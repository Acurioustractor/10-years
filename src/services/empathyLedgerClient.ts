/**
 * Empathy Ledger v2 API client.
 *
 * Supports two auth modes:
 * - Org API key (from env vars) — original read-only mode
 * - Family session token (from SessionContext) — code-based auth with read/write
 *
 * The auth token is set dynamically via setAuthToken().
 */

import type {
  CommunityKinshipGraph,
  CommunityFamilyLink,
  CommunityFamilyClaimRegisterResponse,
  CommunityResearchDecisionWorksheetsResponse,
  CommunityResearchOnlineSourceIntakeResponse,
  CommunityResearchPeopleQueueResponse,
  CommunityResearchResponse,
  CommunityResearchPersonDetailResponse,
  CommunityResearchSourceDetailResponse,
  Connection,
  FamilyAccessMember,
  KinshipGraph,
  KinshipProposal,
  Paginated,
  Storyteller,
  TimelineEventDetail,
  TimelineEventSummary,
} from './types'

const BASE_URL = import.meta.env.VITE_EMPATHY_LEDGER_URL || ''
export const LEDGER_BASE_URL = BASE_URL
const DEFAULT_API_KEY = import.meta.env.VITE_EMPATHY_LEDGER_API_KEY || ''
const NETWORK_API_KEY = import.meta.env.VITE_EMPATHY_LEDGER_NETWORK_API_KEY || ''

export function buildLedgerUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>): string | null {
  if (!LEDGER_BASE_URL) return null

  try {
    const url = new URL(path, LEDGER_BASE_URL)
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue
        url.searchParams.set(key, String(value))
      }
    }
    return url.toString()
  } catch {
    return null
  }
}

export function buildLedgerStorytellerEditUrl(storytellerId: string): string | null {
  return buildLedgerUrl(`/admin/storytellers/${storytellerId}/edit`)
}

export function buildLedgerStorytellerTranscriptsUrl(storytellerId: string): string | null {
  return buildLedgerUrl('/admin/transcripts', { storyteller: storytellerId })
}

export function buildLedgerTranscriptAdminUrl(transcriptId: string): string | null {
  return buildLedgerUrl(`/admin/transcripts/${transcriptId}`)
}

export function buildLedgerPalmReviewUrl(query?: Record<string, string | number | boolean | null | undefined>): string | null {
  return buildLedgerUrl('/admin/data-health/palm-tree-review', query)
}

export function buildLedgerStoriesAdminUrl(query?: Record<string, string | number | boolean | null | undefined>): string | null {
  return buildLedgerUrl('/admin/stories', query)
}

// Mutable auth token — set by SessionProvider on mount/login
let _authToken: string = DEFAULT_API_KEY

export function setAuthToken(token: string) {
  _authToken = token
}

export const isConfigured = Boolean(BASE_URL)

function getStoredFamilySessionToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('10years_family_session')
      if (stored) {
        const session = JSON.parse(stored) as { sessionToken?: string; expiresAt?: string }
        if (
          session?.sessionToken &&
          (!session.expiresAt || new Date(session.expiresAt) > new Date())
        ) {
          return session.sessionToken
        }
      }
    } catch {
      // Ignore malformed localStorage and fall back to in-memory token.
    }
  }
  return null
}

function resolveAuthToken(): string {
  // Prefer live family-session token from localStorage when running in browser.
  // This avoids race conditions where module-level auth state lags behind session updates.
  const familyToken = getStoredFamilySessionToken()
  if (familyToken) return familyToken
  return _authToken
}

async function get<T>(path: string): Promise<T> {
  const token = resolveAuthToken()
  return getWithToken(path, token)
}

function resolveNetworkReadToken(): string {
  const familyToken = getStoredFamilySessionToken()
  if (familyToken) return familyToken
  return NETWORK_API_KEY || DEFAULT_API_KEY
}

async function getWithToken<T>(path: string, token: string): Promise<T> {
  if (!isConfigured || !token) throw new Error('Empathy Ledger is not configured')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-API-Key': token, 'Accept': 'application/json' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null) as { error?: string } | null
    throw new Error(err?.error || `${res.status} ${res.statusText} — ${path}`)
  }
  return res.json() as Promise<T>
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const token = resolveAuthToken()
  if (!isConfigured || !token) throw new Error('Empathy Ledger is not configured')
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'X-API-Key': token,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null) as { error?: string } | null
    throw new Error(err?.error || `${res.status} ${res.statusText} — ${path}`)
  }
  return res.json() as Promise<T>
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const token = resolveAuthToken()
  if (!isConfigured || !token) throw new Error('Empathy Ledger is not configured')
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'X-API-Key': token,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null) as { error?: string } | null
    throw new Error(err?.error || `${res.status} ${res.statusText} — ${path}`)
  }
  return res.json() as Promise<T>
}

// ─── Storytellers ────────────────────────────────────────────────────────

export async function getStorytellers(limit = 100): Promise<Storyteller[]> {
  const res = await get<Paginated<Storyteller>>(`/api/v2/storytellers?limit=${limit}`)
  return res.data
}

// ─── Timeline events ─────────────────────────────────────────────────────

export interface TimelineEventFilters {
  page?: number
  limit?: number
  kind?: 'past' | 'aspiration' | 'milestone'
  status?: string
  yearFrom?: number
  yearTo?: number
  storytellerId?: string
  parentEventId?: string
  domain?: string
  goalScope?: string
}

export async function getTimelineEvents(filters: TimelineEventFilters = {}): Promise<Paginated<TimelineEventSummary>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  return get<Paginated<TimelineEventSummary>>(`/api/v2/timeline-events?${params.toString()}`)
}

// ─── Kinship ─────────────────────────────────────────────────────────────

export async function getKinshipGraph(): Promise<KinshipGraph> {
  return get<KinshipGraph>('/api/v2/kinship')
}

// ─── Connections (dream inbox) ───────────────────────────────────────────

export interface ConnectionFilters {
  page?: number
  limit?: number
  status?: string
  needsAction?: boolean
}

export async function getConnections(filters: ConnectionFilters = {}): Promise<Paginated<Connection>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  return get<Paginated<Connection>>(`/api/v2/connections?${params.toString()}`)
}

// ─── Event detail ────────────────────────────────────────────────────────

export async function getTimelineEvent(id: string): Promise<TimelineEventDetail> {
  return get<TimelineEventDetail>(`/api/v2/timeline-events/${id}`)
}

// ─── Family Folders ──────────────────────────────────────────────────────

export async function getFamilyFolders(): Promise<Paginated<{
  id: string
  name: string
  slug: string
  location: string | null
  memberCount: number
}>> {
  return get('/api/v2/family-folders')
}

export async function getFamilyFolder(id: string): Promise<{
  folder: { id: string; name: string; slug: string; location: string | null }
  members: Array<{
    id: string
    storytellerId: string
    displayName: string
    avatarUrl: string | null
    isElder: boolean
    isAncestor: boolean
    role: string
    joinedAt: string
  }>
  communityLinks: CommunityFamilyLink[]
  stats: { memberCount: number; eventCount: number; kinshipEdgeCount: number }
}> {
  return get(`/api/v2/family-folders/${id}`)
}

export async function getFamilyAccessMembers(folderId: string): Promise<{
  data: FamilyAccessMember[]
  meta?: {
    kind: 'workspace_access'
    note: string
  }
}> {
  return get(`/api/v2/family-folders/${folderId}/members`)
}

export async function getFamilyFolderKinship(folderId: string): Promise<KinshipGraph> {
  return get(`/api/v2/family-folders/${folderId}/kinship`)
}

export async function getFamilyFolderTimeline(
  folderId: string,
  filters: TimelineEventFilters = {}
): Promise<Paginated<TimelineEventSummary>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  return get(`/api/v2/family-folders/${folderId}/timeline?${params.toString()}`)
}

export async function createFamilyFolder(data: {
  name: string
  location?: string
  description?: string
  adminDisplayName?: string
}): Promise<{ id: string; name: string; slug: string; accessCode: string }> {
  return post('/api/v2/family-folders', data)
}

// ─── Communities ─────────────────────────────────────────────────────────

export async function getCommunities(): Promise<Paginated<{
  id: string
  name: string
  traditionalName: string | null
  slug: string
  location: string | null
  region: string | null
  familyCount: number
  memberCount: number
  adminCount: number
  totalPeople: number
}>> {
  return getWithToken('/api/v2/communities', resolveNetworkReadToken())
}

export async function getCommunity(id: string): Promise<{
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  families: Array<{ id: string; name: string; slug: string; memberCount: number }>
  keepers: Array<{
    storytellerId: string
    displayName: string
    avatarUrl: string | null
    isElder: boolean
    role: string
  }>
  members: Array<{
    storytellerId: string
    displayName: string
    avatarUrl: string | null
    isElder: boolean
    role: string
  }>
  stats: { familyCount: number; totalPeople: number; adminCount: number }
  meta?: {
    keepersKind: 'community_governance'
    familiesKind: 'linked_lineage'
    totalPeopleDefinition: string
    keepersDefinition: string
  }
}> {
  return getWithToken(`/api/v2/communities/${id}`, resolveNetworkReadToken())
}

export async function getCommunityKinship(id: string): Promise<CommunityKinshipGraph> {
  return get(`/api/v2/communities/${id}/kinship`)
}

export async function getCommunityResearch(id: string): Promise<CommunityResearchResponse> {
  return getWithToken(`/api/v2/communities/${id}/research`, resolveNetworkReadToken())
}

export async function getCommunityResearchClaims(id: string): Promise<CommunityFamilyClaimRegisterResponse> {
  return getWithToken(`/api/v2/communities/${id}/research/claims`, resolveNetworkReadToken())
}

export async function getCommunityResearchPeopleQueue(id: string): Promise<CommunityResearchPeopleQueueResponse> {
  return getWithToken(`/api/v2/communities/${id}/research/people-queue`, resolveNetworkReadToken())
}

export async function getCommunityResearchDecisionWorksheets(id: string): Promise<CommunityResearchDecisionWorksheetsResponse> {
  return getWithToken(`/api/v2/communities/${id}/research/decision-worksheets`, resolveNetworkReadToken())
}

export async function getCommunityResearchOnlineSourceIntake(id: string): Promise<CommunityResearchOnlineSourceIntakeResponse> {
  return getWithToken(`/api/v2/communities/${id}/research/online-source-intake`, resolveNetworkReadToken())
}

export async function getCommunityResearchSource(
  communityId: string,
  sourceId: string
): Promise<CommunityResearchSourceDetailResponse> {
  return getWithToken(`/api/v2/communities/${communityId}/research/sources/${sourceId}`, resolveNetworkReadToken())
}

export async function getCommunityResearchPerson(
  communityId: string,
  personKey: string
): Promise<CommunityResearchPersonDetailResponse> {
  return getWithToken(`/api/v2/communities/${communityId}/research/people/${personKey}`, resolveNetworkReadToken())
}

export async function getCommunityFamilyLinks(
  communityId: string,
  filters: { status?: 'pending' | 'active' | 'rejected' | 'revoked' | 'all' } = {}
): Promise<{ links: CommunityFamilyLink[] }> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return get(`/api/v2/communities/${communityId}/family-links${suffix}`)
}

export async function requestCommunityFamilyLink(
  communityId: string,
  familyFolderId: string,
  notes?: string
): Promise<{ linkId: string; status: string; familyApproved: boolean; communityApproved: boolean }> {
  return post(`/api/v2/communities/${communityId}/family-links`, { familyFolderId, notes })
}

export async function reviewCommunityFamilyLink(
  communityId: string,
  linkId: string,
  decision: 'approve' | 'reject',
  notes?: string
): Promise<{ linkId: string; status: string; familyApproved: boolean; communityApproved: boolean }> {
  return post(`/api/v2/communities/${communityId}/family-links/${linkId}/review`, { decision, notes })
}

export async function getKinshipProposals(
  filters: { status?: 'pending' | 'approved' | 'rejected' | 'all'; limit?: number } = {}
): Promise<{ proposals: KinshipProposal[] }> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.limit) params.set('limit', String(filters.limit))
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return get(`/api/v2/kinship/proposals${suffix}`)
}

export async function reviewKinshipProposal(
  proposalId: string,
  decision: 'approve' | 'reject',
  notes?: string
): Promise<{
  proposalId: string
  reviewStatus: 'pending' | 'approved' | 'rejected'
  appliedRelationIds?: string[]
}> {
  return post(`/api/v2/kinship/proposals/${proposalId}/review`, { decision, notes })
}

// ─── Write operations ───────────────────────────────────────────────────

export async function createTimelineEvent(
  folderId: string,
  event: {
    title: string
    kind: string
    eventYear?: number
    eventDate?: string
    description?: string
    domain?: string[]
    goalScope?: string
    people?: Array<{ storytellerId: string; role?: string }>
  }
): Promise<{ id: string }> {
  return post(`/api/v2/family-folders/${folderId}/timeline`, event)
}

export async function addFamilyAccessMember(
  folderId: string,
  member: {
    displayName: string
    storytellerId?: string
    role?: string
    isAncestor?: boolean
  }
): Promise<{ member: { id: string; storytellerId: string; role: string } }> {
  return post(`/api/v2/family-folders/${folderId}/members`, member)
}

export const addFamilyMember = addFamilyAccessMember

export async function updateFamilyAccessMember(
  folderId: string,
  update: {
    memberId: string
    role?: 'viewer' | 'contributor'
    isActive?: boolean
  }
): Promise<{
  member: {
    id: string
    storytellerId: string
    role: string
    is_active: boolean
    joined_at: string
  }
  invalidatedSessionCount: number
}> {
  return patch(`/api/v2/family-folders/${folderId}/members`, update)
}

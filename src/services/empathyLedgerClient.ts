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
  Connection,
  KinshipGraph,
  Paginated,
  Storyteller,
  TimelineEventDetail,
  TimelineEventSummary,
} from './types'

const BASE_URL = import.meta.env.VITE_EMPATHY_LEDGER_URL || ''
const DEFAULT_API_KEY = import.meta.env.VITE_EMPATHY_LEDGER_API_KEY || ''

// Mutable auth token — set by SessionProvider on mount/login
let _authToken: string = DEFAULT_API_KEY

export function setAuthToken(token: string) {
  _authToken = token
}

export const isConfigured = Boolean(BASE_URL)

function resolveAuthToken(): string {
  // Prefer live family-session token from localStorage when running in browser.
  // This avoids race conditions where module-level auth state lags behind session updates.
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
  return _authToken
}

async function get<T>(path: string): Promise<T> {
  const token = resolveAuthToken()
  if (!isConfigured || !token) throw new Error('Empathy Ledger is not configured')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-API-Key': token, 'Accept': 'application/json' },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`)
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
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`)
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
  }>
  stats: { memberCount: number; eventCount: number; kinshipEdgeCount: number }
}> {
  return get(`/api/v2/family-folders/${id}`)
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
}>> {
  return get('/api/v2/communities')
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
  stats: { familyCount: number; totalPeople: number }
}> {
  return get(`/api/v2/communities/${id}`)
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

export async function addFamilyMember(
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

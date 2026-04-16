/**
 * Empathy Ledger v2 API client — read-only for the 10-years app.
 *
 * Uses the Oonchiumpa org-scoped key; API returns only rows where
 * at least one subject-person is in the org.
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
const API_KEY = import.meta.env.VITE_EMPATHY_LEDGER_API_KEY || ''

export const isConfigured = Boolean(BASE_URL && API_KEY)

async function get<T>(path: string): Promise<T> {
  if (!isConfigured) throw new Error('Empathy Ledger is not configured')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-API-Key': API_KEY, 'Accept': 'application/json' },
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

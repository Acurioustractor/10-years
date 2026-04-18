/**
 * Session context for family-code-based authentication.
 *
 * Two modes:
 * - Org mode: static API key from env vars (original Oonchiumpa demo)
 * - Family mode: session token from family-auth login
 *
 * The session is persisted in localStorage and restored on page load.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { setAuthToken } from '@/services/empathyLedgerClient'

export interface FamilySession {
  sessionToken: string
  folder: {
    id: string
    name: string
    slug: string
    location: string | null
  }
  member: {
    storytellerId: string
    displayName: string
    role: string
  }
  expiresAt: string
}

interface SessionState {
  mode: 'org' | 'family' | 'none'
  familySession: FamilySession | null
  loading: boolean
  login: (accessCode: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  /** The auth token to send with API requests */
  authToken: string | null
}

const SessionContext = createContext<SessionState>({
  mode: 'none',
  familySession: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  authToken: null,
})

const STORAGE_KEY = '10years_family_session'
const BASE_URL = import.meta.env.VITE_EMPATHY_LEDGER_URL || ''
const ORG_API_KEY = import.meta.env.VITE_EMPATHY_LEDGER_API_KEY || ''

export function SessionProvider({ children }: { children: ReactNode }) {
  const [familySession, setFamilySession] = useState<FamilySession | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const session = JSON.parse(stored) as FamilySession
        // Check expiry
        if (new Date(session.expiresAt) > new Date()) {
          setFamilySession(session)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setLoading(false)
  }, [])

  // Keep API client auth token in sync with current mode/session.
  useEffect(() => {
    setAuthToken(familySession?.sessionToken || ORG_API_KEY || '')
  }, [familySession])

  const login = useCallback(async (accessCode: string, displayName: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v2/family-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode, displayName }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, error: err.error || `Login failed (${res.status})` }
      }

      const session = await res.json() as FamilySession
      setFamilySession(session)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Network error — could not connect' }
    }
  }, [])

  const logout = useCallback(() => {
    if (familySession) {
      // Fire and forget logout call
      fetch(`${BASE_URL}/api/v2/family-auth/session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${familySession.sessionToken}` },
      }).catch(() => {})
    }
    setFamilySession(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [familySession])

  // Determine mode
  const mode = familySession ? 'family' : ORG_API_KEY ? 'org' : 'none'
  const authToken = familySession?.sessionToken || ORG_API_KEY || null

  return (
    <SessionContext.Provider value={{ mode, familySession, loading, login, logout, authToken }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}

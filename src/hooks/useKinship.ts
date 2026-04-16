import { useCallback, useEffect, useState } from 'react'
import { getFamilyFolderKinship, getKinshipGraph, isConfigured } from '@/services/empathyLedgerClient'
import { useSession } from '@/contexts/SessionContext'
import type { KinshipGraph } from '@/services/types'

export function useKinship() {
  const { familySession, mode } = useSession()
  const [graph, setGraph] = useState<KinshipGraph>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    const fetchKinship = familySession
      ? getFamilyFolderKinship(familySession.folder.id)
      : getKinshipGraph()
    fetchKinship
      .then(g => { if (!cancelled) setGraph(g) })
      .catch(e => { if (!cancelled) setError(e as Error) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [familySession, fetchKey, mode])

  const refetch = useCallback(() => setFetchKey(k => k + 1), [])

  return { graph, loading, error, notConfigured: !isConfigured, refetch }
}

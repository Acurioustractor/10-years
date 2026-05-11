import { useCallback, useEffect, useState } from 'react'
import { getFamilyFolderKinship, getFamilyFolders, getKinshipGraph, isConfigured } from '@/services/empathyLedgerClient'
import { useSession } from '@/contexts/SessionContext'
import type { KinshipGraph } from '@/services/types'

export function useKinship(familySlug?: string) {
  const { familySession, mode } = useSession()
  const [graph, setGraph] = useState<KinshipGraph>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    async function fetchKinship() {
      if (familySession) {
        return getFamilyFolderKinship(familySession.folder.id)
      }

      if (familySlug) {
        const folders = await getFamilyFolders()
        const folder = folders.data.find(item => item.slug === familySlug)
        if (!folder) return { nodes: [], edges: [] }
        return getFamilyFolderKinship(folder.id)
      }

      return getKinshipGraph()
    }

    fetchKinship()
      .then(g => { if (!cancelled) setGraph(g) })
      .catch(e => { if (!cancelled) setError(e as Error) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [familySession, familySlug, fetchKey, mode])

  const refetch = useCallback(() => setFetchKey(k => k + 1), [])

  return { graph, loading, error, notConfigured: !isConfigured, refetch }
}

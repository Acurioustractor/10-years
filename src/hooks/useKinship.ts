import { useEffect, useState } from 'react'
import { getKinshipGraph, isConfigured } from '@/services/empathyLedgerClient'
import type { KinshipGraph } from '@/services/types'

export function useKinship() {
  const [graph, setGraph] = useState<KinshipGraph>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    let cancelled = false
    getKinshipGraph()
      .then(g => { if (!cancelled) setGraph(g) })
      .catch(e => { if (!cancelled) setError(e as Error) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { graph, loading, error, notConfigured: !isConfigured }
}

import { useEffect, useState } from 'react'
import { getConnections, isConfigured } from '@/services/empathyLedgerClient'
import type { Connection } from '@/services/types'

export function useConnections(params: { needsAction?: boolean; status?: string } = {}) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const key = JSON.stringify(params)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    let cancelled = false
    const parsed = JSON.parse(key) as { needsAction?: boolean; status?: string }
    getConnections({ limit: 100, ...parsed })
      .then(r => { if (!cancelled) setConnections(r.data) })
      .catch(e => { if (!cancelled) setError(e as Error) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [key])

  return { connections, loading, error, notConfigured: !isConfigured }
}

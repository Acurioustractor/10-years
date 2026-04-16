import { useEffect, useState } from 'react'
import {
  getStorytellers,
  getTimelineEvents,
  isConfigured,
} from '@/services/empathyLedgerClient'
import type { Storyteller, TimelineEventSummary } from '@/services/types'

export interface TimelineData {
  people: Storyteller[]
  events: TimelineEventSummary[]
  loading: boolean
  error: Error | null
  notConfigured: boolean
}

export function useTimelineData(yearFrom: number, yearTo: number): TimelineData {
  const [people, setPeople] = useState<Storyteller[]>([])
  const [events, setEvents] = useState<TimelineEventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([
      getStorytellers(200),
      getTimelineEvents({ yearFrom, yearTo, limit: 500 }),
    ])
      .then(([p, e]) => {
        if (cancelled) return
        setPeople(p)
        setEvents(e.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err as Error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [yearFrom, yearTo])

  return { people, events, loading, error, notConfigured: !isConfigured }
}

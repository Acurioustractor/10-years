import { useEffect, useState } from 'react'
import {
  getFamilyFolder,
  getFamilyFolderTimeline,
  getStorytellers,
  getTimelineEvents,
  isConfigured,
} from '@/services/empathyLedgerClient'
import { useSession } from '@/contexts/SessionContext'
import type { Storyteller, TimelineEventSummary } from '@/services/types'

export interface TimelineData {
  people: Storyteller[]
  events: TimelineEventSummary[]
  loading: boolean
  error: Error | null
  notConfigured: boolean
}

export function useTimelineData(yearFrom: number, yearTo: number): TimelineData {
  const { familySession } = useSession()
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
    const fetchData = familySession
      ? Promise.all([
          getFamilyFolder(familySession.folder.id),
          getFamilyFolderTimeline(familySession.folder.id, { yearFrom, yearTo, limit: 500 }),
        ])
      : Promise.all([
          getStorytellers(200),
          getTimelineEvents({ yearFrom, yearTo, limit: 500 }),
        ])

    fetchData
      .then(([p, e]) => {
        if (cancelled) return
        if (familySession) {
          const familyDetail = p as Awaited<ReturnType<typeof getFamilyFolder>>
          const familyPeople: Storyteller[] = familyDetail.members.map(member => ({
            id: member.storytellerId,
            displayName: member.displayName,
            avatarUrl: member.avatarUrl,
            isElder: member.isElder,
            bio: null,
            culturalBackground: null,
            role: member.role,
            location: null,
            isActive: !member.isAncestor,
            storyCount: 0,
            createdAt: '',
          }))
          setPeople(familyPeople)
        } else {
          setPeople(p as Storyteller[])
        }
        setEvents(e.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err as Error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [familySession, yearFrom, yearTo])

  return { people, events, loading, error, notConfigured: !isConfigured }
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  buildLedgerStoriesAdminUrl,
  getCommunities,
  getCommunity,
  getFamilyFolder,
  getTimelineEvents,
} from '@/services/empathyLedgerClient'
import type { TimelineEventSummary } from '@/services/types'

interface CommunityDetail {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  families: Array<{ id: string; name: string; slug: string; memberCount: number }>
  stats: { familyCount: number; totalPeople: number; adminCount: number }
  meta?: {
    familiesKind: 'linked_lineage'
    totalPeopleDefinition: string
    keepersDefinition: string
  }
}

interface TimelineFamily {
  id: string
  name: string
  slug: string
  memberCount: number
}

interface CommunityTimelineEvent extends TimelineEventSummary {
  families: TimelineFamily[]
}

type FilterMode = 'all' | 'shared' | 'single' | 'future'

const FILTERS: Array<{ id: FilterMode; label: string }> = [
  { id: 'all', label: 'All stories' },
  { id: 'shared', label: 'Shared across families' },
  { id: 'single', label: 'Held in one family' },
  { id: 'future', label: 'Dreaming ahead' },
]

export default function CommunityTimelinePage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const ledgerStoriesUrl = buildLedgerStoriesAdminUrl()
  const [detail, setDetail] = useState<CommunityDetail | null>(null)
  const [events, setEvents] = useState<CommunityTimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [inaccessibleFamilies, setInaccessibleFamilies] = useState<TimelineFamily[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const communities = await getCommunities()
        const match = communities.data.find(community => community.slug === communitySlug)

        if (!match) {
          if (!cancelled) setDetail(null)
          return
        }

        const nextDetail = await getCommunity(match.id)
        if (cancelled) return

        setDetail(nextDetail)

        if (nextDetail.families.length === 0) {
          setEvents([])
          setInaccessibleFamilies([])
          return
        }

        const [familyResults, timelineResult] = await Promise.all([
          Promise.allSettled(nextDetail.families.map(family => getFamilyFolder(family.id))),
          getTimelineEvents({ limit: 500, communitySlug } as any),
        ])
        if (cancelled) return

        const accessibleFamilies = new Map<string, TimelineFamily>()
        const personFamilyMap = new Map<string, TimelineFamily[]>()
        const blockedFamilies: TimelineFamily[] = []

        familyResults.forEach((result, index) => {
          const family = nextDetail.families[index]

          if (result.status !== 'fulfilled') {
            blockedFamilies.push(family)
            return
          }

          accessibleFamilies.set(family.id, family)
          for (const member of result.value.members) {
            const current = personFamilyMap.get(member.storytellerId) || []
            if (!current.some(entry => entry.id === family.id)) {
              current.push(family)
            }
            personFamilyMap.set(member.storytellerId, current)
          }
        })

        const nextEvents = timelineResult.data
          .map(event => {
            const matchedFamilies = dedupeFamilies(
              event.people.flatMap(person => personFamilyMap.get(person.id) || [])
            )

            if (matchedFamilies.length === 0) return null

            return {
              ...event,
              families: matchedFamilies.sort((a, b) => a.name.localeCompare(b.name)),
            } satisfies CommunityTimelineEvent
          })
          .filter((event): event is CommunityTimelineEvent => Boolean(event))
          .sort((a, b) => compareEventsDesc(a, b))

        setEvents(nextEvents)
        setInaccessibleFamilies(blockedFamilies)
      } catch (err) {
        if (cancelled) return
        setDetail(null)
        setEvents([])
        setError(err instanceof Error ? err.message : 'Failed to load community timeline')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [communitySlug])

  const normalizedSearch = search.trim().toLowerCase()

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filterMode === 'shared' && event.families.length < 2) return false
      if (filterMode === 'single' && event.families.length !== 1) return false
      if (filterMode === 'future' && !isFutureFacing(event)) return false

      if (!normalizedSearch) return true

      const haystack = [
        event.title,
        event.description || '',
        event.location || '',
        event.kind,
        event.status,
        ...event.domain,
        ...event.families.map(family => family.name),
        ...event.people.map(person => person.displayName),
      ].join(' ').toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [events, filterMode, normalizedSearch])

  const sharedEvents = useMemo(
    () => filteredEvents.filter(event => event.families.length > 1),
    [filteredEvents]
  )

  const representedPeopleCount = useMemo(() => {
    const people = new Set(filteredEvents.flatMap(event => event.people.map(person => person.id)))
    return people.size
  }, [filteredEvents])

  const yearSpan = useMemo(() => {
    const years = filteredEvents
      .map(eventYear)
      .filter((value): value is number => value !== null)

    if (years.length === 0) return null

    return { from: Math.min(...years), to: Math.max(...years) }
  }, [filteredEvents])

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, CommunityTimelineEvent[]>()

    for (const event of filteredEvents) {
      const key = String(eventYear(event) ?? 'Undated')
      const current = groups.get(key) || []
      current.push(event)
      groups.set(key, current)
    }

    return [...groups.entries()]
      .sort((a, b) => compareYearKeys(a[0], b[0]))
      .map(([year, grouped]) => ({ year, events: grouped }))
  }, [filteredEvents])

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-ink/50">Loading...</div>
  }

  if (!detail) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink mb-2">Community not found</h1>
        <p className="text-ink/60">No community with slug "{communitySlug}" exists yet.</p>
        <Link to="/explore" className="text-sm text-ochre mt-4 inline-block">Browse communities</Link>
      </div>
    )
  }

  const base = `/c/${detail.community.slug}`

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-3 w-3 rounded-full bg-ochre" />
              <span className="text-xs uppercase tracking-widest text-ochre font-medium">Community timeline</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">{detail.community.name}</h1>
            <p className="text-ink/60 mt-2 max-w-3xl">
              This is the shared story feed for the community: events become visible here when they involve people from linked families
              that the current access mode can read.
            </p>
            <p className="text-sm text-ink/50 mt-3 max-w-3xl">
              The people and stories on this page come from linked family lineage and readable family timelines, not from the community keeper list.
            </p>
          </div>
          {ledgerStoriesUrl && (
            <a
              href={ledgerStoriesUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
            >
              Edit source stories in Empathy Ledger
            </a>
          )}
        </div>
      </header>

      {ledgerStoriesUrl && (
        <div className="mb-6 rounded-xl border border-ink/8 bg-sand/20 px-4 py-3 text-sm text-ink/65">
          Community timeline reading happens here. Source story editing, transcript work, and storyteller admin still belong in Empathy Ledger.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Visible events" value={filteredEvents.length} />
        <StatCard label="Shared stories" value={sharedEvents.length} />
        <StatCard label="Lineage people" value={representedPeopleCount} />
        <StatCard label="Time span" value={yearSpan ? `${yearSpan.from}–${yearSpan.to}` : '—'} />
      </div>

      <section className="rounded-xl border border-ink/10 bg-cream p-5 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-eucalypt">Filters</div>
            <h2 className="font-serif text-2xl text-ink">Read the community story</h2>
            <p className="text-sm text-ink/60 mt-2">
              Narrow the feed to shared stories, family-held stories, or future-facing dreams and milestones.
            </p>
            {detail.meta?.totalPeopleDefinition && (
              <p className="text-xs text-ink/50 mt-3 max-w-2xl">
                Linked people counts in this community come from active family lineage, while community keepers govern what can become visible here.
              </p>
            )}
          </div>
          <div className="w-full md:w-72">
            <label className="block">
              <span className="sr-only">Search community timeline</span>
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search people, places, families, stories"
                className="w-full rounded-full border border-ink/10 bg-sand/20 px-4 py-2 text-sm text-ink placeholder:text-ink/40 outline-none focus:border-eucalypt/40"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map(filter => (
            <FilterChip
              key={filter.id}
              active={filterMode === filter.id}
              label={filter.label}
              onClick={() => setFilterMode(filter.id)}
            />
          ))}
        </div>
      </section>

      {inaccessibleFamilies.length > 0 && (
        <section className="rounded-xl border border-ochre/20 bg-ochre/[0.04] p-5 mb-8">
          <div className="text-xs uppercase tracking-widest text-ochre">Partial read</div>
          <h2 className="font-serif text-2xl text-ink mt-2">Some linked family timelines are not readable from this session</h2>
          <p className="text-sm text-ink/65 mt-2 max-w-3xl">
            The feed below is built from the linked family story lines that this access mode can read. Families blocked here are still
            part of the community, but their detailed story feed is not available on this route right now.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {inaccessibleFamilies.map(family => (
              <span
                key={family.id}
                className="rounded-full border border-ochre/20 bg-cream/80 px-3 py-1.5 text-xs text-ink/70"
              >
                {family.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {sharedEvents.length > 0 && (
        <section className="rounded-xl border border-ink/10 bg-cream p-6 mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Shared threads</div>
              <h2 className="font-serif text-2xl text-ink">Stories crossing family lines</h2>
            </div>
            <div className="text-sm text-ink/50">
              {sharedEvents.length} visible {sharedEvents.length === 1 ? 'story' : 'stories'}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {sharedEvents.slice(0, 4).map(event => (
              <StoryCard key={event.id} event={event} highlightShared />
            ))}
          </div>
        </section>
      )}

      {filteredEvents.length === 0 ? (
        <section className="rounded-xl border border-ink/10 bg-cream p-8 text-center">
          <h2 className="font-serif text-2xl text-ink mb-2">No community timeline events match this view yet</h2>
          <p className="text-ink/60 max-w-2xl mx-auto">
            Try a broader filter, clear the search, or check the families page to see which family folders are already linked into this
            community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <Link
              to={`${base}/families`}
              className="rounded-full px-4 py-2 text-sm font-medium bg-ochre text-cream hover:bg-ochre/90 transition-colors"
            >
              See linked families
            </Link>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setFilterMode('all')
              }}
              className="rounded-full border border-ink/10 bg-cream px-4 py-2 text-sm text-ink/65 hover:bg-sand/20 transition-colors"
            >
              Clear filters
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-ink/10 bg-cream p-6">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-ochre">Timeline feed</div>
              <h2 className="font-serif text-2xl text-ink">Community history and dreams</h2>
            </div>
            <div className="text-sm text-ink/50">
              {filteredEvents.length} visible {filteredEvents.length === 1 ? 'event' : 'events'}
            </div>
          </div>

          <div className="space-y-8">
            {groupedEvents.map(group => (
              <div key={group.year} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 md:gap-6">
                <div className="pt-2">
                  <div className="sticky top-24 rounded-xl border border-ink/8 bg-sand/20 px-3 py-2 text-center">
                    <div className="font-serif text-lg text-ink">{group.year}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {group.events.map(event => (
                    <StoryCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StoryCard({
  event,
  highlightShared,
}: {
  event: CommunityTimelineEvent
  highlightShared?: boolean
}) {
  const familyCount = event.families.length
  const accent =
    highlightShared || familyCount > 1
      ? 'border-eucalypt/20 bg-eucalypt/[0.04]'
      : 'border-ink/8 bg-sand/20'

  return (
    <article className={`rounded-xl border p-5 ${accent}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <KindPill kind={event.kind} />
            <StatusPill label={event.status} tone={familyCount > 1 ? 'eucalypt' : 'ochre'} />
            {familyCount > 1 && <StatusPill label="shared" tone="eucalypt" />}
          </div>
          <h3 className="font-serif text-xl text-ink leading-tight">{event.title}</h3>
          <div className="text-xs text-ink/50 mt-2">
            {formatEventDate(event)}
            {event.location ? ` · ${event.location}` : ''}
          </div>
        </div>
        <div className="text-sm text-ink/50">{familyCount} {familyCount === 1 ? 'family' : 'families'}</div>
      </div>

      {event.description && (
        <p className="text-sm text-ink/70 leading-relaxed mt-3">{event.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {event.families.map(family => (
          <Link
            key={family.id}
            to={`/f/${family.slug}`}
            className="rounded-full border border-ink/10 bg-cream/80 px-3 py-1.5 text-[11px] text-ink/70 hover:bg-sand/20 transition-colors"
          >
            {family.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {event.people.slice(0, 5).map(person => (
          <span
            key={person.id}
            className="rounded-full bg-sand/30 px-3 py-1.5 text-[11px] text-ink/65"
          >
            {person.displayName}
          </span>
        ))}
        {event.people.length > 5 && (
          <span className="rounded-full bg-sand/30 px-3 py-1.5 text-[11px] text-ink/50">
            +{event.people.length - 5} more
          </span>
        )}
      </div>
    </article>
  )
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
        active
          ? 'bg-eucalypt text-cream'
          : 'border border-ink/10 bg-sand/20 text-ink/65 hover:bg-sand/30'
      }`}
    >
      {label}
    </button>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 rounded-xl border border-ink/8 bg-cream text-center">
      <div className="text-2xl font-serif text-ink tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-ink/50 mt-1">{label}</div>
    </div>
  )
}

function KindPill({ kind }: { kind: TimelineEventSummary['kind'] }) {
  const styles: Record<TimelineEventSummary['kind'], string> = {
    past: 'bg-desert/12 text-desert',
    aspiration: 'bg-eucalypt/12 text-eucalypt',
    milestone: 'bg-ochre/12 text-ochre',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${styles[kind]}`}>
      {kind.replace('_', ' ')}
    </span>
  )
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'ochre' | 'eucalypt'
}) {
  const styles: Record<typeof tone, string> = {
    ochre: 'bg-ochre/10 text-ochre',
    eucalypt: 'bg-eucalypt/10 text-eucalypt',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${styles[tone]}`}>
      {label.replace(/_/g, ' ')}
    </span>
  )
}

function dedupeFamilies(families: TimelineFamily[]) {
  const byId = new Map<string, TimelineFamily>()
  for (const family of families) {
    byId.set(family.id, family)
  }
  return [...byId.values()]
}

function eventYear(event: TimelineEventSummary) {
  if (typeof event.eventYear === 'number') return event.eventYear
  if (event.eventDate) return new Date(event.eventDate).getFullYear()
  return null
}

function compareEventsDesc(a: TimelineEventSummary, b: TimelineEventSummary) {
  const aYear = eventYear(a) ?? -Infinity
  const bYear = eventYear(b) ?? -Infinity
  if (aYear !== bYear) return bYear - aYear

  const aDate = a.eventDate ? new Date(a.eventDate).getTime() : 0
  const bDate = b.eventDate ? new Date(b.eventDate).getTime() : 0
  return bDate - aDate
}

function compareYearKeys(a: string, b: string) {
  if (a === 'Undated') return 1
  if (b === 'Undated') return -1
  return Number(b) - Number(a)
}

function isFutureFacing(event: TimelineEventSummary) {
  return event.kind !== 'past' || ['dreaming', 'planning', 'in_progress', 'happening'].includes(event.status)
}

function formatEventDate(event: TimelineEventSummary) {
  if (event.eventDate) {
    return new Date(event.eventDate).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (typeof event.eventYear === 'number') {
    return event.dateIsApproximate ? `c. ${event.eventYear}` : String(event.eventYear)
  }

  return 'Undated'
}

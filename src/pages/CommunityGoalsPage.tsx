import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import {
  getCommunities,
  getCommunity,
  getConnections,
  getFamilyFolder,
  getFamilyFolderTimeline,
  getTimelineEvents,
} from '@/services/empathyLedgerClient'
import type {
  Connection,
  ConnectionStatus,
  TimelineEventSummary,
} from '@/services/types'

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

interface CommunityGoal extends TimelineEventSummary {
  families: TimelineFamily[]
  supportQueue: Connection[]
}

type GoalFilter = 'all' | 'needs-support' | 'connected' | 'family-held'

const FILTERS: Array<{ id: GoalFilter; label: string }> = [
  { id: 'all', label: 'All goals' },
  { id: 'needs-support', label: 'Needs support' },
  { id: 'connected', label: 'Connection work' },
  { id: 'family-held', label: 'Family-held dreams' },
]

export default function CommunityGoalsPage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const [detail, setDetail] = useState<CommunityDetail | null>(null)
  const [goals, setGoals] = useState<CommunityGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<GoalFilter>('all')
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
          setGoals([])
          setInaccessibleFamilies([])
          return
        }

        const [familyDetails, familyGoals, connectionFeed, orgAspirations] = await Promise.all([
          Promise.allSettled(nextDetail.families.map(family => getFamilyFolder(family.id))),
          Promise.allSettled(
            nextDetail.families.map(family =>
              getFamilyFolderTimeline(family.id, { kind: 'aspiration', limit: 200 })
            )
          ),
          getConnections({ limit: 200 }),
          getTimelineEvents({ kind: 'aspiration', limit: 500 }),
        ])
        if (cancelled) return

        const memberFamilyMap = new Map<string, TimelineFamily[]>()
        const blockedFamilyIds = new Set<string>()

        familyDetails.forEach((result, index) => {
          const family = nextDetail.families[index]

          if (result.status !== 'fulfilled') {
            blockedFamilyIds.add(family.id)
            return
          }

          for (const member of result.value.members) {
            const current = memberFamilyMap.get(member.storytellerId) || []
            if (!current.some(entry => entry.id === family.id)) {
              current.push(family)
            }
            memberFamilyMap.set(member.storytellerId, current)
          }
        })

        const goalMap = new Map<string, CommunityGoal>()

        familyGoals.forEach((result, index) => {
          const family = nextDetail.families[index]

          if (result.status !== 'fulfilled') {
            blockedFamilyIds.add(family.id)
            return
          }

          for (const event of result.value.data) {
            const matchedFamilies = dedupeFamilies([
              family,
              ...event.people.flatMap(person => memberFamilyMap.get(person.id) || []),
            ])

            goalMap.set(event.id, {
              ...event,
              families: matchedFamilies.sort((a, b) => a.name.localeCompare(b.name)),
              supportQueue: [],
            })
          }
        })

        const orgAspirationMap = new Map(orgAspirations.data.map(event => [event.id, event]))

        for (const connection of connectionFeed.data) {
          const matchedFamilies = dedupeFamilies([
            ...(connection.connector ? memberFamilyMap.get(connection.connector.id) || [] : []),
            ...((connection.aspiration?.subjects || []).flatMap(person => memberFamilyMap.get(person.id) || [])),
          ])

          if (matchedFamilies.length === 0 || !connection.aspirationEventId) continue

          const existing = goalMap.get(connection.aspirationEventId)
          if (existing) {
            existing.supportQueue = mergeConnections(existing.supportQueue, connection)
            existing.families = dedupeFamilies([...existing.families, ...matchedFamilies])
            continue
          }

          const aspiration = orgAspirationMap.get(connection.aspirationEventId)
          const fallback = buildFallbackGoal(connection)
          const base = aspiration || fallback

          goalMap.set(connection.aspirationEventId, {
            ...base,
            families: matchedFamilies.sort((a, b) => a.name.localeCompare(b.name)),
            supportQueue: [connection],
          })
        }

        const nextGoals = [...goalMap.values()].sort(compareGoals)

        setGoals(nextGoals)
        setInaccessibleFamilies(
          nextDetail.families.filter(family => blockedFamilyIds.has(family.id))
        )
      } catch (err) {
        if (cancelled) return
        setDetail(null)
        setGoals([])
        setError(err instanceof Error ? err.message : 'Failed to load community goals')
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

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      if (filter === 'needs-support' && !goal.supportQueue.some(connectionNeedsAttention)) return false
      if (filter === 'connected' && goal.supportQueue.length === 0) return false
      if (filter === 'family-held' && goal.families.length !== 1) return false

      if (!normalizedSearch) return true

      const haystack = [
        goal.title,
        goal.description || '',
        goal.location || '',
        goal.status,
        ...goal.domain,
        ...goal.families.map(family => family.name),
        ...goal.people.map(person => person.displayName),
        ...goal.supportQueue.flatMap(connection => [
          connection.connector?.displayName || '',
          connection.mentor?.displayName || '',
          connection.externalContact?.name || '',
          connection.domain || '',
          connection.notes || '',
        ]),
      ].join(' ').toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [filter, goals, normalizedSearch])

  const supportGoals = useMemo(
    () => filteredGoals.filter(goal => goal.supportQueue.some(connectionNeedsAttention)),
    [filteredGoals]
  )

  const familyLineCount = useMemo(() => {
    const familyIds = new Set(filteredGoals.flatMap(goal => goal.families.map(family => family.id)))
    return familyIds.size
  }, [filteredGoals])

  const carryingPeopleCount = useMemo(() => {
    const people = new Set(filteredGoals.flatMap(goal => goal.people.map(person => person.id)))
    return people.size
  }, [filteredGoals])

  const horizon = useMemo(() => {
    const years = filteredGoals
      .map(goal => goal.eventYear)
      .filter((value): value is number => typeof value === 'number')

    if (years.length === 0) return null
    return { from: Math.min(...years), to: Math.max(...years) }
  }, [filteredGoals])

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
        <div className="flex items-center gap-3 mb-2">
          <div className="h-3 w-3 rounded-full bg-eucalypt" />
          <span className="text-xs uppercase tracking-widest text-eucalypt font-medium">Community goals</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">{detail.community.name}</h1>
        <p className="text-ink/60 mt-2 max-w-3xl">
          This is the community dream layer: linked-family aspirations plus the connection work already underway to help those dreams move.
        </p>
        <p className="text-sm text-ink/50 mt-3 max-w-3xl">
          Families and people on this page come from linked family lineage and readable family goal layers, not from the community keeper list.
        </p>
      </header>

      <div className="mb-8">
        <CrossAppGuideCard
          title="Review source evidence there. Track community ambitions here."
          description="Community goals in 10 Years are the shared ambition layer, not the source editor. Use Empathy Ledger for storyteller cleanup, stories, transcript evidence, and media. Use 10 Years to see which dreams are visible, which ones need support, and which family lines are carrying them."
          editingItems={[
            'Storyteller records, transcript-backed stories, evidence notes, and photos belong in Empathy Ledger.',
            'If a goal is rooted in the wrong person or source story, fix that there before treating it as community-visible here.',
          ]}
          engagementItems={[
            'Use community goals here to read the visible dream horizon.',
            'Track support needs and family-held ambitions here once the underlying records are readable.',
          ]}
          ledgerPath="/admin"
          ledgerLabel="Open Empathy Ledger admin"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Visible goals" value={filteredGoals.length} />
        <StatCard label="Needs support" value={supportGoals.length} />
        <StatCard label="Family lines" value={familyLineCount} />
        <StatCard label="Horizon" value={horizon ? `${horizon.from}–${horizon.to}` : '—'} />
      </div>

      <section className="rounded-xl border border-ink/10 bg-cream p-5 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-ochre">Filters</div>
            <h2 className="font-serif text-2xl text-ink">Read the community ambitions</h2>
            <p className="text-sm text-ink/60 mt-2">
              Shift between the whole goal horizon, the support queue, and dreams still held within one family line.
            </p>
          </div>
          <div className="w-full md:w-72">
            <label className="block">
              <span className="sr-only">Search community goals</span>
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search dreams, people, families, mentors"
                className="w-full rounded-full border border-ink/10 bg-sand/20 px-4 py-2 text-sm text-ink placeholder:text-ink/40 outline-none focus:border-eucalypt/40"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map(option => (
            <FilterChip
              key={option.id}
              active={filter === option.id}
              label={option.label}
              onClick={() => setFilter(option.id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <MetricCard label="Carrying people" value={carryingPeopleCount} />
          <MetricCard label="Linked families" value={detail.stats.familyCount} />
          <MetricCard label="Connection items" value={filteredGoals.reduce((sum, goal) => sum + goal.supportQueue.length, 0)} />
          <MetricCard label="Lineage people in linked families" value={detail.stats.totalPeople} />
        </div>
      </section>

      {inaccessibleFamilies.length > 0 && (
        <section className="rounded-xl border border-ochre/20 bg-ochre/[0.04] p-5 mb-8">
          <div className="text-xs uppercase tracking-widest text-ochre">Partial read</div>
          <h2 className="font-serif text-2xl text-ink mt-2">Some linked family goal feeds are not readable from this session</h2>
          <p className="text-sm text-ink/65 mt-2 max-w-3xl">
            This page only shows goals that could be verified through linked-family timeline data or matching connection records.
            Some family layers may still be blocked on the current backend or session.
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

      {supportGoals.length > 0 && (
        <section className="rounded-xl border border-ink/10 bg-cream p-6 mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Support queue</div>
              <h2 className="font-serif text-2xl text-ink">Goals already moving through the dream inbox</h2>
            </div>
            <div className="text-sm text-ink/50">
              {supportGoals.length} active {supportGoals.length === 1 ? 'goal' : 'goals'}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {supportGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} emphasizeSupport />
            ))}
          </div>
        </section>
      )}

      {filteredGoals.length === 0 ? (
        <section className="rounded-xl border border-ink/10 bg-cream p-8 text-center">
          <h2 className="font-serif text-2xl text-ink mb-2">No community goals match this view yet</h2>
          <p className="text-ink/60 max-w-2xl mx-auto">
            Try a broader filter, clear the search, or look at the timeline and linked families to see which parts of the community story are already visible.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <Link
              to={`${base}/timeline`}
              className="rounded-full px-4 py-2 text-sm font-medium bg-eucalypt text-cream hover:bg-eucalypt/90 transition-colors"
            >
              Open community timeline
            </Link>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setFilter('all')
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
              <div className="text-xs uppercase tracking-widest text-ochre">Goal horizon</div>
              <h2 className="font-serif text-2xl text-ink">Dreams carried in this community</h2>
            </div>
            <div className="text-sm text-ink/50">
              {filteredGoals.length} visible {filteredGoals.length === 1 ? 'goal' : 'goals'}
            </div>
          </div>

          <div className="space-y-4">
            {filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function GoalCard({
  goal,
  emphasizeSupport,
}: {
  goal: CommunityGoal
  emphasizeSupport?: boolean
}) {
  const activeConnections = goal.supportQueue.filter(connectionNeedsAttention)
  const accent =
    emphasizeSupport || activeConnections.length > 0
      ? 'border-eucalypt/20 bg-eucalypt/[0.04]'
      : 'border-ink/8 bg-sand/20'

  return (
    <article className={`rounded-xl border p-5 ${accent}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <GoalKindPill kind={goal.kind} />
            <GoalStatusPill label={goal.status} tone={activeConnections.length > 0 ? 'eucalypt' : 'ochre'} />
            {activeConnections.length > 0 && (
              <GoalStatusPill label={`${activeConnections.length} needs action`} tone="eucalypt" />
            )}
          </div>
          <h3 className="font-serif text-xl text-ink leading-tight">{goal.title}</h3>
          <div className="text-xs text-ink/50 mt-2">
            {formatGoalDate(goal)}
            {goal.location ? ` · ${goal.location}` : ''}
          </div>
        </div>
        <div className="text-sm text-ink/50">
          {goal.families.length} {goal.families.length === 1 ? 'family line' : 'family lines'}
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-ink/70 leading-relaxed mt-3">{goal.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {goal.families.map(family => (
          <Link
            key={family.id}
            to={`/f/${family.slug}`}
            className="rounded-full border border-ink/10 bg-cream/80 px-3 py-1.5 text-[11px] text-ink/70 hover:bg-sand/20 transition-colors"
          >
            {family.name}
          </Link>
        ))}
      </div>

      {goal.people.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {goal.people.map(person => (
            <span
              key={person.id}
              className="rounded-full bg-sand/30 px-3 py-1.5 text-[11px] text-ink/65"
            >
              {person.displayName}
            </span>
          ))}
        </div>
      )}

      {goal.supportQueue.length > 0 && (
        <div className="mt-5 space-y-3">
          {goal.supportQueue.map(connection => (
            <div key={connection.id} className="rounded-lg border border-ink/8 bg-cream/80 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <ConnectionPill status={connection.status} />
                    {connection.domain && (
                      <span className="rounded-full bg-sand/30 px-2.5 py-1 text-[10px] uppercase tracking-wider text-ink/60">
                        {connection.domain}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-ink">
                    {connection.externalContact?.name || connection.mentor?.displayName || 'Mentor not assigned yet'}
                  </div>
                  <div className="text-xs text-ink/50 mt-1">
                    Connector: {connection.connector?.displayName || 'Unassigned'}
                  </div>
                </div>
              </div>

              {connection.notes && (
                <p className="text-xs text-ink/65 leading-relaxed mt-3">{connection.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
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

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-ink/8 bg-sand/20 px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-ink/45">{label}</div>
      <div className="font-serif text-2xl text-ink mt-2">{value}</div>
    </div>
  )
}

function GoalKindPill({ kind }: { kind: TimelineEventSummary['kind'] }) {
  const styles: Record<TimelineEventSummary['kind'], string> = {
    past: 'bg-desert/12 text-desert',
    aspiration: 'bg-eucalypt/12 text-eucalypt',
    milestone: 'bg-ochre/12 text-ochre',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${styles[kind]}`}>
      {kind.replace(/_/g, ' ')}
    </span>
  )
}

function GoalStatusPill({
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

function ConnectionPill({ status }: { status: ConnectionStatus }) {
  const styles: Record<ConnectionStatus, string> = {
    suggested: 'bg-sand text-desert',
    intro_sent: 'bg-ochre/20 text-ochre',
    talking: 'bg-ochre/20 text-ochre',
    meeting_planned: 'bg-eucalypt/20 text-eucalypt',
    met: 'bg-eucalypt/20 text-eucalypt',
    ongoing: 'bg-eucalypt text-cream',
    closed_success: 'bg-eucalypt text-cream',
    closed_no_fit: 'bg-ink/10 text-ink/50',
  }

  return (
    <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status.replace(/_/g, ' ')}
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

function mergeConnections(existing: Connection[], next: Connection) {
  return existing.some(connection => connection.id === next.id) ? existing : [...existing, next]
}

function connectionNeedsAttention(connection: Connection) {
  return !['closed_success', 'closed_no_fit'].includes(connection.status)
}

function buildFallbackGoal(connection: Connection): CommunityGoal {
  return {
    id: connection.aspiration?.id || connection.aspirationEventId,
    title: connection.aspiration?.title || 'Untitled goal',
    description: connection.notes || null,
    kind: 'aspiration',
    status: 'dreaming',
    eventDate: null,
    eventYear: connection.aspiration?.eventYear || null,
    dateIsApproximate: true,
    parentEventId: null,
    domain: connection.domain ? [connection.domain] : [],
    location: null,
    visibility: connection.visibility,
    culturalSensitivityLevel: connection.culturalSensitivityLevel,
    celebratedAt: null,
    celebratedNote: null,
    organizationId: connection.organizationId,
    projectId: null,
    people: (connection.aspiration?.subjects || []).map(person => ({
      ...person,
      role: 'subject' as const,
    })),
    mediaCount: 0,
    storyCount: 0,
    subGoalCount: 0,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
    families: [],
    supportQueue: [],
  }
}

function compareGoals(a: CommunityGoal, b: CommunityGoal) {
  const aNeedsSupport = a.supportQueue.some(connectionNeedsAttention) ? 1 : 0
  const bNeedsSupport = b.supportQueue.some(connectionNeedsAttention) ? 1 : 0
  if (aNeedsSupport !== bNeedsSupport) return bNeedsSupport - aNeedsSupport

  const aYear = a.eventYear ?? Infinity
  const bYear = b.eventYear ?? Infinity
  if (aYear !== bYear) return aYear - bYear

  return a.title.localeCompare(b.title)
}

function formatGoalDate(goal: CommunityGoal) {
  if (goal.eventDate) {
    return new Date(goal.eventDate).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (typeof goal.eventYear === 'number') {
    return goal.dateIsApproximate ? `around ${goal.eventYear}` : String(goal.eventYear)
  }

  return 'No date set'
}

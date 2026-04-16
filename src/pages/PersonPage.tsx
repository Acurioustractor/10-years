import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getStorytellers,
  getTimelineEvents,
  isConfigured,
} from '@/services/empathyLedgerClient'
import { useKinship } from '@/hooks/useKinship'
import { eraForYear } from '@/components/eras'
import type { Storyteller, TimelineEventSummary, KinshipEdge } from '@/services/types'

export default function PersonPage() {
  const { id } = useParams<{ id: string }>()
  const [person, setPerson] = useState<Storyteller | null>(null)
  const [events, setEvents] = useState<TimelineEventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const { graph } = useKinship()

  useEffect(() => {
    if (!isConfigured || !id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    Promise.all([
      getStorytellers(500),
      getTimelineEvents({ storytellerId: id, limit: 200 }),
    ])
      .then(([people, evs]) => {
        if (cancelled) return
        setPerson(people.find(p => p.id === id) || null)
        setEvents(evs.data)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const myKinship = useMemo(
    () => graph.edges.filter(e => e.from.id === id),
    [graph, id]
  )

  const { past, milestones, aspirations, allChronological } = useMemo(() => {
    const p = events.filter(e => e.kind === 'past').sort(byYearAsc)
    const m = events.filter(e => e.kind === 'milestone').sort(byYearAsc)
    const a = events.filter(e => e.kind === 'aspiration').sort(byYearAsc)
    const all = [...events].sort(byYearAsc)
    return { past: p, milestones: m, aspirations: a, allChronological: all }
  }, [events])

  const lifespan = useMemo(() => {
    const years = events
      .filter(e => e.people.some(p => p.id === id && p.role === 'subject'))
      .map(e => e.eventYear)
      .filter((y): y is number => y !== null)
    if (years.length === 0) return null
    return { earliest: Math.min(...years), latest: Math.max(...years) }
  }, [events, id])

  if (!isConfigured) return <Shell><p className="text-ink/60">Not configured. Add the API key to .env.local.</p></Shell>
  if (loading) return <Shell><p className="text-ink/50">Loading…</p></Shell>
  if (!person) return <Shell><p className="text-ink/60">Person not found.</p></Shell>

  const familyByCategory = groupKinship(myKinship)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Link to="/family" className="text-sm text-ink/50 hover:text-ink transition-colors">
        ← Family
      </Link>

      {/* Hero */}
      <header className="mt-6 mb-10">
        <div className="flex items-start gap-6">
          {person.avatarUrl ? (
            <img
              src={person.avatarUrl}
              alt=""
              className="h-24 w-24 rounded-2xl object-cover ring-1 ring-ink/10 shadow-sm"
            />
          ) : (
            <div className="h-24 w-24 rounded-2xl bg-sand flex items-center justify-center text-2xl font-serif text-desert">
              {person.displayName.slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-4xl text-ink leading-tight">{person.displayName}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-ink/60 flex-wrap">
              {person.isElder && (
                <span className="text-ochre uppercase tracking-wider text-xs font-medium px-2 py-0.5 rounded-full bg-ochre/10">
                  Elder
                </span>
              )}
              {lifespan && (
                <span className="tabular-nums">
                  {lifespan.earliest}{lifespan.latest !== lifespan.earliest ? ` – ${lifespan.latest}` : ''}
                </span>
              )}
              {person.location && <span>{person.location}</span>}
              {person.role && <span>{person.role}</span>}
            </div>
          </div>
        </div>

        {person.bio && (
          <p className="mt-6 text-ink/80 leading-relaxed max-w-3xl text-[15px]">
            {person.bio}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        {/* Main column */}
        <div>
          {/* Dreams */}
          {aspirations.length > 0 && (
            <section className="mb-10">
              <SectionTitle>Dreams for the future</SectionTitle>
              <div className="space-y-4">
                {aspirations.map(ev => (
                  <DreamCard key={ev.id} event={ev} />
                ))}
              </div>
            </section>
          )}

          {/* Life timeline */}
          <section className="mb-10">
            <SectionTitle>
              {aspirations.length > 0 ? 'Life so far' : 'Timeline'}
            </SectionTitle>
            {allChronological.length === 0 ? (
              <p className="text-sm text-ink/40 italic">No events recorded yet.</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-sand">
                {allChronological.map((ev, i) => (
                  <TimelineEntry key={ev.id} event={ev} isLast={i === allChronological.length - 1} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Family */}
          {myKinship.length > 0 && (
            <section>
              <SectionTitle>Family</SectionTitle>
              <div className="space-y-5">
                {Object.entries(familyByCategory).map(([cat, edges]) => (
                  <div key={cat}>
                    <div className="text-[10px] uppercase tracking-widest text-ink/40 mb-2">{cat}</div>
                    <div className="space-y-2">
                      {edges.map(e => (
                        <Link
                          key={e.id}
                          to={`/person/${e.to.id}`}
                          className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-sand/30 transition-colors"
                        >
                          {e.to.avatarUrl ? (
                            <img src={e.to.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-sand flex items-center justify-center text-[10px] font-medium text-desert">
                              {e.to.displayName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm text-ink truncate">{e.to.displayName}</div>
                            <div className="text-xs text-ink/50">
                              {e.vocabulary.label || e.relationType}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cultural background */}
          {person.culturalBackground && person.culturalBackground.length > 0 && (
            <section>
              <SectionTitle>Cultural background</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {person.culturalBackground.map(c => (
                  <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-sand text-desert">
                    {c}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Quick stats */}
          <section>
            <SectionTitle>At a glance</SectionTitle>
            <dl className="space-y-2 text-sm">
              {past.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink/50">Past events</dt>
                  <dd className="text-ink tabular-nums">{past.length}</dd>
                </div>
              )}
              {milestones.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink/50">Milestones</dt>
                  <dd className="text-ink tabular-nums">{milestones.length}</dd>
                </div>
              )}
              {aspirations.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink/50">Dreams</dt>
                  <dd className="text-ink tabular-nums">{aspirations.length}</dd>
                </div>
              )}
              {person.storyCount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink/50">Stories</dt>
                  <dd className="text-ink tabular-nums">{person.storyCount}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink/50">Family links</dt>
                <dd className="text-ink tabular-nums">{myKinship.length}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}

function DreamCard({ event }: { event: TimelineEventSummary }) {
  return (
    <div className="border-2 border-dashed border-eucalypt/30 rounded-xl p-5 bg-eucalypt/[0.03]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-lg text-ink leading-tight">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-ink/60 mt-1">{event.description}</p>
          )}
          {event.subGoalCount > 0 && (
            <div className="text-xs text-eucalypt mt-2">
              {event.subGoalCount} step{event.subGoalCount > 1 ? 's' : ''} planned
            </div>
          )}
        </div>
        {event.eventYear && (
          <span className="text-sm font-medium text-eucalypt tabular-nums shrink-0">
            {event.dateIsApproximate ? '~' : ''}{event.eventYear}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-ink/40 uppercase tracking-wider">
        <span className="h-2 w-2 rounded-full border border-dashed border-eucalypt" />
        {event.status.replace(/_/g, ' ')}
      </div>
    </div>
  )
}

function TimelineEntry({ event, isLast }: { event: TimelineEventSummary; isLast: boolean }) {
  const era = event.eventYear ? eraForYear(event.eventYear) : undefined
  const dotColor =
    event.kind === 'milestone' ? 'bg-ochre' :
    event.kind === 'aspiration' ? 'border-2 border-dashed border-eucalypt bg-transparent' :
    'bg-desert/70'

  return (
    <div className={`relative pb-6 ${isLast ? 'pb-0' : ''}`}>
      {/* Dot on the spine */}
      <div className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ${dotColor}`} />

      <div className="flex items-baseline gap-3 mb-0.5">
        {event.eventYear && (
          <span className="text-xs tabular-nums font-medium text-ink/40">
            {event.dateIsApproximate ? '~' : ''}{event.eventYear}
          </span>
        )}
        {era && (
          <span className={`text-[10px] uppercase tracking-wider ${era.color} opacity-50`}>
            {era.label}
          </span>
        )}
      </div>
      <h3 className="font-serif text-base text-ink leading-snug">{event.title}</h3>
      {event.description && (
        <p className="text-sm text-ink/50 mt-0.5 line-clamp-3">{event.description}</p>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-widest text-ink/50 mb-3 pb-2 border-b border-ink/5">
      {children}
    </h2>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="max-w-5xl mx-auto px-6 py-20 text-center">{children}</div>
}

function groupKinship(edges: KinshipEdge[]): Record<string, KinshipEdge[]> {
  const order = ['partner', 'parent', 'child', 'sibling', 'grandparent', 'grandchild', 'extended', 'ceremonial', 'mentor', 'chosen_family', 'other']
  const groups: Record<string, KinshipEdge[]> = {}
  for (const e of edges) {
    const cat = e.vocabulary.category || 'other'
    const label = categoryLabel(cat)
    if (!groups[label]) groups[label] = []
    groups[label].push(e)
  }
  const sorted: Record<string, KinshipEdge[]> = {}
  for (const cat of order) {
    const label = categoryLabel(cat)
    if (groups[label]) sorted[label] = groups[label]
  }
  for (const [k, v] of Object.entries(groups)) {
    if (!sorted[k]) sorted[k] = v
  }
  return sorted
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    partner: 'Partners',
    parent: 'Parents',
    child: 'Children',
    sibling: 'Siblings',
    grandparent: 'Grandparents',
    grandchild: 'Grandchildren',
    extended: 'Extended family',
    ceremonial: 'Ceremonial',
    mentor: 'Mentors',
    chosen_family: 'Chosen family',
    other: 'Other',
  }
  return labels[cat] || cat
}

function byYearAsc(a: TimelineEventSummary, b: TimelineEventSummary) {
  return (a.eventYear ?? 9999) - (b.eventYear ?? 9999)
}

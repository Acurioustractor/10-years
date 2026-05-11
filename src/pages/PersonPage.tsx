import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  buildLedgerStorytellerEditUrl,
  getFamilyFolder,
  getFamilyFolderTimeline,
  getStorytellers,
  getTimelineEvents,
  isConfigured,
} from '@/services/empathyLedgerClient'
import {
  getKinshipPerspectiveForPerson,
  kinshipCategoryLabel,
  relationLabelForCategory,
} from '@/services/kinship'
import { useSession } from '@/contexts/SessionContext'
import { useKinship } from '@/hooks/useKinship'
import { eraForYear } from '@/components/eras'
import type { Storyteller, TimelineEventSummary, KinshipCategory, KinshipEdge } from '@/services/types'

type PersonKinshipLink = {
  id: string
  person: KinshipEdge['to']
  category: KinshipCategory
  label: string
}

export default function PersonPage() {
  const { id, familySlug } = useParams<{ id: string; familySlug?: string }>()
  const { familySession } = useSession()
  const [person, setPerson] = useState<Storyteller | null>(null)
  const [events, setEvents] = useState<TimelineEventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const { graph } = useKinship()

  useEffect(() => {
    if (!isConfigured || !id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)

    const fetchData = familySession
      ? Promise.all([
          getFamilyFolder(familySession.folder.id),
          getFamilyFolderTimeline(familySession.folder.id, { limit: 500 }),
        ])
      : Promise.all([
          getStorytellers(500),
          getTimelineEvents({ storytellerId: id, limit: 200 }),
        ])

    fetchData
      .then(([peopleRes, evs]) => {
        if (cancelled) return

        const people = familySession
          ? (peopleRes as Awaited<ReturnType<typeof getFamilyFolder>>).members.map(member => ({
              id: member.storytellerId,
              displayName: member.displayName,
              avatarUrl: member.avatarUrl,
              isElder: member.isElder,
              bio: null,
              culturalBackground: null,
              role: member.role,
              location: null,
              isActive: !member.isAncestor,
              storyCount: member.storyCount ?? 0,
              createdAt: '',
            }))
          : (peopleRes as Storyteller[])

        const storyteller = people.find(p => p.id === id)
        if (storyteller) {
          setPerson(storyteller)
        } else {
          const kinNode = graph.nodes.find(n => n.id === id)
          if (kinNode) {
            setPerson({
              ...kinNode,
              bio: null,
              culturalBackground: null,
              role: null,
              location: null,
              isActive: false,
              storyCount: 0,
              createdAt: '',
            })
          }
        }
        const scopedEvents = familySession
          ? evs.data.filter(event => event.people.some(p => p.id === id))
          : evs.data
        setEvents(scopedEvents)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [familySession, id, graph.nodes])

  const myKinship = useMemo(
    () => normalizeKinshipForPerson(graph.edges, id),
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

  if (familySession && !familySlug && id) {
    return <Navigate to={`/f/${familySession.folder.slug}/person/${id}`} replace />
  }

  if (!isConfigured) return <Shell><p className="text-ink/60">Not configured. Add the API key to .env.local.</p></Shell>
  if (loading) return <Shell><p className="text-ink/50">Loading…</p></Shell>
  if (!person) return <Shell><p className="text-ink/60">Person not found.</p></Shell>

  const familyByCategory = groupKinship(myKinship)
  const currentYear = new Date().getFullYear()
  const isAncestor = !person.isActive && lifespan && lifespan.latest < currentYear - 20
  const personRouteBase = familySession
    ? `/f/${familySlug || familySession.folder.slug}/person`
    : '/person'
  const folderAccessRole = familySession && person.role && person.role !== 'relative'
    ? formatFolderAccessRole(person.role)
    : null
  const storytellerEditUrl = buildLedgerStorytellerEditUrl(person.id)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 text-sm text-ink/50">
        <Link
          to={familySession ? `/f/${familySlug || familySession.folder.slug}/tree` : '/family'}
          className="hover:text-ink transition-colors"
        >
          ← Family
        </Link>
        <span className="text-ink/20">·</span>
        <Link
          to={familySession ? `/f/${familySlug || familySession.folder.slug}/timeline` : '/'}
          className="hover:text-ink transition-colors"
        >
          ← Timeline
        </Link>
      </div>

      {/* Hero */}
      <header className="mt-6 mb-10">
        <div className="flex items-start gap-6">
          {person.avatarUrl ? (
            <img
              src={person.avatarUrl}
              alt=""
              className="h-28 w-28 rounded-2xl object-cover ring-1 ring-ink/10 shadow-md"
            />
          ) : (
            <div className={`h-28 w-28 rounded-2xl flex items-center justify-center text-2xl font-serif shadow-inner ${isAncestor ? 'bg-desert/10 text-desert/60' : 'bg-sand text-desert'}`}>
              {person.displayName.slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-4xl text-ink leading-tight">{person.displayName}</h1>
            <div className="flex items-center gap-2.5 mt-2 text-sm text-ink/60 flex-wrap">
              {person.isElder && (
                <span className="text-ochre uppercase tracking-wider text-xs font-medium px-2 py-0.5 rounded-full bg-ochre/10">
                  Elder
                </span>
              )}
              {isAncestor && (
                <span className="text-desert uppercase tracking-wider text-xs font-medium px-2 py-0.5 rounded-full bg-desert/10">
                  Ancestor
                </span>
              )}
              {!isAncestor && person.isActive && (
                <span className="text-eucalypt uppercase tracking-wider text-xs font-medium px-2 py-0.5 rounded-full bg-eucalypt/10">
                  Living
                </span>
              )}
              {lifespan && (
                <span className="tabular-nums">
                  {lifespan.earliest}{lifespan.latest !== lifespan.earliest ? ` – ${lifespan.latest}` : ''}
                </span>
              )}
              {person.location && <span className="flex items-center gap-1"><span className="text-ink/30">·</span> {person.location}</span>}
              {folderAccessRole && (
                <span className="flex items-center gap-1">
                  <span className="text-ink/30">·</span> Folder access: {folderAccessRole}
                </span>
              )}
            </div>
          </div>
        </div>

        {person.bio && (
          <p className="mt-6 text-ink/80 leading-relaxed max-w-3xl text-[15px]">
            {person.bio}
          </p>
        )}

        {familySession && (
          <div className="mt-6 rounded-xl border border-ink/8 bg-sand/20 px-4 py-3 text-sm text-ink/65 leading-relaxed">
            Viewing this person inside <span className="text-ink font-medium">{familySession.folder.name}</span>.
            This page shows lineage and timeline context. Folder access roles are separate from family relationships and do not place someone into the tree by themselves.
          </div>
        )}

        {storytellerEditUrl && (
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={storytellerEditUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
            >
              Edit storyteller in Empathy Ledger
            </a>
          </div>
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
                          to={`${personRouteBase}/${e.person.id}`}
                          className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-sand/30 transition-colors"
                        >
                          {e.person.avatarUrl ? (
                            <img src={e.person.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-sand flex items-center justify-center text-[10px] font-medium text-desert">
                              {e.person.displayName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm text-ink truncate">{e.person.displayName}</div>
                            <div className="text-xs text-ink/50">
                              {e.label}
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

function formatFolderAccessRole(role: string) {
  if (role === 'family_rep') return 'family rep'
  return role.replace(/_/g, ' ')
}

function DreamCard({ event }: { event: TimelineEventSummary }) {
  const register = registerForGoalScope(event.goalScope)
  return (
    <div className="border-2 border-dashed border-eucalypt/30 rounded-xl p-5 bg-eucalypt/[0.03]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {register && (
            <div className="mb-2">
              <RegisterPill register={register} />
            </div>
          )}
          <h3 className="font-serif text-lg text-ink leading-tight">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-ink/70 mt-2 leading-relaxed whitespace-pre-line">{event.description}</p>
          )}
          {event.subGoalCount > 0 && (
            <div className="text-xs text-eucalypt mt-3">
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

// M3 register tags — colour-code dreams by goal_scope so a PersonPage
// with 5+ dreams reads as a cluster, not a list. Same vocabulary as the
// seed_data.json goal_scope field; visual palette matches Editorial
// Warmth (desert / eucalypt / ochre / ink).
type DreamRegister = {
  label: string
  pillClass: string
}

function registerForGoalScope(goalScope: string | null | undefined): DreamRegister | null {
  if (!goalScope) return null
  switch (goalScope) {
    case 'family':
      return { label: 'Family dream', pillClass: 'bg-desert/10 text-desert border-desert/20' }
    case 'community':
      return { label: 'Community dream', pillClass: 'bg-eucalypt/10 text-eucalypt border-eucalypt/30' }
    case 'individual':
      return { label: 'Personal dream', pillClass: 'bg-ochre/10 text-ochre border-ochre/25' }
    default:
      return { label: goalScope.replace(/_/g, ' '), pillClass: 'bg-sand/40 text-ink/60 border-ink/10' }
  }
}

function RegisterPill({ register }: { register: DreamRegister }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${register.pillClass}`}>
      {register.label}
    </span>
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

function normalizeKinshipForPerson(edges: KinshipEdge[], personId?: string): PersonKinshipLink[] {
  if (!personId) return []

  const byKey = new Map<string, PersonKinshipLink>()

  for (const edge of edges) {
    const perspective = getKinshipPerspectiveForPerson(edge, personId)
    if (!perspective) continue

    const label = relationLabelForCategory(perspective.category, edge.vocabulary.label || edge.relationType)
    const key = `${perspective.counterpart.id}:${perspective.category}`

    if (!byKey.has(key)) {
      byKey.set(key, {
        id: `${edge.id}:${key}`,
        person: perspective.counterpart,
        category: perspective.category,
        label,
      })
    }
  }

  return [...byKey.values()]
}

function groupKinship(edges: PersonKinshipLink[]): Record<string, PersonKinshipLink[]> {
  const order: KinshipCategory[] = ['partner', 'parent', 'child', 'sibling', 'grandparent', 'grandchild', 'extended', 'ceremonial', 'mentor', 'chosen_family', 'other']
  const groups: Record<string, PersonKinshipLink[]> = {}
  for (const e of edges) {
    const label = kinshipCategoryLabel(e.category)
    if (!groups[label]) groups[label] = []
    groups[label].push(e)
  }
  const sorted: Record<string, PersonKinshipLink[]> = {}
  for (const cat of order) {
    const label = kinshipCategoryLabel(cat)
    if (groups[label]) sorted[label] = groups[label]
  }
  for (const [k, v] of Object.entries(groups)) {
    if (!sorted[k]) sorted[k] = v
  }
  return sorted
}

function byYearAsc(a: TimelineEventSummary, b: TimelineEventSummary) {
  return (a.eventYear ?? 9999) - (b.eventYear ?? 9999)
}

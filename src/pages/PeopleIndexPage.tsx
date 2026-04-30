/**
 * /people — index of every person in the Palm Island knowledge graph.
 *
 * Living elders + ancestors + historical figures + contemporary figures.
 * Filterable by status. Each card → /people/:slug detail. Living elders
 * also get a "View elder profile →" callout to /elders/:slug.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PEOPLE, type Person, type PersonStatus } from '@/palm-graph'
import { LIVING_ELDER_PINS, RIBBON_PALETTE } from '@/palm-history-timeline'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const STATUS_LABELS: Record<PersonStatus, string> = {
  'living-elder': 'Living elders',
  living: 'Living family',
  ancestor: 'Ancestors',
  'historical-figure': 'Historical figures',
  contemporary: 'Contemporary',
}

const FILTERS: Array<{ id: PersonStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'living-elder', label: 'Living elders' },
  { id: 'ancestor', label: 'Ancestors' },
  { id: 'living', label: 'Living family' },
  { id: 'historical-figure', label: 'Historical figures' },
]

export default function PeopleIndexPage() {
  const [filter, setFilter] = useState<PersonStatus | 'all'>('all')

  const grouped = useMemo(() => {
    const filtered = filter === 'all' ? PEOPLE : PEOPLE.filter((p) => p.status === filter)
    const groups: Record<string, Person[]> = {}
    for (const p of filtered) {
      const key = p.status
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    }
    return groups
  }, [filter])

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* Hero band */}
      <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto text-center">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
          Palm Island · Bwgcolman Community
        </div>
        <h1
          className="font-serif font-light leading-[1.05] mb-8"
          style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}
        >
          The people
        </h1>
        <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80">
          {PEOPLE.length} people held in the Palm Island story so far. Living elders, ancestors, witnesses,
          and the colonial actors whose decisions shaped the families. Each name links to what we know.
        </p>
      </section>

      {/* Filter bar */}
      <section className="px-6 sticky top-[60px] z-10 py-4 backdrop-blur" style={{ background: hexToRgba(P.cream, 0.85) }}>
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
          {FILTERS.map((f) => {
            const isActive = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="px-4 py-2 text-xs tracking-widest uppercase transition-colors"
                style={{
                  background: isActive ? P.ochre : 'transparent',
                  color: isActive ? P.cream : P.ochre,
                  border: `1px solid ${P.ochre}`,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Grouped sections */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        {Object.entries(grouped).map(([status, people]) => (
          <div key={status} className="mb-16">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              {STATUS_LABELS[status as PersonStatus]} · {people.length}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {people.map((person) => (
                <PersonCard key={person.slug} person={person} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

function PersonCard({ person }: { person: Person }) {
  // Living elders inherit avatar from LIVING_ELDER_PINS
  const elderPin = person.elderPinSlug
    ? LIVING_ELDER_PINS.find((e) => e.storytellerSlug === person.elderPinSlug)
    : undefined
  const avatarUrl = elderPin?.avatarUrl
  const dateLabel = person.birthYear
    ? `${person.birthYear}${person.deathYear ? ` – ${person.deathYear}` : person.status === 'ancestor' ? '' : ''}`
    : person.birthDecadeApprox
      ? `b. ${person.birthDecadeApprox}`
      : ''

  return (
    <Link to={`/people/${person.slug}`} className="group flex flex-col">
      <div className="flex items-start gap-4 mb-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={person.displayName}
            className="w-16 h-16 rounded-full object-cover shrink-0"
            style={{ filter: 'sepia(0.05) saturate(0.95)' }}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-xl shrink-0"
            style={{
              background: hexToRgba(P.ochre, 0.1),
              color: hexToRgba(P.ochre, 0.6),
              border: `1px solid ${hexToRgba(P.ochre, 0.2)}`,
            }}
          >
            {person.displayName.replace(/^(Uncle|Aunty)\s+/, '').charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg leading-tight mb-1">{person.displayName}</h3>
          {dateLabel && <div className="text-[11px] opacity-50 tracking-wide tabular-nums">{dateLabel}</div>}
        </div>
      </div>
      <p className="font-serif italic text-sm leading-relaxed opacity-75 mb-3">{person.oneLine}</p>
      {person.country.length > 0 && (
        <div className="text-[10px] tracking-[0.2em] uppercase opacity-50 mt-auto" style={{ color: P.ochre }}>
          {person.country.slice(0, 3).join(' · ')}
        </div>
      )}
    </Link>
  )
}

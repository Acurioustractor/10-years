/**
 * /places/:slug — detail page for any place in the graph.
 *
 * Country, language group, settlement, station, town, or specific place.
 * Surfaces: meaning, connected people, connected events, related places.
 */
import { Link, useParams } from 'react-router-dom'
import {
  findPlaceBySlug,
  findPersonBySlug,
  type Person,
  type Place,
} from '@/palm-graph'
import { EVENT_SLOTS, RIBBON_PALETTE } from '@/palm-history-timeline'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const CATEGORY_LABEL: Record<Place['category'], string> = {
  country: 'Country',
  'language-group': 'Language family',
  settlement: 'Settlement',
  station: 'Station',
  'specific-place': 'Place',
  town: 'Town',
}

export default function PlaceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const place = slug ? findPlaceBySlug(slug) : undefined

  if (!place) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24" style={{ background: P.cream, color: P.ink }}>
        <h1 className="font-serif text-3xl mb-4">Place not found</h1>
        <p className="font-serif italic opacity-70 mb-8">No place matches "{slug}".</p>
        <Link to="/places" className="text-sm tracking-widest uppercase underline-offset-4 hover:underline" style={{ color: P.ochre }}>
          ← Back to all places
        </Link>
      </div>
    )
  }

  const people = place.connectedPersonSlugs
    .map((s) => findPersonBySlug(s))
    .filter(Boolean) as Person[]
  const events = place.connectedEventIds
    .map((id) => EVENT_SLOTS.find((e) => e.id === id))
    .filter(Boolean) as typeof EVENT_SLOTS
  const related = place.relatedPlaceSlugs
    .map((s) => findPlaceBySlug(s))
    .filter(Boolean) as Place[]

  // Order people by status priority: living-elder, living, ancestor, historical-figure, contemporary
  const statusOrder: Record<Person['status'], number> = {
    'living-elder': 0,
    living: 1,
    ancestor: 2,
    'historical-figure': 3,
    contemporary: 4,
  }
  const sortedPeople = [...people].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* Back link */}
      <div className="px-6 pt-8 max-w-5xl mx-auto">
        <Link
          to="/places"
          className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: P.ochre }}
        >
          ← All places
        </Link>
      </div>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto text-center">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
          {CATEGORY_LABEL[place.category]}
          {place.region && <span className="opacity-60"> · {place.region}</span>}
        </div>
        <h1
          className="font-serif font-light leading-[1.05] mb-8"
          style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
        >
          {place.displayName}
        </h1>
        <p className="font-serif italic max-w-3xl mx-auto text-lg md:text-xl leading-[1.6] opacity-85">
          {place.oneLine}
        </p>
      </section>

      {/* Connected people */}
      {sortedPeople.length > 0 && (
        <section className="px-6 py-16" style={{ background: hexToRgba(P.ochre, 0.06) }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              Held by · {sortedPeople.length} {sortedPeople.length === 1 ? 'person' : 'people'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPeople.map((person) => (
                <Link
                  key={person.slug}
                  to={`/people/${person.slug}`}
                  className="group p-4 transition-all hover:shadow-md"
                  style={{ background: P.cream, border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}
                >
                  <div className="font-serif text-base leading-tight mb-1">{person.displayName}</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase opacity-50" style={{ color: P.ochre }}>
                    {person.status === 'living-elder' ? 'Living elder' : person.status === 'historical-figure' ? 'Historical figure' : person.status === 'ancestor' ? 'Ancestor' : person.status}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Connected events */}
      {events.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              What happened here
            </div>
            <div className="space-y-4">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/history#${ev.id}`}
                  className="block p-6 transition-all hover:shadow-md"
                  style={{ background: hexToRgba(P.ink, 0.04), border: `1px solid ${hexToRgba(P.ink, 0.1)}` }}
                >
                  <div className="flex items-baseline gap-6 mb-2">
                    <div className="font-serif tabular-nums text-xl shrink-0" style={{ color: P.ochre }}>
                      {ev.yearLabel}
                    </div>
                    <div className="text-[10px] tracking-[0.3em] uppercase opacity-60" style={{ color: P.ochre }}>
                      {ev.eyebrow}
                    </div>
                  </div>
                  <h3 className="font-serif text-xl leading-tight">{ev.heading}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related places */}
      {related.length > 0 && (
        <section className="px-6 py-16" style={{ background: hexToRgba(P.ochre, 0.06) }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              Related places
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/places/${rp.slug}`}
                  className="group p-4 transition-all hover:shadow-md"
                  style={{ background: P.cream, border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}
                >
                  <div className="font-serif text-base leading-tight">{rp.displayName}</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase opacity-50 mt-1" style={{ color: P.ochre }}>
                    {CATEGORY_LABEL[rp.category]}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

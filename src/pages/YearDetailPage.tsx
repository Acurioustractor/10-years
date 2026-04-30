/**
 * /years/:year — the year-anchored detail page.
 *
 * Shows the year's significance, the events that happened, the people
 * connected, the places. Year ribbon at top with prev/next year nav.
 */
import { Link, useParams } from 'react-router-dom'
import {
  ANCHOR_YEARS,
  findPersonBySlug,
  findPlaceBySlug,
  findYearByYear,
  type Person,
} from '@/palm-graph'
import { EVENT_SLOTS, RIBBON_PALETTE } from '@/palm-history-timeline'
import { JOURNEYS } from '@/palm-journeys'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function YearDetailPage() {
  const { year: yearStr } = useParams<{ year: string }>()
  const year = yearStr ? parseInt(yearStr, 10) : NaN
  const anchor = !isNaN(year) ? findYearByYear(year) : undefined

  if (!anchor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24" style={{ background: P.cream, color: P.ink }}>
        <h1 className="font-serif text-3xl mb-4">Year not anchored yet</h1>
        <p className="font-serif italic opacity-70 mb-8">
          {yearStr} is not a populated year in the graph. Years grow as the wiki and elder review surface
          more.
        </p>
        <Link to="/years" className="text-sm tracking-widest uppercase underline-offset-4 hover:underline" style={{ color: P.ochre }}>
          ← Back to all years
        </Link>
      </div>
    )
  }

  const sortedYears = [...ANCHOR_YEARS].sort((a, b) => a.year - b.year)
  const idx = sortedYears.findIndex((y) => y.year === anchor.year)
  const prev = idx > 0 ? sortedYears[idx - 1] : undefined
  const next = idx < sortedYears.length - 1 ? sortedYears[idx + 1] : undefined

  const events = anchor.connectedEventIds
    .map((id) => EVENT_SLOTS.find((e) => e.id === id))
    .filter(Boolean) as typeof EVENT_SLOTS
  const journeys = JOURNEYS.filter((j) => parseInt(j.yearLabel, 10) === anchor.year)
  const people = anchor.connectedPersonSlugs
    .map((s) => findPersonBySlug(s))
    .filter(Boolean) as Person[]
  const places = anchor.connectedPlaceSlugs
    .map((s) => findPlaceBySlug(s))
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof findPlaceBySlug>>>

  // Order people by status
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
      {/* Year ribbon nav */}
      <section className="sticky top-[60px] z-10 px-6 py-4 backdrop-blur" style={{ background: hexToRgba(P.cream, 0.85), borderBottom: `1px solid ${hexToRgba(P.ink, 0.1)}` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/years"
            className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100"
            style={{ color: P.ochre }}
          >
            ← All years
          </Link>
          <div className="flex items-center gap-4">
            {prev && (
              <Link
                to={`/years/${prev.year}`}
                className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 tabular-nums"
                style={{ color: P.ochre }}
              >
                ← {prev.yearLabel}
              </Link>
            )}
            {next && (
              <Link
                to={`/years/${next.year}`}
                className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 tabular-nums"
                style={{ color: P.ochre }}
              >
                {next.yearLabel} →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="px-6 py-24 md:py-32 max-w-4xl mx-auto text-center">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
          The year
        </div>
        <h1
          className="font-serif font-light leading-[0.98] mb-12 tabular-nums"
          style={{ fontSize: 'clamp(80px, 14vw, 200px)' }}
        >
          {anchor.yearLabel}
        </h1>
        <p className="font-serif text-xl md:text-2xl leading-[1.5] max-w-3xl mx-auto opacity-90">
          {anchor.significance}
        </p>
      </section>

      {/* Events */}
      {(events.length > 0 || journeys.length > 0) && (
        <section className="px-6 py-16" style={{ background: hexToRgba(P.ochre, 0.06) }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              Events that year
            </div>
            <div className="space-y-4">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/history#${ev.id}`}
                  className="block p-6 transition-all hover:shadow-md"
                  style={{ background: P.cream, border: `1px solid ${hexToRgba(P.ink, 0.1)}` }}
                >
                  <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 mb-2" style={{ color: P.ochre }}>
                    {ev.eyebrow}
                  </div>
                  <h3 className="font-serif text-2xl leading-tight mb-2">{ev.heading}</h3>
                  <p className="font-serif italic text-sm leading-relaxed opacity-75 line-clamp-2">
                    {ev.body}
                  </p>
                  <div className="text-xs tracking-widest uppercase opacity-50 mt-4">Open in the timeline →</div>
                </Link>
              ))}
              {journeys.map((j) => (
                <Link
                  key={j.slug}
                  to={`/journeys/${j.slug}`}
                  className="block p-6 transition-all hover:shadow-md"
                  style={{ background: P.cream, border: `1px solid ${hexToRgba(P.ink, 0.1)}` }}
                >
                  <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 mb-2" style={{ color: P.ochre }}>
                    Journey
                  </div>
                  <h3 className="font-serif text-2xl leading-tight mb-2">{j.title}</h3>
                  <p className="font-serif italic text-sm leading-relaxed opacity-75">{j.subtitle}</p>
                  <div className="text-xs tracking-widest uppercase opacity-50 mt-4">Open the journey →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* People */}
      {sortedPeople.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              People in this year
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPeople.map((person) => (
                <Link
                  key={person.slug}
                  to={`/people/${person.slug}`}
                  className="group p-4 transition-all hover:shadow-md"
                  style={{ background: hexToRgba(P.ink, 0.04), border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}
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

      {/* Places */}
      {places.length > 0 && (
        <section className="px-6 py-16" style={{ background: hexToRgba(P.ochre, 0.06) }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              Places in this year
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {places.map((pl) => (
                <Link
                  key={pl.slug}
                  to={`/places/${pl.slug}`}
                  className="group p-4 transition-all hover:shadow-md"
                  style={{ background: P.cream, border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}
                >
                  <div className="font-serif text-base leading-tight">{pl.displayName}</div>
                  {pl.region && (
                    <div className="text-[10px] tracking-wide opacity-50 mt-1">{pl.region}</div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

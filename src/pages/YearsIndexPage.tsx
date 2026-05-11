/**
 * /years — chronological index of every dated anchor year in the graph.
 *
 * Each year-card surfaces who's connected, what events happened, where.
 * Click → /years/:year for the full detail.
 */
import { Link } from 'react-router-dom'
import { ANCHOR_YEARS } from '@/palm-graph'
import { RIBBON_PALETTE } from '@/palm-history-timeline'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function YearsIndexPage() {
  const sortedYears = [...ANCHOR_YEARS].sort((a, b) => a.year - b.year)

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* Hero */}
      <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto text-center">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
          Palm Island · Bwgcolman Community
        </div>
        <h1
          className="font-serif font-light leading-[1.05] mb-8"
          style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}
        >
          The years
        </h1>
        <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80">
          {sortedYears.length} dated anchor years from 1880 to 2024. Each year holds the events, the
          people, and the places that shaped what came next.
        </p>
      </section>

      {/* Year cards */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="space-y-6">
          {sortedYears.map((y) => (
            <Link
              key={y.year}
              to={`/years/${y.year}`}
              className="group block p-8 transition-all hover:shadow-md"
              style={{ background: hexToRgba(P.ochre, 0.05), border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}
            >
              <div className="flex items-baseline gap-8 mb-4">
                <div
                  className="font-serif tabular-nums shrink-0"
                  style={{ fontSize: 'clamp(40px, 5vw, 64px)', color: P.ochre, lineHeight: 1 }}
                >
                  {y.yearLabel}
                </div>
                <div className="flex-1">
                  <p className="font-serif text-base md:text-lg leading-relaxed opacity-90">
                    {y.significance}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[10px] tracking-wider uppercase opacity-60" style={{ color: P.ochre }}>
                {y.connectedPersonSlugs.length > 0 && (
                  <span>{y.connectedPersonSlugs.length} {y.connectedPersonSlugs.length === 1 ? 'person' : 'people'}</span>
                )}
                {y.connectedEventIds.length > 0 && (
                  <span>{y.connectedEventIds.length} {y.connectedEventIds.length === 1 ? 'event' : 'events'}</span>
                )}
                {y.connectedPlaceSlugs.length > 0 && (
                  <span>{y.connectedPlaceSlugs.length} {y.connectedPlaceSlugs.length === 1 ? 'place' : 'places'}</span>
                )}
                <span className="ml-auto group-hover:opacity-100">Open the year →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

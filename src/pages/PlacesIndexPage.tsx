/**
 * /places — index of every place in the Palm Island knowledge graph.
 *
 * Country, language groups, settlements, towns, specific places.
 * Grouped by category. Each card → /places/:slug.
 */
import { Link } from 'react-router-dom'
import { PLACES, type Place, type PlaceCategory } from '@/palm-graph'
import { RIBBON_PALETTE } from '@/palm-history-timeline'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  country: 'Country',
  'language-group': 'Language family',
  settlement: 'Settlements & removal sites',
  station: 'Stations',
  'specific-place': 'Specific places',
  town: 'Towns',
}

const CATEGORY_ORDER: PlaceCategory[] = [
  'country',
  'language-group',
  'settlement',
  'specific-place',
  'town',
  'station',
]

export default function PlacesIndexPage() {
  const grouped: Record<string, Place[]> = {}
  for (const place of PLACES) {
    if (!grouped[place.category]) grouped[place.category] = []
    grouped[place.category].push(place)
  }

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
          The places
        </h1>
        <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80">
          Country, settlements, towns, and the specific places that hold the families' stories. Indigenous
          place names always; colonial names where they help.
        </p>
      </section>

      {CATEGORY_ORDER.map((cat) => {
        const places = grouped[cat]
        if (!places || places.length === 0) return null
        return (
          <section key={cat} className="px-6 py-12 max-w-6xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              {CATEGORY_LABELS[cat]} · {places.length}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <Link
                  key={place.slug}
                  to={`/places/${place.slug}`}
                  className="group p-5 transition-all hover:shadow-md flex flex-col"
                  style={{ background: hexToRgba(P.ochre, 0.05), border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}
                >
                  <h3 className="font-serif text-lg leading-tight mb-2">{place.displayName}</h3>
                  {place.region && (
                    <div className="text-[10px] tracking-wide opacity-50 mb-3 italic">{place.region}</div>
                  )}
                  <p className="font-serif italic text-sm leading-relaxed opacity-75 mb-4">{place.oneLine}</p>
                  <div className="flex items-center gap-4 mt-auto text-[10px] tracking-wider uppercase opacity-60" style={{ color: P.ochre }}>
                    {place.connectedPersonSlugs.length > 0 && (
                      <span>{place.connectedPersonSlugs.length} people</span>
                    )}
                    {place.connectedEventIds.length > 0 && (
                      <span>{place.connectedEventIds.length} events</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

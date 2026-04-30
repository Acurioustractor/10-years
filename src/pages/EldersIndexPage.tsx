/**
 * /elders — public index of all living PICC elders.
 *
 * Editorial Warmth grid, 9 portraits, one-line bios, click → /elders/:slug.
 * Front door for "everything about this elder" — the canonical surface for
 * each elder's voice, photos, family, Country, related events.
 */
import { Link } from 'react-router-dom'
import { LIVING_ELDER_PINS, RIBBON_PALETTE } from '@/palm-history-timeline'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function EldersIndexPage() {
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
          The elders
        </h1>
        <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80">
          Nine living elders carrying the lines. Tap any one to enter their page — voice, photos,
          Country, family, the events that hold them.
        </p>
      </section>

      {/* Grid of elder cards */}
      <section className="px-6 pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {LIVING_ELDER_PINS.map((elder) => (
            <Link
              key={elder.storytellerSlug}
              to={`/elders/${elder.storytellerSlug}`}
              className="group flex flex-col"
            >
              <div
                className="aspect-[4/5] mb-5 overflow-hidden"
                style={{ background: hexToRgba(P.ochre, 0.08) }}
              >
                {elder.avatarUrl ? (
                  <img
                    src={elder.avatarUrl}
                    alt={elder.displayName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    style={{ filter: 'sepia(0.05) saturate(0.95)' }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-serif text-6xl"
                    style={{ color: hexToRgba(P.ochre, 0.4) }}
                  >
                    {elder.displayName.charAt(0)}
                  </div>
                )}
              </div>
              <div
                className="text-[10px] tracking-[0.3em] uppercase mb-2"
                style={{ color: P.ochre }}
              >
                {elder.cultural}
              </div>
              <h2
                className="font-serif font-light leading-[1.1] mb-3"
                style={{ fontSize: 'clamp(24px, 2.5vw, 32px)' }}
              >
                {elder.displayName}
              </h2>
              <p className="font-serif italic text-sm leading-relaxed opacity-75 mb-4">
                {elder.oneLine}
              </p>
              <div
                className="text-xs tracking-widest uppercase opacity-60 group-hover:opacity-100 mt-auto"
                style={{ color: P.ochre }}
              >
                Open the page →
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <div
          className="mt-24 pt-12 border-t text-center max-w-2xl mx-auto"
          style={{ borderColor: hexToRgba(P.ink, 0.1) }}
        >
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-3">
            About these pages
          </div>
          <p className="font-serif italic text-sm leading-relaxed opacity-70">
            Each elder page surfaces the voice quotes, events, and Country we have on record. Open
            threads (name variants, cousin links, parent names) sit in the wiki for elder review
            before public publish. The history is a draft the families keep correcting.
          </p>
        </div>
      </section>
    </div>
  )
}

/**
 * /journeys — index of all PICC elder journeys back to Country.
 *
 * Three sections: past (Mission Beach 2024), planned (Atherton 2026),
 * dreaming (the next bridge — held open by the elders).
 */
import { Link } from 'react-router-dom'
import { JOURNEYS, type Journey } from '@/palm-journeys'
import { LIVING_ELDER_PINS, RIBBON_PALETTE } from '@/palm-history-timeline'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const STATUS_LABELS: Record<Journey['status'], string> = {
  past: 'Already walked',
  planned: 'Planned',
  dreaming: 'Held open',
}

export default function JourneyIndexPage() {
  const past = JOURNEYS.filter((j) => j.status === 'past')
  const planned = JOURNEYS.filter((j) => j.status === 'planned')
  const dreaming = JOURNEYS.filter((j) => j.status === 'dreaming')

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
          The journeys
        </h1>
        <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80">
          The elders walking back to the Country their families were taken from. Each return is a chapter
          of one long arc. Each trip prepares the next.
        </p>
      </section>

      {/* Past */}
      {past.length > 0 && (
        <JourneySection
          eyebrow={STATUS_LABELS.past}
          title="Already walked"
          journeys={past}
        />
      )}

      {/* Planned */}
      {planned.length > 0 && (
        <JourneySection
          eyebrow={STATUS_LABELS.planned}
          title="Coming up"
          journeys={planned}
        />
      )}

      {/* Dreaming */}
      {dreaming.length > 0 && (
        <JourneySection
          eyebrow={STATUS_LABELS.dreaming}
          title="Held open"
          journeys={dreaming}
        />
      )}
    </div>
  )
}

function JourneySection({
  eyebrow,
  title,
  journeys,
}: {
  eyebrow: string
  title: string
  journeys: Journey[]
}) {
  return (
    <section className="px-6 py-16 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-2" style={{ color: P.ochre }}>
          {eyebrow}
        </div>
        <h2 className="font-serif font-light leading-[1.05]" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {journeys.map((j) => (
          <JourneyCard key={j.slug} journey={j} />
        ))}
      </div>
    </section>
  )
}

function JourneyCard({ journey }: { journey: Journey }) {
  const elders = journey.elderSlugs
    .map((slug) => LIVING_ELDER_PINS.find((p) => p.storytellerSlug === slug))
    .filter(Boolean) as typeof LIVING_ELDER_PINS

  return (
    <Link to={`/journeys/${journey.slug}`} className="group flex flex-col">
      <div
        className="aspect-[16/10] mb-6 overflow-hidden relative"
        style={{ background: hexToRgba(P.ochre, 0.08) }}
      >
        <img
          src={journey.hero.url}
          alt={journey.hero.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          style={{ filter: 'sepia(0.25) brightness(0.7)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${hexToRgba(P.ink, 0.5)} 100%)`,
          }}
        />
        <div className="absolute bottom-4 left-4 text-[11px] tracking-[0.3em] uppercase" style={{ color: P.cream }}>
          {journey.yearLabel} · {journey.location}
        </div>
      </div>
      <h3
        className="font-serif font-light leading-[1.05] mb-3"
        style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}
      >
        {journey.title}
      </h3>
      <p className="font-serif italic text-base leading-relaxed opacity-75 mb-6 max-w-[55ch]">
        {journey.subtitle}
      </p>
      {elders.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            {elders.slice(0, 5).map((e) =>
              e.avatarUrl ? (
                <img
                  key={e.storytellerSlug}
                  src={e.avatarUrl}
                  alt={e.displayName}
                  className="w-9 h-9 rounded-full object-cover"
                  style={{ border: `2px solid ${P.cream}` }}
                />
              ) : null
            )}
          </div>
          <div className="text-xs tracking-wider uppercase opacity-60">
            {elders.length} elder{elders.length === 1 ? '' : 's'}
          </div>
        </div>
      )}
      <div
        className="text-xs tracking-widest uppercase opacity-60 group-hover:opacity-100 mt-auto"
        style={{ color: P.ochre }}
      >
        Open the journey →
      </div>
    </Link>
  )
}

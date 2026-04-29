/**
 * /journeys/:slug — full scrollytelling spread for one elder journey.
 *
 * Hero → who goes → why this place → chapters (each a full panel with
 * pullquote + photo + frame) → closing reflection → connected events.
 */
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findJourneyBySlug } from '@/palm-journeys'
import { EVENT_SLOTS, LIVING_ELDER_PINS, RIBBON_PALETTE } from '@/palm-history-timeline'
import Lightbox, { type LightboxImage } from '@/components/Lightbox'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function JourneyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const journey = slug ? findJourneyBySlug(slug) : undefined
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!journey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24" style={{ background: P.cream, color: P.ink }}>
        <h1 className="font-serif text-3xl mb-4">Journey not found</h1>
        <p className="font-serif italic opacity-70 mb-8">No journey matches "{slug}".</p>
        <Link to="/journeys" className="text-sm tracking-widest uppercase underline-offset-4 hover:underline" style={{ color: P.ochre }}>
          ← Back to all journeys
        </Link>
      </div>
    )
  }

  const elders = journey.elderSlugs
    .map((s) => LIVING_ELDER_PINS.find((p) => p.storytellerSlug === s))
    .filter(Boolean) as typeof LIVING_ELDER_PINS

  const allPhotos: LightboxImage[] = [
    journey.hero,
    ...journey.chapters.filter((c) => c.bg).map((c) => c.bg!),
  ]

  const events = (journey.connectedEventIds || [])
    .map((id) => EVENT_SLOTS.find((e) => e.id === id))
    .filter(Boolean) as typeof EVENT_SLOTS

  const statusLabel =
    journey.status === 'past' ? 'Already walked' : journey.status === 'planned' ? 'Planned' : 'Held open'

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* Back link */}
      <div className="px-6 pt-8 max-w-5xl mx-auto">
        <Link
          to="/journeys"
          className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: P.ochre }}
        >
          ← All journeys
        </Link>
      </div>

      {/* Hero */}
      <section
        className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-24 mt-4 overflow-hidden"
        style={{ color: P.cream }}
      >
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={`Open photo: ${journey.hero.title}`}
          className="absolute inset-0 w-full h-full cursor-zoom-in"
        >
          <img
            src={journey.hero.url}
            alt={journey.hero.title}
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(0.4) brightness(0.42) contrast(1.05)' }}
          />
        </button>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.5)} 0%, ${hexToRgba(P.ink, 0.85)} 100%)`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto pointer-events-none">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-70 mb-6">
            {statusLabel} · {journey.date}
          </div>
          <h1
            className="font-serif font-light leading-[0.98] mb-6"
            style={{ fontSize: 'clamp(48px, 7.5vw, 112px)' }}
          >
            {journey.title}
          </h1>
          <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-85">
            {journey.subtitle}
          </p>
          <div className="mt-8 text-[11px] tracking-[0.3em] uppercase opacity-60">{journey.location}</div>
        </div>
      </section>

      {/* Who goes / who went */}
      {elders.length > 0 && (
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
            {journey.status === 'past' ? 'Who walked' : 'Who walks'}
          </div>
          <div className="flex flex-wrap items-start gap-6 md:gap-10">
            {elders.map((e) => (
              <Link
                key={e.storytellerSlug}
                to={`/elders/${e.storytellerSlug}`}
                className="group flex flex-col items-center max-w-[140px] hover:opacity-90 transition-opacity"
              >
                {e.avatarUrl ? (
                  <img
                    src={e.avatarUrl}
                    alt={e.displayName}
                    className="w-20 h-20 rounded-full object-cover mb-3"
                    style={{ border: `1px solid ${hexToRgba(P.ink, 0.2)}` }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center font-serif text-2xl mb-3"
                    style={{ background: hexToRgba(P.ochre, 0.15), color: P.ochre }}
                  >
                    {e.displayName.charAt(0)}
                  </div>
                )}
                <div className="text-sm font-serif leading-tight text-center">{e.displayName}</div>
                <div className="text-[10px] opacity-50 tracking-wide mt-1 text-center">{e.cultural}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Why this place */}
      <section className="py-20 px-6" style={{ background: hexToRgba(P.ochre, 0.06) }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
            Why this place
          </div>
          <p className="font-serif text-lg md:text-xl leading-[1.7] opacity-90">{journey.whyThisPlace}</p>
        </div>
      </section>

      {/* Chapters */}
      {journey.chapters.map((chapter, idx) => (
        <section
          key={idx}
          className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden"
          style={{ background: P.ink, color: P.cream }}
        >
          {chapter.bg && (
            <>
              <button
                type="button"
                onClick={() => {
                  // chapter[idx].bg sits at allPhotos[idx+1] since hero is index 0
                  // and we filtered to chapters with bg before pushing
                  const photoIdx = allPhotos.findIndex((p) => p.url === chapter.bg!.url)
                  if (photoIdx >= 0) setLightboxIndex(photoIdx)
                }}
                aria-label={`Open photo: ${chapter.bg.title}`}
                className="absolute inset-0 w-full h-full cursor-zoom-in"
              >
                <img
                  src={chapter.bg.url}
                  alt={chapter.bg.title}
                  className="w-full h-full object-cover"
                  style={{ filter: 'sepia(0.4) brightness(0.32) contrast(1.05)' }}
                />
              </button>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.6)} 0%, ${hexToRgba(P.ink, 0.9)} 100%)`,
                }}
              />
            </>
          )}
          <div className="relative z-10 max-w-3xl mx-auto pointer-events-none">
            <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-6" style={{ color: P.amber }}>
              {chapter.eyebrow}
            </div>
            <h2 className="font-serif font-light leading-[1.05] mb-8" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)' }}>
              {chapter.heading}
            </h2>
            <p className="font-serif italic opacity-85 max-w-2xl text-lg md:text-xl leading-relaxed mx-auto mb-12">
              {chapter.body}
            </p>
            {chapter.pullquote && (
              <figure className="border-l-2 pl-6 my-10 text-left max-w-2xl mx-auto" style={{ borderColor: P.ochre }}>
                <blockquote
                  className="font-serif italic font-light leading-[1.25]"
                  style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
                >
                  &ldquo;{chapter.pullquote}&rdquo;
                </blockquote>
                {chapter.attribution && (
                  <figcaption className="text-xs tracking-wider uppercase opacity-70 mt-4" style={{ color: P.amber }}>
                    {chapter.attribution}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </section>
      ))}

      {/* Closing reflection */}
      {journey.closingReflection && (
        <section className="py-32 px-6" style={{ background: P.cream, color: P.ink }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              {journey.status === 'past' ? 'What we brought back' : 'What we carry in'}
            </div>
            <p className="font-serif italic text-xl md:text-2xl leading-[1.4] opacity-90 mb-12 max-w-2xl mx-auto">
              {journey.closingReflection.body}
            </p>
            {journey.closingReflection.pullquote && (
              <figure>
                <blockquote
                  className="font-serif font-light leading-[1.2]"
                  style={{ fontSize: 'clamp(24px, 3.2vw, 40px)' }}
                >
                  &ldquo;{journey.closingReflection.pullquote}&rdquo;
                </blockquote>
                {journey.closingReflection.attribution && (
                  <figcaption className="mt-6 text-xs tracking-widest uppercase opacity-60" style={{ color: P.ochre }}>
                    {journey.closingReflection.attribution}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </section>
      )}

      {/* Connected events */}
      {events.length > 0 && (
        <section className="py-20 px-6" style={{ background: hexToRgba(P.ochre, 0.06) }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              In the timeline
            </div>
            <div className="space-y-6">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/history#${ev.id}`}
                  className="block p-6 transition-all hover:shadow-md"
                  style={{
                    background: P.cream,
                    border: `1px solid ${hexToRgba(P.ink, 0.1)}`,
                  }}
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

      {/* Editorial note */}
      {journey.notes && (
        <section className="py-12 px-6" style={{ background: P.cream }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-2">Editorial note</div>
            <p className="font-serif italic text-sm leading-relaxed opacity-65">{journey.notes}</p>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={allPhotos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

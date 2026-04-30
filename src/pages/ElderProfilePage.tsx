/**
 * /elders/:slug — canonical surface for one PICC elder.
 *
 * Sections: hero portrait → bio → voice (auto-collected from cluster-configs
 * chapter pullquotes attributed to this elder) → events that name them
 * (from EVENT_SLOTS) → Country → family folder + cluster page links.
 *
 * Self-contained: no API calls (the production /api/v2/communities/.../research
 * endpoint is 500-ing as of 2026-04-30). Voice quotes and events come from
 * static data files which the wiki team controls.
 */
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  findElderBySlug,
  findElderInAttribution,
  getEventsForElder,
  RIBBON_PALETTE,
  type LivingElderPin,
} from '@/palm-history-timeline'
import { CLUSTER_CONFIGS } from '@/cluster-configs'
import { getJourneysForElder } from '@/palm-journeys'
import { findPlaceBySlug } from '@/palm-graph'
import Lightbox from '@/components/Lightbox'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type VoiceQuote = {
  text: string
  attribution: string
  context: string         // "Palmer · Burns · Obah cluster · chapter"
  clusterSlug: string
  bg?: { url: string; title: string }
}

/**
 * Auto-collects pullquotes attributed to this elder from across cluster-configs:
 * - Cluster opening quotes (where quoterMatch matches)
 * - Cluster chapter pullquotes (where attribution names the elder)
 * - Ancestor quotes (where the quoter — not the ancestor — is the elder)
 */
function collectVoiceQuotes(elder: LivingElderPin): VoiceQuote[] {
  const quotes: VoiceQuote[] = []
  for (const cluster of Object.values(CLUSTER_CONFIGS)) {
    // Opening quote
    if (cluster.openingQuote.quoterMatch && elder.displayName.includes(cluster.openingQuote.quoterMatch)) {
      quotes.push({
        text: cluster.openingQuote.text,
        attribution: cluster.openingQuote.quoterDisplayName,
        context: `${cluster.name.join(' · ')} · opening`,
        clusterSlug: cluster.slug,
      })
    }
    // Chapter pullquotes
    for (const chapter of cluster.chapters || []) {
      const matched = findElderInAttribution(chapter.attribution)
      if (matched?.storytellerSlug === elder.storytellerSlug) {
        quotes.push({
          text: chapter.pullquote,
          attribution: chapter.attribution,
          context: `${cluster.name.join(' · ')} · ${chapter.eyebrow}`,
          clusterSlug: cluster.slug,
          bg: chapter.bg ? { url: chapter.bg.url, title: chapter.bg.title } : undefined,
        })
      }
    }
    // Ancestor quotes (quoter, not the ancestor)
    for (const [, q] of Object.entries(cluster.ancestorQuotes || {})) {
      if (q.quoterMatch && elder.displayName.includes(q.quoterMatch)) {
        quotes.push({
          text: q.text,
          attribution: q.attribution,
          context: `${cluster.name.join(' · ')} · ancestor`,
          clusterSlug: cluster.slug,
        })
      }
    }
  }
  return quotes
}

export default function ElderProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const elder = slug ? findElderBySlug(slug) : undefined
  const [portraitOpen, setPortraitOpen] = useState(false)

  const quotes = useMemo(() => (elder ? collectVoiceQuotes(elder) : []), [elder])
  const events = useMemo(() => (elder ? getEventsForElder(elder.storytellerSlug) : []), [elder])
  const journeys = useMemo(() => (elder ? getJourneysForElder(elder.storytellerSlug) : []), [elder])

  if (!elder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24" style={{ background: P.cream, color: P.ink }}>
        <h1 className="font-serif text-3xl mb-4">Elder not found</h1>
        <p className="font-serif italic opacity-70 mb-8">No elder matches "{slug}".</p>
        <Link to="/elders" className="text-sm tracking-widest uppercase underline-offset-4 hover:underline" style={{ color: P.ochre }}>
          ← Back to all elders
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* Back link */}
      <div className="px-6 pt-8 max-w-5xl mx-auto">
        <Link
          to="/elders"
          className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: P.ochre }}
        >
          ← All elders
        </Link>
      </div>

      {/* Hero — portrait + name */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 md:gap-16 items-start">
          <div>
            {elder.avatarUrl ? (
              <button
                type="button"
                onClick={() => setPortraitOpen(true)}
                aria-label={`Open portrait of ${elder.displayName} full-screen`}
                className="block w-full cursor-zoom-in"
              >
                <img
                  src={elder.avatarUrl}
                  alt={elder.displayName}
                  className="w-full aspect-[4/5] object-cover transition-opacity hover:opacity-95"
                  style={{ filter: 'sepia(0.05) saturate(0.95)' }}
                />
              </button>
            ) : (
              <div
                className="w-full aspect-[4/5] flex items-center justify-center font-serif text-7xl"
                style={{ background: hexToRgba(P.ochre, 0.1), color: hexToRgba(P.ochre, 0.5) }}
              >
                {elder.displayName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
              {elder.cultural}
            </div>
            <h1
              className="font-serif font-light leading-[1.05] mb-3"
              style={{ fontSize: 'clamp(40px, 5.5vw, 80px)' }}
            >
              {elder.displayName}
            </h1>
            <div className="text-base mb-8 opacity-50 tracking-wide">{elder.birthDecadeLabel}</div>
            <p className="font-serif text-lg md:text-xl leading-[1.65] opacity-85" style={{ maxWidth: '60ch' }}>
              {elder.bio}
            </p>
            {elder.country && (
              <div className="mt-10">
                <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-2">Country</div>
                <div className="font-serif italic text-base opacity-80">{elder.country}</div>
                {(() => {
                  const graphCountrySlugs = elder.country
                    .split(/[·,]/)
                    .map((s) => s.trim().toLowerCase().replace(/\s+/g, '-'))
                  const places = graphCountrySlugs
                    .map((s) => findPlaceBySlug(s))
                    .filter(Boolean) as Array<NonNullable<ReturnType<typeof findPlaceBySlug>>>
                  if (places.length === 0) return null
                  return (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {places.map((pl) => (
                        <Link
                          key={pl.slug}
                          to={`/places/${pl.slug}`}
                          className="text-[10px] tracking-widest uppercase underline-offset-4 hover:underline"
                          style={{ color: P.ochre }}
                        >
                          {pl.displayName} →
                        </Link>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Voice quotes */}
      {quotes.length > 0 && (
        <section className="py-24 px-6" style={{ background: P.ink, color: P.cream }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.amber }}>
                Voice
              </div>
              <h2 className="font-serif font-light leading-[1.05]" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
                Their words, on record
              </h2>
            </div>
            <div className="space-y-16">
              {quotes.map((q, i) => (
                <figure key={i} className="border-l-2 pl-6 md:pl-8" style={{ borderColor: P.ochre }}>
                  <blockquote
                    className="font-serif italic font-light leading-[1.3]"
                    style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}
                  >
                    &ldquo;{q.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex flex-col gap-1">
                    <div className="text-xs tracking-widest uppercase opacity-70" style={{ color: P.amber }}>
                      {q.attribution}
                    </div>
                    <Link
                      to={`/f/${q.clusterSlug}`}
                      className="text-[11px] tracking-wider uppercase opacity-50 hover:opacity-80 transition-opacity"
                    >
                      {q.context} →
                    </Link>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events that hold their voice */}
      {events.length > 0 && (
        <section className="py-24 px-6" style={{ background: P.cream }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
                History
              </div>
              <h2 className="font-serif font-light leading-[1.05]" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
                Events that hold them
              </h2>
            </div>
            <div className="space-y-8">
              {events.map((ev) => (
                <Link
                  key={ev.eventId}
                  to={`/history#${ev.eventId}`}
                  className="block p-8 transition-all hover:shadow-md"
                  style={{
                    background: hexToRgba(P.ink, 0.04),
                    border: `1px solid ${hexToRgba(P.ink, 0.1)}`,
                  }}
                >
                  <div className="flex items-baseline gap-6 mb-3">
                    <div
                      className="font-serif tabular-nums text-2xl shrink-0"
                      style={{ color: P.ochre }}
                    >
                      {ev.yearLabel}
                    </div>
                    <div
                      className="text-[10px] tracking-[0.3em] uppercase opacity-60"
                      style={{ color: P.ochre }}
                    >
                      {ev.eyebrow}
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl leading-tight mb-2">{ev.heading}</h3>
                  <div className="text-xs tracking-widest uppercase opacity-50">Open in the timeline →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Journeys */}
      {journeys.length > 0 && (
        <section className="py-24 px-6" style={{ background: P.cream }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
                Journeys
              </div>
              <h2 className="font-serif font-light leading-[1.05]" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
                Walking back to Country
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {journeys.map((j) => (
                <Link
                  key={j.slug}
                  to={`/journeys/${j.slug}`}
                  className="group flex flex-col"
                >
                  <div
                    className="aspect-[16/10] mb-5 overflow-hidden relative"
                    style={{ background: hexToRgba(P.ochre, 0.08) }}
                  >
                    <img
                      src={j.hero.url}
                      alt={j.hero.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      style={{ filter: 'sepia(0.25) brightness(0.7)' }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(180deg, transparent 0%, ${hexToRgba(P.ink, 0.5)} 100%)` }}
                    />
                    <div className="absolute bottom-3 left-3 text-[10px] tracking-[0.3em] uppercase" style={{ color: P.cream }}>
                      {j.yearLabel} · {j.status === 'past' ? 'walked' : j.status === 'planned' ? 'planned' : 'held open'}
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl leading-tight mb-2">{j.title}</h3>
                  <p className="font-serif italic text-sm leading-relaxed opacity-75 mb-3">{j.subtitle}</p>
                  <div
                    className="text-xs tracking-widest uppercase opacity-60 group-hover:opacity-100 mt-auto"
                    style={{ color: P.ochre }}
                  >
                    Open the journey →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Family + cluster links */}
      <section className="py-24 px-6" style={{ background: hexToRgba(P.ochre, 0.06) }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
            Where to next
          </div>
          <h2 className="font-serif font-light leading-[1.1] mb-12" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
            More transcripts and photos sit inside the family folder
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link
              to={`/elders/${elder.storytellerSlug}/lineage`}
              className="px-8 py-4 font-serif text-base hover:opacity-90 transition-opacity"
              style={{ background: P.ochre, color: P.cream }}
            >
              See the lineage
            </Link>
            <Link
              to={`/f/${elder.clusterSlug}`}
              className="px-8 py-4 font-serif text-base border-2 hover:opacity-90 transition-opacity"
              style={{ borderColor: P.ochre, color: P.ochre }}
            >
              Open the family folder
            </Link>
            <Link
              to={`/f/${elder.clusterSlug}/tree`}
              className="px-8 py-4 font-serif text-base border-2 hover:opacity-90 transition-opacity"
              style={{ borderColor: P.ochre, color: P.ochre }}
            >
              See the family tree
            </Link>
          </div>
          <div className="mt-12 text-[10px] tracking-[0.3em] uppercase opacity-50">
            Open elder-review threads sit in the wiki before public publish
          </div>
        </div>
      </section>

      {/* Portrait lightbox */}
      {portraitOpen && elder.avatarUrl && (
        <Lightbox
          images={[
            {
              url: elder.avatarUrl,
              title: elder.displayName,
              year: '',
              source: `${elder.cultural} · Palm Island Community Company`,
              license: 'Family consent · public surface',
            },
          ]}
          index={0}
          onClose={() => setPortraitOpen(false)}
        />
      )}
    </div>
  )
}

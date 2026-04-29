/**
 * Palm Island History Ribbon — public scroll page for the 10-years app.
 *
 * Front door. Ties together what the wiki has documented and what the cluster
 * pages render. Hybrid spine: pinned year column on the left, full-screen
 * editorial panels in the middle, living-elder pins band per decade, today
 * gallery of portal cards into family folders at the end.
 *
 * Data: src/palm-history-timeline.ts
 * Visual language: matches ClusterShowcase.tsx (sepia photos, ink overlay,
 * Lora serif, ochre accent, tracking-widest uppercase eyebrows).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildSpine,
  EVENT_SLOTS,
  findElderInAttribution,
  LIVING_ELDER_PINS,
  RIBBON_PALETTE,
  TODAY_GALLERY,
  YEAR_MARKERS,
  type DecadeBackdrop,
  type EventSlot,
  type LivingElderPin,
  type RibbonImage,
  type TodayPortalCard,
} from '@/palm-history-timeline'
import Lightbox from '@/components/Lightbox'
import { getJourneysForEvent } from '@/palm-journeys'

/** First name (after stripping Uncle/Aunty) — used for the initial-circle fallback. */
function nameInitial(displayName: string): string {
  const stripped = displayName.replace(/^(Uncle|Aunty)\s+/, '').split(' ')[0] || displayName
  return stripped.charAt(0)
}

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function TimelineRibbon() {
  const spine = buildSpine()
  const [activeYear, setActiveYear] = useState<number>(YEAR_MARKERS[0]!.year)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const panelRefs = useRef<Record<string, HTMLElement | null>>({})

  // All panel hero photos in scroll order — drives Lightbox prev/next.
  // Hero panel uses EVENT_SLOTS[0].bg, then spine (decades + events) in order.
  const allPhotos: RibbonImage[] = useMemo(() => {
    const out: RibbonImage[] = []
    out.push(EVENT_SLOTS[0]!.bg) // hero panel uses first event's bg
    for (const node of spine) out.push(node.data.bg)
    return out
  }, [spine])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const yearAttr = entry.target.getAttribute('data-year')
            if (yearAttr) setActiveYear(parseInt(yearAttr, 10))
          }
        }
      },
      { threshold: [0.4, 0.6, 0.8] }
    )
    Object.values(panelRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen relative">
      {/* ── Year Ribbon (fixed left edge) ─────────────────────────────── */}
      <YearRibbon activeYear={activeYear} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        ref={(el) => {
          panelRefs.current['hero'] = el
        }}
        data-year="1880"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 md:pl-32 overflow-hidden"
        style={{ color: P.cream }}
      >
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={`Open photo: ${EVENT_SLOTS[0]!.bg.title}`}
          className="absolute inset-0 w-full h-full cursor-zoom-in group"
        >
          <img
            src={EVENT_SLOTS[0]!.bg.url}
            alt={EVENT_SLOTS[0]!.bg.title}
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(0.45) brightness(0.4) contrast(1.05)' }}
          />
        </button>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.55)} 0%, ${hexToRgba(P.ink, 0.9)} 100%)`,
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto w-full pointer-events-none">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">
            Palm Island · Bwgcolman Community
          </div>
          <h1 className="font-serif font-light leading-[0.95] mb-6" style={{ fontSize: 'clamp(48px, 8vw, 120px)' }}>
            The history,
            <span className="block italic opacity-80 mt-2">in one scroll</span>
          </h1>
          <p className="font-serif italic opacity-80 max-w-2xl text-lg md:text-xl leading-relaxed mx-auto mt-8">
            From Lucy at Blencoe Falls in the 1880s to the elders alive today. Year by year. The events, the
            voices, the families that hold them.
          </p>
          <div className="mt-12 text-xs opacity-50 tracking-widest uppercase">↓ Scroll</div>
        </div>
        <ExpandHint onClick={() => setLightboxIndex(0)} />
      </section>

      {/* ── Spine: decade backdrops + event panels interleaved ────────── */}
      {spine.map((node, i) => {
        const photoIndex = i + 1 // hero is index 0; spine[i] is i+1
        if (node.kind === 'decade') {
          return (
            <DecadePanel
              key={`d-${node.data.id}`}
              decade={node.data}
              elders={LIVING_ELDER_PINS.filter((e) => e.birthDecade === node.data.decadeStart)}
              onOpenPhoto={() => setLightboxIndex(photoIndex)}
              registerRef={(el) => {
                panelRefs.current[`d-${node.data.id}`] = el
              }}
            />
          )
        }
        return (
          <EventPanel
            key={`e-${node.data.id}`}
            event={node.data}
            onOpenPhoto={() => setLightboxIndex(photoIndex)}
            registerRef={(el) => {
              panelRefs.current[`e-${node.data.id}`] = el
            }}
          />
        )
      })}

      {/* ── Today Gallery (portal cards into family folders) ───────────── */}
      <TodayGallery
        cards={TODAY_GALLERY}
        registerRef={(el) => {
          panelRefs.current['today'] = el
        }}
      />

      {/* ── Lightbox (full-screen photo viewer) ─────────────────────── */}
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

/** Small "expand" button in bottom-right of a panel — makes lightbox hint obvious. */
function ExpandHint({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open photo full-screen"
      className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-20 w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
      style={{ background: hexToRgba(P.ink, 0.5), border: `1px solid ${hexToRgba(P.cream, 0.2)}` }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </button>
  )
}

// ─────────────────────  Year Ribbon (fixed left edge)  ────────────────────────

function YearRibbon({ activeYear }: { activeYear: number }) {
  const minYear = YEAR_MARKERS[0]!.year
  const maxYear = YEAR_MARKERS[YEAR_MARKERS.length - 1]!.year

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center justify-center z-30 pointer-events-none"
      style={{ background: hexToRgba(P.ink, 0.92), color: P.cream }}
    >
      <div className="relative h-[80vh] w-full flex flex-col items-center justify-between py-2">
        {/* Spine line */}
        <div
          className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
          style={{ background: hexToRgba(P.cream, 0.18) }}
        />
        {YEAR_MARKERS.map((m) => {
          const top = ((m.year - minYear) / (maxYear - minYear)) * 100
          const isActive = activeYear >= m.year
          return (
            <div
              key={m.year}
              className="absolute left-0 right-0 flex items-center justify-center"
              style={{ top: `${top}%` }}
            >
              <div className="flex items-center gap-2 -translate-y-1/2">
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: m.major ? 10 : 6,
                    height: m.major ? 10 : 6,
                    background: isActive ? P.ochre : hexToRgba(P.cream, 0.4),
                  }}
                />
                <span
                  className="font-serif tabular-nums transition-opacity"
                  style={{
                    fontSize: m.major ? 13 : 11,
                    opacity: isActive ? 1 : 0.5,
                    color: isActive ? P.amber : P.cream,
                  }}
                >
                  {m.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

// ─────────────────────  Decade backdrop panel  ───────────────────────────────

function DecadePanel({
  decade,
  elders,
  onOpenPhoto,
  registerRef,
}: {
  decade: DecadeBackdrop
  elders: LivingElderPin[]
  onOpenPhoto: () => void
  registerRef: (el: HTMLElement | null) => void
}) {
  return (
    <section
      ref={registerRef}
      data-year={decade.decadeStart}
      className="relative min-h-screen flex items-center justify-center px-6 md:pl-32 overflow-hidden"
      style={{ color: P.cream }}
    >
      <button
        type="button"
        onClick={onOpenPhoto}
        aria-label={`Open photo: ${decade.bg.title}`}
        className="absolute inset-0 w-full h-full cursor-zoom-in"
      >
        <img
          src={decade.bg.url}
          alt={decade.bg.title}
          className="w-full h-full object-cover"
          style={{ filter: 'sepia(0.5) brightness(0.4) contrast(1.05)' }}
        />
      </button>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.55)} 0%, ${hexToRgba(P.ink, 0.85)} 100%)`,
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-6">
          {decade.decadeStart}s
        </div>
        <h2 className="font-serif font-light leading-[1.05] mb-8" style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}>
          {decade.label}
        </h2>
        <p className="font-serif italic opacity-80 max-w-2xl text-lg md:text-xl leading-relaxed mx-auto">
          {decade.caption}
        </p>

        {/* Living-elder pins for this decade */}
        {elders.length > 0 && (
          <div className="mt-16 pt-10 border-t" style={{ borderColor: hexToRgba(P.cream, 0.15) }}>
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-6">
              Living elders of this era
            </div>
            <div className="flex flex-wrap items-start justify-center gap-6 md:gap-10">
              {elders.map((e) => {
                return (
                  <Link
                    key={e.storytellerSlug}
                    to={`/elders/${e.storytellerSlug}`}
                    className="group flex flex-col items-center max-w-[140px] hover:opacity-90 transition-opacity"
                  >
                    {e.avatarUrl ? (
                      <img
                        src={e.avatarUrl}
                        alt={e.displayName}
                        className="w-16 h-16 rounded-full object-cover mb-3"
                        style={{ border: `1px solid ${hexToRgba(P.cream, 0.4)}` }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-xl mb-3"
                        style={{
                          background: hexToRgba(P.cream, 0.1),
                          border: `1px solid ${hexToRgba(P.cream, 0.4)}`,
                          color: P.amber,
                        }}
                      >
                        {nameInitial(e.displayName)}
                      </div>
                    )}
                    <div className="text-sm font-serif leading-tight text-center">{e.displayName}</div>
                    <div className="text-[10px] opacity-50 tracking-wide mt-1 text-center">
                      {e.birthDecadeLabel}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <ImageCaption bg={decade.bg} />
      <ExpandHint onClick={onOpenPhoto} />
    </section>
  )
}

// ─────────────────────  Event panel (named full-screen)  ─────────────────────

function EventPanel({
  event,
  onOpenPhoto,
  registerRef,
}: {
  event: EventSlot
  onOpenPhoto: () => void
  registerRef: (el: HTMLElement | null) => void
}) {
  return (
    <section
      ref={registerRef}
      data-year={event.year}
      className="relative min-h-screen flex items-center justify-center px-6 md:pl-32 py-20 overflow-hidden"
      style={{ color: P.cream }}
    >
      <button
        type="button"
        onClick={onOpenPhoto}
        aria-label={`Open photo: ${event.bg.title}`}
        className="absolute inset-0 w-full h-full cursor-zoom-in"
      >
        <img
          src={event.bg.url}
          alt={event.bg.title}
          className="w-full h-full object-cover"
          style={{ filter: 'sepia(0.45) brightness(0.35) contrast(1.05)' }}
        />
      </button>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.7)} 0%, ${hexToRgba(P.ink, 0.92)} 100%)`,
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto w-full">
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-3">{event.eyebrow}</div>
        <div className="font-serif text-sm tabular-nums opacity-70 mb-6">{event.yearLabel}</div>
        <h2
          className="font-serif font-light leading-[1.05] mb-8"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
        >
          {event.heading}
        </h2>
        <p className="font-serif text-lg md:text-xl leading-relaxed opacity-90 mb-10">{event.body}</p>

        {event.pullquote && (
          <figure className="border-l-2 pl-6 my-12" style={{ borderColor: P.ochre }}>
            <blockquote
              className="font-serif italic font-light leading-[1.25]"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
            >
              "{event.pullquote}"
            </blockquote>
            {event.attribution && <EventAttribution attribution={event.attribution} />}
          </figure>
        )}

        {/* Cross-link to clusters */}
        {event.connectedClusters.length > 0 && (
          <div className="mt-12 pt-8 border-t" style={{ borderColor: hexToRgba(P.cream, 0.15) }}>
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-4">
              Held by these families
            </div>
            <div className="flex flex-wrap gap-3">
              {event.connectedClusters.map((slug) => (
                <Link
                  key={slug}
                  to={`/f/${slug}`}
                  className="text-sm font-serif italic underline-offset-4 hover:underline"
                  style={{ color: P.amber }}
                >
                  {slug
                    .split('-')
                    .map((w) => w[0]!.toUpperCase() + w.slice(1))
                    .join(' · ')}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cross-link to journeys (the elders walking back to this place) */}
        {(() => {
          const journeys = getJourneysForEvent(event.id)
          if (journeys.length === 0) return null
          return (
            <div className="mt-8 pt-8 border-t" style={{ borderColor: hexToRgba(P.cream, 0.15) }}>
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-4">
                The elders walked back here
              </div>
              <div className="flex flex-col gap-2">
                {journeys.map((j) => (
                  <Link
                    key={j.slug}
                    to={`/journeys/${j.slug}`}
                    className="text-sm font-serif italic underline-offset-4 hover:underline"
                    style={{ color: P.amber }}
                  >
                    {j.title} · {j.yearLabel} →
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
      <ImageCaption bg={event.bg} />
      <ExpandHint onClick={onOpenPhoto} />
    </section>
  )
}

// ─────────────────────  Today Gallery  ────────────────────────────────────────

function TodayGallery({
  cards,
  registerRef,
}: {
  cards: TodayPortalCard[]
  registerRef: (el: HTMLElement | null) => void
}) {
  return (
    <section
      ref={registerRef}
      data-year="2026"
      className="relative min-h-screen px-6 md:pl-32 py-24"
      style={{ background: P.cream, color: P.ink }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-4" style={{ color: P.ochre }}>
            Today · 2026
          </div>
          <h2
            className="font-serif font-light leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
          >
            The elders carrying it now
          </h2>
          <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80">
            Each elder holds a family folder. Tap a name to enter. The folders are theirs to fill, theirs to
            share, theirs to keep.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.storytellerSlug}
              to={`/elders/${card.storytellerSlug}`}
              className="group flex flex-col p-8 rounded-sm transition-all hover:shadow-lg"
              style={{
                background: hexToRgba(P.ink, 0.04),
                border: `1px solid ${hexToRgba(P.ink, 0.1)}`,
              }}
            >
              {card.avatarUrl ? (
                <img
                  src={card.avatarUrl}
                  alt={card.displayName}
                  className="w-16 h-16 rounded-full object-cover mb-5"
                  style={{ border: `1px solid ${hexToRgba(P.ochre, 0.3)}` }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl mb-5"
                  style={{
                    background: hexToRgba(P.ochre, 0.15),
                    color: P.ochre,
                    border: `1px solid ${hexToRgba(P.ochre, 0.3)}`,
                  }}
                >
                  {nameInitial(card.displayName)}
                </div>
              )}
              <div className="font-serif text-2xl leading-tight mb-2">{card.displayName}</div>
              <div className="text-[10px] tracking-[0.2em] uppercase opacity-50 mb-4">{card.clusterLabel}</div>
              <p className="font-serif italic text-sm leading-relaxed opacity-80 mb-6">{card.oneLine}</p>
              <div
                className="mt-auto text-xs tracking-widest uppercase opacity-60 group-hover:opacity-100"
                style={{ color: P.ochre }}
              >
                Enter the folder →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t text-center" style={{ borderColor: hexToRgba(P.ink, 0.1) }}>
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-3">A note on what's here</div>
          <p className="font-serif italic max-w-2xl mx-auto text-sm leading-relaxed opacity-70">
            This page recycles photos from the wiki and the cluster pages. Not every elder's birth year is
            transcript-confirmed; some are dated to the decade. Open threads are tracked in the wiki for elder
            review before public surface. The history is a draft the families keep correcting.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────  Event attribution (avatar + tree link)  ─────────────

function EventAttribution({ attribution }: { attribution: string }) {
  const elder = findElderInAttribution(attribution)
  if (!elder) {
    return <figcaption className="text-xs tracking-wider uppercase opacity-60 mt-4">{attribution}</figcaption>
  }
  return (
    <Link
      to={`/f/${elder.clusterSlug}/tree`}
      className="mt-4 inline-flex items-center gap-3 hover:opacity-90 transition-opacity"
    >
      {elder.avatarUrl && (
        <img
          src={elder.avatarUrl}
          alt={elder.displayName}
          className="w-8 h-8 rounded-full object-cover"
          style={{ border: `1px solid ${hexToRgba(P.cream, 0.4)}` }}
        />
      )}
      <span className="text-xs tracking-wider uppercase opacity-70" style={{ color: P.amber }}>
        {attribution}
      </span>
    </Link>
  )
}

// ─────────────────────  Photo caption (matches ClusterShowcase)  ──────────────

function ImageCaption({ bg }: { bg: { title: string; year: string; source: string; license: string } }) {
  return (
    <div
      className="absolute bottom-3 right-3 md:bottom-6 md:right-6 z-10 text-[9px] tracking-wider uppercase max-w-xs text-right"
      style={{ color: hexToRgba(P.cream, 0.5) }}
    >
      {bg.title}
      {bg.year ? ` · ${bg.year}` : ''}
      <span className="block opacity-70 mt-0.5 normal-case tracking-normal">
        {bg.source} · {bg.license}
      </span>
    </div>
  )
}

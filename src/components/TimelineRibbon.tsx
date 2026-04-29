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
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildSpine,
  EVENT_SLOTS,
  LIVING_ELDER_PINS,
  RIBBON_PALETTE,
  TODAY_GALLERY,
  YEAR_MARKERS,
  type DecadeBackdrop,
  type EventSlot,
  type LivingElderPin,
} from '@/palm-history-timeline'

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
  const panelRefs = useRef<Record<string, HTMLElement | null>>({})

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
        <img
          src={EVENT_SLOTS[0]!.bg.url}
          alt={EVENT_SLOTS[0]!.bg.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'sepia(0.45) brightness(0.4) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.55)} 0%, ${hexToRgba(P.ink, 0.9)} 100%)`,
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto w-full">
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
      </section>

      {/* ── Spine: decade backdrops + event panels interleaved ────────── */}
      {spine.map((node) => {
        if (node.kind === 'decade') {
          return (
            <DecadePanel
              key={`d-${node.data.id}`}
              decade={node.data}
              elders={LIVING_ELDER_PINS.filter((e) => e.birthDecade === node.data.decadeStart)}
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
            registerRef={(el) => {
              panelRefs.current[`e-${node.data.id}`] = el
            }}
          />
        )
      })}

      {/* ── Today Gallery (portal cards into family folders) ───────────── */}
      <TodayGallery registerRef={(el) => {
        panelRefs.current['today'] = el
      }} />
    </div>
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
  registerRef,
}: {
  decade: DecadeBackdrop
  elders: LivingElderPin[]
  registerRef: (el: HTMLElement | null) => void
}) {
  return (
    <section
      ref={registerRef}
      data-year={decade.decadeStart}
      className="relative min-h-screen flex items-center justify-center px-6 md:pl-32 overflow-hidden"
      style={{ color: P.cream }}
    >
      <img
        src={decade.bg.url}
        alt={decade.bg.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'sepia(0.5) brightness(0.4) contrast(1.05)' }}
      />
      <div
        className="absolute inset-0"
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
              Living elders born around this time
            </div>
            <div className="flex flex-wrap items-start justify-center gap-6 md:gap-10">
              {elders.map((e) => (
                <Link
                  key={e.storytellerSlug}
                  to={`/f/${e.clusterSlug}`}
                  className="group flex flex-col items-center max-w-[140px] hover:opacity-90 transition-opacity"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-serif text-xl mb-3"
                    style={{
                      background: hexToRgba(P.cream, 0.1),
                      border: `1px solid ${hexToRgba(P.cream, 0.4)}`,
                      color: P.amber,
                    }}
                  >
                    {e.displayName.replace(/^(Uncle|Aunty)\s+/, '').charAt(0)}
                  </div>
                  <div className="text-sm font-serif leading-tight text-center">{e.displayName}</div>
                  <div className="text-[10px] opacity-50 tracking-wide mt-1 text-center">
                    {e.birthDecadeLabel}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <ImageCaption bg={decade.bg} />
    </section>
  )
}

// ─────────────────────  Event panel (named full-screen)  ─────────────────────

function EventPanel({
  event,
  registerRef,
}: {
  event: EventSlot
  registerRef: (el: HTMLElement | null) => void
}) {
  return (
    <section
      ref={registerRef}
      data-year={event.year}
      className="relative min-h-screen flex items-center justify-center px-6 md:pl-32 py-20 overflow-hidden"
      style={{ color: P.cream }}
    >
      <img
        src={event.bg.url}
        alt={event.bg.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'sepia(0.45) brightness(0.35) contrast(1.05)' }}
      />
      <div
        className="absolute inset-0"
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
            {event.attribution && (
              <figcaption className="text-xs tracking-wider uppercase opacity-60 mt-4">
                {event.attribution}
              </figcaption>
            )}
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
      </div>
      <ImageCaption bg={event.bg} />
    </section>
  )
}

// ─────────────────────  Today Gallery  ────────────────────────────────────────

function TodayGallery({ registerRef }: { registerRef: (el: HTMLElement | null) => void }) {
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
          {TODAY_GALLERY.map((card) => (
            <Link
              key={card.storytellerSlug}
              to={`/f/${card.clusterSlug}`}
              className="group flex flex-col p-8 rounded-sm transition-all hover:shadow-lg"
              style={{
                background: hexToRgba(P.ink, 0.04),
                border: `1px solid ${hexToRgba(P.ink, 0.1)}`,
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl mb-5"
                style={{
                  background: hexToRgba(P.ochre, 0.15),
                  color: P.ochre,
                  border: `1px solid ${hexToRgba(P.ochre, 0.3)}`,
                }}
              >
                {card.displayName.replace(/^(Uncle|Aunty)\s+/, '').charAt(0)}
              </div>
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

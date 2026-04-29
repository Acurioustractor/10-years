/**
 * Landing page — the front door.
 *
 * Voice-led, photo-driven, multi-tenant. Featured content is Palm Island
 * (the active showcase) but framing positions this as the platform.
 *
 * Sections:
 *   1. Hero — full-bleed photo + tagline (rotating photo every 6s)
 *   2. Rotating elder voice — quote + portrait + tappable card (every 7s)
 *   3. Four rooms tile grid — history, elders, journeys, families
 *   4. Photo strip — 8 photos across 140 years (Lightbox-tappable)
 *   5. What this is — voice-led platform framing
 *   6. Join your family — original copy preserved as secondary path
 *   7. Footer attribution carries through PublicLayout
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { JOURNEYS } from '@/palm-journeys'
import {
  EVENT_SLOTS,
  LIVING_ELDER_PINS,
  RIBBON_PALETTE,
  type RibbonImage,
} from '@/palm-history-timeline'
import PhotoStrip from '@/components/PhotoStrip'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ─────────────────────  Hero rotating images  ────────────────────────────────

const HERO_IMAGES: RibbonImage[] = [
  EVENT_SLOTS[0]!.bg,                       // Blencoe Falls — frontier
  EVENT_SLOTS[1]!.bg,                       // Hinchinbrook — Hull River wave
  EVENT_SLOTS[3]!.bg,                       // Victoria Mill Ingham — strike era
  EVENT_SLOTS[5]!.bg,                       // Magnetic Island — Manbarra
]

// ─────────────────────  Rotating elder voice quotes  ─────────────────────────

type VoiceCard = {
  text: string
  attribution: string
  elderSlug: string
}

const VOICE_CARDS: VoiceCard[] = [
  {
    text: 'We are on our way up to Mission Beach to uncover a scenery that would happen back in 1918. To uncover that, to see for myself and actually feel their pain and suffering.',
    attribution: 'Allan Palm Island · Lucinda Interview',
    elderSlug: 'allan-palm-island',
  },
  {
    text: "It's verbal, it's verbally spoken where you tell your story and you're handing it down.",
    attribution: 'Winifred Obah · Elders Trip Interview',
    elderSlug: 'winifred-obah',
  },
  {
    text: "I'm very happy to be here standing on Jirrbal Country from my grandmother. Just walking in, in on country there like, for me to think. It's very emotional, you know.",
    attribution: 'Marjoyie Burns · Elders Trip Interview',
    elderSlug: 'marjoyie-burns',
  },
  {
    text: "Five or six got kicked off the island. They put 'em off, come and grab them at night. And put 'em on the boat. Family and all.",
    attribution: 'Uncle Frank Daniel Anderson · Interview Transcript',
    elderSlug: 'frank-anderson',
  },
  {
    text: "I felt the ancestor spirit. It's like they were around us because my back went funny. I felt like there was spikes on my back, like my hair was standing.",
    attribution: 'Winifred Obah · Elders Trip Interview',
    elderSlug: 'winifred-obah',
  },
]

// ─────────────────────  Photo strip across decades  ──────────────────────────

const STRIP_PHOTOS: RibbonImage[] = [
  EVENT_SLOTS[0]!.bg,                       // 1880s frontier — Blencoe
  EVENT_SLOTS[1]!.bg,                       // 1918 — Hinchinbrook
  EVENT_SLOTS[2]!.bg,                       // 1928 — Palm Island
  EVENT_SLOTS[3]!.bg,                       // 1935 — Victoria Mill Ingham
  EVENT_SLOTS[4]!.bg,                       // 1954 — Atherton
  EVENT_SLOTS[5]!.bg,                       // — Magnetic Island
]

// ─────────────────────  Component  ───────────────────────────────────────────

export default function LandingPage() {
  const [heroIdx, setHeroIdx] = useState(0)
  const [voiceIdx, setVoiceIdx] = useState(0)

  // Rotate hero photo every 6s
  useEffect(() => {
    const t = setInterval(() => {
      setHeroIdx((i) => (i + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(t)
  }, [])

  // Rotate voice card every 8s
  useEffect(() => {
    const t = setInterval(() => {
      setVoiceIdx((i) => (i + 1) % VOICE_CARDS.length)
    }, 8000)
    return () => clearInterval(t)
  }, [])

  const heroImage = HERO_IMAGES[heroIdx]!
  const voice = VOICE_CARDS[voiceIdx]!
  const voiceElder = LIVING_ELDER_PINS.find((e) => e.storytellerSlug === voice.elderSlug)

  return (
    <div>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ color: P.cream }}
      >
        {HERO_IMAGES.map((img, i) => (
          <img
            key={img.url}
            src={img.url}
            alt={img.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]"
            style={{
              filter: 'sepia(0.4) brightness(0.45) contrast(1.05)',
              opacity: i === heroIdx ? 1 : 0,
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.45)} 0%, ${hexToRgba(P.ink, 0.85)} 100%)`,
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">
            10 Years · A living story map
          </div>
          <h1
            className="font-serif font-light leading-[0.98] mb-8"
            style={{ fontSize: 'clamp(40px, 6.5vw, 96px)' }}
          >
            Listening to the elders.
            <span className="block italic opacity-80 mt-3">Holding the history.</span>
            <span className="block opacity-90 mt-3">Walking back to Country.</span>
          </h1>
          <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80 mt-10">
            A storytelling platform built with Indigenous communities. This is the Palm Island instance —
            Bwgcolman elders carrying their families' voices forward.
          </p>
          <div className="mt-12 text-xs opacity-50 tracking-widest uppercase">↓ Scroll</div>
        </div>
        {/* Caption for current photo */}
        <div className="absolute bottom-3 right-3 md:bottom-6 md:right-6 z-10 text-[10px] tracking-wider uppercase max-w-xs text-right" style={{ color: hexToRgba(P.cream, 0.5) }}>
          {heroImage.title}
          {heroImage.year ? ` · ${heroImage.year}` : ''}
        </div>
      </section>

      {/* ── 2. Rotating elder voice ─────────────────────────────────────── */}
      <section className="py-32 px-6" style={{ background: P.ink, color: P.cream }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-10 text-center" style={{ color: P.amber }}>
            Voice
          </div>
          <Link
            to={`/elders/${voice.elderSlug}`}
            className="block group transition-opacity hover:opacity-95"
            key={voiceIdx /* re-mount triggers fade */}
          >
            <figure>
              <blockquote
                className="font-serif italic font-light leading-[1.25] text-center mb-12 transition-opacity duration-700"
                style={{ fontSize: 'clamp(26px, 3.6vw, 44px)' }}
              >
                &ldquo;{voice.text}&rdquo;
              </blockquote>
              <figcaption className="flex flex-col items-center gap-4">
                {voiceElder?.avatarUrl ? (
                  <img
                    src={voiceElder.avatarUrl}
                    alt={voiceElder.displayName}
                    className="w-20 h-20 rounded-full object-cover"
                    style={{ border: `1px solid ${hexToRgba(P.cream, 0.3)}` }}
                  />
                ) : null}
                <div
                  className="text-[11px] tracking-[0.3em] uppercase"
                  style={{ color: P.amber }}
                >
                  {voice.attribution}
                </div>
                <div className="text-[10px] tracking-wider uppercase opacity-50 group-hover:opacity-80">
                  Open the elder's page →
                </div>
              </figcaption>
            </figure>
          </Link>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-12">
            {VOICE_CARDS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setVoiceIdx(i)}
                aria-label={`Show voice ${i + 1}`}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i === voiceIdx ? P.amber : hexToRgba(P.cream, 0.25),
                  transform: i === voiceIdx ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Four rooms ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6" style={{ background: P.cream, color: P.ink }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
              Four rooms
            </div>
            <h2 className="font-serif font-light leading-[1.05]" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              Where to walk in
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <RoomTile
              to="/history"
              eyebrow="The history"
              title="1880 → today, in one scroll"
              body="Year by year, the events, voices, families that hold them."
              bg={EVENT_SLOTS[2]!.bg}
            />
            <RoomTile
              to="/elders"
              eyebrow="The elders"
              title="The nine carrying the lines"
              body="Each holds a Country. Each holds a family. Tap a portrait to enter."
              bg={EVENT_SLOTS[5]!.bg}
            />
            <RoomTile
              to="/journeys"
              eyebrow="The journeys"
              title="Walking back to Country"
              body="Mission Beach 2024 · Atherton Tablelands 2026 · what comes next."
              bg={JOURNEYS[0]!.hero}
            />
            <RoomTile
              to="/explore"
              eyebrow="The families"
              title="Seven family clusters"
              body="Each room belongs to a family. They decide what's surfaced."
              bg={EVENT_SLOTS[3]!.bg}
            />
          </div>
        </div>
      </section>

      {/* ── 4. Photo strip across decades ───────────────────────────────── */}
      <PhotoStrip
        images={STRIP_PHOTOS}
        cream={P.cream}
        ink={P.ink}
        eyebrow="A century in pictures"
        heading="What this site holds"
      />

      {/* ── 5. What this is — voice-led, multi-tenant framing ───────────── */}
      <section className="py-24 px-6" style={{ background: hexToRgba(P.ochre, 0.06) }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
            What this is
          </div>
          <p className="font-serif text-xl md:text-2xl leading-[1.6] opacity-90 mb-8">
            10 Years is a multi-tenant storytelling platform built with Indigenous communities. Each
            community runs its own instance. Their stories are theirs.
          </p>
          <p className="font-serif italic text-lg leading-[1.7] opacity-80 mb-8">
            This instance is the Palm Island Community Company. The voices, photos, history, and journeys
            on this site belong to the Bwgcolman elders and their families. Cultural protocol is mandatory.
            Sovereignty stays with the families.
          </p>
          <p className="font-serif italic text-base leading-relaxed opacity-70">
            Built with PICC. The platform is the Empathy Ledger.
          </p>
        </div>
      </section>

      {/* ── 6. Join your family (original copy preserved) ───────────────── */}
      <section className="py-24 px-6" style={{ background: P.cream }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
            For families
          </div>
          <h2 className="font-serif font-light leading-[1.1] mb-6" style={{ fontSize: 'clamp(28px, 3.8vw, 48px)' }}>
            Build your own family folder
          </h2>
          <p className="font-serif italic text-lg leading-relaxed opacity-80 mb-10 max-w-2xl mx-auto">
            Create a family folder in under a minute. No email or password needed. Just your family name and
            yours. Family members add their own stories, photos, and dreams. Each person controls their own
            privacy. The family decides what's surfaced.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/join"
              className="px-8 py-4 font-serif text-base hover:opacity-90 transition-opacity"
              style={{ background: P.ochre, color: P.cream }}
            >
              Create your family folder
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 font-serif text-base border-2 hover:opacity-90 transition-opacity"
              style={{ borderColor: P.ochre, color: P.ochre }}
            >
              Explore other families
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─────────────────────  Room Tile (4-rooms grid)  ────────────────────────────

function RoomTile({
  to,
  eyebrow,
  title,
  body,
  bg,
}: {
  to: string
  eyebrow: string
  title: string
  body: string
  bg: RibbonImage
}) {
  return (
    <Link to={to} className="group flex flex-col">
      <div
        className="aspect-[4/3] mb-5 overflow-hidden relative"
        style={{ background: hexToRgba(P.ochre, 0.08) }}
      >
        <img
          src={bg.url}
          alt={bg.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ filter: 'sepia(0.3) brightness(0.55)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${hexToRgba(P.ink, 0.65)} 100%)`,
          }}
        />
        <div
          className="absolute bottom-4 left-5 text-[11px] tracking-[0.3em] uppercase"
          style={{ color: P.cream }}
        >
          {eyebrow}
        </div>
      </div>
      <h3
        className="font-serif font-light leading-[1.1] mb-3"
        style={{ fontSize: 'clamp(24px, 2.4vw, 32px)' }}
      >
        {title}
      </h3>
      <p className="font-serif italic text-sm md:text-base leading-relaxed opacity-75 mb-4 max-w-[50ch]">
        {body}
      </p>
      <div
        className="text-xs tracking-widest uppercase opacity-60 group-hover:opacity-100 mt-auto"
        style={{ color: P.ochre }}
      >
        Open the room →
      </div>
    </Link>
  )
}

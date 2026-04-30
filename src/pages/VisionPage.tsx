/**
 * /vision — Bwgcolman Way governance + 20-year vision page.
 *
 * Frames how the elders are participating in and adding value to this
 * platform. Anchored on three sourced quotes from the Bwgcolman Way
 * deep-research doc + the 1936 Elder Dick Palm Island coinage.
 *
 * Voice-led, not framework-led — reads like an elder talking to the
 * younger generation, not a governance memo.
 */
import { Link } from 'react-router-dom'
import { LIVING_ELDER_PINS, RIBBON_PALETTE } from '@/palm-history-timeline'
import VideoHero from '@/components/VideoHero'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function VisionPage() {
  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden"
        style={{ color: P.cream }}
      >
        <div className="absolute inset-0">
          <VideoHero
            src="/media/clips/elders-on-country.mp4"
            poster="/media/stills/memorial-gathering.jpg"
            alt="Elders on Country"
            filter="sepia(0.35) brightness(0.4) contrast(1.05)"
          />
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.55)} 0%, ${hexToRgba(P.ink, 0.9)} 100%)`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto pointer-events-none">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-70 mb-6">
            Bwgcolman Way · the vision
          </div>
          <h1
            className="font-serif font-light leading-[0.98] mb-8"
            style={{ fontSize: 'clamp(48px, 8vw, 120px)' }}
          >
            Many tribes,
            <span className="block italic opacity-85 mt-3">one people.</span>
          </h1>
          <p className="font-serif italic max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-85 mt-8">
            How the elders lead. How the families decide. How the children inherit. The Palm Island
            Community Company carrying its own authority — recognised alongside the law.
          </p>
        </div>
      </section>

      {/* ─── 1. The naming ──────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: P.cream }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
            The naming
          </div>
          <h2
            className="font-serif font-light leading-[1.1] mb-10"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
          >
            Elder Dick Palm Island coined the word
          </h2>
          <p className="font-serif text-lg md:text-xl leading-[1.7] opacity-90 mb-8">
            More than 50 nations were sent to Palm under the Aboriginals Protection Act — Manbarra,
            Wulgurukaba, Mamu, Warrongo, Birri-gubba, Yidinji, Girramay, Gulngay, Djirru, and many more.
            The dormitory system stripped names. The mission system stripped languages.
          </p>
          <p className="font-serif italic text-xl md:text-2xl leading-[1.5] opacity-95 mb-8">
            Instead, they did something remarkable. Elder Dick Palm Island coined the word{' '}
            <span style={{ color: P.ochre }}>Bwgcolman</span> — meaning <em>many tribes, one people.</em>
          </p>
          <p className="font-serif text-base leading-[1.7] opacity-80">
            It became the name for this new, forged-in-adversity community. Not a replacement for the
            original identities, but an acknowledgment of what they had built together.
          </p>
        </div>
      </section>

      {/* ─── 2. The cultural authority ──────────────────────────── */}
      <section className="px-6 py-24" style={{ background: P.ink, color: P.cream }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.amber }}>
            The cultural authority
          </div>
          <figure className="border-l-2 pl-6 md:pl-10 mb-12" style={{ borderColor: P.ochre }}>
            <blockquote
              className="font-serif italic font-light leading-[1.2]"
              style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
            >
              &ldquo;Our cultural authority is recognised alongside the law.&rdquo;
            </blockquote>
            <figcaption className="text-xs tracking-widest uppercase mt-6 opacity-70" style={{ color: P.amber }}>
              Bwgcolman Way · community framing
            </figcaption>
          </figure>
          <p className="font-serif text-lg leading-[1.7] opacity-90 mb-6">
            From 1 January 2024, Palm Island became one of eight additional sites in Queensland's
            delegated-authority programme. Under <em>Reclaiming our Storyline</em> — the 10-year blueprint
            co-developed by QATSICPP and the Queensland department — delegated authority is explicitly
            tied to:
          </p>
          <ul className="font-serif text-lg leading-[1.7] opacity-85 space-y-2 ml-6">
            <li>· <strong>Healing</strong></li>
            <li>· <strong>Breaking cycles of trauma</strong></li>
            <li>· <strong>Honest truth-telling</strong></li>
            <li>· <strong>Reconnecting children and families to culture and community</strong></li>
          </ul>
          <p className="font-serif text-lg leading-[1.7] opacity-90 mt-8">
            The CEO of PICC is the sole prescribed delegate under Part 2A of Queensland's Child Protection
            Act 1999. Statutory power, community-held.
          </p>
        </div>
      </section>

      {/* ─── 3. Decisions ──────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: hexToRgba(P.ochre, 0.06) }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
            What that looks like in practice
          </div>
          <figure>
            <blockquote
              className="font-serif italic font-light leading-[1.2]"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: P.ink }}
            >
              &ldquo;Decisions about Palm Island children now being made by Palm Island people.&rdquo;
            </blockquote>
            <figcaption className="text-xs tracking-widest uppercase mt-6 opacity-70" style={{ color: P.ochre }}>
              PICC 2024-25 Annual Report
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ─── 4. The 20-year arc ─────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
            The next 20 years
          </div>
          <h2
            className="font-serif font-light leading-[1.1] mb-10"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
          >
            Community-controlled infrastructure for every Palm Islander
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6" style={{ background: hexToRgba(P.ochre, 0.06), border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-2 tabular-nums" style={{ color: P.ochre }}>
                By 2028
              </div>
              <h3 className="font-serif text-xl leading-tight mb-3">Aged care on Palm</h3>
              <p className="font-serif italic text-sm leading-relaxed opacity-80">
                Community-run, on-Country aged care so the elders never have to leave home for the last years.
              </p>
            </div>
            <div className="p-6" style={{ background: hexToRgba(P.ochre, 0.06), border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-2 tabular-nums" style={{ color: P.ochre }}>
                By 2030
              </div>
              <h3 className="font-serif text-xl leading-tight mb-3">Delegated Authority into health and justice</h3>
              <p className="font-serif italic text-sm leading-relaxed opacity-80">
                The Bwgcolman Way model — already in child protection — extended into community-controlled health and justice services.
              </p>
            </div>
            <div className="p-6 md:col-span-2" style={{ background: hexToRgba(P.ochre, 0.06), border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: P.ochre }}>
                Always
              </div>
              <h3 className="font-serif text-xl leading-tight mb-3">A permanent archive of community voice</h3>
              <p className="font-serif italic text-sm leading-relaxed opacity-80">
                That grows stronger every year. The elders walking into Country are recording so the children can keep correcting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. How elders participate ──────────────────────────── */}
      <section className="px-6 py-24" style={{ background: P.cream }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6 text-center" style={{ color: P.ochre }}>
            How the elders participate
          </div>
          <h2
            className="font-serif font-light leading-[1.1] mb-12 text-center"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
          >
            Voice, photographs, journeys, lineage
          </h2>
          <p className="font-serif italic max-w-2xl mx-auto text-lg leading-[1.7] opacity-85 text-center mb-16">
            Each elder holds a line. Each line holds a Country. Each Country holds a story. The platform
            surfaces the parts the family approves — voice quotes, transcripts, photographs, the
            backwards lineage. The handover to the children happens when the family says it does.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {LIVING_ELDER_PINS.map((elder) => (
              <Link
                key={elder.storytellerSlug}
                to={`/elders/${elder.storytellerSlug}`}
                className="group flex items-start gap-4 hover:opacity-90 transition-opacity"
              >
                {elder.avatarUrl ? (
                  <img
                    src={elder.avatarUrl}
                    alt={elder.displayName}
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                    style={{ filter: 'sepia(0.05) saturate(0.95)' }}
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-xl shrink-0"
                    style={{ background: hexToRgba(P.ochre, 0.1), color: P.ochre }}
                  >
                    {elder.displayName.replace(/^(Uncle|Aunty)\s+/, '').charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base leading-tight mb-1">{elder.displayName}</h3>
                  <div className="text-[10px] tracking-[0.2em] uppercase opacity-50 mb-2" style={{ color: P.ochre }}>
                    {elder.cultural}
                  </div>
                  <p className="font-serif italic text-xs leading-relaxed opacity-75">{elder.oneLine}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. The handover ─────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: P.ink, color: P.cream }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.amber }}>
            The handover
          </div>
          <h2
            className="font-serif font-light leading-[1.1] mb-10"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
          >
            We are recording so the children can keep correcting.
          </h2>
          <p className="font-serif italic text-lg md:text-xl leading-[1.6] opacity-85 mb-12">
            The platform isn't an archive that closes. It's a draft the families keep correcting. The
            elders walk back to Country. The trips bring back voice. The voice goes into the platform.
            The children take it from there.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/journeys"
              className="px-8 py-4 font-serif text-base hover:opacity-90 transition-opacity"
              style={{ background: P.ochre, color: P.cream }}
            >
              See the journeys
            </Link>
            <Link
              to="/elders"
              className="px-8 py-4 font-serif text-base border-2 hover:opacity-90 transition-opacity"
              style={{ borderColor: P.amber, color: P.amber }}
            >
              Meet the elders
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

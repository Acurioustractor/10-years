/**
 * Generic editorial template for any Palm Island cluster.
 * Renders: hero → opening quote → elder panels → Country → sacred → ancestor panels → bridge → photo strip → leave a note
 *
 * Configured by `cluster-configs.ts`. One config per cluster slug.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'
import { getCommunityFamilyLinks, getFamilyFolder } from '@/services/empathyLedgerClient'
import type { BgSource, ClusterConfig } from '@/cluster-configs'
import { findElderInAttribution } from '@/palm-history-timeline'
import Lightbox from '@/components/Lightbox'
import PhotoStrip from '@/components/PhotoStrip'

const PALM_ISLAND_COMMUNITY_ID = 'c0a20002-0000-0000-0000-000000000001'

type Member = {
  storytellerId: string
  displayName: string
  avatarUrl: string | null
  isElder: boolean
  isAncestor: boolean
  bio?: string | null
  birthYear?: number | null
  deathYear?: number | null
  birthPlace?: string | null
  culturalBackground?: string[]
}

export default function ClusterShowcase({ config }: { config: ClusterConfig }) {
  const { familySession } = useSession()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setMembers([])
    async function load() {
      try {
        const linksRes: any = await getCommunityFamilyLinks(PALM_ISLAND_COMMUNITY_ID)
        const link = (linksRes.links || []).find((l: any) => l.familySlug === config.slug)
        if (!link) return
        const folder = await getFamilyFolder(link.familyFolderId)
        if (!cancelled) setMembers(folder.members as Member[])
      } catch {
        // noop
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [config.slug, familySession])

  // Helpers
  const find = (substr: string) => members.find(m => m.displayName.includes(substr))
  const elders = useMemo(() =>
    config.elderOrder.map(s => find(s)).filter(Boolean) as Member[],
    [members, config])
  const ancestors = useMemo(() =>
    config.ancestorOrder.map(s => find(s)).filter(m => m && m.isAncestor) as Member[],
    [members, config])
  const sacredAncestor = config.sacredAncestorMatch ? find(config.sacredAncestorMatch) : null

  // Image library used in the photo strip — heroBg + countryBg + bridgeBg + ancestor bgs
  const allImages: BgSource[] = useMemo(() => {
    const set: BgSource[] = []
    const seen = new Set<string>()
    const push = (b?: BgSource) => { if (b && !seen.has(b.url)) { seen.add(b.url); set.push(b) } }
    push(config.heroBg)
    push(config.countryBg)
    push(config.bridgeBg)
    Object.values(config.ancestorBgs || {}).forEach(push)
    ;(config.chapters || []).forEach(c => push(c.bg))
    ;(config.gallery || []).forEach(push)
    return set
  }, [config])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/40 italic font-serif">Opening the family folder…</div>

  const P = config.palette
  const cluster = config.slug

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden" style={{ color: P.cream }}>
        <img src={config.heroBg.url} alt={config.heroBg.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.45) brightness(0.45) contrast(1.05)' }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${hexToRgba(P.ink,0.5)} 0%, ${hexToRgba(P.ink,0.85)} 100%)` }} />
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">Palm Island · Bwgcolman Community</div>
          <h1
            className="font-serif font-light leading-[0.95] mb-6 break-words"
            style={{
              fontSize:
                config.name.length >= 3
                  ? 'clamp(40px, 6vw, 88px)'
                  : config.name.length === 2
                    ? 'clamp(48px, 8vw, 112px)'
                    : 'clamp(56px, 10vw, 144px)',
            }}
          >
            {config.name.map((part, i) => (
              <span key={i} className="inline-block">
                {part}
                {i < config.name.length - 1 && <span className="opacity-50 font-light px-3">·</span>}
              </span>
            ))}
          </h1>
          <p className="font-serif italic opacity-80 max-w-xl text-xl leading-relaxed mx-auto">{config.subtitle}</p>
          <div className="mt-12 text-xs opacity-50 tracking-widest uppercase">↓ Scroll</div>
        </div>
        <ImageCaption bg={config.heroBg} cream={P.cream} />
      </section>

      {/* OPENING QUOTE */}
      <section className="min-h-[80vh] flex items-center justify-center px-6 py-32" style={{ background: P.quoteSection, color: P.cream }}>
        <figure className="max-w-3xl mx-auto text-center">
          <blockquote className="font-serif italic font-light leading-[1.2]" style={{ fontSize: 'clamp(28px, 4.5vw, 56px)' }}>
            “{config.openingQuote.text}”
          </blockquote>
          <figcaption className="mt-10 flex flex-col items-center gap-4">
            {find(config.openingQuote.quoterMatch)?.avatarUrl ? (
              <img src={find(config.openingQuote.quoterMatch)!.avatarUrl!} alt={config.openingQuote.quoterDisplayName} className="w-16 h-16 rounded-full object-cover" style={{ border: `2px solid ${P.cream}33` }} />
            ) : (
              <div className="w-16 h-16 rounded-full inline-flex items-center justify-center font-serif text-xl" style={{ background: 'rgba(255,255,255,0.08)', border: `2px solid ${P.cream}33` }}>
                {config.openingQuote.quoterDisplayName.charAt(0)}
              </div>
            )}
            <div className="text-sm tracking-widest uppercase opacity-65">{config.openingQuote.quoterDisplayName}</div>
            <div className="text-[11px] tracking-widest uppercase opacity-45">{config.openingQuote.quoterCultural}</div>
          </figcaption>
        </figure>
      </section>

      {/* ELDER PANELS */}
      {elders.map((elder, i) => (
        <ElderPanel
          key={elder.storytellerId}
          elder={elder}
          accent={P.ochre}
          cream={P.cream}
          ink={P.ink}
          quote={Object.entries(config.elderQuotes || {}).find(([k]) => elder.displayName.includes(k))?.[1]}
          alternate={i % 2 === 1}
        />
      ))}

      {/* CHAPTERS — optional editorial spreads pulled from elder transcripts */}
      {(config.chapters || []).map((ch, i) => (
        <ChapterPanel key={i} chapter={ch} ink={P.ink} cream={P.cream} ochre={P.ochre} />
      ))}

      {/* COUNTRY */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden" style={{ color: P.cream }}>
        <img src={config.countryBg.url} alt={config.countryBg.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.4) brightness(0.45)' }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${hexToRgba(P.ink,0.6)} 0%, rgba(14,15,13,0.78) 100%)` }} />
        <div className="relative z-10 max-w-2xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-12">Country</div>
          <h2 className="font-serif font-light mb-8" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>{config.countryName}</h2>
          <p className="font-serif italic opacity-85 max-w-xl text-xl leading-relaxed mb-10 mx-auto">{config.countryDescription}</p>
          <div className="text-xs tracking-widest uppercase opacity-60">{config.countryFooter}</div>
        </div>
        <ImageCaption bg={config.countryBg} cream={P.cream} />
      </section>

      {/* SACRED ANCESTOR */}
      {sacredAncestor && <SacredPanel ancestor={sacredAncestor} sacred={P.sacred} cream={P.cream} bg={config.heroBg} />}

      {/* ANCESTOR PANELS */}
      {ancestors.map(a => {
        const q = Object.entries(config.ancestorQuotes || {}).find(([k]) => a.displayName.includes(k))?.[1]
        const bg = Object.entries(config.ancestorBgs || {}).find(([k]) => a.displayName.includes(k))?.[1]
        const quoter = q?.quoterMatch ? find(q.quoterMatch) : null
        return (
          <AncestorPanel
            key={a.storytellerId}
            ancestor={a}
            quote={q?.text}
            quoteAttribution={q?.attribution}
            quoterAvatarUrl={quoter?.avatarUrl}
            cream={P.cream}
            ink={P.ink}
            accent={P.ochre}
            bg={bg}
          />
        )
      })}

      {/* THE BRIDGE */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden" style={{ color: P.cream }}>
        <img src={config.bridgeBg.url} alt={config.bridgeBg.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.3) brightness(0.45) contrast(1.05)' }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${hexToRgba(P.ink,0.5)} 0%, rgba(14,15,13,0.78) 100%)` }} />
        <div className="relative z-10 max-w-3xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-12" style={{ color: P.amber }}>The bridge</div>
          <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>{config.bridge.title}</h2>
          {config.bridge.avatarMatches.length > 0 && (
            <div className="flex justify-center gap-6 mb-12">
              {config.bridge.avatarMatches.map(m => {
                const member = find(m)
                return member?.avatarUrl ? (
                  <img key={m} src={member.avatarUrl} alt={member.displayName} className="w-20 h-20 rounded-full object-cover" style={{ border: `2px solid ${P.amber}66` }} />
                ) : null
              })}
            </div>
          )}
          <p className="font-serif italic max-w-2xl text-xl leading-relaxed opacity-85 mx-auto">{config.bridge.body}</p>
        </div>
        <ImageCaption bg={config.bridgeBg} cream={P.cream} />
      </section>

      <PhotoStrip images={allImages} cream={P.cream} ink={P.ink} />

      {/* LEAVE A NOTE */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-32" style={{ background: P.ink, color: P.cream }}>
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">Your family. Your call.</div>
        <p className="font-serif max-w-xl text-xl leading-relaxed opacity-90 mb-10">
          {config.closingNote || 'Anything wrong, anything to add, anything to take down. Tell us. The family folder is yours.'}
        </p>
        <div className="flex gap-6 flex-wrap justify-center">
          <Link to="timeline" className="px-6 py-3 border border-cream/30 hover:border-cream text-cream text-sm tracking-widest uppercase transition-colors">View the full timeline</Link>
          <Link to="tree" className="px-6 py-3 border border-cream/30 hover:border-cream text-cream text-sm tracking-widest uppercase transition-colors">See the family tree</Link>
        </div>
        <div className="mt-16 text-[11px] opacity-40">{cluster} · Built with the Palm Island Community Company · A Curious Tractor · 2026</div>
      </section>
    </div>
  )
}

// ─────────────────────────  ElderPanel  ────────────────────────────────────
function ChapterPanel({ chapter, ink, cream, ochre }: { chapter: NonNullable<ClusterConfig['chapters']>[number]; ink: string; cream: string; ochre: string }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden" style={{ background: ink, color: cream }}>
      {chapter.bg && (
        <>
          <img src={chapter.bg.url} alt={chapter.bg.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.45) brightness(0.32) contrast(1.05)' }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${hexToRgba(ink, 0.55)} 0%, ${hexToRgba(ink, 0.85)} 100%)` }} />
        </>
      )}
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-6" style={{ color: ochre }}>{chapter.eyebrow}</div>
        <h2 className="font-serif font-light leading-[1.05] mb-8" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)' }}>{chapter.heading}</h2>
        <p className="font-serif italic opacity-80 max-w-2xl text-lg leading-relaxed mx-auto mb-14">{chapter.body}</p>
        <blockquote className="font-serif italic font-light leading-[1.25] mx-auto" style={{ fontSize: 'clamp(24px, 3.2vw, 40px)' }}>
          &ldquo;{chapter.pullquote}&rdquo;
        </blockquote>
        <ElderAttribution attribution={chapter.attribution} cream={cream} ochre={ochre} />
      </div>
      {chapter.bg && <ImageCaption bg={chapter.bg} cream={cream} />}
    </section>
  )
}

/**
 * Renders an attribution line. If the attribution names a living elder, the
 * line becomes a tap target into that elder's family tree, with their
 * portrait inline. Otherwise renders plain text (current behaviour).
 */
function ElderAttribution({ attribution, cream, ochre }: { attribution: string; cream: string; ochre: string }) {
  const elder = findElderInAttribution(attribution)
  if (!elder) {
    return <div className="mt-8 text-xs tracking-widest uppercase opacity-60">{attribution}</div>
  }
  return (
    <Link
      to={`/f/${elder.clusterSlug}/tree`}
      className="mt-8 inline-flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
    >
      {elder.avatarUrl && (
        <img
          src={elder.avatarUrl}
          alt={elder.displayName}
          className="w-9 h-9 rounded-full object-cover"
          style={{ border: `1px solid ${hexToRgba(cream, 0.4)}` }}
        />
      )}
      <span
        className="text-xs tracking-widest uppercase underline-offset-4 group-hover:underline"
        style={{ color: ochre }}
      >
        {attribution}
      </span>
    </Link>
  )
}

function ElderPanel({ elder, accent, cream, ink, quote, alternate }: { elder: Member; accent: string; cream: string; ink: string; quote?: string; alternate?: boolean }) {
  return (
    <section className="min-h-screen px-6 py-32" style={{ background: cream, color: ink }}>
      <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-16 items-center ${alternate ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          {elder.avatarUrl ? (
            <img src={elder.avatarUrl} alt={elder.displayName} className="w-full max-w-md aspect-[4/5] object-cover" style={{ filter: 'sepia(0.08) saturate(0.95)' }} />
          ) : (
            <div className="w-full max-w-md aspect-[4/5]" style={{ background: accent, opacity: 0.15 }} />
          )}
        </div>
        <div className="max-w-xl">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: accent }}>Elder</div>
          <h2 className="font-serif font-light leading-[1.05] mb-4" style={{ fontSize: 'clamp(40px, 5.5vw, 80px)' }}>{elder.displayName}</h2>
          {(elder.birthYear || elder.deathYear) && <div className="text-base mb-8 opacity-50 tracking-wide">{elder.birthYear ?? '?'}{elder.deathYear ? `–${elder.deathYear}` : ''}</div>}
          {Array.isArray(elder.culturalBackground) && elder.culturalBackground.length > 0 && (
            <div className="text-sm tracking-wide italic opacity-65 mb-10">{elder.culturalBackground.join(' · ')}</div>
          )}
          {elder.bio && (
            <p className="font-serif text-xl leading-[1.65] opacity-85" style={{ maxWidth: '60ch' }}>
              <span className="float-left font-serif font-light leading-[0.85] mr-2 mt-1" style={{ fontSize: '5.5em', color: accent }}>{elder.bio.charAt(0)}</span>
              {elder.bio.slice(1)}
            </p>
          )}
          {quote && (
            <figure className="mt-10" style={{ maxWidth: '60ch' }}>
              <blockquote className="font-serif italic pl-6 text-2xl leading-relaxed opacity-80" style={{ borderLeft: `2px solid ${accent}` }}>“{quote}”</blockquote>
              <figcaption className="mt-4 pl-6 flex items-center gap-3 text-sm opacity-60">
                {elder.avatarUrl && <img src={elder.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />}
                <span className="italic">— {elder.displayName.split(' ').slice(0, 2).join(' ')}, in their own words</span>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────  AncestorPanel  ─────────────────────────────────
function AncestorPanel({ ancestor, quote, quoteAttribution, quoterAvatarUrl, cream, ink, accent, bg }: {
  ancestor: Member; quote?: string; quoteAttribution?: string; quoterAvatarUrl?: string | null; cream: string; ink: string; accent: string; bg?: BgSource
}) {
  const isDark = !!bg
  return (
    <section className="relative min-h-screen px-6 py-32 overflow-hidden" style={{ background: isDark ? '#0E0F0D' : cream, color: isDark ? cream : ink }}>
      {bg && (
        <>
          <img src={bg.url} alt={bg.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.35) brightness(0.4) contrast(1.1)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,15,13,0.5) 0%, rgba(14,15,13,0.82) 100%)' }} />
        </>
      )}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: accent }}>Ancestor</div>
        <h2 className="font-serif font-light leading-[1.05] mb-4" style={{ fontSize: 'clamp(40px, 6vw, 88px)' }}>{ancestor.displayName}</h2>
        {(ancestor.birthYear || ancestor.deathYear) && <div className="text-base mb-3 opacity-50 tracking-wide">{ancestor.birthYear ?? 'c. ?'}{ancestor.deathYear ? `–${ancestor.deathYear}` : ''}</div>}
        {ancestor.birthPlace && <div className="text-sm italic opacity-65 mb-12">{ancestor.birthPlace}</div>}
        {Array.isArray(ancestor.culturalBackground) && ancestor.culturalBackground.length > 0 && (
          <div className="text-sm tracking-wide italic opacity-65 mb-10">{ancestor.culturalBackground.join(' · ')}</div>
        )}
        {ancestor.bio && (
          <p className="font-serif text-xl leading-[1.7] opacity-80 text-left max-w-2xl mx-auto" style={{ maxWidth: '62ch' }}>
            {ancestor.bio.length > 600 ? ancestor.bio.slice(0, 600) + '…' : ancestor.bio}
          </p>
        )}
        {quote && (
          <figure className="mt-16 max-w-2xl mx-auto">
            <blockquote className="font-serif italic font-light leading-[1.3]" style={{ fontSize: 'clamp(24px, 3vw, 40px)', color: accent }}>“{quote}”</blockquote>
            {quoteAttribution && (() => {
              const elder = findElderInAttribution(quoteAttribution)
              const inner = (
                <>
                  {quoterAvatarUrl || elder?.avatarUrl ? (
                    <img src={quoterAvatarUrl || elder?.avatarUrl || ''} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full inline-flex items-center justify-center font-serif text-sm" style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${accent}40`, color: accent }}>{ancestor.displayName.split(/[\s(]/)[0].charAt(0)}</span>
                  )}
                  <span>{quoteAttribution}</span>
                </>
              )
              return elder ? (
                <Link to={`/f/${elder.clusterSlug}/tree`} className="mt-6 flex items-center justify-center gap-3 text-xs tracking-widest uppercase opacity-60 hover:opacity-90 transition-opacity">
                  {inner}
                </Link>
              ) : (
                <figcaption className="mt-6 flex items-center justify-center gap-3 text-xs tracking-widest uppercase opacity-60">
                  {inner}
                </figcaption>
              )
            })()}
          </figure>
        )}
        <div className="text-center mt-20 text-[11px] opacity-30 tracking-widest">· · ·</div>
      </div>
      {bg && <ImageCaption bg={bg} cream={cream} />}
    </section>
  )
}

// ─────────────────────────  SacredPanel  ───────────────────────────────────
function SacredPanel({ ancestor, sacred, cream, bg }: { ancestor: Member; sacred: string; cream: string; bg?: BgSource }) {
  const [revealed, setRevealed] = useState(false)
  const firstName = ancestor.displayName.split(/[\s(]/)[0]
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden" style={{ background: sacred, color: cream }}>
      {bg && revealed && (
        <>
          <img src={bg.url} alt={bg.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'grayscale(0.65) brightness(0.4) contrast(1.1)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(14,15,13,0.45) 0%, rgba(14,15,13,0.92) 100%)' }} />
        </>
      )}
      <div className="relative z-10 w-full">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-12 opacity-60">Sacred · with elder consent</div>
        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="px-8 py-4 border border-cream/40 hover:border-cream/80 transition-colors text-cream text-sm tracking-widest uppercase max-w-md" style={{ color: cream }}>
            A massacre carried in this family.
            <span className="block text-[11px] opacity-50 normal-case mt-2 tracking-normal">Tap to read with care</span>
          </button>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif font-light mb-6" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>{firstName}</h2>
            {(ancestor.birthYear || ancestor.deathYear) && <div className="text-base mb-10 opacity-60 tracking-wide italic">c. {ancestor.birthYear ?? '?'} – {ancestor.deathYear ?? '?'}</div>}
            {ancestor.birthPlace && <div className="text-sm italic opacity-60 mb-10">{ancestor.birthPlace}</div>}
            {ancestor.bio && (
              <p className="font-serif italic text-xl leading-relaxed opacity-90 mb-10" style={{ maxWidth: '60ch', margin: '0 auto' }}>
                {ancestor.bio.length > 500 ? ancestor.bio.slice(0, 500) + '…' : ancestor.bio}
              </p>
            )}
            <div className="text-[11px] opacity-40 tracking-widest uppercase mt-12">Source · public archive · academic citation</div>
          </div>
        )}
      </div>
      {bg && revealed && <ImageCaption bg={bg} cream={cream} />}
    </section>
  )
}

// ─────────────────────────  ImageCaption  ──────────────────────────────────
function ImageCaption({ bg, cream }: { bg: BgSource; cream: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="absolute bottom-6 left-6 max-w-xs z-10 px-4 py-3 rounded-sm backdrop-blur-sm" style={{ background: 'rgba(14,15,13,0.55)', color: cream, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-[11px] tracking-[0.18em] uppercase opacity-50 mb-1">Photograph</div>
        <div className="font-serif italic text-sm leading-snug opacity-95">{bg.title}</div>
        {bg.year && <div className="text-[11px] opacity-65 mt-1">{bg.year}</div>}
        <div className="text-[10px] opacity-45 mt-2 leading-relaxed">{bg.source} · {bg.license}</div>
        <button type="button" onClick={() => setOpen(true)} className="mt-3 text-[11px] tracking-[0.18em] uppercase opacity-60 hover:opacity-100 transition-opacity border-t border-white/10 pt-2 w-full text-left cursor-pointer" style={{ color: cream }}>View full ↗</button>
      </div>
      {open && <Lightbox images={[bg]} index={0} onClose={() => setOpen(false)} />}
    </>
  )
}

// ─────────────────────────  hex helper  ────────────────────────────────────
function hexToRgba(hex: string, alpha: number) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

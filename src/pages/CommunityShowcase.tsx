/**
 * Community-level editorial template — same design language as ClusterShowcase.
 * Hero → Country statement → 7 cluster cards → big nav → photo strip → leave a note.
 *
 * Configured per community via community-configs.ts.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCommunities, getCommunityFamilyLinks } from '@/services/empathyLedgerClient'
import { CLUSTER_CONFIGS } from '@/cluster-configs'
import type { BgSource, ClusterConfig } from '@/cluster-configs'

type CommunityConfig = {
  slug: string
  name: string
  countryName: string                    // 'Bwgcolman · Palm Island'
  subtitle: string
  openingStatement: string
  palette: {
    ink: string; cream: string; ochre: string; amber: string; sand: string; quoteSection: string
  }
  heroBg: BgSource
}

const COMMUNITY_CONFIGS: Record<string, CommunityConfig> = {
  'palm-island': {
    slug: 'palm-island',
    name: 'Palm Island',
    countryName: 'Bwgcolman',
    subtitle: 'Many tribes, one people. Forty-six nations forcibly brought to a single island reserve from 1914. Today, ten elders carry the stories.',
    openingStatement: 'Seven families. Ten elders. Each holds what is theirs. Open one to begin.',
    palette: { ink: '#1A2418', cream: '#F4EDE0', ochre: '#C9824B', amber: '#E8C496', sand: '#E8DCC4', quoteSection: '#2A3D26' },
    heroBg: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Local_church_%28St_George%27s_Anglican%29_on_Palm_Island%2C_Queensland%2C_circa_1932.jpg',
      title: "St George's Anglican Church, Palm Island",
      year: 'ca. 1932',
      source: 'State Library of Queensland · Wikimedia Commons',
      license: 'Public domain',
    },
  },
}

interface CommunityRecord { id: string; name: string; slug: string; location: string | null; region: string | null }
interface FamilyLink {
  familyId: string
  familyName: string
  familySlug: string
  status: string
  memberCount: number
  avatarUrl: string | null
  featuredName: string | null
}

export default function CommunityShowcase() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const config = communitySlug ? COMMUNITY_CONFIGS[communitySlug] : null
  const [community, setCommunity] = useState<CommunityRecord | null>(null)
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!communitySlug) return
    let cancelled = false
    async function load() {
      try {
        const all = await getCommunities()
        const match = all.data.find(c => c.slug === communitySlug)
        if (!match) { setLoading(false); return }
        if (cancelled) return
        setCommunity(match as any)
        const linksRes: any = await getCommunityFamilyLinks(match.id)
        if (cancelled) return
        const linkRows: any[] = linksRes.links || linksRes.data || []
        const active = linkRows.filter((l: any) => l.status === 'active' || l.status === 'pending')
        setFamilyLinks(active.map((l: any) => ({
          familyId: l.familyFolderId || l.familyId,
          familyName: l.familyName,
          familySlug: l.familySlug,
          status: l.status,
          memberCount: l.memberCount || 0,
          avatarUrl: l.featuredAvatarUrl || null,
          featuredName: l.featuredDisplayName || null,
        })))
      } catch {
        // noop
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [communitySlug])

  const enrichedClusters = useMemo(() => {
    return familyLinks.map(link => {
      const cfg: ClusterConfig | undefined = CLUSTER_CONFIGS[link.familySlug]
      return {
        ...link,
        clusterName: cfg?.name.join(' · ') || link.familyName,
        countryName: cfg?.countryName,
        palette: cfg?.palette,
      }
    })
  }, [familyLinks])

  if (!config) return null
  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/40 italic font-serif">Opening the community…</div>
  const P = config.palette

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden" style={{ color: P.cream }}>
        <img src={config.heroBg.url} alt={config.heroBg.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.45) brightness(0.45) contrast(1.05)' }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${hexToRgba(P.ink, 0.5)} 0%, ${hexToRgba(P.ink, 0.85)} 100%)` }} />
        <div className="relative z-10 max-w-4xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">{config.countryName} · Community</div>
          <h1 className="font-serif font-light leading-[0.95] mb-6" style={{ fontSize: 'clamp(64px, 10vw, 144px)' }}>{config.name}</h1>
          <p className="font-serif italic opacity-85 max-w-2xl text-xl leading-relaxed mx-auto">{config.subtitle}</p>
          <div className="mt-12 text-xs opacity-50 tracking-widest uppercase">↓ Choose a family</div>
        </div>
        <ImageCaption bg={config.heroBg} cream={P.cream} />
      </section>

      {/* OPENING STATEMENT */}
      <section className="min-h-[50vh] flex items-center justify-center px-6 py-32" style={{ background: P.quoteSection, color: P.cream }}>
        <p className="font-serif italic font-light leading-[1.3] text-center max-w-3xl mx-auto" style={{ fontSize: 'clamp(24px, 3.5vw, 40px)' }}>
          {config.openingStatement}
        </p>
      </section>

      {/* THE FAMILIES */}
      <section className="px-6 py-32" style={{ background: P.cream, color: P.ink }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-50 mb-2 text-center">The families</div>
          <h2 className="font-serif font-light mb-16 text-center" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>{enrichedClusters.length} {enrichedClusters.length === 1 ? 'family folder' : 'family folders'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrichedClusters.map(c => (
              <Link key={c.familyId} to={`/f/${c.familySlug}`} className="group flex flex-col items-center text-center cursor-pointer">
                <div
                  className="w-full aspect-[4/3] mb-6 overflow-hidden flex items-center justify-center"
                  style={{ background: c.palette?.ink || P.ink, color: P.cream }}
                >
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt={c.clusterName} className="w-32 h-32 rounded-full object-cover transition-transform group-hover:scale-105" style={{ border: `3px solid ${c.palette?.ochre || P.ochre}` }} />
                  ) : (
                    <span className="font-serif text-6xl opacity-40">{c.clusterName.charAt(0)}</span>
                  )}
                </div>
                <div className="text-[11px] tracking-[0.18em] uppercase opacity-50 mb-2">{c.countryName || 'Palm Island'}</div>
                <h3 className="font-serif font-light leading-tight group-hover:text-ochre transition-colors" style={{ fontSize: 'clamp(22px, 2.8vw, 32px)', color: P.ink }}>{c.clusterName}</h3>
                <div className="text-xs opacity-50 mt-2">{c.memberCount} {c.memberCount === 1 ? 'person' : 'people'}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BIG NAV */}
      <section className="px-6 py-24" style={{ background: P.sand, color: P.ink }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NavTile to={`/c/${communitySlug}/timeline`} label="Timeline" caption="From 1885 to today" P={P} />
          <NavTile to={`/c/${communitySlug}/tree`} label="Tree" caption="The kinship graph" P={P} />
          <NavTile to={`/c/${communitySlug}/gallery`} label="Photo gallery" caption="Browse all photographs" P={P} />
          <NavTile to={`/c/${communitySlug}/research`} label="Research" caption="Public-archive sources" P={P} />
        </div>
      </section>

      {/* LEAVE A NOTE */}
      <section className="min-h-[40vh] flex flex-col items-center justify-center text-center px-6 py-32" style={{ background: P.ink, color: P.cream }}>
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">Sovereign data</div>
        <p className="font-serif max-w-2xl text-xl leading-relaxed opacity-90 mb-10">
          Your community. Your call. Anything wrong, anything to add, anything to take down. Tell us. Family editing happens in Empathy Ledger; family engagement happens here.
        </p>
        <div className="text-[11px] opacity-40">Built with the {community?.name || 'community'} · A Curious Tractor · 2026</div>
      </section>
    </div>
  )
}

function NavTile({ to, label, caption, P }: { to: string; label: string; caption: string; P: CommunityConfig['palette'] }) {
  return (
    <Link to={to} className="group flex flex-col items-center text-center px-8 py-12 hover:bg-cream transition-colors" style={{ border: `1px solid ${hexToRgba(P.ink, 0.12)}`, background: hexToRgba(P.cream, 0.6) }}>
      <h3 className="font-serif font-light mb-2 group-hover:text-ochre transition-colors" style={{ fontSize: 'clamp(24px, 2.8vw, 32px)', color: P.ink }}>{label}</h3>
      <div className="text-xs opacity-60">{caption}</div>
    </Link>
  )
}

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
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6" onClick={() => setOpen(false)}>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-light w-10 h-10 flex items-center justify-center">×</button>
          <div className="max-w-7xl w-full flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={bg.url} alt={bg.title} className="max-w-full max-h-[80vh] object-contain" />
          </div>
          <div className="mt-6 max-w-2xl text-center text-white/85" onClick={(e) => e.stopPropagation()}>
            <div className="font-serif italic text-xl leading-snug">{bg.title}</div>
            <div className="text-sm opacity-70 mt-2">{bg.year} · {bg.source} · {bg.license}</div>
            <a href={bg.url} target="_blank" rel="noreferrer" className="inline-block mt-4 text-xs tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-white/30">Open original ↗</a>
          </div>
        </div>
      )}
    </>
  )
}

function hexToRgba(hex: string, alpha: number) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export { COMMUNITY_CONFIGS }

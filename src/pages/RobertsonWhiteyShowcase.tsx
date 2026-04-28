/**
 * Robertson · Whitey — second cluster, editorial template proof.
 *
 * Halifax/Hinchinbrook Country, two sisters from a family of 17,
 * father Tom Curly (born Mga) brought from Halifax during the
 * documented 1919 forced removal of "28 Aborigines from Halifax to
 * Palm Island". South Sea Islander + Durabal heritage.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'
import { getFamilyFolder } from '@/services/empathyLedgerClient'

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
type BgSource = { url: string; title: string; year: string; source: string; license: string }

// Robertson/Whitey palette — Halifax cane field amber + Hinchinbrook Channel deep teal
const PALETTE = {
  ink: '#1B2E2E',           // deep teal (Hinchinbrook Channel)
  cream: '#F5EBD8',         // cane sugar paper
  ochre: '#B07A35',         // amber/cane
  amber: '#D9A766',         // soft amber
  sand: '#EDDFC4',          // sand
  sacred: '#0E0F0D',        // near-black
}

const BG: Record<string, BgSource> = {
  hinchinbrookChannel: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Queensland_State_Archives_1381_Hinchinbrook_Channel_NQ_c_1935.png',
    title: 'Hinchinbrook Channel, North Queensland',
    year: 'ca. 1935',
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain (pre-1956)',
  },
  hinchinbrookModern: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Wide_expanses_of_estuarine_wetlands._Hinchinbrook_Island_Lookout%2C_Bemerside%2C_2022.jpg',
    title: 'Hinchinbrook Island wetlands',
    year: '2022',
    source: 'Wikimedia Commons',
    license: 'CC BY 4.0',
  },
  cane1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/StateLibQld_1_117483_Sugar_cane_harvesting_at_Victoria_Mill%2C_Ingham%2C_ca.1935.jpg/1920px-StateLibQld_1_117483_Sugar_cane_harvesting_at_Victoria_Mill%2C_Ingham%2C_ca.1935.jpg',
    title: 'Sugar cane harvesting, Victoria Mill, near Ingham',
    year: 'ca. 1935',
    source: 'State Library of Queensland · Wikimedia Commons',
    license: 'Public domain (pre-1956)',
  },
  palmIsland1928: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Queensland_State_Archives_886_Palm_Island_North_Queensland_c_1928.png',
    title: 'Palm Island, North Queensland',
    year: 'ca. 1928',
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain (pre-1956)',
  },
  dancers1931: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Queensland_State_Archives_5801_Dancers_Palm_Island_June_1931.png',
    title: 'Dancers, Palm Island',
    year: 'June 1931',
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain (pre-1956)',
  },
}

export default function RobertsonWhiteyShowcase() {
  const { familySession } = useSession()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!familySession) { setLoading(false); return }
    getFamilyFolder(familySession.folder.id)
      .then(d => setMembers(d.members as Member[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [familySession])
  const ancestors = useMemo(() => members.filter(m => m.isAncestor), [members])
  const ethel = members.find(m => m.displayName.includes('Ethel'))
  const iris = members.find(m => m.displayName.includes('Iris'))
  const tomCurly = ancestors.find(a => a.displayName.includes('Tom Curly'))
  const peter = ancestors.find(a => a.displayName.includes('Peter'))

  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/40 italic font-serif">Opening the family folder…</div>

  return (
    <div style={{ background: PALETTE.cream, color: PALETTE.ink }} className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden" style={{ color: PALETTE.cream }}>
        <img src={BG.hinchinbrookChannel.url} alt={BG.hinchinbrookChannel.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.45) brightness(0.5) contrast(1.05)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(27,46,46,0.5) 0%, rgba(27,46,46,0.85) 100%)' }} />
        <div className="relative z-10 max-w-4xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">Palm Island · Bwgcolman Community</div>
          <h1 className="font-serif font-light leading-[0.95] mb-6" style={{ fontSize: 'clamp(56px, 9vw, 128px)' }}>
            Robertson<span className="opacity-50 font-light px-3">·</span>Whitey
          </h1>
          <p className="font-serif italic opacity-80 max-w-xl text-xl leading-relaxed mx-auto">
            Two sisters from a family of seventeen.
            From Halifax to Palm Island — the documented 1919 wave their father walked through.
          </p>
          <div className="mt-12 text-xs opacity-50 tracking-widest uppercase">↓ Scroll</div>
        </div>
        <ImageCaption bg={BG.hinchinbrookChannel} cream={PALETTE.cream} />
      </section>

      {/* OPENING QUOTE — Aunty Ethel */}
      <section className="min-h-[80vh] flex items-center justify-center px-6 py-32" style={{ background: '#214141', color: PALETTE.cream }}>
        <figure className="max-w-3xl mx-auto text-center">
          <blockquote className="font-serif italic font-light leading-[1.2]" style={{ fontSize: 'clamp(28px, 4.5vw, 56px)' }}>
            “We are full of knowledge and we know our people really well, so we gotta guide the directors about how you should go about things.”
          </blockquote>
          <figcaption className="mt-10 flex flex-col items-center gap-4">
            {ethel?.avatarUrl ? (
              <img src={ethel.avatarUrl} alt={ethel.displayName} className="w-16 h-16 rounded-full object-cover" style={{ border: `2px solid ${PALETTE.cream}33` }} />
            ) : (
              <div className="w-16 h-16 rounded-full inline-flex items-center justify-center font-serif text-xl" style={{ background: 'rgba(255,255,255,0.08)', border: `2px solid ${PALETTE.cream}33` }}>E</div>
            )}
            <div className="text-sm tracking-widest uppercase opacity-65">Aunty Ethel Taylor Robertson</div>
            <div className="text-[11px] tracking-widest uppercase opacity-45">South Sea Islander · Durabal · Aboriginal</div>
          </figcaption>
        </figure>
      </section>

      {/* LEAD ELDER — ETHEL */}
      {ethel && <ElderPanel elder={ethel} accent={PALETTE.ochre} cream={PALETTE.cream} ink={PALETTE.ink}
        quote="A lot of the young generation still don't know the stories. When I was managing the pub, the kids used to ask me the stories." />}

      {/* ELDER — IRIS */}
      {iris && <ElderPanel elder={iris} accent={PALETTE.ochre} cream={PALETTE.cream} ink={PALETTE.ink}
        quote="I come from a big family of seventeen. Even my father, he's born Halifax." />}

      {/* COUNTRY — Halifax + Hinchinbrook */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden" style={{ color: PALETTE.cream }}>
        <img src={BG.cane1935.url} alt={BG.cane1935.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.4) brightness(0.45)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(27,46,46,0.55) 0%, rgba(14,15,13,0.78) 100%)' }} />
        <div className="relative z-10 max-w-2xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-12">Country</div>
          <h2 className="font-serif font-light mb-8" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>Halifax · Hinchinbrook</h2>
          <p className="font-serif italic opacity-85 max-w-xl text-xl leading-relaxed mb-10 mx-auto">
            Cane fields and channel waters. South Sea Islander labour worked these fields.
            The Durabal connections through Hinchinbrook reach deep into the Country.
          </p>
          <div className="text-xs tracking-widest uppercase opacity-60">
            From this Country to Palm Island — the documented 1919 removal
          </div>
        </div>
        <ImageCaption bg={BG.cane1935} cream={PALETTE.cream} />
      </section>

      {/* ANCESTOR — TOM CURLY */}
      {tomCurly && (
        <AncestorPanel
          ancestor={tomCurly}
          quote="They changed his name to Tom Curly 'cause he had tight, curly hair."
          quoteAttribution="Aunty Ethel, recalling her father's renaming on Palm Island"
          quoterAvatarUrl={ethel?.avatarUrl}
          cream={PALETTE.cream}
          ink={PALETTE.ink}
          accent={PALETTE.ochre}
          bg={BG.palmIsland1928}
        />
      )}

      {/* ANCESTOR — PETER */}
      {peter && (
        <AncestorPanel
          ancestor={peter}
          cream={PALETTE.cream}
          ink={PALETTE.ink}
          accent={PALETTE.ochre}
          bg={BG.dancers1931}
        />
      )}

      {/* THE BRIDGE — sisters */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden" style={{ color: PALETTE.cream }}>
        <img src={BG.hinchinbrookModern.url} alt={BG.hinchinbrookModern.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.25) brightness(0.5) contrast(1.05)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(27,46,46,0.45) 0%, rgba(14,15,13,0.78) 100%)' }} />
        <div className="relative z-10 max-w-3xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-12" style={{ color: PALETTE.amber }}>The bridge</div>
          <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>Sisters of the same family of seventeen</h2>
          <div className="flex justify-center gap-6 mb-12">
            {ethel?.avatarUrl && <img src={ethel.avatarUrl} alt={ethel.displayName} className="w-20 h-20 rounded-full object-cover" style={{ border: `2px solid ${PALETTE.amber}66` }} />}
            {iris?.avatarUrl && <img src={iris.avatarUrl} alt={iris.displayName} className="w-20 h-20 rounded-full object-cover" style={{ border: `2px solid ${PALETTE.amber}66` }} />}
          </div>
          <p className="font-serif italic max-w-2xl text-xl leading-relaxed opacity-85 mx-auto">
            Aunty Ethel and Aunty Iris share the same Halifax-born father — Tom Curly (Mga) —
            and the same stolen-generation mother. The Robertson and Whitey lineages meet in this single sibling pair.
          </p>
        </div>
        <ImageCaption bg={BG.hinchinbrookModern} cream={PALETTE.cream} />
      </section>

      <PhotoStrip
        images={[BG.hinchinbrookChannel, BG.cane1935, BG.palmIsland1928, BG.dancers1931, BG.hinchinbrookModern]}
        cream={PALETTE.cream}
        ink={PALETTE.ink}
      />

      {/* LEAVE A NOTE */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-32" style={{ background: PALETTE.ink, color: PALETTE.cream }}>
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">Your family. Your call.</div>
        <p className="font-serif max-w-xl text-xl leading-relaxed opacity-90 mb-10">
          Anything wrong, anything to add, anything to take down — tell us. The family folder is yours.
        </p>
        <div className="flex gap-6 flex-wrap justify-center">
          <Link to="timeline" className="px-6 py-3 border border-cream/30 hover:border-cream text-cream text-sm tracking-widest uppercase transition-colors">View the full timeline</Link>
          <Link to="tree" className="px-6 py-3 border border-cream/30 hover:border-cream text-cream text-sm tracking-widest uppercase transition-colors">See the family tree</Link>
        </div>
        <div className="mt-16 text-[11px] opacity-40">
          Built with the Palm Island Community Company · A Curious Tractor · 2026
        </div>
      </section>
    </div>
  )
}

// Shared sub-components — copied from Palmer template; will refactor to single file next session
function ElderPanel({ elder, accent, cream, ink, quote }: { elder: Member; accent: string; cream: string; ink: string; quote?: string }) {
  return (
    <section className="min-h-screen px-6 py-32" style={{ background: cream, color: ink }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-16 items-center">
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
            {quoteAttribution && (
              <figcaption className="mt-6 flex items-center justify-center gap-3 text-xs tracking-widest uppercase opacity-60">
                {quoterAvatarUrl ? (
                  <img src={quoterAvatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full inline-flex items-center justify-center font-serif text-sm" style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${accent}40`, color: accent }}>{ancestor.displayName.split(/[\s(]/)[0].charAt(0)}</span>
                )}
                <span>{quoteAttribution}</span>
              </figcaption>
            )}
          </figure>
        )}
        <div className="text-center mt-20 text-[11px] opacity-30 tracking-widest">· · ·</div>
      </div>
      {bg && <ImageCaption bg={bg} cream={cream} />}
    </section>
  )
}

function ImageCaption({ bg, cream }: { bg: BgSource; cream: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="absolute bottom-6 left-6 max-w-xs z-10 px-4 py-3 rounded-sm backdrop-blur-sm" style={{ background: 'rgba(14,15,13,0.55)', color: cream, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-[11px] tracking-[0.18em] uppercase opacity-50 mb-1">Photograph</div>
        <div className="font-serif italic text-sm leading-snug opacity-95">{bg.title}</div>
        <div className="text-[11px] opacity-65 mt-1">{bg.year}</div>
        <div className="text-[10px] opacity-45 mt-2 leading-relaxed">{bg.source} · {bg.license}</div>
        <button type="button" onClick={() => setOpen(true)} className="mt-3 text-[11px] tracking-[0.18em] uppercase opacity-60 hover:opacity-100 transition-opacity border-t border-white/10 pt-2 w-full text-left cursor-pointer" style={{ color: cream }}>View full ↗</button>
      </div>
      {open && <Lightbox bg={bg} onClose={() => setOpen(false)} />}
    </>
  )
}

function Lightbox({ bg, onClose }: { bg: BgSource; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Close" className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-light w-10 h-10 flex items-center justify-center">×</button>
      <div className="max-w-7xl w-full flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}><img src={bg.url} alt={bg.title} className="max-w-full max-h-[80vh] object-contain" /></div>
      <div className="mt-6 max-w-2xl text-center text-white/85" onClick={(e) => e.stopPropagation()}>
        <div className="font-serif italic text-xl leading-snug">{bg.title}</div>
        <div className="text-sm opacity-70 mt-2">{bg.year} · {bg.source} · {bg.license}</div>
        <a href={bg.url} target="_blank" rel="noreferrer" className="inline-block mt-4 text-xs tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-white/30">Open original ↗</a>
      </div>
    </div>
  )
}

function PhotoStrip({ images, cream, ink }: { images: BgSource[]; cream: string; ink: string }) {
  const [active, setActive] = useState<BgSource | null>(null)
  return (
    <section className="px-6 py-24" style={{ background: cream, color: ink }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-50 mb-2">All photographs on this page</div>
        <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>The visual record</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((bg, i) => (
            <button key={i} type="button" onClick={() => setActive(bg)} className="group text-left flex flex-col gap-2 cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden bg-ink/10">
                <img src={bg.url} alt={bg.title} className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]" style={{ filter: 'sepia(0.15)' }} />
              </div>
              <div className="font-serif italic text-sm leading-snug opacity-90">{bg.title}</div>
              <div className="text-[11px] opacity-50">{bg.year} · {bg.source.split('·')[0].trim()}</div>
            </button>
          ))}
        </div>
      </div>
      {active && <Lightbox bg={active} onClose={() => setActive(null)} />}
    </section>
  )
}

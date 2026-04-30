/**
 * Palmer · Burns · Obah — bespoke editorial template.
 *
 * Built as a single intentionally-designed page, not a dashboard. Pattern to
 * extend to other clusters once it lands. Reads live data from
 * getFamilyFolder; degrades gracefully if any field is missing.
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

// Editorial palette for THIS cluster — Warrongo Country
// Deep forest (Mt Garnet), ochre desert (Upper Herbert), warm cream (paper)
const PALETTE = {
  ink: '#1A2418',          // deep forest
  cream: '#F4EDE0',         // warm paper
  ochre: '#C9824B',         // ochre desert
  amber: '#E8C496',         // soft amber highlight
  sand: '#E8DCC4',          // sand accent
  sacred: '#0E0F0D',        // near-black for sacred sections
}

// Period-correct full-bleed background images (Wikimedia Commons — high-res, properly licensed)
type BgSource = { url: string; title: string; year: string; source: string; license: string }

const BG: Record<string, BgSource> = {
  mtGarnetCountry: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/StateLibQld_1_49744_Construction_of_Return_Creek_Railway_Bridge%2C_Mount_Garnet%2C_Queensland%2C_ca._1901.jpg/1920px-StateLibQld_1_49744_Construction_of_Return_Creek_Railway_Bridge%2C_Mount_Garnet%2C_Queensland%2C_ca._1901.jpg',
    title: 'Mount Garnet, Warrongo Country',
    year: 'ca. 1901',
    source: 'State Library of Queensland · Wikimedia Commons',
    license: 'Public domain',
  },
  blencoeFalls: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Blencoe_Falls%2C_Girrigun_National_Park%2C_Far_North_Queensland%2C_2022.jpg/1920px-Blencoe_Falls%2C_Girrigun_National_Park%2C_Far_North_Queensland%2C_2022.jpg',
    title: 'Blencoe Falls, Girrigun National Park',
    year: '2022',
    source: 'Royal Geographical Society of Queensland · Wikimedia Commons',
    license: 'CC BY 4.0',
  },
  // Alf Palmer panel — 1931 St George's Anglican church construction (8 years before Alf became Church Warden in 1939)
  stGeorgesChurch: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Australian_Aboriginal_men_erecting_the_wooden_frame_of_St_George%27s_Anglican_church%2C_Palm_Island%2C_1931.jpg/1920px-Australian_Aboriginal_men_erecting_the_wooden_frame_of_St_George%27s_Anglican_church%2C_Palm_Island%2C_1931.jpg",
    title: "Aboriginal men erecting St George's Anglican Church, Palm Island",
    year: '1931',
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain (pre-1956)',
  },
  // Lizzie Palmer panel — 1931 dancers
  dancers1931: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Queensland_State_Archives_5801_Dancers_Palm_Island_June_1931.png',
    title: 'Dancers, Palm Island',
    year: 'June 1931',
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain (pre-1956)',
  },
  // Allison Ober panel — 1928 broader settlement
  palmIsland1928: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Queensland_State_Archives_886_Palm_Island_North_Queensland_c_1928.png',
    title: 'Palm Island, North Queensland',
    year: 'ca. 1928',
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain (pre-1956)',
  },
  // Bridge panel — brass band 1931 (community + ceremony)
  brassBand1931: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Queensland_State_Archives_5796_Brass_Band_Palm_Island_June_1931.png',
    title: 'Brass Band, Palm Island',
    year: 'June 1931',
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain (pre-1956)',
  },
}

export default function PalmerBurnsObahShowcase() {
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

  const ancestors = useMemo(() => {
    const order = ['Lucy', 'Alf Palmer', 'Lizzie', 'Allison Ober']
    return members
      .filter(m => m.isAncestor)
      .sort((a, b) => {
        const ai = order.findIndex(n => a.displayName.includes(n))
        const bi = order.findIndex(n => b.displayName.includes(n))
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
  }, [members])
  const marjoyie = members.find(m => m.displayName.startsWith('Marjoyie'))
  const winifred = members.find(m => m.displayName.startsWith('Winifred'))

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40 italic font-serif">Opening the family folder…</div>
  }

  return (
    <div style={{ background: PALETTE.cream, color: PALETTE.ink }} className="min-h-screen">
      {/* ─────────────────────────────  1. HERO  ───────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden" style={{ color: PALETTE.cream }}>
        <img src={BG.mtGarnetCountry.url} alt={BG.mtGarnetCountry.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.5) brightness(0.45) contrast(1.05)' }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(26,36,24,0.45) 0%, rgba(26,36,24,0.78) 100%)` }} />
        <div className="relative z-10 max-w-4xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">Palm Island · Bwgcolman Community</div>
          <h1 className="font-serif font-light leading-[0.95] mb-6" style={{ fontSize: 'clamp(56px, 9vw, 128px)' }}>
            Palmer<span className="opacity-50 font-light px-3">·</span>Burns<span className="opacity-50 font-light px-3">·</span>Obah
          </h1>
          <p className="font-serif italic opacity-80 max-w-xl text-xl leading-relaxed mx-auto">
            Three families on Palm Island, one Warrongo line.
            From Lucy at Blencoe Falls in the 1880s, to the children at Bwgcolman School today.
          </p>
          <div className="mt-12 text-xs opacity-50 tracking-widest uppercase">↓ Scroll</div>
        </div>
        <ImageCaption bg={BG.mtGarnetCountry} cream={PALETTE.cream} />
      </section>

      {/* ─────────────────────  2. OPENING QUOTE — Winifred  ─────────────── */}
      <section
        className="min-h-[80vh] flex items-center justify-center px-6 py-32"
        style={{ background: '#2A3D26', color: PALETTE.cream }}
      >
        <figure className="max-w-3xl mx-auto text-center">
          <blockquote className="font-serif italic font-light leading-[1.2]" style={{ fontSize: 'clamp(28px, 4.5vw, 56px)' }}>
            “It's verbal, it's verbally spoken where you tell your story and you're handing it down.”
          </blockquote>
          <figcaption className="mt-10 flex flex-col items-center gap-4">
            {winifred?.avatarUrl ? (
              <img src={winifred.avatarUrl} alt={winifred.displayName} className="w-16 h-16 rounded-full object-cover" style={{ border: `2px solid ${PALETTE.cream}33` }} />
            ) : (
              <div className="w-16 h-16 rounded-full inline-flex items-center justify-center font-serif text-xl" style={{ background: 'rgba(255,255,255,0.08)', border: `2px solid ${PALETTE.cream}33` }}>W</div>
            )}
            <div className="text-sm tracking-widest uppercase opacity-65">
              Winifred Obah
            </div>
            <div className="text-[11px] tracking-widest uppercase opacity-45">
              Warrongo · Durru · Warra · Gungandji · Djiru
            </div>
          </figcaption>
        </figure>
      </section>

      {/* ─────────────────────────  3. LEAD ELDER — MARJOYIE  ───────────── */}
      {marjoyie && (
        <ElderPanel elder={marjoyie} accentColor={PALETTE.ochre} cream={PALETTE.cream} ink={PALETTE.ink}
          quote="My grandparents Alf Palmer and Granny Lizzie Palmer." />
      )}

      {/* ─────────────────────────  4. SECOND ELDER — WINIFRED  ──────────── */}
      {winifred && (
        <ElderPanel elder={winifred} accentColor={PALETTE.ochre} cream={PALETTE.cream} ink={PALETTE.ink}
          quote="I felt the ancestor spirit. It's like they were around us because my back went funny. I felt like there was spikes on my back, like my hair was standing." />
      )}

      {/* ─────────────────  5. COUNTRY — Warrongo  ─────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden" style={{ color: PALETTE.cream }}>
        <img src={BG.mtGarnetCountry.url} alt={BG.mtGarnetCountry.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.35) brightness(0.5)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(26,36,24,0.6) 0%, rgba(14,15,13,0.78) 100%)' }} />
        <div className="relative z-10 max-w-2xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-12">Country</div>
          <h2 className="font-serif font-light mb-8" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>Warrongo</h2>
          <p className="font-serif italic opacity-80 max-w-xl text-xl leading-relaxed mb-10 mx-auto">
            Mt Garnet to the Upper Herbert River. Closely related to Gudjal and Gugu Badhun.
            Tin was discovered there in the 1880s. The mining brought the violence.
          </p>
          <div className="text-xs tracking-widest uppercase opacity-60">
            The Palmer line walks from this Country to Palm Island
          </div>
        </div>
        <ImageCaption bg={BG.mtGarnetCountry} cream={PALETTE.cream} />
      </section>

      {/* ─────────────  6. SACRED — Lucy at Blencoe Falls  ────────────── */}
      {ancestors.find(a => a.displayName.includes('Lucy')) && (
        <SacredPanel
          ancestor={ancestors.find(a => a.displayName.includes('Lucy'))!}
          sacred={PALETTE.sacred}
          cream={PALETTE.cream}
          bg={BG.blencoeFalls}
        />
      )}

      {/* ─────────────  7. ANCESTOR — Alf Palmer (Jinbilnggay)  ─────── */}
      {ancestors.find(a => a.displayName.includes('Alf Palmer')) && (
        <AncestorPanel
          ancestor={ancestors.find(a => a.displayName.includes('Alf Palmer'))!}
          quote="I'm the last one to speak Warrungu. When I die this language will die. I'll teach you everything I know, so put it down properly."
          quoteAttribution="Alf Palmer (Jinbilnggay) to linguist Tasaku Tsunoda, Palm Island, 1971"
          cream={PALETTE.cream}
          ink={PALETTE.ink}
          accent={PALETTE.ochre}
          sand={PALETTE.sand}
          bg={BG.stGeorgesChurch}
        />
      )}

      {/* ─────────────  8. ANCESTOR — Lizzie Palmer  ─────────────────── */}
      {ancestors.find(a => a.displayName.includes('Lizzie')) && (
        <AncestorPanel
          ancestor={ancestors.find(a => a.displayName.includes('Lizzie'))!}
          cream={PALETTE.cream}
          ink={PALETTE.ink}
          accent={PALETTE.ochre}
          sand={PALETTE.sand}
          bg={BG.dancers1931}
        />
      )}

      {/* ─────────────  9. ANCESTOR — Allison Ober  ──────────────────── */}
      {ancestors.find(a => a.displayName.includes('Allison')) && (
        <AncestorPanel
          ancestor={ancestors.find(a => a.displayName.includes('Allison'))!}
          cream={PALETTE.cream}
          ink={PALETTE.ink}
          accent={PALETTE.ochre}
          sand={PALETTE.sand}
          bg={BG.palmIsland1928}
        />
      )}

      {/* ─────────────  10. THE BRIDGE  ──────────────────────────────── */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden" style={{ color: PALETTE.cream }}>
        <img src={BG.brassBand1931.url} alt={BG.brassBand1931.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'sepia(0.4) brightness(0.42) contrast(1.1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(26,36,24,0.5) 0%, rgba(14,15,13,0.78) 100%)' }} />
        <div className="relative z-10 max-w-3xl">
          <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-12" style={{ color: PALETTE.ochre }}>The bridge</div>
          <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Marjoyie and Winifred are cousins
          </h2>
          <div className="flex justify-center gap-6 mb-12">
            {marjoyie?.avatarUrl && (
              <img src={marjoyie.avatarUrl} alt={marjoyie.displayName} className="w-20 h-20 rounded-full object-cover" style={{ border: `2px solid ${PALETTE.ochre}66` }} />
            )}
            {winifred?.avatarUrl && (
              <img src={winifred.avatarUrl} alt={winifred.displayName} className="w-20 h-20 rounded-full object-cover" style={{ border: `2px solid ${PALETTE.ochre}66` }} />
            )}
          </div>
          <p className="font-serif italic max-w-2xl text-xl leading-relaxed opacity-85 mx-auto">
            Through Alf Palmer. He was Marjoyie's grandfather and Winifred's grand-uncle (her grandmother's brother).
            Alf's mother Lucy was killed at Blencoe Falls. His granddaughter Rachel Cummins led the Warrongo language revival from 2002.
            The Palmer line carries one of the documented Indigenous lineages of Palm Island.
          </p>
        </div>
        <ImageCaption bg={BG.brassBand1931} cream={PALETTE.cream} />
      </section>

      {/* ─────────────  10b. PHOTO STRIP  ───────────────────────────── */}
      <PhotoStrip
        images={[BG.mtGarnetCountry, BG.blencoeFalls, BG.stGeorgesChurch, BG.dancers1931, BG.palmIsland1928, BG.brassBand1931]}
        cream={PALETTE.cream}
        ink={PALETTE.ink}
      />

      {/* ─────────────  11. LEAVE A NOTE  ────────────────────────────── */}
      <section
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-32"
        style={{ background: PALETTE.ink, color: PALETTE.cream }}
      >
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-8">Your family. Your call.</div>
        <p className="font-serif max-w-xl text-xl leading-relaxed opacity-90 mb-10">
          Anything wrong, anything to add, anything to take down — tell us. The family folder is yours.
        </p>
        <div className="flex gap-6 flex-wrap justify-center">
          <Link to="timeline" className="px-6 py-3 border border-cream/30 hover:border-cream text-cream text-sm tracking-widest uppercase transition-colors">
            View the full timeline
          </Link>
          <Link to="tree" className="px-6 py-3 border border-cream/30 hover:border-cream text-cream text-sm tracking-widest uppercase transition-colors">
            See the family tree
          </Link>
        </div>
        <div className="mt-16 text-[11px] opacity-40">
          Built with the Palm Island Community Company · A Curious Tractor · 2026
        </div>
      </section>
    </div>
  )
}

// ─────────────────────────  ElderPanel  ────────────────────────────────────
function ElderPanel({ elder, accentColor, cream, ink, quote }: {
  elder: Member
  accentColor: string
  cream: string
  ink: string
  quote?: string
}) {
  return (
    <section className="min-h-screen px-6 py-32" style={{ background: cream, color: ink }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-16 items-center">
        <div>
          {elder.avatarUrl ? (
            <img src={elder.avatarUrl} alt={elder.displayName} className="w-full max-w-md aspect-[4/5] object-cover" style={{ filter: 'sepia(0.08) saturate(0.95)' }} />
          ) : (
            <div className="w-full max-w-md aspect-[4/5]" style={{ background: accentColor, opacity: 0.15 }} />
          )}
        </div>
        <div className="max-w-xl">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: accentColor }}>Elder</div>
          <h2 className="font-serif font-light leading-[1.05] mb-4" style={{ fontSize: 'clamp(40px, 5.5vw, 80px)' }}>
            {elder.displayName}
          </h2>
          {(elder.birthYear || elder.deathYear) && (
            <div className="text-base mb-8 opacity-50 tracking-wide">
              {elder.birthYear ?? '?'}{elder.deathYear ? `–${elder.deathYear}` : ''}
            </div>
          )}
          {Array.isArray(elder.culturalBackground) && elder.culturalBackground.length > 0 && (
            <div className="text-sm tracking-wide italic opacity-65 mb-10">
              {elder.culturalBackground.join(' · ')}
            </div>
          )}
          {elder.bio && (
            <p className="font-serif text-xl leading-[1.65] opacity-85" style={{ maxWidth: '60ch' }}>
              <span className="float-left font-serif font-light leading-[0.85] mr-2 mt-1" style={{ fontSize: '5.5em', color: accentColor }}>
                {elder.bio.charAt(0)}
              </span>
              {elder.bio.slice(1)}
            </p>
          )}
          {quote && (
            <figure className="mt-10" style={{ maxWidth: '60ch' }}>
              <blockquote className="font-serif italic pl-6 text-2xl leading-relaxed opacity-80" style={{ borderLeft: `2px solid ${accentColor}` }}>
                “{quote}”
              </blockquote>
              <figcaption className="mt-4 pl-6 flex items-center gap-3 text-sm opacity-60">
                {elder.avatarUrl && (
                  <img src={elder.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                )}
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
function AncestorPanel({ ancestor, quote, quoteAttribution, quoterAvatarUrl, cream, ink, accent, sand, bg }: {
  ancestor: Member
  quote?: string
  quoteAttribution?: string
  quoterAvatarUrl?: string | null
  cream: string
  ink: string
  accent: string
  sand: string
  bg?: BgSource
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
        <h2 className="font-serif font-light leading-[1.05] mb-4" style={{ fontSize: 'clamp(40px, 6vw, 88px)' }}>
          {ancestor.displayName}
        </h2>
        {(ancestor.birthYear || ancestor.deathYear) && (
          <div className="text-base mb-3 opacity-50 tracking-wide">
            {ancestor.birthYear ?? 'c. ?'}{ancestor.deathYear ? `–${ancestor.deathYear}` : ''}
          </div>
        )}
        {ancestor.birthPlace && (
          <div className="text-sm italic opacity-65 mb-12">{ancestor.birthPlace}</div>
        )}
        {Array.isArray(ancestor.culturalBackground) && ancestor.culturalBackground.length > 0 && (
          <div className="text-sm tracking-wide italic opacity-65 mb-10">
            {ancestor.culturalBackground.join(' · ')}
          </div>
        )}
        {ancestor.bio && (
          <p className="font-serif text-xl leading-[1.7] opacity-80 text-left max-w-2xl mx-auto" style={{ maxWidth: '62ch' }}>
            {ancestor.bio.length > 600 ? ancestor.bio.slice(0, 600) + '…' : ancestor.bio}
          </p>
        )}
        {quote && (
          <figure className="mt-16 max-w-2xl mx-auto">
            <blockquote className="font-serif italic font-light leading-[1.3]" style={{ fontSize: 'clamp(24px, 3vw, 40px)', color: accent }}>
              “{quote}”
            </blockquote>
            {quoteAttribution && (
              <figcaption className="mt-6 flex items-center justify-center gap-3 text-xs tracking-widest uppercase opacity-60">
                {quoterAvatarUrl ? (
                  <img src={quoterAvatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full inline-flex items-center justify-center font-serif text-sm" style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${accent}40`, color: accent }}>
                    {ancestor.displayName.split(/[\s(]/)[0].charAt(0)}
                  </span>
                )}
                <span>{quoteAttribution}</span>
              </figcaption>
            )}
          </figure>
        )}
        <div className="text-center mt-20 text-[11px] opacity-30 tracking-widest">· · ·</div>
      </div>
      {bg && <ImageCaption bg={bg} cream={cream} />}
      {/* Suppress unused-arg lint */}
      <span className="hidden">{sand}</span>
    </section>
  )
}

// ─────────────────────────  SacredPanel  ───────────────────────────────────
function SacredPanel({ ancestor, sacred, cream, bg }: {
  ancestor: Member
  sacred: string
  cream: string
  bg?: BgSource
}) {
  const [revealed, setRevealed] = useState(false)
  const firstName = ancestor.displayName.split(/[\s(]/)[0]
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden"
      style={{ background: sacred, color: cream }}
    >
      {bg && revealed && (
        <>
          <img src={bg.url} alt={bg.title} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'grayscale(0.65) brightness(0.4) contrast(1.1)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(14,15,13,0.45) 0%, rgba(14,15,13,0.92) 100%)' }} />
        </>
      )}
      <div className="relative z-10 w-full">
      <div className="text-[11px] tracking-[0.3em] uppercase mb-12 opacity-60">Sacred · with elder consent</div>
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="px-8 py-4 border border-cream/40 hover:border-cream/80 transition-colors text-cream text-sm tracking-widest uppercase max-w-md"
        >
          A massacre carried in this family.
          <span className="block text-[11px] opacity-50 normal-case mt-2 tracking-normal">Tap to read with care</span>
        </button>
      ) : (
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif font-light mb-6" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            {firstName}
          </h2>
          <div className="text-base mb-10 opacity-60 tracking-wide italic">c. 1830s – 1880s · Warrongo Country (Mt Garnet)</div>
          <p className="font-serif italic text-xl leading-relaxed opacity-90 mb-10" style={{ maxWidth: '60ch', margin: '0 auto' }}>
            {ancestor.bio || 'Lucy was the mother of Alf Palmer (Jinbilnggay). She was killed at Blencoe Falls in the 1880s, when a group of Warrongo people were driven off the cliffs by frontier settlers. The Palmer line carries her memory forward. Marjoyie and Winifred are her descendants.'}
          </p>
          <div className="text-[11px] opacity-40 tracking-widest uppercase mt-12">Source · Wikipedia (Warrongo people) · Tasaku Tsunoda, academic</div>
        </div>
      )}
      </div>
      {bg && revealed && <ImageCaption bg={bg} cream={cream} />}
    </section>
  )
}

// ─────────────────────────  ImageCaption  ──────────────────────────────────
// Small floating caption block, bottom-left of any panel with a background image
function ImageCaption({ bg, cream }: { bg: BgSource; cream: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div
        className="absolute bottom-6 left-6 max-w-xs z-10 px-4 py-3 rounded-sm backdrop-blur-sm"
        style={{ background: 'rgba(14,15,13,0.55)', color: cream, border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="text-[11px] tracking-[0.18em] uppercase opacity-50 mb-1">Photograph</div>
        <div className="font-serif italic text-sm leading-snug opacity-95">{bg.title}</div>
        <div className="text-[11px] opacity-65 mt-1">{bg.year}</div>
        <div className="text-[10px] opacity-45 mt-2 leading-relaxed">{bg.source} · {bg.license}</div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 text-[11px] tracking-[0.18em] uppercase opacity-60 hover:opacity-100 transition-opacity border-t border-white/10 pt-2 w-full text-left cursor-pointer"
          style={{ color: cream }}
        >
          View full ↗
        </button>
      </div>
      {open && <Lightbox bg={bg} onClose={() => setOpen(false)} />}
    </>
  )
}

// ─────────────────────────  Lightbox  ──────────────────────────────────────
// Full-screen modal showing the photo, caption, full source link
function Lightbox({ bg, onClose }: { bg: BgSource; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-light leading-none w-10 h-10 flex items-center justify-center"
      >
        ×
      </button>
      <div className="max-w-7xl w-full flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img src={bg.url} alt={bg.title} className="max-w-full max-h-[80vh] object-contain" />
      </div>
      <div className="mt-6 max-w-2xl text-center text-white/85" onClick={(e) => e.stopPropagation()}>
        <div className="font-serif italic text-xl leading-snug">{bg.title}</div>
        <div className="text-sm opacity-70 mt-2">{bg.year} · {bg.source} · {bg.license}</div>
        <a
          href={bg.url}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 text-xs tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-white/30"
        >
          Open original ↗
        </a>
      </div>
    </div>
  )
}

// ─────────────────────────  PhotoStrip  ────────────────────────────────────
// Bottom-of-page thumbnail strip showing all images on the page
function PhotoStrip({ images, cream, ink }: { images: BgSource[]; cream: string; ink: string }) {
  const [active, setActive] = useState<BgSource | null>(null)
  return (
    <section className="px-6 py-24" style={{ background: cream, color: ink }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-50 mb-2">All photographs on this page</div>
        <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>The visual record</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((bg, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(bg)}
              className="group text-left flex flex-col gap-2 cursor-pointer"
            >
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

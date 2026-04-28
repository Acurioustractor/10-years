/**
 * Community photo gallery — timeline browse + lightbox.
 * Curated historical images (Wikimedia Commons + State Library of Queensland)
 * from 1880s through 2025. Click any thumbnail to open in a lightbox.
 *
 * Pattern to extend: pull from media_assets table once /api/v2/communities/[id]/media exists.
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

interface Photo {
  url: string
  thumbUrl?: string
  title: string
  year: string
  yearSort: number
  source: string
  license: string
  era: string
  description?: string
}

const PHOTOS: Photo[] = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Blencoe_Falls%2C_Girrigun_National_Park%2C_Far_North_Queensland%2C_2022.jpg/1920px-Blencoe_Falls%2C_Girrigun_National_Park%2C_Far_North_Queensland%2C_2022.jpg',
    title: 'Blencoe Falls, Girrigun National Park',
    year: '1880s · pictured 2022',
    yearSort: 1885,
    source: 'Royal Geographical Society of Queensland · Wikimedia Commons',
    license: 'CC BY 4.0',
    era: 'Frontier · Warrongo Country',
    description: 'The site of the Blencoe Falls massacre — where Lucy (Alf Palmer\'s mother) was killed in the 1880s when Warrongo people were driven off the cliffs by frontier settlers.',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/StateLibQld_1_49744_Construction_of_Return_Creek_Railway_Bridge%2C_Mount_Garnet%2C_Queensland%2C_ca._1901.jpg/1920px-StateLibQld_1_49744_Construction_of_Return_Creek_Railway_Bridge%2C_Mount_Garnet%2C_Queensland%2C_ca._1901.jpg',
    title: 'Mt Garnet, Warrongo Country',
    year: 'ca. 1901',
    yearSort: 1901,
    source: 'State Library of Queensland · Wikimedia Commons',
    license: 'Public domain',
    era: 'Tin mining · settler expansion',
    description: 'Return Creek Railway Bridge construction at Mt Garnet — the heartland of Warrongo Country, where mining brought waves of frontier violence.',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Queensland_State_Archives_886_Palm_Island_North_Queensland_c_1928.png',
    title: 'Palm Island, North Queensland',
    year: 'ca. 1928',
    yearSort: 1928,
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain',
    era: 'Forced removals era',
    description: 'Palm Island in the late 1920s — when forced relocations from the mainland were bringing the Bwgcolman peoples (Allison Ober\'s era).',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Queensland_State_Archives_5801_Dancers_Palm_Island_June_1931.png',
    title: 'Dancers, Palm Island',
    year: 'June 1931',
    yearSort: 1931,
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain',
    era: 'Cultural performance',
    description: 'Photographed during the Home Secretary\'s inspection visit to Palm Island. Lizzie Palmer\'s era — Marjoyie\'s grandmother\'s generation.',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Queensland_State_Archives_5796_Brass_Band_Palm_Island_June_1931.png',
    title: 'Brass Band, Palm Island',
    year: 'June 1931',
    yearSort: 1931,
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain',
    era: 'Mission community life',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Australian_Aboriginal_men_erecting_the_wooden_frame_of_St_George%27s_Anglican_church%2C_Palm_Island%2C_1931.jpg/1920px-Australian_Aboriginal_men_erecting_the_wooden_frame_of_St_George%27s_Anglican_church%2C_Palm_Island%2C_1931.jpg',
    title: "Aboriginal men erecting St George's Anglican Church",
    year: '1931',
    yearSort: 1931,
    source: 'Queensland State Archives · Wikimedia Commons',
    license: 'Public domain',
    era: 'Mission building era',
    description: 'The same St George\'s Mission where Alf Palmer would serve as Church Warden in 1939, eight years after this photograph.',
  },
]

const ERAS = [
  { label: 'All', from: 1800, to: 2100 },
  { label: 'Frontier', from: 1800, to: 1899 },
  { label: 'Removals', from: 1900, to: 1949 },
  { label: 'Strike era', from: 1950, to: 1979 },
  { label: 'Recent', from: 1980, to: 2100 },
]

export default function CommunityPhotoGalleryPage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const [active, setActive] = useState<Photo | null>(null)
  const [filter, setFilter] = useState<typeof ERAS[number]>(ERAS[0])

  const sorted = [...PHOTOS].sort((a, b) => a.yearSort - b.yearSort)
  const visible = sorted.filter(p => p.yearSort >= filter.from && p.yearSort <= filter.to)

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  return (
    <div className="min-h-screen" style={{ background: '#F4EDE0', color: '#1A2418' }}>
      {/* Header */}
      <header className="px-6 pt-16 pb-12 max-w-6xl mx-auto">
        <Link to={`/c/${communitySlug}`} className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100">← Back to community</Link>
        <h1 className="font-serif font-light leading-[1.05] mt-6 mb-4" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>The visual record</h1>
        <p className="font-serif italic text-xl opacity-75 max-w-xl leading-relaxed">
          Photographs of Palm Island and its Country, from the 1880s to today.
          Drawn from State Library of Queensland and Wikimedia Commons.
        </p>
      </header>

      {/* Era filter */}
      <div className="px-6 pb-12 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {ERAS.map(era => (
            <button
              key={era.label}
              type="button"
              onClick={() => setFilter(era)}
              className={`text-[11px] tracking-[0.18em] uppercase px-4 py-2 rounded-full transition-colors cursor-pointer ${filter.label === era.label ? 'bg-ink text-cream' : 'bg-transparent border border-ink/15 hover:border-ink/40'}`}
              style={filter.label === era.label ? { background: '#1A2418', color: '#F4EDE0' } : { color: '#1A2418', opacity: 0.7 }}
            >
              {era.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid — chronological */}
      <div className="px-6 pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(p)}
              className="text-left flex flex-col gap-3 cursor-pointer group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-ink/10">
                <img src={p.url} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]" style={{ filter: 'sepia(0.15)' }} />
              </div>
              <div>
                <div className="text-[11px] tracking-[0.18em] uppercase opacity-50 mb-1">{p.era}</div>
                <div className="font-serif italic text-base leading-snug">{p.title}</div>
                <div className="text-xs opacity-55 mt-1">{p.year}</div>
              </div>
            </button>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="text-center py-16 opacity-50 italic font-serif">No photographs in this era yet.</div>
        )}
      </div>

      {/* Lightbox */}
      {active && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6" onClick={() => setActive(null)}>
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-light w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
          <div className="max-w-7xl w-full flex-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={active.url} alt={active.title} className="max-w-full max-h-[75vh] object-contain" />
          </div>
          <div className="mt-6 max-w-2xl text-center text-white/85" onClick={(e) => e.stopPropagation()}>
            <div className="text-[11px] tracking-[0.18em] uppercase opacity-60 mb-2">{active.era}</div>
            <div className="font-serif italic text-2xl leading-snug">{active.title}</div>
            <div className="text-sm opacity-70 mt-2">{active.year} · {active.source} · {active.license}</div>
            {active.description && (
              <p className="font-serif italic mt-4 text-base leading-relaxed opacity-80">{active.description}</p>
            )}
            <a href={active.url} target="_blank" rel="noreferrer" className="inline-block mt-5 text-xs tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-white/30">
              Open original ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

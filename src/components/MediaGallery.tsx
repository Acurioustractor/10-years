/**
 * Mixed-media gallery — stills + video clips together.
 *
 * Stills open in the shared Lightbox; clips render inline as preview tiles
 * that play on hover and open in a full-screen video player on click.
 *
 * Used on JourneyDetailPage and ElderProfilePage to surface the trip
 * imagery sourced from the Palm Island repo's hero-assets folder.
 */
import { useEffect, useState } from 'react'
import Lightbox, { type LightboxImage } from './Lightbox'

export type GalleryStill = LightboxImage & { kind: 'still' }
export type GalleryClip = {
  kind: 'clip'
  url: string                  // mp4 url
  poster?: string              // optional poster
  title: string
  year: string
  source: string
  license: string
}

export type GalleryItem = GalleryStill | GalleryClip

export type MediaGalleryProps = {
  items: GalleryItem[]
  cream: string
  ink: string
  ochre: string
  heading?: string
  eyebrow?: string
}

export default function MediaGallery({
  items,
  cream,
  ink,
  ochre,
  heading = 'The visual record',
  eyebrow = 'Photographs and footage',
}: MediaGalleryProps) {
  const [lightboxStill, setLightboxStill] = useState<GalleryStill | null>(null)
  const [openClip, setOpenClip] = useState<GalleryClip | null>(null)

  // Lock body scroll while video viewer is open
  useEffect(() => {
    if (!openClip) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenClip(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [openClip])

  if (items.length === 0) return null
  const stills = items.filter((i): i is GalleryStill => i.kind === 'still')

  return (
    <section className="px-6 py-24" style={{ background: cream, color: ink }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-50 mb-2">{eyebrow}</div>
        <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
          {heading}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
            if (item.kind === 'clip') {
              return (
                <button
                  key={`clip-${i}-${item.url}`}
                  type="button"
                  onClick={() => setOpenClip(item)}
                  className="group text-left flex flex-col gap-2 cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-ink/10 relative">
                    <video
                      src={item.url}
                      poster={item.poster}
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                      style={{ filter: 'sepia(0.15)' }}
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                      }}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] tracking-widest uppercase" style={{ background: ochre, color: cream }}>
                      Video
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <polygon points="6,4 20,12 6,20" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="font-serif italic text-sm leading-snug opacity-90">{item.title}</div>
                  <div className="text-[11px] opacity-50">
                    {item.year ? `${item.year} · ` : ''}
                    {item.source.split('·')[0].trim()}
                  </div>
                </button>
              )
            }
            return (
              <button
                key={`still-${i}-${item.url}`}
                type="button"
                onClick={() => setLightboxStill(item)}
                className="group text-left flex flex-col gap-2 cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden bg-ink/10">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                    style={{ filter: 'sepia(0.15)' }}
                  />
                </div>
                <div className="font-serif italic text-sm leading-snug opacity-90">{item.title}</div>
                <div className="text-[11px] opacity-50">
                  {item.year ? `${item.year} · ` : ''}
                  {item.source.split('·')[0].trim()}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Still lightbox */}
      {lightboxStill && (
        <Lightbox
          images={stills}
          index={Math.max(0, stills.findIndex((s) => s.url === lightboxStill.url))}
          onIndexChange={(i) => setLightboxStill(stills[i] || null)}
          onClose={() => setLightboxStill(null)}
        />
      )}

      {/* Clip viewer */}
      {openClip && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6"
          onClick={() => setOpenClip(null)}
        >
          <button
            type="button"
            onClick={() => setOpenClip(null)}
            aria-label="Close"
            className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-light w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
          <div
            className="max-w-7xl w-full flex-1 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={openClip.url}
              poster={openClip.poster}
              autoPlay
              controls
              className="max-w-full max-h-[80vh]"
            />
          </div>
          <div className="mt-6 max-w-2xl text-center text-white/85" onClick={(e) => e.stopPropagation()}>
            <div className="font-serif italic text-xl leading-snug">{openClip.title}</div>
            <div className="text-sm opacity-70 mt-2">
              {openClip.year ? `${openClip.year} · ` : ''}
              {openClip.source} · {openClip.license}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

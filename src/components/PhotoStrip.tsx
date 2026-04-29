/**
 * Grid of all photos on a page, with click-to-open in Lightbox.
 * Extracted from ClusterShowcase. Behaviour unchanged; uses the new shared
 * Lightbox so prev/next navigates the whole strip.
 */
import { useState } from 'react'
import Lightbox, { type LightboxImage } from './Lightbox'

export type PhotoStripProps = {
  images: LightboxImage[]
  cream: string
  ink: string
  heading?: string
  eyebrow?: string
}

export default function PhotoStrip({
  images,
  cream,
  ink,
  heading = 'The visual record',
  eyebrow = 'All photographs on this page',
}: PhotoStripProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  if (images.length === 0) return null

  return (
    <section className="px-6 py-24" style={{ background: cream, color: ink }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-50 mb-2">{eyebrow}</div>
        <h2 className="font-serif font-light mb-12" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
          {heading}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((bg, i) => (
            <button
              key={`${bg.url}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className="group text-left flex flex-col gap-2 cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden bg-ink/10">
                <img
                  src={bg.url}
                  alt={bg.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                  style={{ filter: 'sepia(0.15)' }}
                />
              </div>
              <div className="font-serif italic text-sm leading-snug opacity-90">{bg.title}</div>
              <div className="text-[11px] opacity-50">
                {bg.year ? `${bg.year} · ` : ''}
                {bg.source.split('·')[0].trim()}
              </div>
            </button>
          ))}
        </div>
      </div>
      {activeIndex !== null && (
        <Lightbox
          images={images}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </section>
  )
}

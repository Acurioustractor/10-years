/**
 * Full-screen video panel with an elder pullquote overlaid in serif.
 *
 * The video plays muted/loop behind a sepia gradient; the quote sits
 * front-and-center. Used between chapters on journey pages to give
 * cinematic weight to the elders' words.
 */
import VideoHero from './VideoHero'

export type VideoQuoteSectionProps = {
  videoSrc: string
  poster?: string
  quote: string
  attribution: string
  cream: string
  ink: string
  amber?: string
  /** Optional avatar URL to render below attribution */
  attributionAvatarUrl?: string
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function VideoQuoteSection({
  videoSrc,
  poster,
  quote,
  attribution,
  cream,
  ink,
  amber,
  attributionAvatarUrl,
}: VideoQuoteSectionProps) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden"
      style={{ color: cream }}
    >
      <div className="absolute inset-0">
        <VideoHero
          src={videoSrc}
          poster={poster}
          alt={quote}
          filter="sepia(0.4) brightness(0.32) contrast(1.05)"
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(ink, 0.5)} 0%, ${hexToRgba(ink, 0.85)} 100%)`,
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto pointer-events-none">
        <blockquote
          className="font-serif italic font-light leading-[1.2]"
          style={{ fontSize: 'clamp(28px, 4.5vw, 56px)' }}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="mt-12 flex flex-col items-center gap-4">
          {attributionAvatarUrl && (
            <img
              src={attributionAvatarUrl}
              alt={attribution}
              className="w-16 h-16 rounded-full object-cover"
              style={{ border: `1px solid ${hexToRgba(cream, 0.4)}` }}
            />
          )}
          <div
            className="text-xs tracking-widest uppercase opacity-80"
            style={{ color: amber || cream }}
          >
            {attribution}
          </div>
        </div>
      </div>
    </section>
  )
}

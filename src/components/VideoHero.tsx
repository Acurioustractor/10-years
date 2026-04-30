/**
 * Video-aware hero. Autoplay, muted, loop, plays inline. Falls back
 * gracefully — if the browser blocks autoplay or the video fails, the
 * poster image stays visible.
 *
 * Used by JourneyDetailPage hero and any other surface that wants
 * cinematic atmosphere instead of a still photo.
 */
import { useEffect, useRef, useState } from 'react'

export type VideoHeroProps = {
  src: string                  // e.g. "/media/clips/elders-on-country.mp4"
  poster?: string              // fallback still — shown until video plays
  alt: string                  // for screen readers
  filter?: string              // CSS filter — defaults to sepia + brightness
  className?: string
  onClick?: () => void
}

const DEFAULT_FILTER = 'sepia(0.4) brightness(0.45) contrast(1.05)'

export default function VideoHero({
  src,
  poster,
  alt,
  filter = DEFAULT_FILTER,
  className = '',
  onClick,
}: VideoHeroProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    // Some browsers block autoplay even with muted — try once, fall back
    const playPromise = v.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — silent. Poster will show.
      })
    }
  }, [src])

  // If video errors hard, fall back to poster image
  if (failed && poster) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={alt}
        className={`block w-full h-full ${onClick ? 'cursor-zoom-in' : ''} ${className}`}
      >
        <img src={poster} alt={alt} className="w-full h-full object-cover" style={{ filter }} />
      </button>
    )
  }

  const inner = (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="w-full h-full object-cover"
      style={{ filter }}
      onError={() => setFailed(true)}
    />
  )

  if (!onClick) return <div className={className}>{inner}</div>

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={alt}
      className={`block w-full h-full cursor-zoom-in ${className}`}
    >
      {inner}
    </button>
  )
}

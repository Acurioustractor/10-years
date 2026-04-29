/**
 * Full-screen photo viewer. Shared across cluster pages, /history, and
 * /elders/:slug. Keyboard-aware (Esc / arrow keys), body-scroll-locked,
 * caption + license + open-original link.
 *
 * Shape-compatible with both BgSource (cluster-configs) and RibbonImage
 * (palm-history-timeline) — structural typing means callers can pass either.
 */
import { useEffect, useCallback } from 'react'

export type LightboxImage = {
  url: string
  title: string
  year: string
  source: string
  license: string
}

export type LightboxProps = {
  images: LightboxImage[]
  index: number
  onIndexChange?: (next: number) => void
  onClose: () => void
}

export default function Lightbox({ images, index, onIndexChange, onClose }: LightboxProps) {
  const total = images.length
  const current = images[index]
  const canNav = !!onIndexChange && total > 1

  const goPrev = useCallback(() => {
    if (!canNav) return
    onIndexChange!((index - 1 + total) % total)
  }, [canNav, index, total, onIndexChange])

  const goNext = useCallback(() => {
    if (!canNav) return
    onIndexChange!((index + 1) % total)
  }, [canNav, index, total, onIndexChange])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-light w-10 h-10 flex items-center justify-center"
      >
        ×
      </button>

      {/* Prev button */}
      {canNav && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          aria-label="Previous photo"
          className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-5xl font-light w-12 h-12 flex items-center justify-center"
        >
          ‹
        </button>
      )}

      {/* Next button */}
      {canNav && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          aria-label="Next photo"
          className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-5xl font-light w-12 h-12 flex items-center justify-center"
        >
          ›
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-7xl w-full flex-1 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.url}
          alt={current.title}
          className="max-w-full max-h-[78vh] object-contain"
        />
      </div>

      {/* Caption */}
      <div
        className="mt-6 max-w-2xl text-center text-white/85"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-serif italic text-xl leading-snug">{current.title}</div>
        <div className="text-sm opacity-70 mt-2">
          {current.year ? `${current.year} · ` : ''}
          {current.source} · {current.license}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 border-b border-white/30 pb-0.5"
          >
            Open original ↗
          </a>
          {canNav && (
            <span className="text-xs tracking-widest uppercase opacity-50 tabular-nums">
              {index + 1} of {total}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

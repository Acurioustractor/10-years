/**
 * Real Leaflet map for elder trip routes — pulled from the Palm
 * Island Repository's EldersTripMap pattern.
 *
 * CartoDB Voyager tiles (free, warm-toned), numbered ochre markers,
 * solid-line past route + dashed planned route, animated playthrough,
 * story panel with stop description + family connection.
 */
import { useEffect, useMemo, useState, useCallback } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { LIVING_ELDER_PINS } from '@/palm-history-timeline'

const OCHRE = '#B15427'
const INK = '#1A1612'
const CREAM = '#F5EEDF'
const AMBER = '#D4A574'

export type LeafletTripStop = {
  id: string
  name: string
  description: string
  familyConnection?: string
  lat: number
  lng: number
  /** /places slug for cross-link */
  placeSlug?: string
  photos?: string[]
  videoSrc?: string
  videoPoster?: string
  elderSlugs?: string[]
}

export type LeafletTripMapProps = {
  stops: LeafletTripStop[]
  status: 'past' | 'planned'
  className?: string
  caption?: string
  heading?: string
  eyebrow?: string
}

function createStopIcon(index: number, isActive: boolean, isVisited: boolean, isPlanned: boolean) {
  const size = isActive ? 44 : 36
  const bg = isActive ? OCHRE : isVisited ? INK : CREAM
  const border = isActive ? CREAM : isPlanned ? AMBER : OCHRE
  const textColor = isActive ? CREAM : isVisited ? OCHRE : INK
  const shadow = isActive
    ? '0 4px 20px rgba(177,84,39,0.5)'
    : '0 2px 12px rgba(0,0,0,0.15)'
  const scale = isActive ? 'transform: scale(1.0);' : 'transform: scale(0.85);'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        border: 3px solid ${border};
        ${isPlanned && !isActive ? `border-style: dashed;` : ''}
        background: ${bg};
        color: ${textColor};
        box-shadow: ${shadow};
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: ${isActive ? 16 : 14}px;
        font-family: 'Lora', Georgia, serif;
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        ${scale}
        cursor: pointer;
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FlyToStop({ stop }: { stop: LeafletTripStop | null }) {
  const map = useMap()
  useEffect(() => {
    if (!stop || !map) return
    map.flyTo([stop.lat, stop.lng], 9, { duration: 1.2, easeLinearity: 0.25 })
  }, [map, stop])
  return null
}

function FitBounds({ points }: { points: LeafletTripStop[] }) {
  const map = useMap()
  useEffect(() => {
    if (!map || points.length === 0) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds.pad(0.25), { animate: true, duration: 1 })
  }, [map, points])
  return null
}

export default function LeafletTripMap({
  stops,
  status,
  className = '',
  caption,
  heading,
  eyebrow,
}: LeafletTripMapProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const activeStop = stops[activeIndex] || null
  const visitedStops = useMemo(
    () => new Set(stops.slice(0, activeIndex + 1).map((s) => s.id)),
    [stops, activeIndex]
  )

  const polyline = useMemo(
    () => stops.map((s) => [s.lat, s.lng] as [number, number]),
    [stops]
  )
  const activePath = useMemo(
    () => stops.slice(0, activeIndex + 1).map((s) => [s.lat, s.lng] as [number, number]),
    [stops, activeIndex]
  )

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(i + 1, stops.length - 1))
  }, [stops.length])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(i - 1, 0))
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    if (activeIndex >= stops.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(goNext, 3000)
    return () => clearTimeout(timer)
  }, [isPlaying, activeIndex, stops.length, goNext])

  if (stops.length === 0) return null

  return (
    <section className="px-6 py-24" style={{ background: CREAM, color: INK }}>
      <div className="max-w-5xl mx-auto">
        {(eyebrow || heading) && (
          <div className="mb-12 text-center">
            {eyebrow && (
              <div
                className="text-[11px] tracking-[0.3em] uppercase mb-3"
                style={{ color: OCHRE }}
              >
                {eyebrow}
              </div>
            )}
            {heading && (
              <h2
                className="font-serif font-light leading-[1.05]"
                style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
              >
                {heading}
              </h2>
            )}
          </div>
        )}

        <div
          className={`relative overflow-hidden ${className}`}
          style={{ border: `1px solid ${INK}1a` }}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4" style={{ background: '#fff' }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-base font-serif" style={{ color: INK }}>
                  The route · {stops.length} stops
                </h3>
                <p className="text-xs mt-1 font-serif italic" style={{ color: INK + 'b3' }}>
                  {status === 'past' ? 'Tap or play to walk the journey.' : 'Tap any stop to explore the planned route.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false)
                  } else {
                    setActiveIndex(0)
                    setIsPlaying(true)
                  }
                }}
                className="px-4 py-1.5 text-xs tracking-widest uppercase transition-colors"
                style={{
                  background: isPlaying ? '#f4f4f4' : OCHRE,
                  color: isPlaying ? INK : CREAM,
                }}
              >
                {isPlaying ? 'Pause' : 'Play journey'}
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="relative h-[640px] md:h-[720px]">
            <MapContainer
              center={[stops[0]!.lat, stops[0]!.lng]}
              zoom={9}
              scrollWheelZoom={false}
              zoomControl={true}
              className="h-full w-full"
              style={{ background: '#f0ebe3' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
              />
              <FitBounds points={stops} />
              {activeStop && <FlyToStop stop={activeStop} />}

              {stops.length >= 2 && (
                <Polyline
                  positions={polyline}
                  pathOptions={{
                    color: OCHRE,
                    weight: 3,
                    opacity: 0.25,
                    dashArray: status === 'planned' ? '8 12' : '8 12',
                  }}
                />
              )}
              {activePath.length >= 2 && (
                <Polyline
                  positions={activePath}
                  pathOptions={{
                    color: OCHRE,
                    weight: 4,
                    opacity: 0.85,
                    dashArray: status === 'planned' ? '8 8' : undefined,
                  }}
                />
              )}

              {stops.map((s, idx) => (
                <Marker
                  key={s.id}
                  position={[s.lat, s.lng]}
                  icon={createStopIcon(idx, activeIndex === idx, visitedStops.has(s.id), status === 'planned')}
                  eventHandlers={{
                    click: () => {
                      setActiveIndex(idx)
                      setIsPlaying(false)
                    },
                  }}
                />
              ))}
            </MapContainer>

            {/* Story panel */}
            {activeStop && (
              <div className="absolute left-4 bottom-4 right-4 md:right-auto md:max-w-[520px] z-[400]">
                <div
                  className="overflow-hidden"
                  style={{ background: '#fffef7e6', backdropFilter: 'blur(8px)', border: `1px solid ${INK}1a` }}
                >
                  <div className="px-5 py-3" style={{ background: INK, color: CREAM }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-sm"
                          style={{ background: OCHRE, color: CREAM }}
                        >
                          {activeIndex + 1}
                        </div>
                        <div>
                          <div className="font-serif text-base">{activeStop.name}</div>
                          <div className="text-[11px] opacity-70">
                            Stop {activeIndex + 1} of {stops.length}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={goPrev}
                          disabled={activeIndex <= 0}
                          aria-label="Previous"
                          className="px-2 py-1 hover:bg-white/10 disabled:opacity-30 transition-all text-lg"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          disabled={activeIndex >= stops.length - 1}
                          aria-label="Next"
                          className="px-2 py-1 hover:bg-white/10 disabled:opacity-30 transition-all text-lg"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4 max-h-[360px] overflow-y-auto">
                    <p className="font-serif text-sm leading-relaxed">{activeStop.description}</p>
                    {activeStop.familyConnection && (
                      <p
                        className="font-serif italic text-xs leading-relaxed mt-3 pt-3 border-t"
                        style={{ borderColor: INK + '14', color: INK + 'cc' }}
                      >
                        {activeStop.familyConnection}
                      </p>
                    )}

                    {/* Photo strip */}
                    {activeStop.photos && activeStop.photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-1.5">
                        {activeStop.photos.slice(0, 6).map((url, i) => (
                          <div
                            key={`${url}-${i}`}
                            className="aspect-[4/3] overflow-hidden"
                            style={{ background: '#0001' }}
                          >
                            <img
                              src={url}
                              alt=""
                              loading="lazy"
                              className="w-full h-full object-cover"
                              style={{ filter: 'sepia(0.08)' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Video tile */}
                    {activeStop.videoSrc && (
                      <div className="mt-3 relative aspect-video overflow-hidden" style={{ background: INK }}>
                        <video
                          src={activeStop.videoSrc}
                          poster={activeStop.videoPoster}
                          muted
                          playsInline
                          loop
                          className="w-full h-full object-cover"
                          style={{ filter: 'sepia(0.15)' }}
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause()
                            e.currentTarget.currentTime = 0
                          }}
                          onClick={(e) => {
                            const v = e.currentTarget
                            if (v.paused) v.play().catch(() => {}); else v.pause()
                          }}
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] tracking-widest uppercase" style={{ background: OCHRE, color: CREAM }}>
                          Video
                        </div>
                      </div>
                    )}

                    {/* Elder avatars */}
                    {activeStop.elderSlugs && activeStop.elderSlugs.length > 0 && (
                      <div className="mt-4 pt-3 border-t" style={{ borderColor: INK + '14' }}>
                        <div className="text-[9px] tracking-[0.25em] uppercase opacity-50 mb-2">
                          Elders held here
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeStop.elderSlugs.map((slug) => {
                            const pin = LIVING_ELDER_PINS.find((e) => e.storytellerSlug === slug)
                            if (!pin) return null
                            return (
                              <Link
                                key={slug}
                                to={`/elders/${slug}`}
                                className="group flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                                title={pin.displayName}
                              >
                                {pin.avatarUrl ? (
                                  <img
                                    src={pin.avatarUrl}
                                    alt={pin.displayName}
                                    className="w-7 h-7 rounded-full object-cover"
                                    style={{ border: `1px solid ${INK}26` }}
                                  />
                                ) : (
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center font-serif text-[10px]"
                                    style={{ background: OCHRE + '26', color: OCHRE }}
                                  >
                                    {pin.displayName.replace(/^(Uncle|Aunty)\s+/, '').charAt(0)}
                                  </div>
                                )}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {activeStop.placeSlug && (
                      <Link
                        to={`/places/${activeStop.placeSlug}`}
                        className="inline-block mt-4 text-[10px] tracking-widest uppercase underline-offset-4 hover:underline"
                        style={{ color: OCHRE }}
                      >
                        Open the place →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stop strip */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto" style={{ background: '#fafafa', borderTop: `1px solid ${INK}10` }}>
            {stops.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveIndex(idx)
                  setIsPlaying(false)
                }}
                className="flex items-center gap-2 px-3 py-2 whitespace-nowrap text-xs font-serif transition-all"
                style={{
                  background: activeIndex === idx ? INK : idx < activeIndex ? '#f0e6d2' : '#fff',
                  color: activeIndex === idx ? CREAM : INK,
                  border: `1px solid ${activeIndex === idx ? INK : '#e6dcc8'}`,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: activeIndex === idx ? OCHRE : idx < activeIndex ? INK : '#f4ecd9',
                    color: activeIndex === idx ? CREAM : idx < activeIndex ? OCHRE : INK,
                  }}
                >
                  {idx + 1}
                </div>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {caption && (
          <p className="font-serif italic text-sm leading-relaxed opacity-70 mt-6 text-center max-w-2xl mx-auto">
            {caption}
          </p>
        )}
      </div>
    </section>
  )
}

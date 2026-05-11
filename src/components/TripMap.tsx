/**
 * Stylised SVG map of the Far North Queensland coast + Tablelands,
 * with marked locations and a curved route line for a journey.
 *
 * Editorial Warmth palette. Loose hand-traced coastline; positions
 * are relative percentages, not real lat/lon. Each location gets a
 * dot + serif label + optional sub-label (Country / event).
 */
import { useState } from 'react'

export type MapLocation = {
  id: string
  x: number          // 0-100 percentage left
  y: number          // 0-100 percentage top
  label: string
  sublabel?: string  // e.g. "Djiru Country" or "Mamu — Doreen taken from here"
  isOrigin?: boolean // Palm Island — render slightly differently
  isPlanned?: boolean // future trip stop
  href?: string      // optional /places/<slug>
}

export type MapRoute = {
  fromId: string
  toId: string
  /** Optional waypoint x/y for curve control */
  curve?: { x: number; y: number }
  /** 'past' = solid line, 'planned' = dashed */
  status: 'past' | 'planned'
  label?: string
}

export type TripMapProps = {
  locations: MapLocation[]
  routes: MapRoute[]
  cream: string
  ink: string
  ochre: string
  amber: string
  caption?: string
  heading?: string
  eyebrow?: string
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Stylised FNQ coastline path (loose hand-traced). Treat as decorative.
const COAST_PATH =
  'M 80 8 ' +
  'C 75 12, 72 18, 68 22 ' +
  'C 64 26, 60 28, 56 28 ' +
  'C 52 28, 50 30, 50 33 ' +
  'C 50 35, 53 36, 55 38 ' +
  'C 57 42, 58 45, 58 50 ' +
  'C 58 53, 60 55, 64 56 ' +
  'C 68 57, 71 60, 73 64 ' +
  'C 75 68, 76 72, 78 76 ' +
  'C 80 80, 82 84, 85 88 ' +
  'L 100 92 ' +
  'L 100 0 ' +
  'L 80 8 Z'

// Stylised Tablelands region (inland west)
const TABLELANDS_PATH =
  'M 8 18 ' +
  'C 14 18, 22 20, 30 22 ' +
  'C 36 22, 42 24, 46 28 ' +
  'L 46 50 ' +
  'C 42 52, 36 54, 28 54 ' +
  'C 20 54, 12 52, 8 48 ' +
  'L 8 18 Z'

export default function TripMap({
  locations,
  routes,
  cream,
  ink,
  ochre,
  amber,
  caption,
  heading,
  eyebrow,
}: TripMapProps) {
  const [hoverId, setHoverId] = useState<string | null>(null)

  function locById(id: string) {
    return locations.find((l) => l.id === id)
  }

  return (
    <section className="px-6 py-24" style={{ background: cream, color: ink }}>
      <div className="max-w-5xl mx-auto">
        {(eyebrow || heading) && (
          <div className="mb-12 text-center">
            {eyebrow && (
              <div className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: ochre }}>
                {eyebrow}
              </div>
            )}
            {heading && (
              <h2 className="font-serif font-light leading-[1.05]" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
                {heading}
              </h2>
            )}
          </div>
        )}

        <div
          className="relative aspect-[5/3] rounded-sm overflow-hidden"
          style={{ background: hexToRgba(ochre, 0.05), border: `1px solid ${hexToRgba(ink, 0.08)}` }}
        >
          <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
            {/* Coastline (decorative) */}
            <path
              d={COAST_PATH}
              fill={hexToRgba(ochre, 0.08)}
              stroke={hexToRgba(ink, 0.18)}
              strokeWidth="0.15"
            />
            {/* Tablelands region (decorative) */}
            <path
              d={TABLELANDS_PATH}
              fill={hexToRgba(amber, 0.06)}
              stroke={hexToRgba(ink, 0.12)}
              strokeWidth="0.12"
              strokeDasharray="0.5 0.4"
            />

            {/* Routes — drawn behind dots */}
            {routes.map((r, i) => {
              const a = locById(r.fromId)
              const b = locById(r.toId)
              if (!a || !b) return null
              // Compute control point — gentle bow above the midpoint
              const cx = r.curve?.x ?? (a.x + b.x) / 2
              const cy = r.curve?.y ?? (a.y + b.y) / 2 - 4
              const d = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
              return (
                <path
                  key={`r-${i}`}
                  d={d}
                  fill="none"
                  stroke={r.status === 'planned' ? amber : ochre}
                  strokeWidth="0.4"
                  strokeDasharray={r.status === 'planned' ? '1 0.8' : undefined}
                  strokeLinecap="round"
                  opacity={r.status === 'planned' ? 0.7 : 0.85}
                />
              )
            })}

            {/* Location dots + labels */}
            {locations.map((loc) => {
              const radius = loc.isOrigin ? 1.2 : 0.8
              const isHover = hoverId === loc.id
              return (
                <g
                  key={loc.id}
                  onMouseEnter={() => setHoverId(loc.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{ cursor: loc.href ? 'pointer' : 'default' }}
                >
                  {/* Hit area */}
                  <circle cx={loc.x} cy={loc.y} r={2} fill="transparent" />
                  {/* Outer halo for origin */}
                  {loc.isOrigin && (
                    <circle
                      cx={loc.x}
                      cy={loc.y}
                      r={radius + 0.6}
                      fill="none"
                      stroke={ochre}
                      strokeWidth="0.15"
                      opacity={0.6}
                    />
                  )}
                  {/* Dot */}
                  <circle
                    cx={loc.x}
                    cy={loc.y}
                    r={radius}
                    fill={loc.isPlanned ? amber : ochre}
                    stroke={cream}
                    strokeWidth="0.2"
                  />
                  {/* Label */}
                  <text
                    x={loc.x + radius + 0.8}
                    y={loc.y + 0.4}
                    fontFamily="Lora, Georgia, serif"
                    fontSize="1.6"
                    fill={ink}
                    style={{ fontStyle: 'normal', fontWeight: 400 }}
                  >
                    {loc.label}
                  </text>
                  {loc.sublabel && isHover && (
                    <text
                      x={loc.x + radius + 0.8}
                      y={loc.y + 2.4}
                      fontFamily="Lora, Georgia, serif"
                      fontSize="1.1"
                      fill={hexToRgba(ink, 0.6)}
                      style={{ fontStyle: 'italic' }}
                    >
                      {loc.sublabel}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Compass + scale (decorative) */}
            <g transform="translate(94 54)" opacity="0.5">
              <text
                fontFamily="Lora, Georgia, serif"
                fontSize="1.2"
                fill={ink}
                textAnchor="middle"
              >
                N
              </text>
              <line x1="0" y1="-2.5" x2="0" y2="-1" stroke={ink} strokeWidth="0.15" />
            </g>
          </svg>
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

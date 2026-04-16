import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { TimelineEventSummary } from '@/services/types'
import { ERAS, eraForYear, type Era } from './eras'

interface Props {
  events: TimelineEventSummary[]
  onEventClick?: (event: TimelineEventSummary) => void
  onEraClick?: (from: number, to: number) => void
}

export default function CenturyTimeline({ events, onEventClick, onEraClick }: Props) {
  const [expandedEra, setExpandedEra] = useState<string | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  const eventsByEra = useMemo(() => {
    const map = new Map<string, TimelineEventSummary[]>()
    for (const era of ERAS) map.set(era.id, [])

    for (const ev of events) {
      const year = ev.eventYear ?? (ev.eventDate ? new Date(ev.eventDate).getFullYear() : null)
      if (!year) continue
      const era = eraForYear(year)
      if (era) {
        map.get(era.id)!.push(ev)
      }
    }

    for (const [, list] of map) {
      list.sort((a, b) => (a.eventYear ?? 0) - (b.eventYear ?? 0))
    }
    return map
  }, [events])

  const decades = useMemo(() => {
    const all: number[] = []
    for (const era of ERAS) {
      const start = Math.ceil(era.from / 10) * 10
      for (let d = start; d <= era.to; d += 10) all.push(d)
    }
    return [...new Set(all)].sort((a, b) => a - b)
  }, [])

  const thisYear = new Date().getFullYear()

  return (
    <div className="relative pl-4 md:pl-0">
      {/* Vertical spine — thicker with gradient */}
      <div className="absolute left-[22px] md:left-[88px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-desert/50 via-ochre/50 to-eucalypt/50" />

      {/* Decade dots along spine */}
      {decades.map(d => {
        const era = eraForYear(d)
        if (!era) return null
        const eraIdx = ERAS.indexOf(era)
        return (
          <div
            key={d}
            className="absolute left-[19px] md:left-[85px] w-2 h-2 rounded-full bg-cream border border-ink/15 z-[1]"
            style={{ top: `${eraIdx * 200 + ((d - era.from) / (era.to - era.from)) * 160 + 80}px` }}
            title={String(d)}
          />
        )
      })}

      {ERAS.map((era) => {
        const eraEvents = eventsByEra.get(era.id) || []
        const isExpanded = expandedEra === era.id
        const showAll = isExpanded || eraEvents.length <= 5

        return (
          <section key={era.id} className="relative mb-1">
            {/* Era header */}
            <button
              type="button"
              onClick={() => setExpandedEra(isExpanded ? null : era.id)}
              className={`
                sticky top-0 z-10 w-full text-left pl-12 md:pl-28 pr-4 py-3.5 rounded-r-lg
                border-l-4 backdrop-blur-sm transition-all
                ${era.bg} ${era.borderColor} hover:shadow-md
              `}
              style={{ borderLeftColor: era.id === 'colonial' ? '#6b3a1f' : era.id === 'family-empire' ? '#b15427' : era.id === 'stolen-gen' ? '#1a1612' : '#546b4a' }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-medium tabular-nums ${era.color} opacity-70`}>
                    {era.from}–{era.to}
                  </span>
                  <h2 className={`font-serif text-lg md:text-xl ${era.color}`}>{era.label}</h2>
                  <span className="text-xs text-ink/40 tabular-nums">
                    {eraEvents.length} event{eraEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEraClick?.(era.from, era.to)
                    }}
                    className="text-xs text-ink/40 hover:text-ink/70 px-2.5 py-1 rounded-full hover:bg-ink/5 transition-colors border border-ink/10"
                    title={`Zoom into ${era.label}`}
                  >
                    Zoom
                  </button>
                  <span className={`text-xs text-ink/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </div>
              <p className="text-sm text-ink/50 mt-1 max-w-3xl hidden md:block">{era.description}</p>
            </button>

            {/* Events */}
            <div className="ml-8 md:ml-4 pl-4 md:pl-[88px]">
              {eraEvents.length === 0 ? (
                <div className="py-4 text-sm text-ink/25 italic pl-6">
                  No events recorded in this era.
                </div>
              ) : (
                <>
                  {(showAll ? eraEvents : eraEvents.slice(0, 4)).map((ev) => (
                    <EventRow
                      key={ev.id}
                      event={ev}
                      era={era}
                      isFuture={(ev.eventYear ?? 0) > thisYear}
                      isHovered={hoveredEvent === ev.id}
                      onHover={setHoveredEvent}
                      onClick={onEventClick}
                    />
                  ))}
                  {!showAll && (
                    <button
                      type="button"
                      onClick={() => setExpandedEra(era.id)}
                      className="ml-6 my-2 text-sm text-ink/50 hover:text-ink transition-colors flex items-center gap-1.5"
                    >
                      <span className="h-4 w-4 rounded-full bg-ink/5 flex items-center justify-center text-[10px]">+</span>
                      {eraEvents.length - 4} more events
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function EventRow({
  event,
  era,
  isFuture,
  isHovered,
  onHover,
  onClick,
}: {
  event: TimelineEventSummary
  era: Era
  isFuture: boolean
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick?: (event: TimelineEventSummary) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const kindIndicator =
    event.kind === 'milestone' ? (
      <span className="h-3 w-3 rounded-full bg-ochre ring-2 ring-ochre/20 shrink-0" />
    ) : event.kind === 'aspiration' ? (
      <span className="h-3 w-3 rounded-full border-2 border-dashed border-eucalypt bg-transparent shrink-0" />
    ) : (
      <span className="h-2.5 w-2.5 rounded-full bg-desert/60 shrink-0" />
    )

  return (
    <div
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        group relative w-full text-left flex items-start gap-3 py-2.5 px-4 md:px-6
        rounded-lg transition-all duration-200 cursor-pointer
        ${isHovered ? 'bg-sand/60 shadow-sm -translate-x-0.5' : 'hover:bg-ink/[0.02]'}
        ${isFuture ? 'opacity-80' : ''}
      `}
    >
      {/* Year + dot */}
      <div className="flex items-center gap-2.5 shrink-0 w-[70px] md:w-[80px] pt-0.5">
        <span className={`text-xs tabular-nums font-medium ${era.color} opacity-60`}>
          {event.dateIsApproximate ? '~' : ''}{event.eventYear ?? ''}
        </span>
        {kindIndicator}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1" onClick={() => {
        if (event.description) {
          setExpanded(!expanded)
        } else {
          onClick?.(event)
        }
      }}>
        <h3 className="font-serif text-[15px] text-ink leading-snug group-hover:text-ochre transition-colors">
          {event.title}
        </h3>
        {event.description && (
          <p className={`text-sm text-ink/50 mt-0.5 ${expanded ? '' : 'line-clamp-2'}`}>
            {event.description}
          </p>
        )}

        {/* People pills */}
        {event.people.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {event.people.slice(0, 4).map((p) => (
              <Link
                key={`${p.id}-${event.id}`}
                to={`/person/${p.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-sand/60 text-desert hover:bg-sand transition-colors"
              >
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full bg-sand text-[7px] flex items-center justify-center font-medium">
                    {p.displayName.slice(0, 1)}
                  </span>
                )}
                {p.displayName.split(' ')[0]}
              </Link>
            ))}
            {event.people.length > 4 && (
              <span className="text-xs text-ink/40 self-center">+{event.people.length - 4}</span>
            )}
          </div>
        )}

        {/* Domain tags */}
        {event.domain.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {event.domain.map((d) => (
              <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-ink/40">
                {d}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expand indicator for events with descriptions */}
      {event.description && (
        <span className={`text-[10px] text-ink/25 mt-1 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      )}
    </div>
  )
}

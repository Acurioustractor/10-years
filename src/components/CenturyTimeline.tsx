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

  const thisYear = new Date().getFullYear()

  return (
    <div className="relative">
      {/* Vertical spine */}
      <div className="absolute left-[88px] top-0 bottom-0 w-px bg-gradient-to-b from-desert/40 via-ochre/40 to-eucalypt/40" />

      {ERAS.map((era) => {
        const eraEvents = eventsByEra.get(era.id) || []
        const isExpanded = expandedEra === era.id
        const showAll = isExpanded || eraEvents.length <= 6

        return (
          <section key={era.id} className="relative mb-2">
            {/* Era header */}
            <button
              type="button"
              onClick={() => {
                setExpandedEra(isExpanded ? null : era.id)
              }}
              className={`
                sticky top-0 z-10 w-full text-left px-4 py-3 rounded-lg
                border backdrop-blur-sm transition-colors
                ${era.bg} ${era.borderColor} hover:shadow-sm
              `}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium tabular-nums ${era.color} opacity-70`}>
                    {era.from}–{era.to}
                  </span>
                  <h2 className={`font-serif text-lg ${era.color}`}>{era.label}</h2>
                  <span className="text-xs text-ink/40">
                    {eraEvents.length} event{eraEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEraClick?.(era.from, era.to)
                  }}
                  className="text-xs text-ink/40 hover:text-ink/70 px-2 py-1 rounded hover:bg-ink/5 transition-colors"
                  title={`Zoom into ${era.label}`}
                >
                  Zoom
                </button>
              </div>
              <p className="text-sm text-ink/50 mt-1 max-w-3xl">{era.description}</p>
            </button>

            {/* Events */}
            <div className="ml-4 pl-[72px] border-l border-transparent">
              {eraEvents.length === 0 ? (
                <div className="py-6 text-sm text-ink/30 italic pl-6">
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
                      onClick={onEventClick}
                    />
                  ))}
                  {!showAll && (
                    <button
                      type="button"
                      onClick={() => setExpandedEra(era.id)}
                      className="ml-6 my-3 text-sm text-ink/50 hover:text-ink transition-colors"
                    >
                      + {eraEvents.length - 4} more events
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
  onClick,
}: {
  event: TimelineEventSummary
  era: Era
  isFuture: boolean
  onClick?: (event: TimelineEventSummary) => void
}) {
  const kindIndicator =
    event.kind === 'milestone' ? (
      <span className="h-3 w-3 rounded-full bg-ochre ring-2 ring-ochre/30 shrink-0" />
    ) : event.kind === 'aspiration' ? (
      <span className="h-3 w-3 rounded-full border-2 border-dashed border-eucalypt bg-transparent shrink-0" />
    ) : (
      <span className="h-3 w-3 rounded-full bg-desert/70 shrink-0" />
    )

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={`
        group w-full text-left flex items-start gap-4 py-3 px-6
        hover:bg-ink/[0.03] rounded-lg transition-colors
        ${isFuture ? 'opacity-80' : ''}
      `}
    >
      {/* Year + dot */}
      <div className="flex items-center gap-3 shrink-0 w-[80px] pt-0.5">
        <span className={`text-xs tabular-nums font-medium ${era.color} opacity-60`}>
          {event.dateIsApproximate ? '~' : ''}{event.eventYear ?? ''}
        </span>
        {kindIndicator}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-base text-ink leading-snug group-hover:text-ochre transition-colors">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-sm text-ink/50 mt-0.5 line-clamp-2">{event.description}</p>
        )}

        {/* People pills */}
        {event.people.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {event.people.slice(0, 4).map((p) => (
              <Link
                key={`${p.id}-${event.id}`}
                to={`/person/${p.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-sand/60 text-desert hover:bg-sand transition-colors"
              >
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-sand text-[8px] flex items-center justify-center font-medium">
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
          <div className="flex flex-wrap gap-1 mt-1.5">
            {event.domain.map((d) => (
              <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-ink/40">
                {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

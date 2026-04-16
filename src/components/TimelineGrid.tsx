import { useMemo } from 'react'
import type { Storyteller, TimelineEventSummary } from '@/services/types'
import EventDot from './EventDot'

interface Props {
  people: Storyteller[]
  events: TimelineEventSummary[]
  yearFrom: number
  yearTo: number
  onEventClick?: (event: TimelineEventSummary) => void
  onPersonClick?: (person: Storyteller) => void
}

/**
 * Horizontal timeline. Years across the top, one lane per person,
 * events plotted as dots at their year column.
 *
 * A person's lane shows ALL events where they are a subject/participant,
 * including events that also belong to other people — shared events are
 * rendered on both lanes.
 */
export default function TimelineGrid({
  people,
  events,
  yearFrom,
  yearTo,
  onEventClick,
  onPersonClick,
}: Props) {
  const years = useMemo(() => {
    const out: number[] = []
    for (let y = yearFrom; y <= yearTo; y++) out.push(y)
    return out
  }, [yearFrom, yearTo])

  // Bucket events by (personId, year).
  const bucket = useMemo(() => {
    const map = new Map<string, TimelineEventSummary[]>()
    for (const ev of events) {
      const year = ev.eventYear ?? (ev.eventDate ? new Date(ev.eventDate).getFullYear() : null)
      if (!year || year < yearFrom || year > yearTo) continue
      for (const p of ev.people) {
        const key = `${p.id}::${year}`
        const list = map.get(key) || []
        list.push(ev)
        map.set(key, list)
      }
    }
    return map
  }, [events, yearFrom, yearTo])

  // Only show people with at least one event in range, plus elders
  // (elders always visible — they anchor the family).
  const visiblePeople = useMemo(() => {
    const withEvents = new Set<string>()
    for (const ev of events) for (const p of ev.people) withEvents.add(p.id)
    return people
      .filter(p => p.isElder || withEvents.has(p.id))
      .sort((a, b) => {
        // Elders first, then alphabetically.
        if (a.isElder && !b.isElder) return -1
        if (!a.isElder && b.isElder) return 1
        return a.displayName.localeCompare(b.displayName)
      })
  }, [people, events])

  const thisYear = new Date().getFullYear()

  if (visiblePeople.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-2xl text-ink mb-2">The timeline is empty.</p>
        <p className="text-ink/60">
          Once kinship and events are seeded, people and their dreams appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="grid gap-y-1"
        style={{
          gridTemplateColumns: `minmax(180px, 220px) repeat(${years.length}, minmax(56px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="sticky left-0 z-10 bg-cream" />
        {years.map(y => (
          <div
            key={y}
            className={[
              'text-center text-xs font-medium pb-2 border-b',
              y === thisYear
                ? 'text-ochre border-ochre'
                : y < thisYear
                ? 'text-ink/40 border-ink/10'
                : 'text-eucalypt border-ink/10',
            ].join(' ')}
          >
            {y}
          </div>
        ))}

        {/* People rows */}
        {visiblePeople.map(person => (
          <PersonRow
            key={person.id}
            person={person}
            years={years}
            bucket={bucket}
            thisYear={thisYear}
            onEventClick={onEventClick}
            onPersonClick={onPersonClick}
          />
        ))}
      </div>
    </div>
  )
}

function PersonRow({
  person,
  years,
  bucket,
  thisYear,
  onEventClick,
  onPersonClick,
}: {
  person: Storyteller
  years: number[]
  bucket: Map<string, TimelineEventSummary[]>
  thisYear: number
  onEventClick?: (event: TimelineEventSummary) => void
  onPersonClick?: (person: Storyteller) => void
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onPersonClick?.(person)}
        className="sticky left-0 z-10 bg-cream pr-3 py-3 flex items-center gap-3 text-left hover:bg-sand/30 rounded transition-colors"
      >
        {person.avatarUrl ? (
          <img
            src={person.avatarUrl}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-1 ring-ink/10"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-sand flex items-center justify-center text-xs font-medium text-desert">
            {person.displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium text-ink truncate">{person.displayName}</div>
          {person.isElder && (
            <div className="text-[10px] uppercase tracking-wider text-ochre">Elder</div>
          )}
        </div>
      </button>

      {years.map(y => {
        const cellEvents = bucket.get(`${person.id}::${y}`) || []
        return (
          <div
            key={y}
            className={[
              'relative border-l border-dashed min-h-[56px]',
              y === thisYear ? 'border-ochre/40 bg-ochre/5' : 'border-ink/5',
            ].join(' ')}
          >
            {cellEvents.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center gap-1 flex-wrap p-1">
                {cellEvents.map(ev => (
                  <EventDot key={ev.id} event={ev} onClick={onEventClick} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

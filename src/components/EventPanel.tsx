import type { TimelineEventSummary } from '@/services/types'

interface Props {
  event: TimelineEventSummary | null
  onClose: () => void
}

export default function EventPanel({ event, onClose }: Props) {
  if (!event) return null

  const kindLabel =
    event.kind === 'past' ? 'happened' :
    event.kind === 'milestone' ? 'made it happen' :
    'dreaming'

  return (
    <aside className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-cream border-l border-ink/10 shadow-xl flex flex-col z-20">
      <div className="flex items-start justify-between p-6 border-b border-ink/10">
        <div>
          <div className="text-xs uppercase tracking-widest text-ochre mb-1">{kindLabel}</div>
          <h2 className="font-serif text-2xl text-ink leading-tight">{event.title}</h2>
          {event.eventYear && (
            <div className="mt-2 text-sm text-ink/60">
              {event.dateIsApproximate ? '~ ' : ''}
              {event.eventDate
                ? new Date(event.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                : event.eventYear}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-ink/40 hover:text-ink p-1"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {event.description && (
          <p className="text-ink/80 leading-relaxed">{event.description}</p>
        )}

        {event.domain.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.domain.map(d => (
              <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-sand text-desert">
                {d}
              </span>
            ))}
          </div>
        )}

        {event.people.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">People</div>
            <div className="space-y-2">
              {event.people.map(p => (
                <div key={`${p.id}-${p.role}`} className="flex items-center gap-3">
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-sand" />
                  )}
                  <div className="text-sm">
                    <div className="text-ink">{p.displayName}</div>
                    <div className="text-xs text-ink/50 capitalize">{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {event.subGoalCount > 0 && (
          <div className="text-sm text-ink/60">
            {event.subGoalCount} step{event.subGoalCount > 1 ? 's' : ''} toward this dream.
          </div>
        )}
      </div>
    </aside>
  )
}

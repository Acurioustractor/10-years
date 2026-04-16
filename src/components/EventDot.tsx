import type { TimelineEventSummary } from '@/services/types'

interface Props {
  event: TimelineEventSummary
  onClick?: (event: TimelineEventSummary) => void
}

export default function EventDot({ event, onClick }: Props) {
  const { kind, status, domain, title, eventYear, subGoalCount } = event

  const base =
    'h-4 w-4 rounded-full flex items-center justify-center ring-2 transition-transform hover:scale-125 focus:scale-125 focus:outline-none'

  const style =
    kind === 'milestone'
      ? 'bg-ochre ring-ochre shadow-sm'
      : kind === 'past'
      ? 'bg-desert ring-desert'
      : // aspiration
        status === 'paused'
        ? 'bg-transparent ring-ink/30 border-2 border-dashed border-ink/30'
        : 'bg-transparent ring-eucalypt border-2 border-dashed border-eucalypt'

  const tooltip = [
    title,
    eventYear ? `· ${eventYear}` : null,
    domain.length ? `· ${domain.join(', ')}` : null,
    subGoalCount ? `· ${subGoalCount} step${subGoalCount > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      title={tooltip}
      aria-label={tooltip}
      className={`${base} ${style}`}
    />
  )
}

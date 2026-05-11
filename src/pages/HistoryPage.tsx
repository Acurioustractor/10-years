/**
 * /history — public front-door scroll for the Palm Island timeline ribbon.
 *
 * Renders TimelineRibbon. Lives outside the Family/Community shells; a
 * standalone full-bleed page with its own background. Linked from the landing
 * page CTA and from cluster pages ("see this in the timeline").
 */
import TimelineRibbon from '@/components/TimelineRibbon'

export default function HistoryPage() {
  return <TimelineRibbon />
}

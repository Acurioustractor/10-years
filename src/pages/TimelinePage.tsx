import { useState } from 'react'
import { useTimelineData } from '@/hooks/useTimelineData'
import TimelineGrid from '@/components/TimelineGrid'
import CenturyTimeline from '@/components/CenturyTimeline'
import ChaptersOverlay from '@/components/ChaptersOverlay'
import EventPanel from '@/components/EventPanel'
import type { TimelineEventSummary } from '@/services/types'

type RangePreset = 'century' | 'recent' | 'future'
type ViewMode = 'timeline' | 'story'

const RANGE_PRESETS: Record<RangePreset, { label: string; from: number; to: number }> = {
  century: { label: 'Century', from: 1615, to: new Date().getFullYear() + 10 },
  recent:  { label: 'Recent',  from: new Date().getFullYear() - 10, to: new Date().getFullYear() + 10 },
  future:  { label: 'Future',  from: new Date().getFullYear(), to: new Date().getFullYear() + 10 },
}

export default function TimelinePage() {
  const [preset, setPreset] = useState<RangePreset>('century')
  const [yearFrom, setYearFrom] = useState(RANGE_PRESETS.century.from)
  const [yearTo, setYearTo] = useState(RANGE_PRESETS.century.to)
  const [selected, setSelected] = useState<TimelineEventSummary | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')

  const applyPreset = (p: RangePreset) => {
    setPreset(p)
    setYearFrom(RANGE_PRESETS[p].from)
    setYearTo(RANGE_PRESETS[p].to)
    setViewMode('timeline')
  }

  const handleEraZoom = (from: number, to: number) => {
    setPreset('century')
    setYearFrom(from)
    setYearTo(to)
    setViewMode('timeline')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { people, events, loading, error, notConfigured } = useTimelineData(yearFrom, yearTo)

  const isFullCentury = preset === 'century' && yearFrom <= 1700 && yearTo >= new Date().getFullYear() + 5
  const isZoomedEra = preset === 'century' && !isFullCentury && (yearTo - yearFrom) < 100

  if (viewMode === 'story') {
    return (
      <ChaptersOverlay
        events={events}
        onChapterChange={(_from, _to) => {
          // chapters auto-advance — no zoom in story mode
        }}
        onExit={() => {
          setViewMode('timeline')
          applyPreset('century')
        }}
      />
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">The next ten years</h1>
          <p className="text-ink/60 mt-1 max-w-2xl">
            What has happened, what is being dreamed, and the people carrying each story forward.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setViewMode('story')}
            className="px-3 py-1 rounded-full text-xs font-medium text-ochre border border-ochre/30 hover:bg-ochre/10 transition-colors"
          >
            Read the story
          </button>
          <div className="flex items-center gap-1 rounded-full bg-sand/40 p-1">
            {(Object.keys(RANGE_PRESETS) as RangePreset[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => applyPreset(p)}
                className={[
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  preset === p && !isZoomedEra
                    ? 'bg-cream text-ink shadow-sm'
                    : 'text-ink/60 hover:text-ink',
                ].join(' ')}
              >
                {RANGE_PRESETS[p].label}
              </button>
            ))}
          </div>
          {isZoomedEra && (
            <button
              type="button"
              onClick={() => applyPreset('century')}
              className="text-xs text-ink/50 hover:text-ink transition-colors"
            >
              Back to full timeline
            </button>
          )}
        </div>
      </div>

      <Legend />

      {notConfigured && <ConfigNotice />}
      {error && !notConfigured && <ErrorNotice error={error} />}
      {loading && !notConfigured && <div className="py-10 text-center text-ink/50">Loading…</div>}
      {!loading && !notConfigured && !error && (
        isFullCentury ? (
          <CenturyTimeline
            events={events}
            onEventClick={setSelected}
            onEraClick={handleEraZoom}
          />
        ) : (
          <TimelineGrid
            people={people}
            events={events}
            yearFrom={yearFrom}
            yearTo={yearTo}
            onEventClick={setSelected}
          />
        )
      )}

      <EventPanel event={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-6 text-xs text-ink/60 mb-4">
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full bg-desert" />
        happened
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full bg-ochre" />
        milestone
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full border-2 border-dashed border-eucalypt bg-transparent" />
        dreaming
      </div>
    </div>
  )
}

function ConfigNotice() {
  return (
    <div className="rounded-lg border border-ochre/30 bg-ochre/5 p-6">
      <div className="font-serif text-lg text-ink mb-1">Not configured yet</div>
      <p className="text-ink/70 text-sm">
        Copy <code className="bg-cream px-1.5 py-0.5 rounded">.env.example</code> to{' '}
        <code className="bg-cream px-1.5 py-0.5 rounded">.env.local</code> and add the Empathy Ledger API key.
        The app reads people and events from the ledger with the Oonchiumpa org scope.
      </p>
    </div>
  )
}

function ErrorNotice({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-900">
      <div className="font-medium">Could not load timeline.</div>
      <div className="mt-1 opacity-75">{error.message}</div>
    </div>
  )
}

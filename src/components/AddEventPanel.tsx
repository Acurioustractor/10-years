import { useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { createTimelineEvent } from '@/services/empathyLedgerClient'

interface Props {
  onClose: () => void
  onAdded: () => void
}

export default function AddEventPanel({ onClose, onAdded }: Props) {
  const { familySession } = useSession()
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<'past' | 'aspiration' | 'milestone'>('past')
  const [year, setYear] = useState('')
  const [description, setDescription] = useState('')
  const [goalScope, setGoalScope] = useState('individual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!familySession) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !year) return
    setLoading(true)
    setError(null)

    try {
      await createTimelineEvent(familySession.folder.id, {
        title: title.trim(),
        kind,
        eventYear: parseInt(year),
        description: description.trim() || undefined,
        goalScope,
      })
      onAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-cream border border-ink/10 rounded-xl shadow-lg w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-ink">Add an event</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-lg">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">What happened (or is dreamed)</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Baden wins the Alice Springs Cup"
              className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Type</label>
              <select
                value={kind}
                onChange={e => setKind(e.target.value as typeof kind)}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-ochre/30"
              >
                <option value="past">Happened</option>
                <option value="aspiration">Dream / goal</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Year</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="e.g. 1935"
                min={1600}
                max={2040}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Tell the story..."
              className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Scope</label>
            <div className="flex gap-2">
              {(['individual', 'family', 'community'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setGoalScope(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    goalScope === s
                      ? 'bg-ochre/15 text-ochre border border-ochre/30'
                      : 'bg-sand/40 text-ink/60 border border-transparent hover:bg-sand/60'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-ink/15 text-sm text-ink/60 hover:bg-sand/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !year}
              className="flex-1 py-2.5 rounded-lg bg-ochre text-cream text-sm font-medium hover:bg-ochre/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Add event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

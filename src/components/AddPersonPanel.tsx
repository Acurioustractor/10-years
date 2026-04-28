import { useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { addFamilyAccessMember } from '@/services/empathyLedgerClient'

interface Props {
  onClose: () => void
  onAdded: () => void
}

export default function AddPersonPanel({ onClose, onAdded }: Props) {
  const { familySession } = useSession()
  const [name, setName] = useState('')
  const [role, setRole] = useState('contributor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!familySession) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    try {
      await addFamilyAccessMember(familySession.folder.id, {
        displayName: name.trim(),
        role,
      })
      onAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant access')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-cream border border-ink/10 rounded-xl shadow-lg w-full max-w-md mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-ink">Grant family-folder access</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-lg">&times;</button>
        </div>

        <p className="text-sm text-ink/60 mb-4 leading-relaxed">
          This adds someone to the folder access list so they can sign in or help manage the family space.
          People appear in the family tree once kinship is recorded, not just because they have folder access.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name used for folder access"
              className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30"
              autoFocus
            />
          </div>

          <div className="rounded-lg border border-ink/8 bg-sand/25 px-3 py-3 text-sm text-ink/65">
            Use this for family access and governance only. Historical ancestors and lineage-only people should be connected through kinship, not added as folder-access members.
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Access role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-ochre/30"
            >
              <option value="contributor">Contributor (can add stories)</option>
              <option value="viewer">Viewer (read only)</option>
            </select>
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
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 rounded-lg bg-ochre text-cream text-sm font-medium hover:bg-ochre/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Granting...' : 'Grant access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

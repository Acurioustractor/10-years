import { useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { addFamilyMember } from '@/services/empathyLedgerClient'

interface Props {
  onClose: () => void
  onAdded: () => void
}

export default function AddPersonPanel({ onClose, onAdded }: Props) {
  const { familySession } = useSession()
  const [name, setName] = useState('')
  const [role, setRole] = useState('contributor')
  const [isAncestor, setIsAncestor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!familySession) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    try {
      await addFamilyMember(familySession.folder.id, {
        displayName: name.trim(),
        role: isAncestor ? 'viewer' : role,
        isAncestor,
      })
      onAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person')
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
          <h2 className="font-serif text-xl text-ink">Add a person</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-lg">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="As the family knows them"
              className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAncestor}
                onChange={e => setIsAncestor(e.target.checked)}
                className="rounded border-ink/30"
              />
              <span className="text-sm text-ink/70">This is an ancestor (historical figure)</span>
            </label>
          </div>

          {!isAncestor && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-ochre/30"
              >
                <option value="contributor">Contributor (can add stories)</option>
                <option value="viewer">Viewer (read only)</option>
                <option value="family_rep">Family rep (can manage tree)</option>
                <option value="elder">Elder (full governance)</option>
              </select>
            </div>
          )}

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
              {loading ? 'Adding...' : 'Add person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

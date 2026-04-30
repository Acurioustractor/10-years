import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'
import { createFamilyFolder } from '@/services/empathyLedgerClient'

type Tab = 'login' | 'create'

export default function JoinPage() {
  const [tab, setTab] = useState<Tab>('login')

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-serif text-2xl text-ink text-center mb-2">Join your family</h1>
      <p className="text-sm text-ink/60 text-center mb-8">
        Enter your family code to see your family's story, or create a new folder.
      </p>

      <div className="border border-ink/10 rounded-xl bg-cream p-6 md:p-8">
        <div className="flex gap-1 rounded-full bg-sand/40 p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === 'login' ? 'bg-cream text-ink shadow-sm' : 'text-ink/60'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === 'create' ? 'bg-cream text-ink shadow-sm' : 'text-ink/60'
            }`}
          >
            Create folder
          </button>
        </div>

        {tab === 'login' ? <LoginForm /> : <CreateForm />}
      </div>

      <div className="mt-6 text-center text-xs text-ink/40 max-w-sm mx-auto leading-relaxed">
        Family Folder is powered by the Empathy Ledger. Your family's data belongs to your family.
      </div>
    </div>
  )
}

function LoginForm() {
  const { login } = useSession()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !name.trim()) return
    setLoading(true)
    setError(null)

    const result = await login(code.trim(), name.trim())
    setLoading(false)

    if (result.success) {
      const stored = localStorage.getItem('10years_family_session')
      const slug = stored
        ? (JSON.parse(stored) as { folder?: { slug?: string } }).folder?.slug
        : null
      navigate(`/f/${slug || code.trim().toUpperCase()}`)
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Family code</label>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="e.g. BLOOM-2024"
          className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
        />
        <p className="text-[11px] text-ink/40 mt-1">Your family elder or admin will give you this code</p>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Your name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="As your family knows you"
          className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
        />
      </div>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !code.trim() || !name.trim()}
        className="w-full py-2.5 rounded-lg bg-ochre text-cream font-medium text-sm hover:bg-ochre/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Enter family folder'}
      </button>
      <p className="text-xs text-ink/40 text-center">
        No email or password needed.
      </p>
    </form>
  )
}

function CreateForm() {
  const navigate = useNavigate()
  const [familyName, setFamilyName] = useState('')
  const [location, setLocation] = useState('')
  const [adminName, setAdminName] = useState('')
  const [result, setResult] = useState<{ accessCode: string; slug: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await createFamilyFolder({
        name: familyName.trim(),
        location: location.trim() || undefined,
        adminDisplayName: adminName.trim() || undefined,
      })
      setResult({ accessCode: res.accessCode, slug: res.slug })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
    }
    setLoading(false)
  }

  if (result) {
    return (
      <div className="space-y-4 text-center">
        <div className="h-12 w-12 mx-auto rounded-full bg-eucalypt/10 flex items-center justify-center">
          <span className="text-eucalypt text-lg">✓</span>
        </div>
        <h3 className="font-serif text-lg text-ink">Family folder created</h3>
        <div className="bg-sand/50 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink/50 mb-1">Your family code</div>
          <div className="font-mono text-2xl text-ochre font-bold tracking-wider">{result.accessCode}</div>
        </div>
        <p className="text-xs text-ink/60">
          Share this code with family members so they can join. Save it somewhere safe — it won't be shown again.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/f/${result.slug}`)}
          className="w-full py-2.5 rounded-lg bg-ochre text-cream font-medium text-sm hover:bg-ochre/90 transition-colors"
        >
          Enter your family folder
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Family name</label>
        <input
          type="text"
          value={familyName}
          onChange={e => setFamilyName(e.target.value)}
          placeholder="e.g. Bloomfield family"
          className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Location / Country</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Alice Springs, Arrernte Country"
          className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-ink/50 mb-1.5">Your name (admin)</label>
        <input
          type="text"
          value={adminName}
          onChange={e => setAdminName(e.target.value)}
          placeholder="You'll be the first elder"
          className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
        />
      </div>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !familyName.trim()}
        className="w-full py-2.5 rounded-lg bg-eucalypt text-cream font-medium text-sm hover:bg-eucalypt/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create family folder'}
      </button>
    </form>
  )
}

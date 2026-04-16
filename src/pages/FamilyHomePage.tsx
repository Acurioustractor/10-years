import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'
import { getFamilyFolder } from '@/services/empathyLedgerClient'

interface FolderDetail {
  folder: { id: string; name: string; slug: string; location: string | null }
  members: Array<{
    storytellerId: string
    displayName: string
    avatarUrl: string | null
    isElder: boolean
    isAncestor: boolean
    role: string
  }>
  stats: { memberCount: number; eventCount: number; kinshipEdgeCount: number }
}

export default function FamilyHomePage() {
  const { familySession } = useSession()
  const [detail, setDetail] = useState<FolderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!familySession) { setLoading(false); return }
    getFamilyFolder(familySession.folder.id)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [familySession])

  const folderName = familySession?.folder.name || 'Family folder'
  const memberName = familySession?.member.displayName || ''
  const role = familySession?.member.role || 'viewer'
  const location = familySession?.folder.location || ''

  const elders = detail?.members.filter(m => m.isElder || m.role === 'elder') || []
  const living = detail?.members.filter(m => !m.isAncestor) || []
  const ancestors = detail?.members.filter(m => m.isAncestor) || []

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      {/* Welcome */}
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">{folderName}</h1>
        {location && <p className="text-sm text-ink/50 mt-1">{location}</p>}
        <p className="text-ink/60 mt-2">
          Welcome{memberName ? `, ${memberName}` : ''}. You're signed in as <span className="text-ochre font-medium">{role}</span>.
        </p>
      </header>

      {/* Stats */}
      {detail && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="People" value={detail.stats.memberCount} />
          <StatCard label="Living" value={living.length} />
          <StatCard label="Ancestors" value={ancestors.length} />
          <StatCard label="Events" value={detail.stats.eventCount} />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <QuickLink to="tree" label="Family tree" description="See how everyone connects" color="desert" />
        <QuickLink to="timeline" label="Timeline" description="Century of family history" color="ochre" />
        <QuickLink to="story" label="Read the story" description="Scrollytelling chapters" color="eucalypt" />
        <QuickLink to="goals" label="Goals & dreams" description="What the family is working toward" color="eucalypt" />
      </div>

      {/* Elders */}
      {elders.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-ink/50 mb-3 pb-2 border-b border-ink/5">Elders</h2>
          <div className="flex flex-wrap gap-3">
            {elders.map(e => (
              <Link
                key={e.storytellerId}
                to={`person/${e.storytellerId}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-ochre/20 bg-ochre/5 hover:bg-ochre/10 transition-colors"
              >
                {e.avatarUrl ? (
                  <img src={e.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-sand flex items-center justify-center text-xs font-medium text-desert">
                    {e.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-ink">{e.displayName}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ochre">Elder</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Access code reminder for elders */}
      {(role === 'elder' || role === 'family_rep') && (
        <div className="bg-sand/30 border border-ink/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-ink mb-1">Share with family</h3>
          <p className="text-xs text-ink/60 mb-3">
            Family members can join by entering the family code on the Join page.
            They'll need the code and their name as the family knows them.
          </p>
          <Link to="/join" className="text-xs text-ochre hover:underline">
            Go to Join page
          </Link>
        </div>
      )}

      {loading && <div className="py-10 text-center text-ink/50">Loading family data...</div>}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-ink/8 bg-cream text-center">
      <div className="text-2xl font-serif text-ink tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-ink/50 mt-1">{label}</div>
    </div>
  )
}

function QuickLink({ to, label, description, color }: { to: string; label: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    desert: 'border-desert/20 hover:bg-desert/5',
    ochre: 'border-ochre/20 hover:bg-ochre/5',
    eucalypt: 'border-eucalypt/20 hover:bg-eucalypt/5',
  }
  return (
    <Link to={to} className={`block p-5 rounded-xl border ${colorMap[color]} transition-colors`}>
      <h3 className="font-serif text-lg text-ink">{label}</h3>
      <p className="text-xs text-ink/60 mt-1">{description}</p>
    </Link>
  )
}

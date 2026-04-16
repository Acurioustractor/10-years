import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCommunities, isConfigured } from '@/services/empathyLedgerClient'

interface CommunityInfo {
  id: string
  name: string
  traditionalName: string | null
  slug: string
  location: string | null
  region: string | null
  familyCount: number
  memberCount: number
}

export default function ExplorePage() {
  const [communities, setCommunities] = useState<CommunityInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    getCommunities()
      .then(res => setCommunities(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
      {/* Hero */}
      <header className="text-center mb-12">
        <h1 className="font-serif text-3xl md:text-4xl text-ink">Explore communities</h1>
        <p className="text-ink/60 mt-3 max-w-2xl mx-auto leading-relaxed">
          Indigenous Australian families and communities building their own living histories.
          Each community is a collection of families sharing their stories, tracking their
          lineage, and dreaming about the decade ahead.
        </p>
      </header>

      {/* Communities grid */}
      {loading ? (
        <div className="py-10 text-center text-ink/50">Loading communities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map(c => (
            <Link
              key={c.id}
              to={`/c/${c.slug}`}
              className={`border rounded-xl p-6 transition-all ${
                c.familyCount > 0
                  ? 'border-eucalypt/30 bg-eucalypt/[0.03] hover:bg-eucalypt/[0.06] hover:shadow-sm'
                  : 'border-ink/10 bg-cream hover:bg-sand/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-serif text-xl text-ink">{c.name}</h2>
                  {c.traditionalName && (
                    <h3 className="font-serif text-base text-ink/40 mt-0.5">{c.traditionalName}</h3>
                  )}
                </div>
                {c.familyCount > 0 ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-eucalypt mt-2" />
                ) : (
                  <span className="text-[10px] text-ink/30 px-2 py-0.5 rounded-full bg-ink/5 mt-1">
                    Awaiting families
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-ink/60 mb-3">
                {c.location && <span>{c.location}</span>}
                {c.region && (
                  <>
                    <span className="text-ink/20">·</span>
                    <span>{c.region}</span>
                  </>
                )}
              </div>

              {c.familyCount > 0 ? (
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="font-serif text-lg text-ink tabular-nums">{c.familyCount}</span>
                    <span className="text-ink/50 ml-1.5">{c.familyCount === 1 ? 'family' : 'families'}</span>
                  </div>
                  <div>
                    <span className="font-serif text-lg text-ink tabular-nums">{c.memberCount}</span>
                    <span className="text-ink/50 ml-1.5">people</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink/40">
                  This community is ready for families to join and start building their story.
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Vision */}
      <div className="mt-16 bg-desert/5 border border-desert/15 rounded-xl p-6 md:p-8 text-center">
        <h2 className="font-serif text-2xl text-ink mb-3">A truth-telling system for all of Australia</h2>
        <p className="text-ink/60 max-w-2xl mx-auto leading-relaxed">
          As more families and communities join, this becomes a connected map of Indigenous
          Australian history — built and controlled by the people who lived it.
          Every family owns their data. Every community sets their own protocols.
          The stories here are told on terms set by those who carry them.
        </p>
        <Link
          to="/join"
          className="inline-block mt-6 px-6 py-3 rounded-full bg-ochre text-cream font-medium text-sm hover:bg-ochre/90 transition-colors"
        >
          Start your family's story
        </Link>
      </div>
    </div>
  )
}

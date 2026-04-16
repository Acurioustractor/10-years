import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCommunities, getCommunity } from '@/services/empathyLedgerClient'

interface FamilyInfo {
  id: string
  name: string
  slug: string
  memberCount: number
}

export default function CommunityFamiliesPage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const [families, setFamilies] = useState<FamilyInfo[]>([])
  const [communityName, setCommunityName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now, use getCommunities to find the community by slug,
    // then getCommunity by ID for family list
    getCommunities()
        .then(res => {
          const match = res.data.find(c => c.slug === communitySlug)
          if (match) {
            setCommunityName(match.name)
            return getCommunity(match.id)
          }
          return null
        })
        .then(detail => {
          if (detail) setFamilies(detail.families)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
  }, [communitySlug])

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink/50">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Families in {communityName}</h1>
        <p className="text-ink/60 mt-1">
          Each family manages their own folder. Together they form the {communityName} community story.
        </p>
      </header>

      {families.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-xl text-ink mb-2">No families yet</p>
          <p className="text-ink/60 mb-6">Be the first to create a family folder and join this community.</p>
          <Link
            to="/join"
            className="inline-block px-6 py-3 rounded-full bg-ochre text-cream font-medium text-sm hover:bg-ochre/90 transition-colors"
          >
            Create a family folder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {families.map(fam => (
            <div
              key={fam.id}
              className="border border-ink/10 rounded-xl p-6 bg-cream hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ochre mb-1">Family</div>
                  <h2 className="font-serif text-xl text-ink">{fam.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-lg font-serif text-ink tabular-nums">{fam.memberCount}</div>
                  <div className="text-[10px] text-ink/40">people</div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Link
                  to={`/f/${fam.slug}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-ochre/10 text-ochre hover:bg-ochre/15 transition-colors"
                >
                  View family folder
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 p-6 bg-sand/30 rounded-xl border border-ink/5 text-center">
        <p className="text-sm text-ink/60">
          Want to add your family to {communityName}?
        </p>
        <Link
          to="/join"
          className="text-sm text-ochre mt-2 inline-block hover:underline"
        >
          Create a family folder and link it here
        </Link>
      </div>
    </div>
  )
}

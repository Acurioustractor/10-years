import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCommunities } from '@/services/empathyLedgerClient'

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

export default function CommunityHomePage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const [community, setCommunity] = useState<CommunityInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCommunities()
      .then(res => {
        const match = res.data.find(c => c.slug === communitySlug)
        if (match) setCommunity(match)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [communitySlug])

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink/50">Loading...</div>
  }

  if (!community) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink mb-2">Community not found</h1>
        <p className="text-ink/60">No community with slug "{communitySlug}" exists yet.</p>
        <Link to="/explore" className="text-sm text-ochre mt-4 inline-block">Browse communities</Link>
      </div>
    )
  }

  const base = `/c/${communitySlug}`

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      {/* Hero */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-3 w-3 rounded-full bg-eucalypt" />
          <span className="text-xs uppercase tracking-widest text-eucalypt font-medium">Community</span>
        </div>
        <h1 className="font-serif text-4xl text-ink leading-tight">{community.name}</h1>
        {community.traditionalName && (
          <h2 className="font-serif text-2xl text-ink/50 mt-1">{community.traditionalName}</h2>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-ink/60">
          {community.location && <span>{community.location}</span>}
          {community.region && <span className="text-ink/30">·</span>}
          {community.region && <span>{community.region}</span>}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Families" value={community.familyCount} />
        <StatCard label="People" value={community.memberCount} />
        <StatCard label="Communities" value="1" />
        <StatCard label="Status" value="Active" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link
          to={`${base}/families`}
          className="p-6 rounded-xl border border-eucalypt/20 hover:bg-eucalypt/5 transition-colors"
        >
          <h3 className="font-serif text-lg text-ink mb-1">Families</h3>
          <p className="text-xs text-ink/60">
            {community.familyCount} {community.familyCount === 1 ? 'family' : 'families'} building their story in this community
          </p>
        </Link>
        <Link
          to={`${base}/timeline`}
          className="p-6 rounded-xl border border-ochre/20 hover:bg-ochre/5 transition-colors"
        >
          <h3 className="font-serif text-lg text-ink mb-1">Community timeline</h3>
          <p className="text-xs text-ink/60">Shared history across all families in {community.name}</p>
        </Link>
        <Link
          to={`${base}/goals`}
          className="p-6 rounded-xl border border-desert/20 hover:bg-desert/5 transition-colors"
        >
          <h3 className="font-serif text-lg text-ink mb-1">Community goals</h3>
          <p className="text-xs text-ink/60">What the community is dreaming and working toward together</p>
        </Link>
      </div>

      {/* About */}
      <div className="bg-eucalypt/5 border border-eucalypt/15 rounded-xl p-6 md:p-8">
        <h3 className="font-serif text-xl text-ink mb-3">About this community</h3>
        <p className="text-ink/70 leading-relaxed">
          {community.name} is a community of Indigenous Australian families building a shared
          living history. Each family manages their own folder — their tree, their stories,
          their dreams. The community view brings it all together, showing how families
          connect across generations and country.
        </p>
        {community.familyCount === 0 && (
          <div className="mt-4 p-4 bg-sand/40 rounded-lg">
            <p className="text-sm text-ink/60">
              No families have joined this community yet. If your family is from {community.name},
              create a family folder and link it to this community.
            </p>
            <Link to="/join" className="text-sm text-ochre mt-2 inline-block">Create a family folder</Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 rounded-xl border border-ink/8 bg-cream text-center">
      <div className="text-2xl font-serif text-ink tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-ink/50 mt-1">{label}</div>
    </div>
  )
}

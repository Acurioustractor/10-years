import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getCommunities,
  getCommunityResearchSource,
} from '@/services/empathyLedgerClient'
import type { CommunityResearchSourceDetailResponse } from '@/services/types'

function stageLabel(stage: CommunityResearchSourceDetailResponse['source']['stage']) {
  switch (stage) {
    case 'start_here':
      return 'Start here'
    case 'history':
      return 'Historical frame'
    case 'governance':
      return 'Governance context'
    case 'family-history':
      return 'Family history pathway'
    default:
      return stage
  }
}

export default function CommunityResearchSourcePage() {
  const { communitySlug, sourceId } = useParams<{ communitySlug: string; sourceId: string }>()
  const [data, setData] = useState<CommunityResearchSourceDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const communities = await getCommunities()
        const match = communities.data.find(item => item.slug === communitySlug)

        if (!match || !sourceId) {
          if (!cancelled) setData(null)
          return
        }

        const detail = await getCommunityResearchSource(match.id, sourceId)
        if (!cancelled) setData(detail)
      } catch {
        if (!cancelled) setData(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [communitySlug, sourceId])

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink/50">Loading source...</div>
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink mb-2">Research source not found</h1>
        <p className="text-ink/60">This Palm source is not available yet.</p>
        <Link to={`/c/${communitySlug}/research`} className="text-sm text-ochre mt-4 inline-block">
          Back to Palm research
        </Link>
      </div>
    )
  }

  const base = `/c/${data.community.slug}/research`
  const source = data.source

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs uppercase tracking-widest text-eucalypt">
        <span>Palm Source Reader</span>
        <span className="text-ink/20">·</span>
        <span>{stageLabel(source.stage)}</span>
      </div>

      <header className="mb-8">
        <h1 className="font-serif text-4xl text-ink leading-tight">{source.title}</h1>
        <p className="text-sm text-ink/55 mt-3">
          {source.authority}
          {source.sourcePath ? ` · ${source.sourcePath}` : ''}
        </p>
        <p className="text-base text-ink/65 leading-relaxed mt-4 max-w-3xl">{source.summary}</p>
      </header>

      <section className="rounded-2xl border border-ochre/20 bg-ochre/5 px-5 py-4 mb-8">
        <div className="text-xs uppercase tracking-widest text-ochre">Why this source matters</div>
        <p className="text-sm text-ink/70 mt-2 leading-relaxed">{source.whyItMatters}</p>
        <p className="text-xs text-ink/45 mt-3">{data.note}</p>
      </section>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link to={base} className="inline-flex items-center rounded-full bg-ochre px-5 py-2.5 text-sm text-white">
          Back to Palm research
        </Link>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-ink/10 px-5 py-2.5 text-sm text-ink/65"
          >
            Open public source
          </a>
        )}
      </div>

      {source.content ? (
        <article className="rounded-[28px] border border-ink/10 bg-cream/80 p-5 md:p-6">
          <div className="text-xs uppercase tracking-widest text-eucalypt mb-4">In-app reader</div>
          <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-7 text-ink/78">
            {source.content}
          </pre>
        </article>
      ) : (
        <section className="rounded-[28px] border border-ink/10 bg-cream/80 p-6">
          <h2 className="font-serif text-2xl text-ink">External source</h2>
          <p className="text-sm text-ink/60 leading-relaxed mt-3">
            This source stays outside the app. Open the public source in a new tab, then come back to Palm research to connect any grounded names or family leads.
          </p>
        </section>
      )}
    </div>
  )
}

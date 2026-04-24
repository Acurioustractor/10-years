import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  buildLedgerPalmReviewUrl,
  buildLedgerStorytellerEditUrl,
  buildLedgerStorytellerTranscriptsUrl,
  buildLedgerTranscriptAdminUrl,
  getCommunities,
  getCommunityResearchPerson,
} from '@/services/empathyLedgerClient'
import type { CommunityResearchPersonDetailResponse } from '@/services/types'

function stageLabel(stage: CommunityResearchPersonDetailResponse['person']['sourceMentions'][number]['stage']) {
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

function confidenceLabel(confidence: CommunityResearchPersonDetailResponse['person']['confidence']) {
  switch (confidence) {
    case 'grounded':
      return 'Grounded lead'
    case 'emerging':
      return 'Emerging lead'
    case 'name_only':
      return 'Name-only lead'
    default:
      return confidence
  }
}

function confidenceClass(confidence: CommunityResearchPersonDetailResponse['person']['confidence']) {
  switch (confidence) {
    case 'grounded':
      return 'bg-eucalypt text-white'
    case 'emerging':
      return 'bg-ochre text-white'
    case 'name_only':
      return 'border border-ink/10 bg-white/80 text-ink/55'
    default:
      return 'border border-ink/10 bg-white/80 text-ink/55'
  }
}

function leadKindLabel(kind: CommunityResearchPersonDetailResponse['person']['leadKinds'][number]) {
  switch (kind) {
    case 'anchor_elder':
      return 'Anchor elder'
    case 'storyteller_match':
      return 'Storyteller match'
    case 'named_relation':
      return 'Named relation'
    case 'public_source_name_lead':
      return 'Public source name lead'
    default:
      return kind
  }
}

function ActionLink({
  href,
  label,
  tone = 'neutral',
}: {
  href: string | null
  label: string
  tone?: 'neutral' | 'primary'
}) {
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        tone === 'primary'
          ? 'inline-flex items-center rounded-full bg-eucalypt px-4 py-2 text-xs font-medium text-white'
          : 'inline-flex items-center rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-xs text-ink/65'
      }
    >
      {label}
    </a>
  )
}

export default function CommunityResearchPersonPage() {
  const { communitySlug, personKey } = useParams<{ communitySlug: string; personKey: string }>()
  const [data, setData] = useState<CommunityResearchPersonDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const communities = await getCommunities()
        const match = communities.data.find(item => item.slug === communitySlug)

        if (!match || !personKey) {
          if (!cancelled) setData(null)
          return
        }

        const detail = await getCommunityResearchPerson(match.id, personKey)
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
  }, [communitySlug, personKey])

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink/50">Loading person research...</div>
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink mb-2">Research person not found</h1>
        <p className="text-ink/60">This Palm person lead is not available yet.</p>
        <Link to={`/c/${communitySlug}/research`} className="text-sm text-ochre mt-4 inline-block">
          Back to Palm research
        </Link>
      </div>
    )
  }

  const base = `/c/${data.community.slug}/research`
  const person = data.person

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs uppercase tracking-widest text-eucalypt">
        <span>Palm Person Research</span>
        <span className="text-ink/20">·</span>
        <span>{confidenceLabel(person.confidence)}</span>
      </div>

      <header className="mb-8">
        <h1 className="font-serif text-4xl text-ink leading-tight">{person.name}</h1>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`rounded-full px-3 py-1 text-xs ${confidenceClass(person.confidence)}`}>
            {confidenceLabel(person.confidence)}
          </span>
          {person.leadKinds.map(kind => (
            <span key={kind} className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
              {leadKindLabel(kind)}
            </span>
          ))}
          {person.isElder && (
            <span className="rounded-full border border-eucalypt/20 bg-eucalypt/10 px-3 py-1 text-xs text-eucalypt">
              Elder anchor
            </span>
          )}
        </div>
        <p className="text-base text-ink/65 leading-relaxed mt-4 max-w-4xl">
          This page brings the Palm history/source base, family packets, and transcript traces together for one name.
          Treat it as a research sheet, not approved family truth.
        </p>
      </header>

      <section className="rounded-2xl border border-ochre/20 bg-ochre/5 px-5 py-4 mb-8">
        <div className="text-xs uppercase tracking-widest text-ochre">Research note</div>
        <p className="text-sm text-ink/70 mt-2 leading-relaxed">{data.note}</p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-ink/10 bg-cream/80 px-4 py-5 text-center">
          <div className="font-serif text-3xl text-ink leading-none">{person.families.length}</div>
          <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink/45">Family packets</div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-cream/80 px-4 py-5 text-center">
          <div className="font-serif text-3xl text-ink leading-none">{person.sourceMentions.length}</div>
          <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink/45">Source mentions</div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-cream/80 px-4 py-5 text-center">
          <div className="font-serif text-3xl text-ink leading-none">{person.transcriptMentions.length}</div>
          <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink/45">Transcript traces</div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-cream/80 px-4 py-5 text-center">
          <div className="font-serif text-3xl text-ink leading-none">{person.storyCount ?? '—'}</div>
          <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink/45">Stories</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link to={base} className="inline-flex items-center rounded-full bg-ochre px-5 py-2.5 text-sm text-white">
          Back to Palm research
        </Link>
        <ActionLink href={person.storytellerId ? buildLedgerStorytellerEditUrl(person.storytellerId) : null} label="Open storyteller" />
        <ActionLink href={person.storytellerId ? buildLedgerStorytellerTranscriptsUrl(person.storytellerId) : null} label="Open storyteller transcripts" />
        <ActionLink
          href={buildLedgerPalmReviewUrl({
            view: 'demo_prep',
            kinship_search: person.name,
          })}
          label="Open Palm review with this name"
          tone="primary"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <section className="xl:col-span-2 rounded-[28px] border border-ink/10 bg-cream/80 p-5 md:p-6">
          <div className="text-xs uppercase tracking-widest text-eucalypt">Source-first reading path</div>
          <p className="text-sm text-ink/60 leading-relaxed mt-2">
            Start here. These mentions come from the wider Palm history and public source base before the transcript layer.
          </p>

          {person.sourceMentions.length === 0 ? (
            <p className="text-sm text-ink/50 mt-4">No source-base mentions surfaced for this person yet.</p>
          ) : (
            <div className="space-y-4 mt-5">
              {person.sourceMentions.map(source => (
                <div key={`${person.personKey}-${source.sourceId}`} className="rounded-2xl border border-ink/8 bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">{stageLabel(source.stage)}</div>
                      <h2 className="font-serif text-2xl text-ink mt-2">{source.title}</h2>
                      <p className="text-xs text-ink/45 mt-2">{source.authority}</p>
                    </div>
                    {source.readInApp ? (
                      <Link
                        to={`${base}/sources/${source.sourceId}`}
                        className="inline-flex items-center rounded-full bg-eucalypt px-4 py-2 text-xs font-medium text-white"
                      >
                        Read source
                      </Link>
                    ) : (
                      <ActionLink href={source.url || null} label="Open public source" tone="primary" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {source.matchedTerms.slice(0, 5).map(term => (
                      <span key={`${person.personKey}-${source.sourceId}-${term}`} className="rounded-full bg-sand/70 px-3 py-1 text-xs text-ink/65">
                        {term}
                      </span>
                    ))}
                  </div>
                  {source.excerpt && (
                    <p className="text-sm text-ink/68 leading-relaxed mt-3">{source.excerpt}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-ink/10 bg-cream/80 p-5 md:p-6">
          <div className="text-xs uppercase tracking-widest text-ochre">Where this person shows up</div>
          <div className="space-y-3 mt-4">
            {person.families.map(family => (
              <div key={family.id} className="rounded-2xl border border-ink/8 bg-white/70 p-4">
                <div className="font-medium text-ink">{family.label}</div>
                <div className="text-xs text-ink/45 mt-1">Evidence score {family.evidenceScore}</div>
              </div>
            ))}
          </div>

          {(person.relationLabels.length > 0 || person.sourcePackets.length > 0) && (
            <div className="mt-6 pt-5 border-t border-ink/8">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Current lead shape</div>
              <div className="flex flex-wrap gap-2 mt-3">
                {person.relationLabels.map(label => (
                  <span key={`${person.personKey}-${label}`} className="rounded-full bg-sand/70 px-3 py-1 text-xs text-ink/65">
                    {label}
                  </span>
                ))}
                {person.sourcePackets.map(packet => (
                  <span key={`${person.personKey}-${packet}`} className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
                    {packet}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-[28px] border border-ink/10 bg-cream/80 p-5 md:p-6">
        <div className="text-xs uppercase tracking-widest text-eucalypt">Transcript traces underneath</div>
        <p className="text-sm text-ink/60 leading-relaxed mt-2">
          These transcript mentions sit under the source-first layer. Use them to test and deepen a person lead, not as the only basis for family truth.
        </p>

        {person.transcriptMentions.length === 0 ? (
          <p className="text-sm text-ink/50 mt-4">No transcript traces surfaced for this person yet.</p>
        ) : (
          <div className="space-y-4 mt-5">
            {person.transcriptMentions.map((mention, index) => (
              <div key={`${person.personKey}-${index}`} className="rounded-2xl border border-ink/8 bg-white/70 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-serif text-2xl text-ink">{mention.title}</h2>
                    {mention.storytellerName && (
                      <p className="text-xs text-ink/45 mt-2">{mention.storytellerName}</p>
                    )}
                  </div>
                  <ActionLink
                    href={mention.transcriptId ? buildLedgerTranscriptAdminUrl(mention.transcriptId) : null}
                    label={mention.transcriptId ? 'Open transcript' : 'Storyteller bio'}
                  />
                </div>
                <p className="text-sm text-ink/68 leading-relaxed mt-3">{mention.excerpt}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

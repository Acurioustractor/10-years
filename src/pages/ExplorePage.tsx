import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import { getCommunities, getCommunity, isConfigured } from '@/services/empathyLedgerClient'

interface CommunityInfo {
  id: string
  name: string
  traditionalName: string | null
  slug: string
  location: string | null
  region: string | null
  familyCount: number
  memberCount: number
  adminCount: number
  totalPeople: number
}

type CommunityStage = 'shared' | 'governance' | 'open'
type CommunityStageFilter = CommunityStage | 'all'

export default function ExplorePage() {
  const [communities, setCommunities] = useState<CommunityInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<CommunityStageFilter>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCommunities() {
      if (!isConfigured) {
        setLoading(false)
        return
      }

      try {
        const res = await getCommunities()
        const hydrated = await Promise.all(
          res.data.map(async (community) => {
            if (
              typeof community.totalPeople === 'number'
              && typeof community.adminCount === 'number'
            ) {
              return community
            }

            try {
              const detail = await getCommunity(community.id)
              return {
                ...community,
                familyCount: detail.stats.familyCount,
                adminCount: detail.stats.adminCount,
                totalPeople: detail.stats.totalPeople,
              }
            } catch {
              return {
                ...community,
                adminCount: typeof community.adminCount === 'number' ? community.adminCount : 0,
                totalPeople: typeof community.totalPeople === 'number' ? community.totalPeople : 0,
              }
            }
          })
        )

        if (!cancelled) setCommunities(hydrated)
      } catch {
        if (!cancelled) setCommunities([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCommunities()

    return () => {
      cancelled = true
    }
  }, [])

  const communitiesByStage = useMemo(() => (
    communities.reduce<Record<CommunityStage, number>>(
      (acc, community) => {
        acc[getCommunityStage(community)] += 1
        return acc
      },
      { shared: 0, governance: 0, open: 0 }
    )
  ), [communities])

  const orderedCommunities = useMemo(() => (
    [...communities].sort((a, b) => {
      const stageOrder = { shared: 0, governance: 1, open: 2 }
      const stageDiff = stageOrder[getCommunityStage(a)] - stageOrder[getCommunityStage(b)]
      if (stageDiff !== 0) return stageDiff
      return a.name.localeCompare(b.name)
    })
  ), [communities])

  const normalizedQuery = query.trim().toLowerCase()

  const filteredCommunities = useMemo(() => (
    orderedCommunities.filter(community => {
      const stage = getCommunityStage(community)
      const matchesStage = selectedStage === 'all' || selectedStage === stage
      if (!matchesStage) return false

      if (!normalizedQuery) return true

      const haystack = [
        community.name,
        community.traditionalName,
        community.location,
        community.region,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  ), [normalizedQuery, orderedCommunities, selectedStage])

  const regionGroups = useMemo(() => {
    const groups = new Map<string, {
      region: string
      communities: CommunityInfo[]
      linkedFamilies: number
      linkedPeople: number
      sharedCount: number
      governanceCount: number
      openCount: number
    }>()

    for (const community of filteredCommunities) {
      const region = community.region || community.location || 'Region not set'
      const existing = groups.get(region) || {
        region,
        communities: [],
        linkedFamilies: 0,
        linkedPeople: 0,
        sharedCount: 0,
        governanceCount: 0,
        openCount: 0,
      }

      existing.communities.push(community)
      existing.linkedFamilies += community.familyCount
      existing.linkedPeople += community.totalPeople

      const stage = getCommunityStage(community)
      if (stage === 'shared') existing.sharedCount += 1
      if (stage === 'governance') existing.governanceCount += 1
      if (stage === 'open') existing.openCount += 1

      groups.set(region, existing)
    }

    return [...groups.values()].sort((a, b) => a.region.localeCompare(b.region))
  }, [filteredCommunities])

  const hasActiveFilters = selectedStage !== 'all' || normalizedQuery.length > 0

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

      <div className="mb-10">
        <CrossAppGuideCard
          title="Build the source of truth in Empathy Ledger. Use 10 Years as the community map."
          description="Empathy Ledger is where transcript-backed stories, storyteller records, photos, and review evidence are edited. 10 Years is where families and communities read, approve, and navigate the living lineage map."
          editingItems={[
            'Storyteller profiles, transcripts, stories, photos, and Palm evidence review happen in Empathy Ledger.',
            'Identity cleanup and family-anchor decisions happen in Empathy Ledger before they become tree structure.',
          ]}
          engagementItems={[
            'Family trees, community trees, timelines, goals, and governance queues live in 10 Years.',
            'Families and communities use 10 Years to approve what becomes visible as family or community truth.',
          ]}
        />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StageSummaryCard
          tone="eucalypt"
          count={communitiesByStage.shared}
          title="Shared layer active"
          description="Families are linked and the community layer has started to fill with shared people and kinship."
        />
        <StageSummaryCard
          tone="ochre"
          count={communitiesByStage.governance}
          title="Governance ready"
          description="Community elders or admins are in place, but shared family links are not active yet."
        />
        <StageSummaryCard
          tone="ink"
          count={communitiesByStage.open}
          title="Open for first family"
          description="A community shell exists and is ready for families to start building into it."
        />
      </section>

      <section className="rounded-2xl border border-ink/10 bg-cream/80 p-4 md:p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
          <div className="flex-1">
            <label htmlFor="community-search" className="text-xs uppercase tracking-widest text-ink/45">
              Search place or region
            </label>
            <input
              id="community-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by community name, traditional name, or region"
              className="w-full mt-2 px-4 py-2.5 rounded-lg border border-ink/15 bg-cream text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ochre/30 focus:border-ochre/40"
            />
          </div>

          <div className="lg:max-w-[28rem]">
            <div className="text-xs uppercase tracking-widest text-ink/45 mb-2">Stage</div>
            <div className="flex flex-wrap gap-2">
              <StageFilterChip
                active={selectedStage === 'all'}
                label={`All (${communities.length})`}
                onClick={() => setSelectedStage('all')}
              />
              <StageFilterChip
                active={selectedStage === 'shared'}
                label={`Shared (${communitiesByStage.shared})`}
                onClick={() => setSelectedStage('shared')}
                tone="eucalypt"
              />
              <StageFilterChip
                active={selectedStage === 'governance'}
                label={`Governance (${communitiesByStage.governance})`}
                onClick={() => setSelectedStage('governance')}
                tone="ochre"
              />
              <StageFilterChip
                active={selectedStage === 'open'}
                label={`Open (${communitiesByStage.open})`}
                onClick={() => setSelectedStage('open')}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 pt-4 border-t border-ink/8">
          <p className="text-sm text-ink/55">
            Showing {filteredCommunities.length} of {communities.length} {communities.length === 1 ? 'community' : 'communities'}
            {' '}across {regionGroups.length} {regionGroups.length === 1 ? 'region' : 'regions'}.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSelectedStage('all')
                setQuery('')
              }}
              className="self-start md:self-auto text-sm px-3 py-1.5 rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Communities grid */}
      {loading ? (
        <div className="py-10 text-center text-ink/50">Loading communities...</div>
      ) : filteredCommunities.length === 0 ? (
        <div className="rounded-2xl border border-ink/10 bg-cream/80 px-6 py-10 text-center">
          <div className="text-xs uppercase tracking-widest text-ink/35">No matches</div>
          <h2 className="font-serif text-2xl text-ink mt-3">No communities match that filter yet</h2>
          <p className="text-sm text-ink/55 max-w-xl mx-auto mt-3 leading-relaxed">
            Try a different place name or switch back to another stage. As more families and communities come online,
            this index will start to fill out across regions.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {regionGroups.map(group => (
            <section key={group.region} className="space-y-4">
              <div className="rounded-2xl border border-ink/10 bg-cream/70 px-5 py-4">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-ink/40">Region</div>
                    <h2 className="font-serif text-2xl text-ink mt-1">{group.region}</h2>
                    <p className="text-sm text-ink/55 mt-2">
                      {group.communities.length} {group.communities.length === 1 ? 'community' : 'communities'} · {' '}
                      {group.linkedFamilies} {group.linkedFamilies === 1 ? 'linked family' : 'linked families'} · {' '}
                      {group.linkedPeople} linked lineage people
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.sharedCount > 0 && (
                      <RegionStagePill tone="eucalypt">{group.sharedCount} shared</RegionStagePill>
                    )}
                    {group.governanceCount > 0 && (
                      <RegionStagePill tone="ochre">{group.governanceCount} governance</RegionStagePill>
                    )}
                    {group.openCount > 0 && (
                      <RegionStagePill tone="ink">{group.openCount} open</RegionStagePill>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.communities.map(c => {
                  const hasLinkedFamilies = c.familyCount > 0
                  const hasGovernance = c.adminCount > 0
                  const stage = getCommunityStage(c)
                  const stageMeta = getStageMeta(stage)
                  const stageActions = getStageActions(c, stage)

                  return (
                    <article
                      key={c.id}
                      className={`border rounded-xl p-6 transition-all ${
                        stageMeta.cardClass
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <div>
                          <Link to={`/c/${c.slug}`} className="font-serif text-xl text-ink hover:text-ochre transition-colors">
                            {c.name}
                          </Link>
                          {c.traditionalName && (
                            <h3 className="font-serif text-base text-ink/40 mt-0.5">{c.traditionalName}</h3>
                          )}
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full mt-1 uppercase tracking-widest ${stageMeta.badgeClass}`}>
                          {stageMeta.badgeLabel}
                        </span>
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

                      <p className="text-sm text-ink/62 leading-relaxed mb-4">
                        {stageMeta.description}
                      </p>

                      {hasLinkedFamilies ? (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <MetricTile
                              value={c.familyCount}
                              label={c.familyCount === 1 ? 'linked family' : 'linked families'}
                            />
                            <MetricTile
                              value={c.totalPeople}
                              label="linked lineage people"
                            />
                          </div>
                          {hasGovernance && (
                            <div className="mt-3">
                              <MetricTile
                                value={c.adminCount}
                                label={c.adminCount === 1 ? 'community steward' : 'community stewards'}
                                compact
                              />
                            </div>
                          )}
                        </>
                      ) : hasGovernance ? (
                        <div className="grid grid-cols-1 gap-3">
                          <MetricTile
                            value={c.adminCount}
                            label={c.adminCount === 1 ? 'community steward' : 'community stewards'}
                          />
                          <div className="rounded-lg border border-ochre/15 bg-ochre/[0.05] px-3 py-2 text-xs text-ink/55">
                            The governance layer is ready. The shared tree will appear here once families and elders approve active links.
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-ink/10 bg-cream/80 px-3 py-3 text-sm text-ink/52">
                          This community is waiting for its first family to begin the shared story.
                        </div>
                      )}

                      <div className="mt-5 border-t border-ink/8 pt-4">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <span className="text-xs uppercase tracking-widest text-ink/35">{stageMeta.footerLabel}</span>
                          <span className="text-[11px] text-ink/45">{stageActions.footerHint}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StageActionLink
                            to={stageActions.primaryTo}
                            label={stageActions.primaryLabel}
                            tone={stageActions.primaryTone}
                          />
                          <StageActionLink
                            to={stageActions.secondaryTo}
                            label={stageActions.secondaryLabel}
                            tone="subtle"
                          />
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
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

function getCommunityStage(community: CommunityInfo): CommunityStage {
  if (community.familyCount > 0) return 'shared'
  if (community.adminCount > 0) return 'governance'
  return 'open'
}

function getStageMeta(stage: CommunityStage) {
  switch (stage) {
    case 'shared':
      return {
        badgeLabel: 'Shared layer active',
        badgeClass: 'bg-eucalypt/12 text-eucalypt',
        cardClass: 'border-eucalypt/30 bg-eucalypt/[0.03] hover:bg-eucalypt/[0.06] hover:shadow-sm',
        description: 'Families are already linked into the community layer and shared kinship can begin to appear.',
        footerLabel: 'Shared community',
      }
    case 'governance':
      return {
        badgeLabel: 'Governance ready',
        badgeClass: 'bg-ochre/12 text-ochre',
        cardClass: 'border-ochre/20 bg-ochre/[0.03] hover:bg-ochre/[0.06] hover:shadow-sm',
        description: 'Community stewards are holding the governance layer, but no family links are active in the shared layer yet.',
        footerLabel: 'Governance layer',
      }
    default:
      return {
        badgeLabel: 'Open for families',
        badgeClass: 'bg-ink/6 text-ink/45',
        cardClass: 'border-ink/10 bg-cream hover:bg-sand/20',
        description: 'This place exists in the map, but the shared community layer has not started yet.',
        footerLabel: 'Setup stage',
      }
  }
}

function getStageActions(community: CommunityInfo, stage: CommunityStage) {
  if (stage === 'shared') {
    return {
      primaryTo: `/c/${community.slug}/tree`,
      primaryLabel: 'View shared tree',
      primaryTone: 'eucalypt' as const,
      secondaryTo: `/c/${community.slug}/families`,
      secondaryLabel: 'See linked families',
      footerHint: 'Shared story is visible',
    }
  }

  if (stage === 'governance') {
    return {
      primaryTo: `/c/${community.slug}`,
      primaryLabel: 'Open overview',
      primaryTone: 'ochre' as const,
      secondaryTo: `/c/${community.slug}/families`,
      secondaryLabel: 'See family link state',
      footerHint: 'Waiting on family linking',
    }
  }

  return {
    primaryTo: '/join',
    primaryLabel: 'Start first family',
    primaryTone: 'ink' as const,
    secondaryTo: `/c/${community.slug}`,
    secondaryLabel: 'Open community',
    footerHint: 'Ready for setup',
  }
}

function StageSummaryCard({
  tone,
  count,
  title,
  description,
}: {
  tone: 'eucalypt' | 'ochre' | 'ink'
  count: number
  title: string
  description: string
}) {
  const toneClass = {
    eucalypt: 'border-eucalypt/20 bg-eucalypt/[0.04] text-eucalypt',
    ochre: 'border-ochre/20 bg-ochre/[0.04] text-ochre',
    ink: 'border-ink/10 bg-cream text-ink/60',
  }[tone]

  return (
    <div className={`rounded-xl border px-5 py-4 ${toneClass}`}>
      <div className="text-xs uppercase tracking-widest">Communities</div>
      <div className="font-serif text-3xl mt-2">{count}</div>
      <div className="font-medium text-sm mt-3 text-ink">{title}</div>
      <p className="text-xs text-ink/55 mt-2 leading-relaxed">{description}</p>
    </div>
  )
}

function MetricTile({
  value,
  label,
  compact = false,
}: {
  value: number
  label: string
  compact?: boolean
}) {
  return (
    <div className={`rounded-lg border border-ink/8 bg-cream/75 px-3 ${compact ? 'py-2.5' : 'py-3'}`}>
      <div className={`font-serif text-ink tabular-nums ${compact ? 'text-xl' : 'text-2xl'}`}>{value}</div>
      <div className="text-xs text-ink/50 mt-1">{label}</div>
    </div>
  )
}

function RegionStagePill({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'eucalypt' | 'ochre' | 'ink'
}) {
  const tones = {
    eucalypt: 'bg-eucalypt/10 text-eucalypt',
    ochre: 'bg-ochre/10 text-ochre',
    ink: 'bg-ink/6 text-ink/55',
  }

  return (
    <span className={`rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  )
}

function StageFilterChip({
  active,
  label,
  onClick,
  tone = 'ink',
}: {
  active: boolean
  label: string
  onClick: () => void
  tone?: 'eucalypt' | 'ochre' | 'ink'
}) {
  const inactiveTone = {
    eucalypt: 'border-eucalypt/20 text-eucalypt hover:bg-eucalypt/[0.06]',
    ochre: 'border-ochre/20 text-ochre hover:bg-ochre/[0.06]',
    ink: 'border-ink/10 text-ink/60 hover:bg-ink/[0.04]',
  }[tone]

  const activeTone = {
    eucalypt: 'border-eucalypt/25 bg-eucalypt text-cream',
    ochre: 'border-ochre/25 bg-ochre text-cream',
    ink: 'border-ink/20 bg-ink text-cream',
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${active ? activeTone : inactiveTone}`}
    >
      {label}
    </button>
  )
}

function StageActionLink({
  to,
  label,
  tone,
}: {
  to: string
  label: string
  tone: 'eucalypt' | 'ochre' | 'ink' | 'subtle'
}) {
  const tones = {
    eucalypt: 'border-eucalypt/25 bg-eucalypt text-cream hover:bg-eucalypt/90',
    ochre: 'border-ochre/25 bg-ochre text-cream hover:bg-ochre/90',
    ink: 'border-ink/20 bg-ink text-cream hover:bg-ink/90',
    subtle: 'border-ink/10 bg-cream/80 text-ink/65 hover:bg-sand/25',
  }

  return (
    <Link
      to={to}
      className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${tones[tone]}`}
    >
      {label}
    </Link>
  )
}

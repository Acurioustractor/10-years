import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import {
  LEDGER_BASE_URL,
  getCommunities,
  getCommunity,
  getCommunityKinship,
  getFamilyFolder,
  getFamilyFolderKinship,
  getFamilyFolderTimeline,
  getTimelineEvents,
} from '@/services/empathyLedgerClient'
import { normalizeKinshipCategory } from '@/services/kinship'
import type {
  CulturalSensitivity,
  CommunityKinshipGraph,
  CommunityKinshipEdge,
  CommunityPersonRef,
  KinshipGraph,
  KinshipCategory,
  PersonRef,
  TimelineEventSummary,
  Visibility,
} from '@/services/types'

interface CommunityDetail {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  families: Array<{ id: string; name: string; slug: string; memberCount: number }>
  stats: { familyCount: number; totalPeople: number }
  meta?: {
    familiesKind: 'linked_lineage'
    totalPeopleDefinition: string
    keepersDefinition: string
  }
}

interface FamilyCluster {
  familyId: string
  familyName: string
  familySlug: string | null
  people: CommunityPersonRef[]
  elderCount: number
  relationCount: number
}

interface BridgeGroup {
  key: string
  familyAName: string
  familyASlug: string | null
  familyBName: string
  familyBSlug: string | null
  edges: CommunityKinshipEdge[]
  peopleCount: number
}

interface StoryPreviewEvent {
  id: string
  title: string
  description: string | null
  kind: TimelineEventSummary['kind']
  status: TimelineEventSummary['status']
  eventDate: string | null
  eventYear: number | null
  dateIsApproximate: boolean
  location: string | null
  families: Array<{ id: string; name: string; slug: string }>
}

interface FamilyPathway {
  familyId: string
  familyName: string
  familySlug: string
  memberCount: number
  storyCount: number
  goalCount: number
  sharedStoryCount: number
  sharedGoalCount: number
  featuredStory: StoryPreviewEvent | null
  featuredGoal: StoryPreviewEvent | null
}

interface LinkedFamilyTreePreview {
  familyId: string
  familyName: string
  familySlug: string
  memberCount: number
  nodeCount: number
  edgeCount: number
  elderCount: number
  people: PersonRef[]
  relationTypes: string[]
}

export default function CommunityTreePage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [detail, setDetail] = useState<CommunityDetail | null>(null)
  const [graph, setGraph] = useState<CommunityKinshipGraph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<'copied' | 'error' | null>(null)
  const [storyPreviewLoading, setStoryPreviewLoading] = useState(false)
  const [storyPreviewError, setStoryPreviewError] = useState<string | null>(null)
  const [foundationalStories, setFoundationalStories] = useState<StoryPreviewEvent[]>([])
  const [futureGoals, setFutureGoals] = useState<StoryPreviewEvent[]>([])
  const [familyPathways, setFamilyPathways] = useState<FamilyPathway[]>([])
  const [familyTreePreviewLoading, setFamilyTreePreviewLoading] = useState(false)
  const [familyTreePreviewError, setFamilyTreePreviewError] = useState<string | null>(null)
  const [familyTreePreviews, setFamilyTreePreviews] = useState<LinkedFamilyTreePreview[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setStoryPreviewError(null)
      setFoundationalStories([])
      setFutureGoals([])
      setFamilyPathways([])
      setFamilyTreePreviewError(null)
      setFamilyTreePreviews([])

      try {
        const communities = await getCommunities()
        const match = communities.data.find(community => community.slug === communitySlug)

        if (!match) {
          if (!cancelled) {
            setDetail(null)
            setStoryPreviewLoading(false)
            setFamilyTreePreviewLoading(false)
          }
          return
        }

        const nextDetail = await getCommunity(match.id)
        if (cancelled) return

        setDetail(nextDetail)

        if (nextDetail.families.length > 0) {
          setStoryPreviewLoading(true)
          setFamilyTreePreviewLoading(true)

          try {
            const [familyResults, timelineResult, aspirationResults, familyKinshipResults] = await Promise.all([
              Promise.allSettled(nextDetail.families.map(family => getFamilyFolder(family.id))),
              getTimelineEvents({ limit: 500 }),
              Promise.allSettled(
                nextDetail.families.map(family =>
                  getFamilyFolderTimeline(family.id, { kind: 'aspiration', limit: 100 })
                )
              ),
              Promise.allSettled(
                nextDetail.families.map(family => getFamilyFolderKinship(family.id))
              ),
            ])

            if (cancelled) return

            const memberFamilyMap = new Map<string, Array<{ id: string; name: string; slug: string }>>()

            familyResults.forEach((result, index) => {
              const family = nextDetail.families[index]
              if (result.status !== 'fulfilled') return

              for (const member of result.value.members) {
                const current = memberFamilyMap.get(member.storytellerId) || []
                if (!current.some(entry => entry.id === family.id)) {
                  current.push(family)
                }
                memberFamilyMap.set(member.storytellerId, current)
              }
            })

            const nextStoriesAll = timelineResult.data
              .map(event => {
                const matchedFamilies = dedupePreviewFamilies(
                  event.people.flatMap(person => memberFamilyMap.get(person.id) || [])
                )

                if (matchedFamilies.length === 0 || event.kind === 'aspiration') return null
                return toStoryPreviewEvent(event, matchedFamilies)
              })
              .filter((event): event is StoryPreviewEvent => Boolean(event))
              .sort(compareStoryPreviewChronology)

            const goalMap = new Map<string, StoryPreviewEvent>()

            aspirationResults.forEach((result, index) => {
              const family = nextDetail.families[index]
              if (result.status !== 'fulfilled') return

              for (const event of result.value.data) {
                const matchedFamilies = dedupePreviewFamilies([
                  family,
                  ...event.people.flatMap(person => memberFamilyMap.get(person.id) || []),
                ])

                goalMap.set(event.id, toStoryPreviewEvent(event, matchedFamilies))
              }
            })

            const nextGoalsAll = [...goalMap.values()]
              .sort(compareStoryPreviewChronology)

            setFoundationalStories(nextStoriesAll.slice(0, 4))
            setFutureGoals(nextGoalsAll.slice(0, 4))
            setFamilyPathways(buildFamilyPathways(nextDetail.families, nextStoriesAll, nextGoalsAll))
            setFamilyTreePreviews(buildFamilyTreePreviews(nextDetail.families, familyKinshipResults))
          } catch (previewError) {
            if (cancelled) return
            setStoryPreviewError(
              previewError instanceof Error ? previewError.message : 'Failed to load story previews'
            )
          } finally {
            if (!cancelled) {
              setStoryPreviewLoading(false)
              setFamilyTreePreviewLoading(false)
            }
          }
        } else {
          setStoryPreviewLoading(false)
          setFamilyTreePreviewLoading(false)
        }

        try {
          const nextGraph = await getCommunityKinship(match.id)
          if (!cancelled) setGraph(nextGraph)
        } catch (graphError) {
          if (cancelled) return
          setGraph(null)
          setError(graphError instanceof Error ? graphError.message : 'Failed to load community tree')
        }
      } catch (err) {
        if (cancelled) return
        setDetail(null)
        setGraph(null)
        setStoryPreviewLoading(false)
        setFamilyTreePreviewLoading(false)
        setError(err instanceof Error ? err.message : 'Failed to load community tree')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [communitySlug])

  const familyClusters = useMemo<FamilyCluster[]>(() => {
    if (!detail || !graph) return []

    const familyByName = new Map(detail.families.map(family => [family.name, family]))
    const clusters = new Map<string, CommunityPersonRef[]>()

    for (const person of graph.nodes) {
      const primaryFamilyName = person.familyNames[0] || 'Shared lineage people'
      const current = clusters.get(primaryFamilyName) || []
      current.push(person)
      clusters.set(primaryFamilyName, current)
    }

    return [...clusters.entries()]
      .map(([familyName, people]) => {
        const family = familyByName.get(familyName)
        const sortedPeople = [...people].sort((a, b) => {
          if (a.isElder !== b.isElder) return a.isElder ? -1 : 1
          return a.displayName.localeCompare(b.displayName)
        })

        return {
          familyId: family?.id || familyName,
          familyName,
          familySlug: family?.slug || null,
          people: sortedPeople,
          elderCount: sortedPeople.filter(person => person.isElder).length,
          relationCount: graph.edges.filter(edge =>
            edge.from.familyNames.includes(familyName) || edge.to.familyNames.includes(familyName)
          ).length,
        }
      })
      .sort((a, b) => a.familyName.localeCompare(b.familyName))
  }, [detail, graph])

  const crossFamilyEdges = useMemo(() => {
    if (!graph) return []

    return graph.edges.filter(edge => {
      const fromFamilies = new Set(edge.from.familyNames)
      const toFamilies = new Set(edge.to.familyNames)

      for (const familyName of fromFamilies) {
        if (toFamilies.has(familyName)) return false
      }

      return true
    })
  }, [graph])

  const linkedFamiliesWithoutSharedTree = useMemo(() => {
    if (!detail) return []

    const visibleFamilyNames = new Set(familyClusters.map(cluster => cluster.familyName))
    return detail.families.filter(family => !visibleFamilyNames.has(family.name))
  }, [detail, familyClusters])

  const sharedAcrossFamilies = useMemo(() => {
    if (!graph) return []

    return graph.nodes
      .filter(person => new Set(person.familyNames).size > 1)
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
  }, [graph])

  const bridgeGroups = useMemo(() => {
    if (!detail || crossFamilyEdges.length === 0) return []

    const familyByName = new Map(detail.families.map(family => [family.name, family]))
    const groups = new Map<string, CommunityKinshipEdge[]>()

    for (const edge of crossFamilyEdges) {
      const [fromFamilyName, toFamilyName] = resolveEdgeFamilyPair(edge)
      const [familyAName, familyBName] = [fromFamilyName, toFamilyName].sort((a, b) => a.localeCompare(b))
      const key = `${familyAName}::${familyBName}`
      const current = groups.get(key) || []
      current.push(edge)
      groups.set(key, current)
    }

    return [...groups.entries()]
      .map(([key, edges]) => {
        const [familyAName, familyBName] = key.split('::')
        const familyA = familyByName.get(familyAName)
        const familyB = familyByName.get(familyBName)
        const people = new Set(edges.flatMap(edge => [edge.from.id, edge.to.id]))

        return {
          key,
          familyAName,
          familyASlug: familyA?.slug || null,
          familyBName,
          familyBSlug: familyB?.slug || null,
          edges: edges.sort((a, b) => a.from.displayName.localeCompare(b.from.displayName)),
          peopleCount: people.size,
        }
      })
      .sort((a, b) => b.edges.length - a.edges.length || a.key.localeCompare(b.key))
  }, [detail, crossFamilyEdges])

  const selectedFamilyName = searchParams.get('family')
  const selectedBridgeKey = searchParams.get('bridge')
  const crossFamilyOnly = searchParams.get('mode') === 'cross'

  const selectedBridge = useMemo(
    () => bridgeGroups.find(group => group.key === selectedBridgeKey) || null,
    [bridgeGroups, selectedBridgeKey]
  )

  const focusedFamilyNames = useMemo(() => {
    if (selectedBridge) {
      return new Set([selectedBridge.familyAName, selectedBridge.familyBName])
    }

    if (selectedFamilyName) {
      return new Set([selectedFamilyName])
    }

    if (crossFamilyOnly) {
      return new Set(crossFamilyEdges.flatMap(edge => resolveEdgeFamilyPair(edge)))
    }

    return null
  }, [crossFamilyEdges, crossFamilyOnly, selectedBridge, selectedFamilyName])

  const visibleFamilyClusters = useMemo(() => {
    if (!focusedFamilyNames) return familyClusters
    return familyClusters.filter(cluster => focusedFamilyNames.has(cluster.familyName))
  }, [familyClusters, focusedFamilyNames])

  const visibleBridgeGroups = useMemo(() => {
    if (selectedBridge) return [selectedBridge]
    if (selectedFamilyName) {
      return bridgeGroups.filter(group =>
        group.familyAName === selectedFamilyName || group.familyBName === selectedFamilyName
      )
    }
    return bridgeGroups
  }, [bridgeGroups, selectedBridge, selectedFamilyName])

  const visibleSharedAcrossFamilies = useMemo(() => {
    if (crossFamilyOnly && !focusedFamilyNames) return sharedAcrossFamilies
    if (!focusedFamilyNames) return sharedAcrossFamilies

    return sharedAcrossFamilies.filter(person =>
      person.familyNames.some(familyName => focusedFamilyNames.has(familyName))
    )
  }, [crossFamilyOnly, focusedFamilyNames, sharedAcrossFamilies])

  const visibleEdges = useMemo(() => {
    if (selectedBridge) return selectedBridge.edges
    if (selectedFamilyName) {
      return (graph?.edges || []).filter(edge =>
        edge.from.familyNames.includes(selectedFamilyName) || edge.to.familyNames.includes(selectedFamilyName)
      )
    }
    if (crossFamilyOnly) return crossFamilyEdges
    return graph?.edges || []
  }, [crossFamilyEdges, crossFamilyOnly, graph?.edges, selectedBridge, selectedFamilyName])

  const visibleLinkedFamiliesWithoutSharedTree = useMemo(() => {
    if (!focusedFamilyNames) return linkedFamiliesWithoutSharedTree
    return linkedFamiliesWithoutSharedTree.filter(family => focusedFamilyNames.has(family.name))
  }, [focusedFamilyNames, linkedFamiliesWithoutSharedTree])

  const visibleCategoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const edge of visibleEdges) {
      const key = edge.vocabulary.category || edge.relationType || 'other'
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    return [...counts.entries()]
      .map(([raw, count]) => ({ raw, count }))
      .sort((a, b) => b.count - a.count || a.raw.localeCompare(b.raw))
  }, [visibleEdges])

  const visibleVisibilityCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const edge of visibleEdges) {
      counts.set(edge.visibility, (counts.get(edge.visibility) || 0) + 1)
    }

    return [...counts.entries()]
      .map(([raw, count]) => ({ raw: raw as Visibility, count }))
      .sort((a, b) => b.count - a.count || a.raw.localeCompare(b.raw))
  }, [visibleEdges])

  const visibleSensitivityCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const edge of visibleEdges) {
      counts.set(edge.culturalSensitivityLevel, (counts.get(edge.culturalSensitivityLevel) || 0) + 1)
    }

    return [...counts.entries()]
      .map(([raw, count]) => ({ raw: raw as CulturalSensitivity, count }))
      .sort((a, b) => b.count - a.count || a.raw.localeCompare(b.raw))
  }, [visibleEdges])

  const activeFilterLabel = selectedBridge
    ? `${selectedBridge.familyAName} × ${selectedBridge.familyBName}`
    : selectedFamilyName
      ? selectedFamilyName
      : crossFamilyOnly
        ? 'Cross-family only'
        : null
  const treeIssue = useMemo(() => classifyTreeIssue(error, LEDGER_BASE_URL), [error])
  const storyLayerVisible =
    storyPreviewLoading
    || Boolean(storyPreviewError)
    || foundationalStories.length > 0
    || futureGoals.length > 0
  const configuredBackendLabel = useMemo(() => formatBackendLabel(LEDGER_BASE_URL), [])

  const updateFilters = (mutator: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams)
    mutator(nextParams)
    setSearchParams(nextParams, { replace: true })
    setCopyStatus(null)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
    setCopyStatus(null)
  }

  const focusFamily = (familyName: string) => {
    updateFilters(params => {
      const nextFamily = selectedFamilyName === familyName ? null : familyName
      params.delete('bridge')
      params.delete('mode')
      if (nextFamily) {
        params.set('family', nextFamily)
      } else {
        params.delete('family')
      }
    })
  }

  const focusBridge = (bridgeKey: string) => {
    updateFilters(params => {
      const nextBridge = selectedBridgeKey === bridgeKey ? null : bridgeKey
      params.delete('family')
      params.delete('mode')
      if (nextBridge) {
        params.set('bridge', nextBridge)
      } else {
        params.delete('bridge')
      }
    })
  }

  const toggleCrossFamilyOnly = () => {
    updateFilters(params => {
      const nextCrossOnly = !crossFamilyOnly
      params.delete('family')
      params.delete('bridge')
      if (nextCrossOnly) {
        params.set('mode', 'cross')
      } else {
        params.delete('mode')
      }
    })
  }

  const copyFocusLink = async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.clipboard) {
      setCopyStatus('error')
      return
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-ink/50">Loading...</div>
  }

  if (!detail) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink mb-2">Community not found</h1>
        <p className="text-ink/60">No community with slug "{communitySlug}" exists yet.</p>
        <Link to="/explore" className="text-sm text-ochre mt-4 inline-block">Browse communities</Link>
      </div>
    )
  }

  const activeGraph = graph || { community: detail.community, nodes: [], edges: [] }
  const treeUnavailable = !graph && Boolean(treeIssue)
  const legacyGraphMode = graph?.mode === 'legacy_family_graph'
  const isPalmCommunity = detail.community.slug === 'palm-island'

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-3 w-3 rounded-full bg-ochre" />
          <span className="text-xs uppercase tracking-widest text-ochre font-medium">Community tree</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">{activeGraph.community.name}</h1>
        <p className="text-ink/60 mt-2 max-w-3xl">
          {legacyGraphMode
            ? 'This community view is being assembled from linked family trees because the community overlay schema has not been migrated in the live database yet.'
            : 'This is the shared community tree: only people and kinship links approved by families and community elders appear here.'}
        </p>
        <p className="text-sm text-ink/50 mt-3 max-w-3xl">
          Linked families and people on this page come from family lineage. Community keepers are a separate governance layer shown on the overview page.
        </p>
      </header>

      <div className="mb-8">
        <CrossAppGuideCard
          title="Review source evidence there. Read the shared map here."
          description="The community tree is the governed visibility layer, not the source-editing layer. Use Empathy Ledger for transcript evidence, storyteller cleanup, stories, and Palm review. Use 10 Years to read the shared lineage map and approve what becomes community-visible."
          editingItems={[
            'Transcript evidence, storyteller cleanup, stories, and media belong in Empathy Ledger.',
            isPalmCommunity
              ? 'Palm identity review and family-start evidence should be resolved in Palm Tree Review before changing the shared map here.'
              : 'Resolve source-record or evidence issues in Empathy Ledger before changing the shared map here.',
          ]}
          engagementItems={[
            'Read the shared lineage map here once families and community keepers have approved it.',
            'Use community governance in 10 Years for family-link and shared-kinship approvals.',
          ]}
          ledgerPath={isPalmCommunity ? '/admin/data-health/palm-tree-review' : '/admin'}
          ledgerLabel={isPalmCommunity ? 'Open Palm review in Empathy Ledger' : 'Open Empathy Ledger admin'}
        />
      </div>

      {error && !treeUnavailable && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Linked families" value={detail.stats.familyCount} />
        <StatCard label="Shared people" value={treeUnavailable ? '—' : activeGraph.nodes.length} />
        <StatCard label="Shared relations" value={treeUnavailable ? '—' : activeGraph.edges.length} />
        <StatCard label="Cross-family links" value={treeUnavailable ? '—' : crossFamilyEdges.length} />
      </div>

      {legacyGraphMode && graph?.note && (
        <section className="mb-8 rounded-xl border border-desert/20 bg-desert/[0.05] p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-widest text-desert">Compatibility view</div>
              <p className="text-sm text-ink/70 mt-2 max-w-3xl">{graph.note}</p>
            </div>
            <StatusPill tone="desert">Linked family graph</StatusPill>
          </div>
        </section>
      )}

      {activeGraph.nodes.length > 0 && (
        <section className="mb-8 rounded-xl border border-ink/10 bg-cream p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Focus view</div>
              <h2 className="font-serif text-2xl text-ink">Filter the shared tree</h2>
              <p className="text-sm text-ink/60 mt-1">
                Narrow the view to one family, one bridge, or only cross-family relations.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {activeFilterLabel && (
                <div className="rounded-full bg-sand/40 px-3 py-1 text-xs text-ink/60">
                  Focus: <span className="font-medium text-ink">{activeFilterLabel}</span>
                </div>
              )}
              {activeFilterLabel && (
                <button
                  type="button"
                  onClick={copyFocusLink}
                  className="rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink/60 hover:bg-sand/20 transition-colors"
                >
                  {copyStatus === 'copied' ? 'Link copied' : copyStatus === 'error' ? 'Copy failed' : 'Copy link'}
                </button>
              )}
              {(selectedFamilyName || selectedBridgeKey || crossFamilyOnly) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink/60 hover:bg-sand/20 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-2">Modes</div>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={crossFamilyOnly}
                  label="Cross-family only"
                  onClick={toggleCrossFamilyOnly}
                />
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-2">Families</div>
              <div className="flex flex-wrap gap-2">
                {familyClusters.map(cluster => (
                  <FilterChip
                    key={cluster.familyId}
                    active={selectedFamilyName === cluster.familyName}
                    label={`${cluster.familyName} (${cluster.people.length})`}
                    onClick={() => focusFamily(cluster.familyName)}
                  />
                ))}
              </div>
            </div>

            {bridgeGroups.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-2">Bridges</div>
                <div className="flex flex-wrap gap-2">
                  {bridgeGroups.map(group => (
                    <FilterChip
                      key={group.key}
                      active={selectedBridgeKey === group.key}
                      label={`${group.familyAName} × ${group.familyBName}`}
                      onClick={() => focusBridge(group.key)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {treeUnavailable ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-eucalypt/20 bg-eucalypt/[0.04] p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs uppercase tracking-widest text-eucalypt">Linked family view</div>
              <StatusPill tone="eucalypt">Fallback active</StatusPill>
            </div>
            <h2 className="font-serif text-2xl text-ink mt-2">
              The shared community overlay is unavailable here, but the family trees underneath it are still readable
            </h2>
            <p className="text-ink/65 max-w-3xl mt-3 leading-relaxed">
              The community record and linked families are loading correctly. While the shared community kinship overlay is
              blocked on this backend, this page can still show the linked family trees and story layers that are already
              readable.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <StatCard label="Linked families" value={detail.stats.familyCount} />
              <StatCard label="Lineage people in linked families" value={detail.stats.totalPeople} />
              <StatCard label="Current mode" value="Family trees" />
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to={`/c/${detail.community.slug}`}
                className="rounded-full px-4 py-2 text-sm font-medium bg-ochre text-cream hover:bg-ochre/90 transition-colors"
              >
                Open community overview
              </Link>
              <Link
                to={`/c/${detail.community.slug}/families`}
                className="rounded-full border border-ink/10 bg-cream/80 px-4 py-2 text-sm text-ink/65 hover:bg-sand/25 transition-colors"
              >
                See linked families
              </Link>
            </div>

            <details className="mt-6 rounded-xl border border-ink/10 bg-cream/75 p-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-ink">
                Technical details
              </summary>
              <div className="mt-3 space-y-3 text-sm text-ink/65">
                <div>
                  <span className="font-medium text-ink">Status:</span> {treeIssue?.statusLabel || 'Unavailable'}
                </div>
                <div>
                  <span className="font-medium text-ink">What is blocked:</span>{' '}
                  {treeIssue?.description || 'The approved community kinship overlay is not readable from the configured backend.'}
                </div>
                {treeIssue?.message && (
                  <div>
                    <span className="font-medium text-ink">Current response:</span> {treeIssue.message}
                  </div>
                )}
                {configuredBackendLabel && (
                  <div>
                    <span className="font-medium text-ink">Configured backend:</span> {configuredBackendLabel}
                  </div>
                )}
                <div>
                  <span className="font-medium text-ink">Next step:</span>{' '}
                  {treeIssue?.nextStep || 'Restore the community graph endpoint to see the shared overlay here.'}
                </div>
              </div>
            </details>
          </div>

          {detail.families.length > 0 && (
            <div className="space-y-6">
              <LinkedFamilyTreePreviewSection
                communitySlug={detail.community.slug}
                loading={familyTreePreviewLoading}
                error={familyTreePreviewError}
                previews={familyTreePreviews}
              />

              <section className="rounded-xl border border-ink/10 bg-cream p-6">
                <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-eucalypt">Linked families</div>
                    <h2 className="font-serif text-2xl text-ink">Families already present in this community</h2>
                  </div>
                  <Link to={`/c/${detail.community.slug}/families`} className="text-sm text-ochre hover:underline">
                    View family list
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.families.map(family => (
                    <div key={family.id} className="rounded-lg border border-ink/8 bg-sand/20 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-ink">{family.name}</div>
                          <div className="text-xs text-ink/50 mt-1">{family.memberCount} lineage people linked to this community</div>
                        </div>
                        <Link to={`/f/${family.slug}`} className="text-xs text-ochre hover:underline">
                          Open family
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      ) : activeGraph.nodes.length === 0 ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-ink/10 bg-cream p-8 text-center">
            <h2 className="font-serif text-2xl text-ink mb-2">No shared kinship has been approved yet</h2>
            <p className="text-ink/60 max-w-2xl mx-auto">
              Families can already be linked into this community, but the community tree stays empty until shared kinship is approved through the elder review flow.
            </p>
          </div>

          {detail.families.length > 0 && (
            <section className="rounded-xl border border-ink/10 bg-cream p-6">
              <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-eucalypt">Linked families</div>
                  <h2 className="font-serif text-2xl text-ink">Active linked families</h2>
                </div>
                <Link to={`/c/${detail.community.slug}/families`} className="text-sm text-ochre hover:underline">
                  View family list
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detail.families.map(family => (
                  <div key={family.id} className="rounded-lg border border-ink/8 bg-sand/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium text-ink">{family.name}</div>
                        <div className="text-xs text-ink/50 mt-1">{family.memberCount} lineage people linked to this community</div>
                      </div>
                      <Link to={`/f/${family.slug}`} className="text-xs text-ochre hover:underline">
                        Open family
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <section className="rounded-xl border border-ink/10 bg-cream p-6">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-ochre">Reading guide</div>
                <h2 className="font-serif text-2xl text-ink">How to read this shared tree</h2>
                <p className="text-sm text-ink/60 mt-2 max-w-3xl">
                  This page only shows kinship that families and community elders have approved for community visibility.
                </p>
              </div>
              {activeFilterLabel && (
                <div className="rounded-full bg-sand/40 px-3 py-1 text-xs text-ink/60">
                  Guide for <span className="font-medium text-ink">{activeFilterLabel}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
              <div className="rounded-xl border border-ink/8 bg-sand/20 p-5">
                <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-3">Legend</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <GuideCard
                    title="Family bridge"
                    body="A bridge card means the community has approved kinship that connects two different family groups."
                  />
                  <GuideCard
                    title="Shared person"
                    body="A shared person chip means that person appears across more than one family grouping in the approved community view."
                  />
                  <GuideCard
                    title="Elder"
                    body="Lineage people marked as elders are highlighted first inside each family cluster."
                  />
                  <GuideCard
                    title="Still private"
                    body="Families listed as still private are linked to the community but do not yet have approved shared kinship visible here."
                  />
                </div>
              </div>

              <div className="rounded-xl border border-ink/8 bg-sand/20 p-5 space-y-5">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-3">Visible relation types</div>
                  <div className="flex flex-wrap gap-2">
                    {visibleCategoryCounts.length === 0 ? (
                      <span className="text-sm text-ink/50">No visible relation types in this view.</span>
                    ) : (
                      visibleCategoryCounts.map(item => (
                        <CategoryMetricChip key={item.raw} category={item.raw} count={item.count} />
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-3">Visibility in this view</div>
                  <div className="flex flex-wrap gap-2">
                    {visibleVisibilityCounts.length === 0 ? (
                      <span className="text-sm text-ink/50">No visibility markers in this view.</span>
                    ) : (
                      visibleVisibilityCounts.map(item => (
                        <VisibilityMetricChip key={item.raw} visibility={item.raw} count={item.count} />
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-3">Cultural sensitivity in this view</div>
                  <div className="flex flex-wrap gap-2">
                    {visibleSensitivityCounts.length === 0 ? (
                      <span className="text-sm text-ink/50">No sensitivity markers in this view.</span>
                    ) : (
                      visibleSensitivityCounts.map(item => (
                        <SensitivityMetricChip key={item.raw} sensitivity={item.raw} count={item.count} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {visibleBridgeGroups.length > 0 && (
            <section className="rounded-xl border border-ink/10 bg-cream p-6">
              <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
                <div>
                  <div className="text-xs uppercase tracking-widest text-eucalypt">Bridge map</div>
                  <h2 className="font-serif text-2xl text-ink">How families connect in the shared tree</h2>
                  <p className="text-sm text-ink/60 mt-2 max-w-3xl">
                    These bridge cards only appear when the community has approved kinship that crosses family lines.
                  </p>
                </div>
                <div className="text-sm text-ink/50">
                  {visibleBridgeGroups.length} visible {visibleBridgeGroups.length === 1 ? 'bridge' : 'bridges'}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {visibleBridgeGroups.map(group => (
                  <BridgeCard
                    key={group.key}
                    group={group}
                    active={selectedBridgeKey === group.key}
                    onFocus={() => focusBridge(group.key)}
                  />
                ))}
              </div>
            </section>
          )}

          {visibleSharedAcrossFamilies.length > 0 && (
            <section className="rounded-xl border border-ink/10 bg-cream p-6">
              <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ochre">Shared people</div>
                  <h2 className="font-serif text-2xl text-ink">Lineage people appearing across more than one family</h2>
                </div>
                <div className="text-sm text-ink/50">
                  {visibleSharedAcrossFamilies.length} visible {visibleSharedAcrossFamilies.length === 1 ? 'person' : 'people'}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {visibleSharedAcrossFamilies.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => focusFamily(primaryFamilyName(person))}
                    className="rounded-full border border-ink/10 bg-sand/20 px-4 py-2 text-left hover:bg-sand/30 transition-colors"
                  >
                    <div className="text-sm font-medium text-ink">{person.displayName}</div>
                    <div className="text-[11px] text-ink/50">{formatFamilyNames(person.familyNames)}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-ink/10 bg-cream p-6">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-eucalypt">Family groups</div>
                <h2 className="font-serif text-2xl text-ink">Families represented in the shared tree</h2>
              </div>
              <div className="text-sm text-ink/50">
                {visibleFamilyClusters.length} visible {visibleFamilyClusters.length === 1 ? 'family' : 'families'}
              </div>
            </div>

            {visibleFamilyClusters.length === 0 ? (
              <p className="text-sm text-ink/50">No family groups match the current filter.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {visibleFamilyClusters.map(cluster => (
                <section key={cluster.familyId} className="rounded-xl border border-ink/8 bg-sand/20 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-ochre">Family</div>
                      <h3 className="font-serif text-xl text-ink">{cluster.familyName}</h3>
                      <div className="text-xs text-ink/50 mt-1">
                        {cluster.people.length} shared people · {cluster.elderCount} elder{cluster.elderCount === 1 ? '' : 's'} · {cluster.relationCount} visible links
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => focusFamily(cluster.familyName)}
                        className={`rounded-full px-3 py-1.5 text-[11px] transition-colors ${
                          selectedFamilyName === cluster.familyName
                            ? 'bg-ochre text-cream'
                            : 'bg-ochre/10 text-ochre hover:bg-ochre/15'
                        }`}
                      >
                        {selectedFamilyName === cluster.familyName ? 'Focused' : 'Focus family'}
                      </button>
                      {cluster.familySlug && (
                        <Link to={`/f/${cluster.familySlug}`} className="text-xs text-ochre hover:underline">
                          Open family folder
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cluster.people.map(person => (
                      <div
                        key={person.id}
                        className={[
                          'rounded-lg border p-3',
                          person.isElder ? 'border-ochre/30 bg-ochre/5' : 'border-ink/8 bg-cream/70',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-3">
                          {person.avatarUrl ? (
                            <img src={person.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-sand flex items-center justify-center text-xs font-medium text-desert">
                              {person.displayName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-ink truncate">{person.displayName}</div>
                            <div className="text-[10px] uppercase tracking-wider text-ink/45">
                              {person.isElder ? 'Elder' : 'Shared family member'}
                            </div>
                          </div>
                        </div>

                        {person.familyNames.length > 1 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {person.familyNames.map(familyName => (
                              <span
                                key={`${person.id}-${familyName}`}
                                className="rounded-full bg-cream px-2.5 py-1 text-[11px] text-ink/55"
                              >
                                {familyName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-ink/10 bg-cream p-6">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-ochre">Shared kinship</div>
                <h2 className="font-serif text-2xl text-ink">Approved relations in the community tree</h2>
              </div>
              <div className="text-sm text-ink/50">
                {visibleEdges.length} visible {visibleEdges.length === 1 ? 'relation' : 'relations'}
              </div>
            </div>

            {visibleEdges.length === 0 ? (
              <p className="text-sm text-ink/50">No approved relations match the current filter.</p>
            ) : (
              <div className="space-y-3">
                {visibleEdges.map(edge => (
                  <RelationRow
                    key={edge.id}
                    edge={edge}
                    highlightCrossFamily={crossFamilyEdges.some(item => item.id === edge.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {visibleLinkedFamiliesWithoutSharedTree.length > 0 && (
            <section className="rounded-xl border border-ink/10 bg-cream p-6">
              <div className="text-xs uppercase tracking-widest text-eucalypt">Still private</div>
              <h2 className="font-serif text-2xl text-ink mt-1">Linked families not yet visible in the shared tree</h2>
              <p className="text-sm text-ink/60 mt-2 mb-4">
                These families are linked to the community, but no shared kinship from them has been approved for community visibility yet.
              </p>

              <div className="flex flex-wrap gap-3">
                {visibleLinkedFamiliesWithoutSharedTree.map(family => (
                  <Link
                    key={family.id}
                    to={`/f/${family.slug}`}
                    className="rounded-full border border-ink/10 bg-sand/20 px-4 py-2 text-sm text-ink hover:bg-sand/30 transition-colors"
                  >
                    {family.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {storyLayerVisible && detail && (
        <StoryLayerSection
          communitySlug={detail.community.slug}
          loading={storyPreviewLoading}
          error={storyPreviewError}
          foundationalStories={foundationalStories}
          futureGoals={futureGoals}
          familyPathways={familyPathways}
          intro={
            treeUnavailable
              ? 'Even while the shared kinship graph is blocked, linked-family story and goal layers are still readable here.'
              : activeGraph.nodes.length === 0
                ? 'The shared kinship graph is still forming, but the community story and goal layers are already visible.'
                : 'Read the community structure alongside the story lines and future goals already carried by linked families.'
          }
        />
      )}
    </div>
  )
}

function StoryLayerSection({
  communitySlug,
  loading,
  error,
  foundationalStories,
  futureGoals,
  familyPathways,
  intro,
}: {
  communitySlug: string
  loading: boolean
  error: string | null
  foundationalStories: StoryPreviewEvent[]
  futureGoals: StoryPreviewEvent[]
  familyPathways: FamilyPathway[]
  intro: string
}) {
  return (
    <section className="mt-8 rounded-xl border border-ink/10 bg-cream p-6">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-eucalypt">Story layers</div>
          <h2 className="font-serif text-2xl text-ink">What is already visible beyond the tree</h2>
          <p className="text-sm text-ink/60 mt-2 max-w-3xl">{intro}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/c/${communitySlug}/timeline`}
            className="rounded-full border border-ink/10 bg-sand/20 px-4 py-2 text-sm text-ink/65 hover:bg-sand/30 transition-colors"
          >
            Open timeline
          </Link>
          <Link
            to={`/c/${communitySlug}/goals`}
            className="rounded-full border border-ink/10 bg-sand/20 px-4 py-2 text-sm text-ink/65 hover:bg-sand/30 transition-colors"
          >
            Open goals
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-ink/50">Loading visible story layers…</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : (
        <div className="space-y-5">
          {familyPathways.length > 0 && (
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-5">
              <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ochre">Family pathways</div>
                  <h3 className="font-serif text-xl text-ink mt-1">How each linked family is already showing up here</h3>
                  <p className="text-sm text-ink/60 mt-2">
                    This tracks visible stories and goals by family, even before the shared kinship graph is fully readable.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {familyPathways.map(pathway => (
                  <FamilyPathwayCard key={pathway.familyId} pathway={pathway} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <StoryLane
              title="Foundational stories"
              label="Timeline"
              description="Story lines already visible through linked-family history."
              emptyLabel="No visible timeline stories were matched to linked families yet."
              items={foundationalStories}
            />
            <StoryLane
              title="Future goals"
              label="Goals"
              description="Dreams and aspirations already visible through linked-family goal layers."
              emptyLabel="No visible future goals were matched to linked families yet."
              items={futureGoals}
            />
          </div>
        </div>
      )}
    </section>
  )
}

function StoryLane({
  title,
  label,
  description,
  emptyLabel,
  items,
}: {
  title: string
  label: string
  description: string
  emptyLabel: string
  items: StoryPreviewEvent[]
}) {
  return (
    <div className="rounded-xl border border-ink/8 bg-sand/20 p-5">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-widest text-ochre">{label}</div>
        <h3 className="font-serif text-xl text-ink mt-1">{title}</h3>
        <p className="text-sm text-ink/60 mt-2">{description}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink/50">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <StoryPreviewCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function StoryPreviewCard({ item }: { item: StoryPreviewEvent }) {
  return (
    <article className="rounded-lg border border-ink/8 bg-cream/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StoryKindPill kind={item.kind} />
            <span className="rounded-full bg-sand/30 px-2.5 py-1 text-[10px] uppercase tracking-wider text-ink/55">
              {item.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h4 className="font-serif text-lg text-ink leading-tight">{item.title}</h4>
          <div className="text-xs text-ink/50 mt-2">
            {formatStoryPreviewDate(item)}
            {item.location ? ` · ${item.location}` : ''}
          </div>
        </div>
        <div className="text-xs text-ink/45">
          {item.families.length} {item.families.length === 1 ? 'family' : 'families'}
        </div>
      </div>

      {item.description && (
        <p className="text-sm text-ink/65 leading-relaxed mt-3">{item.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {item.families.map(family => (
          <Link
            key={family.id}
            to={`/f/${family.slug}`}
            className="rounded-full border border-ink/10 bg-sand/20 px-3 py-1.5 text-[11px] text-ink/70 hover:bg-sand/30 transition-colors"
          >
            {family.name}
          </Link>
        ))}
      </div>
    </article>
  )
}

function FamilyPathwayCard({ pathway }: { pathway: FamilyPathway }) {
  return (
    <article className="rounded-lg border border-ink/8 bg-cream/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-eucalypt">Family</div>
          <h4 className="font-serif text-lg text-ink mt-1">{pathway.familyName}</h4>
          <div className="text-xs text-ink/50 mt-2">
            {pathway.memberCount} lineage people · {pathway.storyCount} visible {pathway.storyCount === 1 ? 'story' : 'stories'} · {pathway.goalCount} visible {pathway.goalCount === 1 ? 'goal' : 'goals'}
          </div>
        </div>
        <Link to={`/f/${pathway.familySlug}`} className="text-xs text-ochre hover:underline">
          Open family
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <MiniMetric label="Shared stories" value={pathway.sharedStoryCount} />
        <MiniMetric label="Shared goals" value={pathway.sharedGoalCount} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <MiniPreview
          label="Story thread"
          title={pathway.featuredStory?.title || 'No visible story yet'}
          meta={pathway.featuredStory ? formatStoryPreviewDate(pathway.featuredStory) : 'Waiting on visible story layer'}
        />
        <MiniPreview
          label="Goal thread"
          title={pathway.featuredGoal?.title || 'No visible goal yet'}
          meta={pathway.featuredGoal ? formatStoryPreviewDate(pathway.featuredGoal) : 'Waiting on visible goal layer'}
        />
      </div>
    </article>
  )
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink/8 bg-sand/20 px-3 py-3">
      <div className="text-[10px] uppercase tracking-widest text-ink/45">{label}</div>
      <div className="font-serif text-2xl text-ink mt-2">{value}</div>
    </div>
  )
}

function MiniPreview({
  label,
  title,
  meta,
}: {
  label: string
  title: string
  meta: string
}) {
  return (
    <div className="rounded-lg border border-ink/8 bg-sand/20 px-3 py-3">
      <div className="text-[10px] uppercase tracking-widest text-ink/45">{label}</div>
      <div className="text-sm font-medium text-ink mt-2 leading-snug">{title}</div>
      <div className="text-xs text-ink/50 mt-2">{meta}</div>
    </div>
  )
}

function StoryKindPill({ kind }: { kind: TimelineEventSummary['kind'] }) {
  const styles: Record<TimelineEventSummary['kind'], string> = {
    past: 'bg-desert/12 text-desert',
    aspiration: 'bg-eucalypt/12 text-eucalypt',
    milestone: 'bg-ochre/12 text-ochre',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${styles[kind]}`}>
      {kind.replace(/_/g, ' ')}
    </span>
  )
}

function LinkedFamilyTreePreviewSection({
  communitySlug,
  loading,
  error,
  previews,
}: {
  communitySlug: string
  loading: boolean
  error: string | null
  previews: LinkedFamilyTreePreview[]
}) {
  return (
    <section className="rounded-xl border border-ink/10 bg-cream p-6">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-ochre">Linked family trees</div>
          <h2 className="font-serif text-2xl text-ink">Tree previews still readable from linked families</h2>
          <p className="text-sm text-ink/60 mt-2 max-w-3xl">
            The governed community overlay is blocked on the current backend, but these family-scoped tree previews are still readable and give a real sense of the lineage already in the system.
          </p>
        </div>
        <Link to={`/c/${communitySlug}/families`} className="text-sm text-ochre hover:underline">
          Compare family list
        </Link>
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-ink/50">Loading linked family tree previews…</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : previews.length === 0 ? (
        <p className="text-sm text-ink/50">No linked family tree previews are readable from this backend yet.</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {previews.map(preview => (
            <LinkedFamilyTreeCard key={preview.familyId} preview={preview} />
          ))}
        </div>
      )}
    </section>
  )
}

function LinkedFamilyTreeCard({ preview }: { preview: LinkedFamilyTreePreview }) {
  return (
    <article className="rounded-xl border border-ink/8 bg-sand/20 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-eucalypt">Family tree</div>
          <h3 className="font-serif text-xl text-ink mt-1">{preview.familyName}</h3>
          <div className="text-xs text-ink/50 mt-2">
            {preview.memberCount} lineage people linked to community · {preview.nodeCount} visible people · {preview.edgeCount} visible relations
          </div>
        </div>
        <Link to={`/f/${preview.familySlug}/tree`} className="text-xs text-ochre hover:underline">
          Open family tree
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <MiniMetric label="Visible people" value={preview.nodeCount} />
        <MiniMetric label="Visible links" value={preview.edgeCount} />
        <MiniMetric label="Elders" value={preview.elderCount} />
      </div>

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-2">Key relation types</div>
        <div className="flex flex-wrap gap-2">
          {preview.relationTypes.length === 0 ? (
            <span className="text-sm text-ink/50">No visible relation types.</span>
          ) : (
            preview.relationTypes.map(type => (
              <span
                key={`${preview.familyId}-${type}`}
                className="rounded-full bg-cream/80 px-3 py-1.5 text-[11px] text-ink/65"
              >
                {formatCategoryLabel(type)}
              </span>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-ink/45 mb-2">Lineage people in preview</div>
        <div className="flex flex-wrap gap-2">
          {preview.people.map(person => (
            <span
              key={`${preview.familyId}-${person.id}`}
              className={`rounded-full px-3 py-1.5 text-[11px] ${
                person.isElder ? 'bg-ochre/12 text-ochre' : 'bg-cream/80 text-ink/65'
              }`}
            >
              {person.displayName}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

function BridgeCard({
  group,
  active,
  onFocus,
}: {
  group: BridgeGroup
  active?: boolean
  onFocus: () => void
}) {
  return (
    <section className={`rounded-xl border p-5 transition-colors ${
      active ? 'border-ochre/40 bg-ochre/5' : 'border-ink/8 bg-sand/20'
    }`}>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-eucalypt">Family bridge</div>
          <h3 className="font-serif text-xl text-ink">
            {group.familyAName} <span className="text-ink/30">×</span> {group.familyBName}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onFocus}
            className={`rounded-full px-3 py-1.5 text-[11px] transition-colors ${
              active ? 'bg-ochre text-cream' : 'bg-ochre/10 text-ochre hover:bg-ochre/15'
            }`}
          >
            {active ? 'Focused' : 'Focus bridge'}
          </button>
          <StatusPill tone="eucalypt">{group.edges.length} shared links</StatusPill>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 mb-4">
        <FamilyBridgeEndpoint name={group.familyAName} slug={group.familyASlug} align="left" />
        <div className="rounded-full bg-cream px-3 py-1 text-[11px] uppercase tracking-widest text-ink/40">
          {group.peopleCount} people
        </div>
        <FamilyBridgeEndpoint name={group.familyBName} slug={group.familyBSlug} align="right" />
      </div>

      <div className="space-y-2">
        {group.edges.slice(0, 4).map(edge => (
          <RelationRow key={edge.id} edge={edge} highlightCrossFamily />
        ))}
        {group.edges.length > 4 && (
          <div className="text-xs text-ink/45 px-1">
            + {group.edges.length - 4} more approved shared links in this bridge
          </div>
        )}
      </div>
    </section>
  )
}

function FamilyBridgeEndpoint({
  name,
  slug,
  align,
}: {
  name: string
  slug: string | null
  align: 'left' | 'right'
}) {
  const content = (
    <div className={`rounded-lg border border-ink/8 bg-cream/80 px-4 py-3 ${align === 'right' ? 'text-right' : ''}`}>
      <div className="text-[10px] uppercase tracking-widest text-ochre">Family</div>
      <div className="text-sm font-medium text-ink">{name}</div>
    </div>
  )

  if (!slug) return content

  return (
    <Link to={`/f/${slug}`} className="hover:opacity-90 transition-opacity">
      {content}
    </Link>
  )
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
        active
          ? 'bg-eucalypt text-cream'
          : 'border border-ink/10 bg-sand/20 text-ink/65 hover:bg-sand/30'
      }`}
    >
      {label}
    </button>
  )
}

function RelationRow({ edge, highlightCrossFamily }: { edge: CommunityKinshipEdge; highlightCrossFamily: boolean }) {
  const categoryStyle = getCategoryStyle(edge.vocabulary.category || edge.relationType)
  const visibilityStyle = getVisibilityStyle(edge.visibility)
  const sensitivityStyle = getSensitivityStyle(edge.culturalSensitivityLevel)

  return (
    <div className={`rounded-lg border bg-sand/20 p-4 ${categoryStyle.containerClass}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <RelationMarker category={edge.vocabulary.category || edge.relationType} />
            <div className="text-sm font-medium text-ink">
              {edge.from.displayName} <span className="text-ink/35">→</span> {edge.to.displayName}
            </div>
          </div>
          <div className="text-xs text-ink/55 mt-1">
            {edge.vocabulary.label || edge.relationType}
            {' · '}
            {formatFamilyNames(edge.from.familyNames)}
            {' → '}
            {formatFamilyNames(edge.to.familyNames)}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <MetricPill
            accentClass={categoryStyle.badgeClass}
            marker={categoryStyle.marker}
            label={formatCategoryLabel(edge.vocabulary.category || edge.relationType)}
          />
          <MetricPill
            accentClass={visibilityStyle.badgeClass}
            marker={visibilityStyle.marker}
            label={edge.visibility}
          />
          {highlightCrossFamily && (
            <MetricPill accentClass="bg-eucalypt/12 text-eucalypt" marker="XF" label="cross-family" />
          )}
          {edge.culturalSensitivityLevel !== 'standard' && (
            <MetricPill
              accentClass={sensitivityStyle.badgeClass}
              marker={sensitivityStyle.marker}
              label={edge.culturalSensitivityLevel}
            />
          )}
        </div>
      </div>
      {edge.notes && <div className="mt-3 text-xs text-ink/60">{edge.notes}</div>}
    </div>
  )
}

function GuideCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-ink/8 bg-cream/80 p-4">
      <div className="text-sm font-medium text-ink">{title}</div>
      <div className="text-xs text-ink/60 mt-2 leading-relaxed">{body}</div>
    </div>
  )
}

function CategoryMetricChip({ category, count }: { category: string; count: number }) {
  const style = getCategoryStyle(category)
  return (
    <MetricPill
      accentClass={style.badgeClass}
      marker={style.marker}
      label={`${formatCategoryLabel(category)} (${count})`}
    />
  )
}

function VisibilityMetricChip({ visibility, count }: { visibility: Visibility; count: number }) {
  const style = getVisibilityStyle(visibility)
  return (
    <MetricPill
      accentClass={style.badgeClass}
      marker={style.marker}
      label={`${visibility} (${count})`}
    />
  )
}

function SensitivityMetricChip({
  sensitivity,
  count,
}: {
  sensitivity: CulturalSensitivity
  count: number
}) {
  const style = getSensitivityStyle(sensitivity)
  return (
    <MetricPill
      accentClass={style.badgeClass}
      marker={style.marker}
      label={`${sensitivity} (${count})`}
    />
  )
}

function RelationMarker({ category }: { category: string }) {
  const style = getCategoryStyle(category)
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${style.badgeClass}`}>
      <span className="font-mono text-[10px]">{style.marker}</span>
      <span>{formatCategoryLabel(category)}</span>
    </div>
  )
}

function MetricPill({
  accentClass,
  marker,
  label,
}: {
  accentClass: string
  marker: string
  label: string
}) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${accentClass}`}>
      <span className="font-mono text-[10px]">{marker}</span>
      <span>{label}</span>
    </span>
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

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'ochre' | 'eucalypt' | 'desert'
}) {
  const tones: Record<typeof tone, string> = {
    ochre: 'bg-ochre/10 text-ochre',
    eucalypt: 'bg-eucalypt/10 text-eucalypt',
    desert: 'bg-desert/10 text-desert',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  )
}

function formatFamilyNames(familyNames: string[]) {
  return familyNames.length > 0 ? familyNames.join(', ') : 'Shared community member'
}

function getCategoryStyle(category: string): {
  marker: string
  badgeClass: string
  containerClass: string
} {
  const normalized = normalizeKinshipCategory(category)

  const styles: Record<KinshipCategory, { marker: string; badgeClass: string; containerClass: string }> = {
    parent: {
      marker: 'PR',
      badgeClass: 'bg-ochre/12 text-ochre',
      containerClass: 'border-ochre/20 border-l-4',
    },
    child: {
      marker: 'CH',
      badgeClass: 'bg-desert/12 text-desert',
      containerClass: 'border-desert/20 border-l-4',
    },
    sibling: {
      marker: 'SB',
      badgeClass: 'bg-eucalypt/12 text-eucalypt',
      containerClass: 'border-eucalypt/20 border-l-4',
    },
    grandparent: {
      marker: 'GP',
      badgeClass: 'bg-ochre/12 text-ochre',
      containerClass: 'border-ochre/20 border-l-4',
    },
    grandchild: {
      marker: 'GC',
      badgeClass: 'bg-desert/12 text-desert',
      containerClass: 'border-desert/20 border-l-4',
    },
    extended: {
      marker: 'EX',
      badgeClass: 'bg-ink/8 text-ink/65',
      containerClass: 'border-ink/12 border-l-4',
    },
    partner: {
      marker: 'PT',
      badgeClass: 'bg-eucalypt/12 text-eucalypt',
      containerClass: 'border-eucalypt/20 border-l-4',
    },
    chosen_family: {
      marker: 'CF',
      badgeClass: 'bg-eucalypt/12 text-eucalypt',
      containerClass: 'border-eucalypt/20 border-l-4',
    },
    ceremonial: {
      marker: 'CE',
      badgeClass: 'bg-desert/12 text-desert',
      containerClass: 'border-desert/20 border-l-4',
    },
    mentor: {
      marker: 'MN',
      badgeClass: 'bg-ochre/12 text-ochre',
      containerClass: 'border-ochre/20 border-l-4',
    },
    other: {
      marker: 'OT',
      badgeClass: 'bg-ink/8 text-ink/65',
      containerClass: 'border-ink/12 border-l-4',
    },
  }

  return styles[normalized]
}

function getVisibilityStyle(visibility: Visibility): { marker: string; badgeClass: string } {
  const styles: Record<Visibility, { marker: string; badgeClass: string }> = {
    public: { marker: 'PB', badgeClass: 'bg-eucalypt/12 text-eucalypt' },
    org: { marker: 'OG', badgeClass: 'bg-ochre/12 text-ochre' },
    family: { marker: 'FM', badgeClass: 'bg-desert/12 text-desert' },
    private: { marker: 'PV', badgeClass: 'bg-ink/8 text-ink/65' },
  }

  return styles[visibility]
}

function getSensitivityStyle(sensitivity: CulturalSensitivity): { marker: string; badgeClass: string } {
  const styles: Record<CulturalSensitivity, { marker: string; badgeClass: string }> = {
    standard: { marker: 'ST', badgeClass: 'bg-eucalypt/12 text-eucalypt' },
    sensitive: { marker: 'SN', badgeClass: 'bg-ochre/12 text-ochre' },
    sacred: { marker: 'SC', badgeClass: 'bg-desert/12 text-desert' },
    restricted: { marker: 'RS', badgeClass: 'bg-ink/8 text-ink/65' },
  }

  return styles[sensitivity]
}

function formatCategoryLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function primaryFamilyName(person: CommunityPersonRef) {
  return person.familyNames[0] || 'Shared lineage people'
}

function resolveEdgeFamilyPair(edge: CommunityKinshipEdge): [string, string] {
  const fromPrimary = primaryFamilyName(edge.from)
  const toPrimary = edge.to.familyNames.find(name => name !== fromPrimary) || primaryFamilyName(edge.to)
  const fromResolved = edge.from.familyNames.find(name => name !== toPrimary) || fromPrimary

  return [fromResolved, toPrimary]
}

function dedupePreviewFamilies(
  families: Array<{ id: string; name: string; slug: string }>
) {
  const byId = new Map<string, { id: string; name: string; slug: string }>()
  for (const family of families) {
    byId.set(family.id, family)
  }
  return [...byId.values()]
}

function buildFamilyPathways(
  families: Array<{ id: string; name: string; slug: string; memberCount: number }>,
  stories: StoryPreviewEvent[],
  goals: StoryPreviewEvent[]
): FamilyPathway[] {
  return families
    .map(family => {
      const familyStories = stories.filter(event => event.families.some(item => item.id === family.id))
      const familyGoals = goals.filter(event => event.families.some(item => item.id === family.id))

      return {
        familyId: family.id,
        familyName: family.name,
        familySlug: family.slug,
        memberCount: family.memberCount,
        storyCount: familyStories.length,
        goalCount: familyGoals.length,
        sharedStoryCount: familyStories.filter(event => event.families.length > 1).length,
        sharedGoalCount: familyGoals.filter(event => event.families.length > 1).length,
        featuredStory: familyStories[0] || null,
        featuredGoal: familyGoals[0] || null,
      }
    })
    .sort((a, b) => {
      const aWeight = a.storyCount + a.goalCount
      const bWeight = b.storyCount + b.goalCount
      if (aWeight !== bWeight) return bWeight - aWeight
      return a.familyName.localeCompare(b.familyName)
    })
}

function buildFamilyTreePreviews(
  families: Array<{ id: string; name: string; slug: string; memberCount: number }>,
  kinshipResults: PromiseSettledResult<KinshipGraph>[]
): LinkedFamilyTreePreview[] {
  return families
    .flatMap((family, index) => {
      const result = kinshipResults[index]
      if (!result || result.status !== 'fulfilled') return []

      const graph = result.value
      const relationTypes = [...new Set(
        graph.edges.map(edge => edge.vocabulary.category || edge.relationType).filter(Boolean)
      )]
      const people = [...graph.nodes]
        .sort((a, b) => {
          if (a.isElder !== b.isElder) return a.isElder ? -1 : 1
          return a.displayName.localeCompare(b.displayName)
        })
        .slice(0, 8)

      return [{
        familyId: family.id,
        familyName: family.name,
        familySlug: family.slug,
        memberCount: family.memberCount,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
        elderCount: graph.nodes.filter(person => person.isElder).length,
        people,
        relationTypes: relationTypes.slice(0, 6),
      }]
    })
    .sort((a, b) => {
      if (a.nodeCount !== b.nodeCount) return b.nodeCount - a.nodeCount
      return a.familyName.localeCompare(b.familyName)
    })
}

function toStoryPreviewEvent(
  event: TimelineEventSummary,
  families: Array<{ id: string; name: string; slug: string }>
): StoryPreviewEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    kind: event.kind,
    status: event.status,
    eventDate: event.eventDate,
    eventYear: event.eventYear,
    dateIsApproximate: event.dateIsApproximate,
    location: event.location,
    families,
  }
}

function compareStoryPreviewChronology(a: StoryPreviewEvent, b: StoryPreviewEvent) {
  const aYear = previewEventYear(a)
  const bYear = previewEventYear(b)
  if (aYear !== bYear) return aYear - bYear

  const aDate = a.eventDate ? new Date(a.eventDate).getTime() : 0
  const bDate = b.eventDate ? new Date(b.eventDate).getTime() : 0
  return aDate - bDate
}

function previewEventYear(event: StoryPreviewEvent) {
  if (typeof event.eventYear === 'number') return event.eventYear
  if (event.eventDate) return new Date(event.eventDate).getFullYear()
  return Number.MAX_SAFE_INTEGER
}

function formatStoryPreviewDate(event: StoryPreviewEvent) {
  if (event.eventDate) {
    return new Date(event.eventDate).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (typeof event.eventYear === 'number') {
    return event.dateIsApproximate ? `c. ${event.eventYear}` : String(event.eventYear)
  }

  return 'Undated'
}

function classifyTreeIssue(message: string | null, backendUrl?: string): {
  kind: 'access' | 'network' | 'backend' | 'preview' | 'unknown'
  statusLabel: string
  title: string
  description: string
  nextStep: string
  message: string
} | null {
  if (!message) return null

  const normalized = message.toLowerCase()

  if (normalized.includes('authentication required') || normalized.includes('access key')) {
    return {
      kind: 'access',
      statusLabel: 'Access blocked',
      title: 'This community exists, but this backend or key cannot read its shared graph yet',
      description:
        'The page can verify the community record, linked families, and linked lineage people. What is being rejected is the approved community kinship graph request, which usually means this backend or access key does not expose that governed read path yet.',
      nextStep: 'Use a compatible family/community session or deploy the backend path that exposes the community graph.',
      message,
    }
  }

  if (normalized.includes('failed to fetch') || normalized.includes('networkerror')) {
    const backendLabel = formatBackendLabel(backendUrl)
    const backendHost = extractBackendHost(backendUrl)

    if (backendHost?.endsWith('vercel.app')) {
      return {
        kind: 'preview',
        statusLabel: 'Preview backend blocked',
        title: 'This community exists, but the configured preview backend is blocking the shared tree endpoint',
        description:
          `The community detail request is working, but the separate kinship graph request is being blocked by the backend this app is pointed at${backendLabel ? ` (${backendLabel})` : ''}. In this setup that usually means the preview route is returning an auth or CORS failure, which the browser surfaces only as “Failed to fetch.”`,
        nextStep: 'Either point 10 Years at the local Empathy Ledger backend or deploy the current community-kinship route to this preview backend.',
        message,
      }
    }

    return {
      kind: 'network',
      statusLabel: 'Cross-origin backend issue',
      title: 'This community exists, but the shared tree request is not getting a usable response from the configured backend',
      description:
        `The community detail request is working, but the separate kinship graph request is failing before a usable response reaches the page${backendLabel ? ` from ${backendLabel}` : ''}. That usually points to an auth/CORS or backend-compatibility problem rather than missing community data.`,
      nextStep: 'Check the configured backend URL and the auth/CORS behavior of the community kinship endpoint.',
      message,
    }
  }

  if (/\b5\d\d\b/.test(normalized) || normalized.includes('internal server error')) {
    return {
      kind: 'backend',
      statusLabel: 'Backend issue',
      title: 'This community exists, but the shared tree endpoint is failing on the backend',
      description:
        'The page can read the community itself, but the community kinship endpoint is returning a backend-style failure. That usually means the route or its required schema is behind the frontend.',
      nextStep: 'Bring the backend route and its governance schema into sync, then reload the community tree.',
      message,
    }
  }

  return {
    kind: 'unknown',
    statusLabel: 'Tree unavailable',
    title: 'This community exists, but its shared tree cannot be read yet',
    description:
      'The community record is loading, but the approved kinship graph request is still failing. The data layer behind the shared tree needs attention before the graph can render here.',
    nextStep: 'Check the community graph endpoint and the backend data model behind it.',
    message,
  }
}

function formatBackendLabel(value?: string) {
  if (!value) return null

  try {
    const url = new URL(value)
    return url.host
  } catch {
    return value
  }
}

function extractBackendHost(value?: string) {
  if (!value) return null

  try {
    return new URL(value).host
  } catch {
    return null
  }
}

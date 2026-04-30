import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import { useSession } from '@/contexts/SessionContext'
import {
  getCommunities,
  getCommunity,
  getCommunityFamilyLinks,
  getCommunityKinship,
  getCommunityResearch,
  getKinshipProposals,
} from '@/services/empathyLedgerClient'
import type { CommunityFamilyLink, CommunityKinshipGraph, CommunityResearchResponse, KinshipProposal } from '@/services/types'
import CommunityShowcase, { COMMUNITY_CONFIGS } from './CommunityShowcase'

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
  keepers?: Array<{
    storytellerId: string
    displayName: string
    avatarUrl: string | null
    isElder: boolean
    role: string
  }>
  members: Array<{
    storytellerId: string
    displayName: string
    avatarUrl: string | null
    isElder: boolean
    role: string
  }>
  stats: { familyCount: number; totalPeople: number; adminCount: number }
  meta?: {
    keepersKind: 'community_governance'
    familiesKind: 'linked_lineage'
    totalPeopleDefinition: string
    keepersDefinition: string
  }
}

export default function CommunityHomePage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  // Community-specific bespoke template — Palm Island is the design template.
  if (communitySlug && COMMUNITY_CONFIGS[communitySlug]) {
    return <CommunityShowcase />
  }
  const { familySession } = useSession()
  const [detail, setDetail] = useState<CommunityDetail | null>(null)
  const [graphSummary, setGraphSummary] = useState<Pick<CommunityKinshipGraph, 'mode' | 'note'> & { nodeCount: number; edgeCount: number } | null>(null)
  const [graphSummaryError, setGraphSummaryError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [governanceLoading, setGovernanceLoading] = useState(false)
  const [governanceError, setGovernanceError] = useState<string | null>(null)
  const [communityLinks, setCommunityLinks] = useState<CommunityFamilyLink[]>([])
  const [proposalQueue, setProposalQueue] = useState<KinshipProposal[]>([])
  const [researchPreview, setResearchPreview] = useState<CommunityResearchResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCommunity() {
      setLoading(true)
      setGraphSummary(null)
      setGraphSummaryError(null)
      setResearchPreview(null)

      try {
        const res = await getCommunities()
        const match = res.data.find(community => community.slug === communitySlug)

        if (!match) {
          if (!cancelled) {
            setDetail(null)
            setResearchPreview(null)
          }
          return
        }

        const [nextDetail, nextGraph] = await Promise.all([
          getCommunity(match.id),
          getCommunityKinship(match.id).catch(error => {
            if (!cancelled) {
              setGraphSummaryError(error instanceof Error ? error.message : 'Failed to load community tree summary')
            }
            return null
          }),
        ])

        const nextResearch =
          match.slug === 'palm-island'
            ? await getCommunityResearch(match.id).catch(() => null)
            : null

        if (!cancelled) {
          setDetail(nextDetail)
          setResearchPreview(nextResearch)
          if (nextGraph) {
            setGraphSummary({
              mode: nextGraph.mode,
              note: nextGraph.note || null,
              nodeCount: nextGraph.nodes.length,
              edgeCount: nextGraph.edges.length,
            })
          }
        }
      } catch {
        if (!cancelled) {
          setDetail(null)
          setResearchPreview(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCommunity()

    return () => {
      cancelled = true
    }
  }, [communitySlug, familySession?.sessionToken])

  const currentCommunityRole = useMemo(() => {
    if (!detail || !familySession) return null

    const governanceMembers = detail.keepers || detail.members

    return governanceMembers.find(
      member => member.storytellerId === familySession.member.storytellerId
    )?.role || null
  }, [detail, familySession])

  const canReviewCommunityKinship = currentCommunityRole === 'elder'
  const canReviewCommunityLinks =
    currentCommunityRole === 'elder' || currentCommunityRole === 'community_admin'

  useEffect(() => {
    let cancelled = false

    async function loadGovernance() {
      if (!detail || (!canReviewCommunityKinship && !canReviewCommunityLinks)) {
        setCommunityLinks([])
        setProposalQueue([])
        setGovernanceError(null)
        setGovernanceLoading(false)
        return
      }

      setGovernanceLoading(true)
      setGovernanceError(null)

      try {
        const [linksResult, proposalsResult] = await Promise.all([
          canReviewCommunityLinks
            ? getCommunityFamilyLinks(detail.community.id, { status: 'all' })
            : Promise.resolve({ links: [] as CommunityFamilyLink[] }),
          canReviewCommunityKinship
            ? getKinshipProposals({ status: 'pending', limit: 200 })
            : Promise.resolve({ proposals: [] as KinshipProposal[] }),
        ])

        if (cancelled) return

        setCommunityLinks(linksResult.links)
        setProposalQueue(proposalsResult.proposals)
      } catch (err) {
        if (cancelled) return
        setGovernanceError(err instanceof Error ? err.message : 'Failed to load community governance queue')
      } finally {
        if (!cancelled) setGovernanceLoading(false)
      }
    }

    loadGovernance()

    return () => {
      cancelled = true
    }
  }, [detail, canReviewCommunityKinship, canReviewCommunityLinks])

  const pendingCommunityLinks = useMemo(() => (
    communityLinks.filter(link => link.status === 'pending' && !link.communityApprovedAt)
  ), [communityLinks])

  const pendingCommunityKinship = useMemo(() => {
    if (!detail) return []

    return proposalQueue.filter(proposal =>
      proposal.reviewScope === 'community'
      && proposal.reviewStatus === 'pending'
      && proposal.targetCommunityId === detail.community.id
      && proposal.requiredFamilyFolderIds.every(familyFolderId =>
        proposal.approvedFamilyFolderIds.includes(familyFolderId)
      )
      && !proposal.communityApproved
    )
  }, [detail, proposalQueue])

  const spotlightFamilies = useMemo(() => {
    if (!detail) return []

    return [...detail.families]
      .sort((a, b) => b.memberCount - a.memberCount || a.name.localeCompare(b.name))
      .slice(0, 4)
  }, [detail])

  const stewardMembers = useMemo(() => {
    if (!detail) return []

    const governanceMembers = detail.keepers || detail.members

    return [...governanceMembers]
      .sort((a, b) => {
        if (a.role !== b.role) {
          if (a.role === 'elder') return -1
          if (b.role === 'elder') return 1
        }
        if (a.isElder !== b.isElder) return a.isElder ? -1 : 1
        return a.displayName.localeCompare(b.displayName)
      })
  }, [detail])

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink/50">Loading...</div>
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

  const base = `/c/${detail.community.slug}`
  const governanceRoleLabel = currentCommunityRole?.replace('_', ' ') || null
  const communityPulseCount = pendingCommunityKinship.length + pendingCommunityLinks.length
  const graphModeLabel = graphSummary?.mode === 'legacy_family_graph' ? 'Linked family graph' : 'Governed overlay'

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-3 w-3 rounded-full bg-eucalypt" />
          <span className="text-xs uppercase tracking-widest text-eucalypt font-medium">Community</span>
        </div>
        <h1 className="font-serif text-4xl text-ink leading-tight">{detail.community.name}</h1>
        {detail.community.traditionalName && (
          <h2 className="font-serif text-2xl text-ink/50 mt-1">{detail.community.traditionalName}</h2>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-ink/60">
          {detail.community.location && <span>{detail.community.location}</span>}
          {detail.community.region && <span className="text-ink/30">·</span>}
          {detail.community.region && <span>{detail.community.region}</span>}
        </div>
        {governanceRoleLabel && (
          <p className="text-sm text-ink/55 mt-3">
            You are participating in this community as <span className="text-eucalypt font-medium">{governanceRoleLabel}</span>.
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Linked families" value={detail.stats.familyCount} />
        <StatCard label="Linked lineage people" value={detail.stats.totalPeople} />
        <StatCard label="Community stewards" value={detail.stats.adminCount} />
        <StatCard label="Status" value="Active" />
      </div>

      {researchPreview?.available && researchPreview.clusters.length > 0 && (
        <section className="rounded-[28px] border border-ink/10 bg-cream/80 p-5 md:p-6 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-widest text-eucalypt">Palm family research</div>
              <h2 className="font-serif text-3xl text-ink mt-3">Research leads now visible in 10 Years</h2>
              <p className="text-sm text-ink/60 leading-relaxed mt-3">
                These family names come from the Palm research loops. They are deep-read packets from transcripts and the wider Palm corpus,
                not approved family truth yet.
              </p>
            </div>
            <Link
              to={`${base}/research`}
              className="inline-flex items-center rounded-full border border-ink/12 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
            >
              Open research reader
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {researchPreview.clusters.slice(0, 3).map(cluster => (
              <div key={cluster.id} className="rounded-2xl border border-ink/8 bg-sand/20 p-4">
                <div className="text-xs uppercase tracking-widest text-ochre">Research packet</div>
                <h3 className="font-serif text-2xl text-ink mt-3">{cluster.label}</h3>
                <div className="text-xs text-ink/45 mt-2">
                  {cluster.anchorElders.length} anchor elders · {cluster.transcriptHits.length} transcript hits · {cluster.repoHits.length} corpus hits
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {cluster.coreSurnames.slice(0, 4).map(item => (
                    <span key={`${cluster.id}-${item.surname}`} className="rounded-full bg-cream px-3 py-1 text-xs text-ink/60">
                      {item.surname}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mb-10">
        <CrossAppGuideCard
          title="Community editing stays in Empathy Ledger. Community visibility and approvals stay here."
          description="Use Empathy Ledger to edit the underlying storyteller and story record. Use this community space to read the linked lineage layer, approve community visibility, and hold community governance."
          editingItems={[
            'Edit source stories, storyteller profiles, transcript evidence, and media in Empathy Ledger.',
            'Use Empathy Ledger when community truth still needs identity cleanup or evidence review before publishing into the map.',
          ]}
          engagementItems={[
            'Use 10 Years for community overview, linked families, shared tree, timeline, goals, and community governance.',
            'Community elders and admins approve what becomes community-visible here.',
          ]}
        />
      </div>

      <section className="mb-10 rounded-2xl border border-ink/10 bg-cream/80 p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-eucalypt">Community pulse</div>
            <h2 className="font-serif text-2xl text-ink mt-2">What is live in this community layer</h2>
            <p className="text-sm text-ink/60 mt-2 leading-relaxed">
              {detail.community.name} currently holds {detail.stats.familyCount} linked {detail.stats.familyCount === 1 ? 'family' : 'families'},
              {' '}{detail.stats.totalPeople} lineage people across those families, and {detail.stats.adminCount} community
              {' '} {detail.stats.adminCount === 1 ? 'steward' : 'stewards'} carrying governance.
            </p>
            {detail.meta && (
              <p className="text-xs text-ink/50 mt-3 leading-relaxed">
                Linked people come from active family lineage. Community keepers are the elders and admins who govern what becomes community-visible.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 lg:min-w-[28rem]">
            <PulseTile
              value={detail.stats.familyCount}
              label={detail.stats.familyCount === 1 ? 'linked family' : 'linked families'}
              tone="eucalypt"
            />
            <PulseTile
              value={detail.stats.familyCount}
              label={detail.stats.familyCount === 1 ? 'active family link' : 'active family links'}
              tone="ochre"
            />
            <PulseTile
              value={communityPulseCount}
              label={communityPulseCount === 1 ? 'item needs review' : 'items need review'}
              tone={communityPulseCount > 0 ? 'desert' : 'ink'}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 mt-6 pt-6 border-t border-ink/8">
          <div className="rounded-xl border border-desert/15 bg-desert/[0.05] p-4">
            <div className="text-xs uppercase tracking-widest text-desert">Shared layer status</div>
            {graphSummary ? (
              <div className="space-y-2 mt-3 text-sm text-ink/70">
                <div>
                  {graphSummary.nodeCount} visible lineage people and {graphSummary.edgeCount} visible relations are loading into the
                  community tree right now.
                </div>
                <div>
                  {graphSummary.mode === 'legacy_family_graph'
                    ? 'This is currently being assembled from linked family trees because the final community overlay table is not yet live in the database.'
                    : 'This community is reading from the governed shared overlay, so only approved community-visible kinship is shown.'}
                </div>
              </div>
            ) : detail.stats.familyCount > 0 ? (
              <div className="space-y-2 mt-3 text-sm text-ink/70">
                <div>The community has active family links, so shared structure can begin to emerge here.</div>
                <div>
                  {communityPulseCount > 0
                    ? `${communityPulseCount} governance ${communityPulseCount === 1 ? 'decision is' : 'decisions are'} waiting before more knowledge becomes community-visible.`
                    : 'No governance items are blocked right now.'}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/60 mt-3">
                Governance is present, but the shared family layer has not formed yet. This is still a community shell waiting
                for active family links.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs uppercase tracking-widest text-ink/45">Community tree mode</div>
              <MiniPill tone={graphSummary?.mode === 'legacy_family_graph' ? 'ochre' : 'eucalypt'}>
                {graphSummary ? graphModeLabel : 'Checking tree'}
              </MiniPill>
            </div>
            <div className="space-y-2 mt-3 text-sm text-ink/65">
              {graphSummary?.note ? (
                <div>{graphSummary.note}</div>
              ) : (
                <div>Tree: approved shared kinship across linked families.</div>
              )}
              <div>Families: who is actively linked into this community.</div>
              <div>Governance: community keepers deciding what becomes community-visible.</div>
              {graphSummaryError && <div className="text-ochre">{graphSummaryError}</div>}
            </div>
          </div>
        </div>
      </section>

      {detail.stats.familyCount === 0 && detail.stats.adminCount > 0 && (
        <div className="mb-10 rounded-xl border border-ochre/20 bg-ochre/[0.04] px-5 py-4">
          <div className="text-xs uppercase tracking-widest text-ochre">Shared layer</div>
          <p className="text-sm text-ink/70 mt-2 leading-relaxed">
            This community has governance in place, but no family links are active yet. Family trees still live inside
            their family folders; this community page only fills in once families and community elders approve shared visibility.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-10">
        <Link
          to={`${base}/governance`}
          className="p-6 rounded-xl border border-eucalypt/20 hover:bg-eucalypt/5 transition-colors"
        >
          <h3 className="font-serif text-lg text-ink mb-1">Governance</h3>
          <p className="text-xs text-ink/60">
            Keepers, family link approvals, and community-visible kinship decisions
          </p>
        </Link>
        <Link
          to={`${base}/tree`}
          className="p-6 rounded-xl border border-ochre/20 hover:bg-ochre/5 transition-colors"
        >
          <h3 className="font-serif text-lg text-ink mb-1">Community tree</h3>
          <p className="text-xs text-ink/60">
            {graphSummary
              ? `${graphSummary.nodeCount} people and ${graphSummary.edgeCount} relations visible in ${graphModeLabel.toLowerCase()}`
              : `Approved shared kinship across linked families in ${detail.community.name}`}
          </p>
        </Link>
        <Link
          to={`${base}/families`}
          className="p-6 rounded-xl border border-eucalypt/20 hover:bg-eucalypt/5 transition-colors"
        >
          <h3 className="font-serif text-lg text-ink mb-1">Families</h3>
          <p className="text-xs text-ink/60">
            {detail.stats.familyCount} {detail.stats.familyCount === 1 ? 'family' : 'families'} building story together here
          </p>
        </Link>
        <Link
          to={`${base}/timeline`}
          className="p-6 rounded-xl border border-ochre/20 hover:bg-ochre/5 transition-colors"
        >
          <h3 className="font-serif text-lg text-ink mb-1">Community timeline</h3>
          <p className="text-xs text-ink/60">Shared history across linked families in {detail.community.name}</p>
        </Link>
        <Link
          to={`${base}/goals`}
          className="p-6 rounded-xl border border-desert/20 hover:bg-desert/5 transition-colors"
        >
          <h3 className="font-serif text-lg text-ink mb-1">Community goals</h3>
          <p className="text-xs text-ink/60">What the community is working toward together</p>
        </Link>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-10">
        <div className="rounded-2xl border border-ink/10 bg-cream p-5">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-ochre">Community keepers</div>
              <h2 className="font-serif text-2xl text-ink mt-1">Who is holding this layer</h2>
              {detail.meta?.keepersDefinition && (
                <p className="text-sm text-ink/55 mt-2 max-w-xl">
                  {detail.meta.keepersDefinition}
                </p>
              )}
            </div>
            <QueueBadge value={stewardMembers.length} label={stewardMembers.length === 1 ? 'keeper shown' : 'keepers shown'} />
          </div>

          {stewardMembers.length === 0 ? (
            <p className="text-sm text-ink/55">No community steward records are visible yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stewardMembers.map(member => (
                <div key={member.storytellerId} className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                  <div className="flex items-start gap-3">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="" className="h-11 w-11 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-11 w-11 rounded-xl bg-sand flex items-center justify-center text-xs font-medium text-desert shrink-0">
                        {member.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{member.displayName}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <MiniPill tone={member.role === 'elder' ? 'eucalypt' : 'ochre'}>
                          {formatRoleLabel(member.role)}
                        </MiniPill>
                        {member.isElder && member.role !== 'elder' && (
                          <MiniPill tone="eucalypt">elder</MiniPill>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-ink/10 bg-cream p-5">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Linked families</div>
              <h2 className="font-serif text-2xl text-ink mt-1">Families already building here</h2>
              {detail.meta?.totalPeopleDefinition && (
                <p className="text-sm text-ink/55 mt-2 max-w-xl">
                  Linked people counts come from family lineage, not from community governance membership.
                </p>
              )}
            </div>
            <Link to={`${base}/families`} className="text-sm text-ochre hover:underline">
              Open family list
            </Link>
          </div>

          {spotlightFamilies.length === 0 ? (
            <p className="text-sm text-ink/55">
              No families are active in this community yet. Once the first handshake is approved, that family will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {spotlightFamilies.map(family => (
                <div key={family.id} className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{family.name}</div>
                      <div className="text-xs text-ink/50 mt-1">
                        {family.memberCount} {family.memberCount === 1 ? 'lineage person' : 'lineage people'} linked to this community
                      </div>
                    </div>
                    <Link to={`/f/${family.slug}`} className="text-xs text-ochre hover:underline shrink-0">
                      Open family
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-ink/8 bg-sand/20 p-4 mt-4">
            <div className="text-xs uppercase tracking-widest text-ink/45">Next layer to check</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <Link
                to={`${base}/tree`}
                className="rounded-lg border border-ink/8 bg-cream/80 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors"
              >
                Shared tree
              </Link>
              <Link
                to={`${base}/families`}
                className="rounded-lg border border-ink/8 bg-cream/80 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors"
              >
                Family links
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-10">
        <div className="rounded-2xl border border-ink/10 bg-cream p-5">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Governance snapshot</div>
              <h2 className="font-serif text-2xl text-ink mt-1">Keepers and queue at a glance</h2>
            </div>
            {governanceLoading && <div className="text-xs text-ink/40">Refreshing queue…</div>}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="Community keepers" value={detail.stats.adminCount} />
            <StatCard label="Active family links" value={detail.stats.familyCount} />
          </div>

          {canReviewCommunityKinship || canReviewCommunityLinks ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                  <div className="text-xs uppercase tracking-widest text-eucalypt">Family links</div>
                  <div className="font-serif text-2xl text-ink mt-2">{pendingCommunityLinks.length}</div>
                  <div className="text-sm text-ink/60 mt-1">
                    {pendingCommunityLinks.length === 1 ? 'community-side family link is waiting' : 'community-side family links are waiting'}
                  </div>
                </div>
                <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                  <div className="text-xs uppercase tracking-widest text-ochre">Shared kinship</div>
                  <div className="font-serif text-2xl text-ink mt-2">{pendingCommunityKinship.length}</div>
                  <div className="text-sm text-ink/60 mt-1">
                    {canReviewCommunityKinship
                      ? pendingCommunityKinship.length === 1 ? 'elder review is waiting' : 'elder reviews are waiting'
                      : 'elder review is held on the governance page'}
                  </div>
                </div>
              </div>

              <p className="text-sm text-ink/60 mt-4 leading-relaxed">
                The operational queue now lives on the governance page so the overview stays focused on orientation and state.
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4 text-sm text-ink/65 leading-relaxed">
              Community keepers hold this layer. They approve family links and, where required, elder-reviewed kinship before more knowledge becomes community-visible.
            </div>
          )}

          {governanceError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {governanceError}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-ink/10 bg-cream p-5">
          <div className="text-xs uppercase tracking-widest text-ochre">Where to work from</div>
          <h2 className="font-serif text-2xl text-ink mt-2">Choose the right community layer</h2>
          <div className="space-y-3 text-sm text-ink/65 mt-4">
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              <div className="font-medium text-ink">Governance</div>
              <div className="mt-1">Keepers, approvals, and what becomes community-visible.</div>
            </div>
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              <div className="font-medium text-ink">Families</div>
              <div className="mt-1">Which families are linked into this community layer.</div>
            </div>
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              <div className="font-medium text-ink">Tree</div>
              <div className="mt-1">The shared lineage layer that governance makes visible.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <Link
              to={`${base}/governance`}
              className="rounded-lg border border-eucalypt/15 bg-eucalypt/[0.05] px-4 py-3 text-sm text-ink hover:bg-eucalypt/[0.08] transition-colors"
            >
              Open governance
            </Link>
            <Link
              to={`${base}/families`}
              className="rounded-lg border border-ink/8 bg-cream/80 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors"
            >
              Open families
            </Link>
            <Link
              to={`${base}/tree`}
              className="rounded-lg border border-ink/8 bg-cream/80 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors"
            >
              Open tree
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-eucalypt/5 border border-eucalypt/15 rounded-xl p-6 md:p-8">
        <h3 className="font-serif text-xl text-ink mb-3">About this community</h3>
        <p className="text-ink/70 leading-relaxed">
          {detail.community.name} brings together linked family folders while keeping family truth governed by each family.
          The community layer only carries what families approve upward and what community elders approve as shared knowledge.
        </p>
        {detail.stats.familyCount === 0 && (
          <div className="mt-4 p-4 bg-sand/40 rounded-lg">
            <p className="text-sm text-ink/60">
              No families have joined this community yet. If your family belongs here, create a family folder and request a link.
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

function PulseTile({
  value,
  label,
  tone,
}: {
  value: number | string
  label: string
  tone: 'eucalypt' | 'ochre' | 'desert' | 'ink'
}) {
  const tones = {
    eucalypt: 'border-eucalypt/15 bg-eucalypt/[0.05] text-eucalypt',
    ochre: 'border-ochre/15 bg-ochre/[0.05] text-ochre',
    desert: 'border-desert/15 bg-desert/[0.05] text-desert',
    ink: 'border-ink/8 bg-sand/20 text-ink',
  }

  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <div className="font-serif text-2xl tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-widest mt-1 text-ink/55">{label}</div>
    </div>
  )
}

function QueueBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-full bg-sand/40 px-3 py-1 text-xs text-ink/60">
      <span className="font-medium text-ink">{value}</span> {label}
    </div>
  )
}

function MiniPill({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'ochre' | 'eucalypt'
}) {
  const tones = {
    ochre: 'bg-ochre/10 text-ochre',
    eucalypt: 'bg-eucalypt/10 text-eucalypt',
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  )
}

function formatRoleLabel(role: string) {
  return role.replace('_', ' ')
}

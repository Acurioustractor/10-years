import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import { useSession } from '@/contexts/SessionContext'
import {
  getCommunities,
  getCommunity,
  getCommunityFamilyLinks,
  getKinshipProposals,
  reviewCommunityFamilyLink,
  reviewKinshipProposal,
} from '@/services/empathyLedgerClient'
import type { CommunityFamilyLink, KinshipProposal } from '@/services/types'

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

export default function CommunityGovernancePage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const { familySession } = useSession()
  const [detail, setDetail] = useState<CommunityDetail | null>(null)
  const [communityLinks, setCommunityLinks] = useState<CommunityFamilyLink[]>([])
  const [proposalQueue, setProposalQueue] = useState<KinshipProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [governanceLoading, setGovernanceLoading] = useState(false)
  const [governanceError, setGovernanceError] = useState<string | null>(null)
  const [activeProposalActionId, setActiveProposalActionId] = useState<string | null>(null)
  const [activeLinkActionId, setActiveLinkActionId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCommunity() {
      setLoading(true)

      try {
        const res = await getCommunities()
        const match = res.data.find(community => community.slug === communitySlug)

        if (!match) {
          if (!cancelled) setDetail(null)
          return
        }

        const nextDetail = await getCommunity(match.id)
        if (!cancelled) setDetail(nextDetail)
      } catch {
        if (!cancelled) setDetail(null)
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

  const stewardMembers = useMemo(() => {
    if (!detail) return []

    const governanceMembers = detail.keepers || detail.members

    return [...governanceMembers]
      .sort((a, b) => {
        if (a.role !== b.role) {
          if (a.role === 'elder') return -1
          if (b.role === 'elder') return 1
          if (a.role === 'community_admin') return -1
          if (b.role === 'community_admin') return 1
        }
        if (a.isElder !== b.isElder) return a.isElder ? -1 : 1
        return a.displayName.localeCompare(b.displayName)
      })
  }, [detail])

  const pendingCommunityLinks = useMemo(() => (
    communityLinks.filter(link => link.status === 'pending' && !link.communityApprovedAt)
  ), [communityLinks])

  const activeCommunityLinks = useMemo(() => (
    communityLinks.filter(link => link.status === 'active')
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

  const refreshCommunityDetail = async () => {
    if (!detail) return
    const nextDetail = await getCommunity(detail.community.id)
    setDetail(nextDetail)
  }

  const refreshGovernance = async () => {
    if (!detail) return

    const [linksResult, proposalsResult] = await Promise.all([
      canReviewCommunityLinks
        ? getCommunityFamilyLinks(detail.community.id, { status: 'all' })
        : Promise.resolve({ links: [] as CommunityFamilyLink[] }),
      canReviewCommunityKinship
        ? getKinshipProposals({ status: 'pending', limit: 200 })
        : Promise.resolve({ proposals: [] as KinshipProposal[] }),
    ])

    setCommunityLinks(linksResult.links)
    setProposalQueue(proposalsResult.proposals)
  }

  const handleCommunityLinkDecision = async (
    link: CommunityFamilyLink,
    decision: 'approve' | 'reject'
  ) => {
    setGovernanceError(null)
    setActiveLinkActionId(link.id)

    try {
      await reviewCommunityFamilyLink(link.communityId, link.id, decision)
      await Promise.all([refreshCommunityDetail(), refreshGovernance()])
    } catch (err) {
      setGovernanceError(err instanceof Error ? err.message : 'Failed to review community-family link')
    } finally {
      setActiveLinkActionId(null)
    }
  }

  const handleProposalDecision = async (
    proposalId: string,
    decision: 'approve' | 'reject'
  ) => {
    setGovernanceError(null)
    setActiveProposalActionId(proposalId)

    try {
      await reviewKinshipProposal(proposalId, decision)
      await refreshGovernance()
    } catch (err) {
      setGovernanceError(err instanceof Error ? err.message : 'Failed to review community kinship proposal')
    } finally {
      setActiveProposalActionId(null)
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink/50">Loading…</div>
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

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-eucalypt">Community governance</div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink mt-2">Keepers, approvals, and shared visibility</h1>
        <p className="text-ink/60 mt-2 max-w-3xl">
          This page holds the governance layer for {detail.community.name}. Families govern family truth; community keepers govern what becomes community-visible.
        </p>
        {governanceRoleLabel && (
          <p className="text-sm text-ink/55 mt-3">
            You are participating here as <span className="text-eucalypt font-medium">{governanceRoleLabel}</span>.
          </p>
        )}
      </header>

      <div className="mb-8">
        <CrossAppGuideCard
          title="Edit source evidence there. Hold community visibility here."
          description="Community governance in 10 Years should stay focused on shared-layer decisions. Transcript evidence, story editing, storyteller cleanup, and source media remain in Empathy Ledger."
          editingItems={[
            'Story text, transcript evidence, storyteller identity cleanup, and photos belong in Empathy Ledger.',
            'Palm review and family-start evidence work should be resolved there before the community tree changes here.',
          ]}
          engagementItems={[
            'Approve linked families into the community layer here.',
            'Approve community-visible kinship here after family-side review is complete.',
          ]}
          ledgerPath="/admin"
          ledgerLabel="Open Empathy Ledger admin"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Community keepers" value={stewardMembers.length} />
        <StatCard label="Active family links" value={detail.stats.familyCount} />
        <StatCard label="Family link reviews" value={canReviewCommunityLinks ? pendingCommunityLinks.length : '—'} />
        <StatCard label="Kinship reviews" value={canReviewCommunityKinship ? pendingCommunityKinship.length : '—'} />
      </div>

      <section className="rounded-2xl border border-ink/10 bg-cream/80 p-5 md:p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-ochre">Governance model</div>
            <h2 className="font-serif text-2xl text-ink mt-2">What community keepers actually govern</h2>
            <div className="space-y-2 mt-3 text-sm text-ink/65">
              <div>Keepers: elders and admins holding the community governance layer.</div>
              <div>Family links: the handshake that lets a family participate in the community layer.</div>
              <div>Shared kinship: what families and elders approve upward into community visibility.</div>
            </div>
            {detail.meta?.keepersDefinition && (
              <p className="text-xs text-ink/45 mt-4 leading-relaxed">
                {detail.meta.keepersDefinition}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={base}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
            >
              Community overview
            </Link>
            <Link
              to={`${base}/families`}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
            >
              Family links
            </Link>
          </div>
        </div>

        {!canReviewCommunityLinks && !canReviewCommunityKinship && (
          <div className="mt-6 rounded-xl border border-ochre/20 bg-ochre/[0.05] px-4 py-4 text-sm text-ink/70">
            Only community elders can approve shared kinship, and only community elders or community admins can approve family links.
            Sign in through a family folder that is represented in this community if you need to act on the queue.
          </div>
        )}
      </section>

      {governanceError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {governanceError}
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-8">
        <div className="rounded-2xl border border-ink/10 bg-cream p-5">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Community keepers</div>
              <h2 className="font-serif text-2xl text-ink mt-1">Who is holding this layer</h2>
            </div>
            <QueueBadge value={stewardMembers.length} label={stewardMembers.length === 1 ? 'keeper shown' : 'keepers shown'} />
          </div>

          {stewardMembers.length === 0 ? (
            <p className="text-sm text-ink/55">No community keeper records are visible yet.</p>
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
              <div className="text-xs uppercase tracking-widest text-ochre">Shared layer readiness</div>
              <h2 className="font-serif text-2xl text-ink mt-1">How much is already active</h2>
            </div>
            <QueueBadge value={detail.stats.familyCount} label={detail.stats.familyCount === 1 ? 'active family link' : 'active family links'} />
          </div>

          <div className="space-y-3 text-sm text-ink/65">
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              {detail.stats.familyCount} active {detail.stats.familyCount === 1 ? 'family link is' : 'family links are'} feeding the community layer right now.
            </div>
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              {detail.stats.totalPeople} lineage {detail.stats.totalPeople === 1 ? 'person is' : 'people are'} represented through those linked families.
            </div>
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              Shared kinship still only becomes community-visible after family approvals and, where required, elder approval here.
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 mb-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-serif text-2xl text-ink">Governance queue</h2>
            <p className="text-sm text-ink/60 mt-1">
              Community elders govern what becomes community-visible. Community admins and elders approve family links.
            </p>
          </div>
          {governanceLoading && <div className="text-xs text-ink/40">Refreshing queue…</div>}
        </div>

        <div className="rounded-xl border border-ink/10 bg-cream p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Family link handshakes</div>
              <h3 className="font-serif text-xl text-ink">Community-side approvals</h3>
            </div>
            <QueueBadge
              value={canReviewCommunityLinks ? pendingCommunityLinks.length : activeCommunityLinks.length}
              label={canReviewCommunityLinks ? 'awaiting community' : 'active links'}
            />
          </div>

          {!canReviewCommunityLinks ? (
            <p className="text-sm text-ink/55">
              Family link approvals are visible to community admins and elders. You can still open the family list to see which handshakes are already active.
            </p>
          ) : communityLinks.length === 0 ? (
            <p className="text-sm text-ink/50">No families have requested or established community links yet.</p>
          ) : (
            <div className="space-y-3">
              {communityLinks.map(link => (
                <div key={link.id} className="rounded-lg border border-ink/8 bg-sand/20 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-medium text-ink">
                        <Link to={`/f/${link.familySlug}`} className="hover:text-ochre transition-colors">
                          {link.familyName}
                        </Link>
                      </div>
                      <div className="text-xs text-ink/50 mt-1">
                        Requested from the {link.requestedBySide} side
                        {link.requestedByStorytellerName ? ` by ${link.requestedByStorytellerName}` : ''}.
                      </div>
                    </div>
                    <StatusPill tone={link.status === 'active' ? 'eucalypt' : link.status === 'pending' ? 'ochre' : 'desert'}>
                      {link.status}
                    </StatusPill>
                  </div>
                  <div className="mt-3 text-xs text-ink/60 space-y-1">
                    <div>Family approval: {link.familyApprovedAt ? formatShortDate(link.familyApprovedAt) : 'Pending'}</div>
                    <div>Community approval: {link.communityApprovedAt ? formatShortDate(link.communityApprovedAt) : 'Pending'}</div>
                    {link.decisionNotes && <div>Notes: {link.decisionNotes}</div>}
                  </div>
                  {link.status === 'pending' && !link.communityApprovedAt && (
                    <div className="mt-4 flex gap-3">
                      <ActionButton
                        tone="eucalypt"
                        disabled={activeLinkActionId === link.id}
                        onClick={() => handleCommunityLinkDecision(link, 'approve')}
                      >
                        {activeLinkActionId === link.id ? 'Saving…' : 'Approve'}
                      </ActionButton>
                      <ActionButton
                        tone="desert"
                        disabled={activeLinkActionId === link.id}
                        onClick={() => handleCommunityLinkDecision(link, 'reject')}
                      >
                        Reject
                      </ActionButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-ink/10 bg-cream p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-ochre">Shared kinship</div>
              <h3 className="font-serif text-xl text-ink">Ready for elder review</h3>
            </div>
            <QueueBadge
              value={canReviewCommunityKinship ? pendingCommunityKinship.length : 0}
              label={canReviewCommunityKinship ? 'awaiting elder' : 'elder access required'}
            />
          </div>

          {!canReviewCommunityKinship ? (
            <p className="text-sm text-ink/55">
              Only community elders can approve kinship into the shared community layer.
            </p>
          ) : pendingCommunityKinship.length === 0 ? (
            <p className="text-sm text-ink/50">No kinship proposals are ready for community elder review right now.</p>
          ) : (
            <div className="space-y-3">
              {pendingCommunityKinship.map(proposal => (
                <div key={proposal.id} className="rounded-lg border border-ink/8 bg-sand/20 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {proposal.fromStorytellerName} → {proposal.toStorytellerName}
                      </div>
                      <div className="text-xs text-ink/50 mt-1">{proposal.relationType} shared into {detail.community.name}</div>
                    </div>
                    <StatusPill tone="eucalypt">family approvals complete</StatusPill>
                  </div>
                  <div className="mt-3 text-xs text-ink/60 space-y-1">
                    <div>
                      Family approvals: {proposal.approvedFamilyFolderIds.length} / {proposal.requiredFamilyFolderIds.length}
                    </div>
                    <div>Requested by {proposal.requestedByStorytellerName || 'Unknown'}.</div>
                    {proposal.notes && <div>Notes: {proposal.notes}</div>}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <ActionButton
                      tone="eucalypt"
                      disabled={activeProposalActionId === proposal.id}
                      onClick={() => handleProposalDecision(proposal.id, 'approve')}
                    >
                      {activeProposalActionId === proposal.id ? 'Saving…' : 'Approve'}
                    </ActionButton>
                    <ActionButton
                      tone="desert"
                      disabled={activeProposalActionId === proposal.id}
                      onClick={() => handleProposalDecision(proposal.id, 'reject')}
                    >
                      Reject
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
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

function QueueBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-full bg-sand/40 px-3 py-1 text-xs text-ink/60">
      <span className="font-medium text-ink">{value}</span> {label}
    </div>
  )
}

function MiniPill({
  tone,
  children,
}: {
  tone: 'ochre' | 'eucalypt'
  children: React.ReactNode
}) {
  const tones = {
    ochre: 'bg-ochre/[0.08] text-ochre',
    eucalypt: 'bg-eucalypt/[0.08] text-eucalypt',
  } as const

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${tones[tone]}`}>
      {children}
    </span>
  )
}

function StatusPill({
  tone,
  children,
}: {
  tone: 'eucalypt' | 'ochre' | 'desert'
  children: React.ReactNode
}) {
  const tones = {
    eucalypt: 'bg-eucalypt/[0.08] text-eucalypt',
    ochre: 'bg-ochre/[0.08] text-ochre',
    desert: 'bg-desert/[0.08] text-desert',
  } as const

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${tones[tone]}`}>
      {children}
    </span>
  )
}

function ActionButton({
  tone,
  disabled,
  onClick,
  children,
}: {
  tone: 'eucalypt' | 'desert'
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  const tones = {
    eucalypt: 'bg-eucalypt text-cream hover:bg-eucalypt/90',
    desert: 'bg-desert text-cream hover:bg-desert/90',
  } as const

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

function formatRoleLabel(role: string) {
  if (role === 'community_admin') return 'Community admin'
  if (role === 'family_rep') return 'Family rep'
  return role.replace('_', ' ')
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

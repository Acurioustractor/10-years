import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import { useSession } from '@/contexts/SessionContext'
import {
  getFamilyFolder,
  getKinshipProposals,
  reviewCommunityFamilyLink,
  reviewKinshipProposal,
} from '@/services/empathyLedgerClient'
import type { CommunityFamilyLink, KinshipProposal } from '@/services/types'

interface FolderDetail {
  folder: { id: string; name: string; slug: string; location: string | null }
  members: Array<{
    id: string
    storytellerId: string
    displayName: string
    avatarUrl: string | null
    isElder: boolean
    isAncestor: boolean
    role: string
    joinedAt: string
  }>
  communityLinks: CommunityFamilyLink[]
  stats: { memberCount: number; eventCount: number; kinshipEdgeCount: number }
}

export default function FamilyGovernancePage() {
  const { familySession } = useSession()
  const [detail, setDetail] = useState<FolderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [proposalQueue, setProposalQueue] = useState<KinshipProposal[]>([])
  const [governanceLoading, setGovernanceLoading] = useState(true)
  const [governanceError, setGovernanceError] = useState<string | null>(null)
  const [activeProposalActionId, setActiveProposalActionId] = useState<string | null>(null)
  const [activeLinkActionId, setActiveLinkActionId] = useState<string | null>(null)

  useEffect(() => {
    if (!familySession) {
      setLoading(false)
      return
    }

    getFamilyFolder(familySession.folder.id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [familySession])

  useEffect(() => {
    if (!familySession) {
      setGovernanceLoading(false)
      return
    }

    setGovernanceLoading(true)
    setGovernanceError(null)

    getKinshipProposals({ status: 'pending', limit: 200 })
      .then(result => setProposalQueue(result.proposals))
      .catch(err => setGovernanceError(err instanceof Error ? err.message : 'Failed to load governance queue'))
      .finally(() => setGovernanceLoading(false))
  }, [familySession])

  const role = familySession?.member.role || 'viewer'
  const canReviewFamilyKinship = role === 'elder'
  const canReviewFamilyLinks = role === 'elder' || role === 'family_rep'
  const canManage = canReviewFamilyKinship || canReviewFamilyLinks

  const pendingFamilyKinship = useMemo(() => {
    if (!familySession) return []

    return proposalQueue.filter(proposal =>
      proposal.reviewStatus === 'pending'
      && proposal.requiredFamilyFolderIds.includes(familySession.folder.id)
      && !proposal.approvedFamilyFolderIds.includes(familySession.folder.id)
    )
  }, [familySession, proposalQueue])

  const familyCommunityLinks = detail?.communityLinks || []
  const pendingFamilyCommunityLinks = familyCommunityLinks.filter(
    link => link.status === 'pending' && !link.familyApprovedAt
  )
  const activeCommunityLinks = familyCommunityLinks.filter(link => link.status === 'active')
  const familyKeepers = (detail?.members || []).filter(member => member.role === 'elder' || member.role === 'family_rep')

  const refreshFamilyDetail = async () => {
    if (!familySession) return
    const nextDetail = await getFamilyFolder(familySession.folder.id)
    setDetail(nextDetail)
  }

  const refreshProposalQueue = async () => {
    const nextQueue = await getKinshipProposals({ status: 'pending', limit: 200 })
    setProposalQueue(nextQueue.proposals)
  }

  const handleProposalDecision = async (proposalId: string, decision: 'approve' | 'reject') => {
    setGovernanceError(null)
    setActiveProposalActionId(proposalId)
    try {
      await reviewKinshipProposal(proposalId, decision)
      await refreshProposalQueue()
    } catch (err) {
      setGovernanceError(err instanceof Error ? err.message : 'Failed to review kinship proposal')
    } finally {
      setActiveProposalActionId(null)
    }
  }

  const handleCommunityLinkDecision = async (link: CommunityFamilyLink, decision: 'approve' | 'reject') => {
    setGovernanceError(null)
    setActiveLinkActionId(link.id)
    try {
      await reviewCommunityFamilyLink(link.communityId, link.id, decision)
      await refreshFamilyDetail()
    } catch (err) {
      setGovernanceError(err instanceof Error ? err.message : 'Failed to review community link')
    } finally {
      setActiveLinkActionId(null)
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink/50">Loading family governance…</div>
  }

  if (!detail) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink mb-2">Family not found</h1>
        <p className="text-ink/60">This family folder could not be loaded.</p>
        <Link to="/join" className="text-sm text-ochre mt-4 inline-block">Go to Join page</Link>
      </div>
    )
  }

  const base = `/f/${detail.folder.slug}`

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ochre">Family governance</div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink mt-2">Approvals, community links, and family truth</h1>
        <p className="text-ink/60 mt-2 max-w-3xl">
          This page holds the decision layer for {detail.folder.name}. Family elders approve family truth. Family reps and elders can approve community link handshakes.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Family keepers" value={familyKeepers.length} />
        <StatCard label="Active communities" value={activeCommunityLinks.length} />
        <StatCard label="Kinship reviews" value={canReviewFamilyKinship ? pendingFamilyKinship.length : '—'} />
        <StatCard label="Link reviews" value={canReviewFamilyLinks ? pendingFamilyCommunityLinks.length : '—'} />
      </div>

      <section className="rounded-2xl border border-ink/10 bg-cream/80 p-5 md:p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-eucalypt">Governance model</div>
            <h2 className="font-serif text-2xl text-ink mt-2">What belongs in family governance</h2>
            <div className="space-y-2 mt-3 text-sm text-ink/65">
              <div>Family truth: elders approve kinship and lineage decisions inside the family.</div>
              <div>Community handshakes: family reps and elders approve whether the family joins a community layer.</div>
              <div>Access and workspace roles: handled separately in family settings.</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={base}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
            >
              Family home
            </Link>
            <Link
              to={`${base}/settings`}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
            >
              Access settings
            </Link>
          </div>
        </div>

        {!canManage && (
          <div className="mt-6 rounded-xl border border-ochre/20 bg-ochre/[0.05] px-4 py-4 text-sm text-ink/70">
            Only family elders can approve kinship, and only family elders or family reps can approve community link requests.
          </div>
        )}
      </section>

      <div className="mb-8">
        <CrossAppGuideCard
          title="Edit source stories there. Approve family truth here."
          description="Family governance in 10 Years should stay focused on lineage decisions and community handshakes. Story editing, transcripts, storyteller records, and photos still belong in Empathy Ledger."
          editingItems={[
            'Transcripts, story text, storyteller profile changes, and media belong in Empathy Ledger.',
            'Identity cleanup and evidence notes should be reviewed there before they become family truth.',
          ]}
          engagementItems={[
            'Approve kinship and lineage changes here as family truth.',
            'Approve or reject community link requests here before this family moves into a shared community layer.',
          ]}
          ledgerPath="/admin"
          ledgerLabel="Open Empathy Ledger admin"
        />
      </div>

      {governanceError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {governanceError}
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-8">
        <div className="rounded-2xl border border-ink/10 bg-cream p-5">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Family keepers</div>
              <h2 className="font-serif text-2xl text-ink mt-1">Who can hold decisions here</h2>
            </div>
            <QueueBadge value={familyKeepers.length} label={familyKeepers.length === 1 ? 'keeper shown' : 'keepers shown'} />
          </div>

          {familyKeepers.length === 0 ? (
            <p className="text-sm text-ink/55">No family keeper roles are visible yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {familyKeepers.map(member => (
                <div key={member.storytellerId} className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                  <div className="text-sm font-medium text-ink">{member.displayName}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <MiniPill tone={member.role === 'elder' ? 'eucalypt' : 'ochre'}>
                      {formatRoleLabel(member.role)}
                    </MiniPill>
                    {member.isElder && member.role !== 'elder' && (
                      <MiniPill tone="eucalypt">elder</MiniPill>
                    )}
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
              <h2 className="font-serif text-2xl text-ink mt-1">What is already active</h2>
            </div>
            <QueueBadge value={activeCommunityLinks.length} label={activeCommunityLinks.length === 1 ? 'active community' : 'active communities'} />
          </div>

          <div className="space-y-3 text-sm text-ink/65">
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              {detail.stats.memberCount} lineage {detail.stats.memberCount === 1 ? 'person is' : 'people are'} currently visible in the family layer.
            </div>
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              {activeCommunityLinks.length} active {activeCommunityLinks.length === 1 ? 'community link is' : 'community links are'} already carrying this family upward.
            </div>
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              Pending decisions stay here until the family approves or rejects them.
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 mb-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-serif text-2xl text-ink">Governance queue</h2>
            <p className="text-sm text-ink/60 mt-1">
              Family elders approve kinship inside the family. Family reps and elders approve community link requests.
            </p>
          </div>
          {governanceLoading && <div className="text-xs text-ink/40">Refreshing queue…</div>}
        </div>

        <div className="rounded-xl border border-ink/10 bg-cream p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-ochre">Kinship review</div>
              <h3 className="font-serif text-xl text-ink">Pending family approvals</h3>
            </div>
            <QueueBadge
              value={canReviewFamilyKinship ? pendingFamilyKinship.length : 0}
              label={canReviewFamilyKinship ? 'awaiting this family' : 'elder access required'}
            />
          </div>

          {!canReviewFamilyKinship ? (
            <p className="text-sm text-ink/55">
              Only family elders can approve kinship into the family truth layer.
            </p>
          ) : pendingFamilyKinship.length === 0 ? (
            <p className="text-sm text-ink/50">No kinship proposals are waiting on this family right now.</p>
          ) : (
            <div className="space-y-3">
              {pendingFamilyKinship.map(proposal => (
                <div key={proposal.id} className="rounded-lg border border-ink/8 bg-sand/20 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {proposal.fromStorytellerName} → {proposal.toStorytellerName}
                      </div>
                      <div className="text-xs text-ink/50 mt-1">
                        {proposal.relationType} · {proposal.reviewScope === 'community' ? 'shared to community' : 'family only'}
                      </div>
                    </div>
                    <StatusPill tone={proposal.reviewScope === 'community' ? 'eucalypt' : 'ochre'}>
                      {proposal.reviewScope}
                    </StatusPill>
                  </div>
                  <div className="mt-3 text-xs text-ink/60 space-y-1">
                    <div>Requested by {proposal.requestedByStorytellerName || 'Unknown'}.</div>
                    <div>
                      Family approvals: {proposal.approvedFamilyFolderIds.length} / {proposal.requiredFamilyFolderIds.length}
                    </div>
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

        <div className="rounded-xl border border-ink/10 bg-cream p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Community links</div>
              <h3 className="font-serif text-xl text-ink">Family-side approvals</h3>
            </div>
            <QueueBadge
              value={canReviewFamilyLinks ? pendingFamilyCommunityLinks.length : activeCommunityLinks.length}
              label={canReviewFamilyLinks ? 'awaiting this family' : 'active links'}
            />
          </div>

          {!canReviewFamilyLinks ? (
            <p className="text-sm text-ink/55">
              Family reps and elders can approve community link requests for this family.
            </p>
          ) : familyCommunityLinks.length === 0 ? (
            <p className="text-sm text-ink/50">This family has no community links yet.</p>
          ) : (
            <div className="space-y-3">
              {familyCommunityLinks.map(link => (
                <div key={link.id} className="rounded-lg border border-ink/8 bg-sand/20 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-medium text-ink">
                        <Link to={`/c/${link.communitySlug}`} className="hover:text-ochre transition-colors">
                          {link.communityName}
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
                  {link.status === 'pending' && !link.familyApprovedAt && (
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

function ActionButton({
  children,
  disabled,
  onClick,
  tone,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
  tone: 'eucalypt' | 'desert'
}) {
  const tones = {
    eucalypt: 'bg-eucalypt text-cream hover:bg-eucalypt/90',
    desert: 'bg-desert text-cream hover:bg-desert/90',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
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

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatRoleLabel(role: string) {
  return role.replace('_', ' ')
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import ClusterShowcase from './ClusterShowcase'
import { CLUSTER_CONFIGS } from '@/cluster-configs'
import { useSession } from '@/contexts/SessionContext'
import {
  getFamilyFolder,
  getKinshipProposals,
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
    bio?: string | null
    birthYear?: number | null
    deathYear?: number | null
    birthPlace?: string | null
    location?: string | null
    culturalBackground?: string[]
    tags?: string[]
    historicalSources?: unknown
  }>
  communityLinks: CommunityFamilyLink[]
  stats: { memberCount: number; eventCount: number; kinshipEdgeCount: number }
}

export default function FamilyHomePage() {
  const { familySession } = useSession()
  const { familySlug: routeSlug } = useParams<{ familySlug: string }>()
  // URL takes precedence so cross-cluster navigation works; session slug is fallback.
  const slug = routeSlug || familySession?.folder.slug
  if (slug && CLUSTER_CONFIGS[slug]) {
    return <ClusterShowcase config={CLUSTER_CONFIGS[slug]} />
  }
  const [detail, setDetail] = useState<FolderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [proposalQueue, setProposalQueue] = useState<KinshipProposal[]>([])
  const [governanceLoading, setGovernanceLoading] = useState(true)
  const [governanceError, setGovernanceError] = useState<string | null>(null)

  useEffect(() => {
    if (!familySession) { setLoading(false); return }
    getFamilyFolder(familySession.folder.id)
      .then(setDetail)
      .catch(() => {})
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

  const folderName = familySession?.folder.name || 'Family folder'
  const memberName = familySession?.member.displayName || ''
  const role = familySession?.member.role || 'viewer'
  const location = familySession?.folder.location || ''

  const elders = detail?.members.filter(m => m.isElder || m.role === 'elder') || []
  const familyKeepers = detail?.members.filter(m => m.role === 'elder' || m.role === 'family_rep') || []
  const living = detail?.members.filter(m => !m.isAncestor) || []
  const ancestors = detail?.members.filter(m => m.isAncestor) || []
  const canReviewFamilyKinship = role === 'elder'
  const canReviewFamilyLinks = role === 'elder' || role === 'family_rep'

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
  const pendingCommunityLinks = familyCommunityLinks.filter(link => link.status === 'pending')
  const attentionCount = pendingFamilyKinship.length + pendingFamilyCommunityLinks.length

  const featuredMembers = useMemo(() => {
    if (!detail) return []

    return [...detail.members]
      .sort((a, b) => {
        if (a.isElder !== b.isElder) return a.isElder ? -1 : 1
        if (a.isAncestor !== b.isAncestor) return a.isAncestor ? 1 : -1
        return a.displayName.localeCompare(b.displayName)
      })
      .slice(0, 8)
  }, [detail])

  const newestMembers = useMemo(() => {
    if (!detail) return []

    return [...detail.members]
      .filter(member => !member.isAncestor)
      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
      .slice(0, 3)
  }, [detail])

  // Lead elder for hero — first non-ancestor with a bio + photo, fallback to first elder
  const leadElder = useMemo(() => {
    if (!detail) return null
    const eldersWithBio = detail.members.filter(m => m.isElder && m.bio && m.avatarUrl)
    if (eldersWithBio.length > 0) return eldersWithBio[0]
    const eldersWithPhoto = detail.members.filter(m => m.isElder && m.avatarUrl)
    if (eldersWithPhoto.length > 0) return eldersWithPhoto[0]
    return detail.members.find(m => m.isElder) || null
  }, [detail])

  const otherElders = useMemo(() => {
    if (!detail || !leadElder) return []
    return detail.members.filter(m => m.isElder && m.storytellerId !== leadElder.storytellerId)
  }, [detail, leadElder])

  const ancestorList = useMemo(() => {
    if (!detail) return []
    return detail.members.filter(m => m.isAncestor)
  }, [detail])

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* HERO — name + lead elder portrait + bio */}
      <header className="mb-10">
        <div className="text-xs uppercase tracking-[0.18em] text-ochre mb-2">{location || 'Family folder'}</div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight">{folderName}</h1>
        {memberName && (
          <p className="text-ink/55 mt-3 text-sm">
            Welcome, {memberName}. Signed in as <span className="text-ochre font-medium">{role}</span>.
          </p>
        )}
      </header>

      {leadElder && (
        <section className="mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-cream via-sand/20 to-ochre/[0.06] border border-ink/8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-0">
            <div className="relative bg-ink/5">
              {leadElder.avatarUrl ? (
                <img
                  src={leadElder.avatarUrl}
                  alt={leadElder.displayName}
                  className="w-full h-full object-cover aspect-square md:aspect-auto md:min-h-[420px]"
                />
              ) : (
                <div className="aspect-square md:min-h-[420px] flex items-center justify-center font-serif text-6xl text-ochre/30">
                  {leadElder.displayName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
              )}
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="text-xs uppercase tracking-[0.18em] text-eucalypt mb-3">
                {leadElder.isElder ? 'Elder' : leadElder.isAncestor ? 'Ancestor' : 'Family'}
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-ink leading-tight">{leadElder.displayName}</h2>
              {(leadElder.birthYear || leadElder.deathYear) && (
                <div className="text-sm text-ink/50 mt-1">
                  {leadElder.birthYear ?? '?'}{leadElder.deathYear ? `–${leadElder.deathYear}` : ''}
                </div>
              )}
              {Array.isArray(leadElder.culturalBackground) && leadElder.culturalBackground.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {leadElder.culturalBackground.map(cb => (
                    <span key={cb} className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-eucalypt/10 text-eucalypt">{cb}</span>
                  ))}
                </div>
              )}
              {leadElder.bio && (
                <p className="font-serif text-ink/85 text-lg leading-relaxed mt-5">{leadElder.bio.length > 360 ? leadElder.bio.slice(0, 360) + '…' : leadElder.bio}</p>
              )}
              {(leadElder.location || leadElder.birthPlace) && (
                <p className="text-sm text-ink/50 mt-4">{leadElder.location || leadElder.birthPlace}</p>
              )}
              <Link to={`person/${leadElder.storytellerId}`} className="inline-block mt-6 text-sm text-ochre hover:text-ink transition-colors font-medium">
                Open full profile →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Other elders — voices in this family */}
      {otherElders.length > 0 && (
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-2xl text-ink">Voices in this family</h2>
            <Link to="tree" className="text-sm text-ochre hover:text-ink">See the family tree →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {otherElders.map(m => (
              <Link key={m.storytellerId} to={`person/${m.storytellerId}`} className="group rounded-2xl bg-cream border border-ink/8 overflow-hidden hover:border-ochre/30 transition-colors">
                <div className="flex gap-4 p-5">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt={m.displayName} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-sand flex items-center justify-center font-serif text-2xl text-ochre/40 shrink-0">
                      {m.displayName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-xl text-ink leading-tight group-hover:text-ochre transition-colors">{m.displayName}</div>
                    {(m.birthYear || m.deathYear) && (
                      <div className="text-xs text-ink/45 mt-0.5">{m.birthYear ?? '?'}{m.deathYear ? `–${m.deathYear}` : ''}</div>
                    )}
                    {Array.isArray(m.culturalBackground) && m.culturalBackground.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {m.culturalBackground.slice(0, 3).map(cb => (
                          <span key={cb} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-eucalypt/10 text-eucalypt">{cb}</span>
                        ))}
                      </div>
                    )}
                    {m.bio && <p className="text-sm text-ink/65 mt-2.5 leading-relaxed line-clamp-3">{m.bio}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Ancestors strip */}
      {ancestorList.length > 0 && (
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-2xl text-ink">Ancestors carried in this family</h2>
            <Link to="tree" className="text-sm text-ochre hover:text-ink">Open the lineage →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ancestorList.map(a => (
              <Link key={a.storytellerId} to={`person/${a.storytellerId}`} className="group rounded-2xl border border-desert/15 bg-desert/[0.04] p-5 hover:bg-desert/[0.07] transition-colors">
                <div className="text-[10px] uppercase tracking-[0.18em] text-desert mb-2">Ancestor</div>
                <div className="font-serif text-xl text-ink leading-tight">{a.displayName}</div>
                {(a.birthYear || a.deathYear) && (
                  <div className="text-xs text-ink/50 mt-1">{a.birthYear ?? '?'}{a.deathYear ? `–${a.deathYear}` : ''}</div>
                )}
                {a.birthPlace && <div className="text-xs text-ink/50 mt-0.5 italic">{a.birthPlace}</div>}
                {a.bio && <p className="text-sm text-ink/70 mt-3 leading-relaxed line-clamp-4">{a.bio}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Continue the spine — clear single CTAs to other surfaces */}
      <section className="mb-16 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="tree" className="group rounded-2xl border border-ink/8 bg-cream p-6 hover:border-ochre/40 transition-colors text-center">
            <div className="font-serif text-2xl text-ink mb-1 group-hover:text-ochre transition-colors">Family tree</div>
            <div className="text-sm text-ink/55">See how everyone connects</div>
          </Link>
          <Link to="timeline" className="group rounded-2xl border border-ink/8 bg-cream p-6 hover:border-ochre/40 transition-colors text-center">
            <div className="font-serif text-2xl text-ink mb-1 group-hover:text-ochre transition-colors">Timeline</div>
            <div className="text-sm text-ink/55">From 1885 to today</div>
          </Link>
          <Link to="goals" className="group rounded-2xl border border-ink/8 bg-cream p-6 hover:border-ochre/40 transition-colors text-center">
            <div className="font-serif text-2xl text-ink mb-1 group-hover:text-ochre transition-colors">Dreams</div>
            <div className="text-sm text-ink/55">What the family is working toward</div>
          </Link>
        </div>
      </section>

      {/* Behind the scenes — collapsed by default. Hides governance/admin/stats noise. */}
      {detail && (
        <details className="mb-12 max-w-3xl mx-auto group">
          <summary className="cursor-pointer list-none flex items-center justify-between py-4 border-t border-ink/10 hover:border-ink/20 transition-colors">
            <span className="text-xs uppercase tracking-[0.18em] text-ink/45 group-open:text-ochre">Behind the scenes</span>
            <span className="text-xs text-ink/40 group-open:text-ochre">↓</span>
          </summary>
          <div className="pt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Lineage people" value={detail.stats.memberCount} />
              <StatCard label="Living" value={living.length} />
              <StatCard label="Ancestors" value={ancestors.length} />
              <StatCard label="Events" value={detail.stats.eventCount} />
            </div>
            {(canReviewFamilyKinship || canReviewFamilyLinks) && (
              <div className="rounded-xl border border-ochre/15 bg-ochre/[0.04] p-4 text-sm text-ink/70">
                {attentionCount > 0
                  ? `${attentionCount} ${attentionCount === 1 ? 'item needs' : 'items need'} attention. Open the governance page to review.`
                  : 'Nothing is blocked right now. The family folder is clear to keep building.'}
                <div className="mt-3 flex gap-3 text-xs">
                  <Link to="governance" className="text-ochre hover:text-ink">Open governance →</Link>
                  <Link to="settings" className="text-ink/55 hover:text-ink">Settings</Link>
                </div>
              </div>
            )}
            {familyCommunityLinks.length > 0 && (
              <div className="text-sm text-ink/60">
                Linked to {familyCommunityLinks.length} {familyCommunityLinks.length === 1 ? 'community' : 'communities'}.
                <Link to={`/c/${familyCommunityLinks[0].communitySlug}`} className="ml-2 text-ochre hover:text-ink">Open community view →</Link>
              </div>
            )}
            <p className="text-xs text-ink/40 leading-relaxed">
              Family editing stays in Empathy Ledger. Family engagement stays here. This space is for navigating lineage, holding approvals, and living inside the family story.
            </p>
          </div>
        </details>
      )}

      {/* Hidden everything below — magazine-style focus */}
      <div className="hidden">


      {detail && (
        <section className="mb-8 rounded-2xl border border-ink/10 bg-cream/80 p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-widest text-eucalypt">Family pulse</div>
              <h2 className="font-serif text-2xl text-ink mt-2">What is live in this family folder</h2>
              <p className="text-sm text-ink/60 mt-2 leading-relaxed">
                This family currently holds {detail.stats.memberCount} lineage people, {detail.stats.eventCount} timeline events,
                and {familyCommunityLinks.length} community {familyCommunityLinks.length === 1 ? 'connection' : 'connections'}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 lg:min-w-[28rem]">
              <PulseTile
                value={activeCommunityLinks.length}
                label={activeCommunityLinks.length === 1 ? 'active community' : 'active communities'}
                tone="eucalypt"
              />
              <PulseTile
                value={pendingCommunityLinks.length}
                label={pendingCommunityLinks.length === 1 ? 'pending link' : 'pending links'}
                tone="ochre"
              />
              <PulseTile
                value={attentionCount}
                label={attentionCount === 1 ? 'item needs attention' : 'items need attention'}
                tone={attentionCount > 0 ? 'desert' : 'ink'}
              />
            </div>
          </div>

          {(attentionCount > 0 || newestMembers.length > 0) && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 mt-6 pt-6 border-t border-ink/8">
              <div className="rounded-xl border border-desert/15 bg-desert/[0.05] p-4">
                <div className="text-xs uppercase tracking-widest text-desert">Needs attention</div>
                {attentionCount > 0 ? (
                  <div className="space-y-2 mt-3 text-sm text-ink/70">
                    {pendingFamilyKinship.length > 0 && (
                      <div>{pendingFamilyKinship.length} kinship {pendingFamilyKinship.length === 1 ? 'proposal is' : 'proposals are'} waiting on this family.</div>
                    )}
                    {pendingFamilyCommunityLinks.length > 0 && (
                      <div>{pendingFamilyCommunityLinks.length} community {pendingFamilyCommunityLinks.length === 1 ? 'link is' : 'links are'} waiting on family-side approval.</div>
                    )}
                    {!canReviewFamilyKinship && !canReviewFamilyLinks && (
                      <div className="text-xs text-ink/55">
                        You can see the family state here, but only elders or family reps can approve the pending items.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ink/55 mt-3">Nothing is blocked right now. The family folder is clear to keep building.</p>
                )}
              </div>

              <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                <div className="text-xs uppercase tracking-widest text-ink/45">Recently visible people</div>
                {newestMembers.length > 0 ? (
                  <div className="space-y-3 mt-3">
                    {newestMembers.map(member => (
                      <Link
                        key={member.storytellerId}
                        to={`person/${member.storytellerId}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-cream/75 px-3 py-2 hover:bg-cream transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-ink truncate">{member.displayName}</div>
                          <div className="text-xs text-ink/45">{formatRoleLabel(member.role)}</div>
                        </div>
                        <div className="text-[11px] text-ink/40 shrink-0">{formatShortDate(member.joinedAt)}</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink/55 mt-3">No recent additions are visible in this folder yet.</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="mb-8">
        <CrossAppGuideCard
          title="Family editing stays in Empathy Ledger. Family engagement stays here."
          description="Use Empathy Ledger to edit transcript-backed source material and storyteller records. Use this family space to navigate lineage, hold approvals, and live inside the family story."
          editingItems={[
            'Edit transcripts, story chapters, storyteller profiles, and photos in Empathy Ledger.',
            'Use Empathy Ledger when the family needs to correct source evidence before it becomes family truth.',
          ]}
          engagementItems={[
            'Use 10 Years for the family tree, timeline, goals, and family governance approvals.',
            'Use family settings for folder access and governance roles, not for kinship editing.',
          ]}
        />
      </div>

      {/* Quick links */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${canReviewFamilyKinship || canReviewFamilyLinks ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-10`}>
        {(canReviewFamilyKinship || canReviewFamilyLinks) && (
          <QuickLink to="governance" label="Governance" description="Approvals, community links, and family truth" color="desert" />
        )}
        <QuickLink to="tree" label="Family tree" description="See how everyone connects" color="desert" />
        <QuickLink to="timeline" label="Timeline" description="Century of family history" color="ochre" />
        <QuickLink to="story" label="Read the story" description="Scrollytelling chapters" color="eucalypt" />
        <QuickLink to="goals" label="Goals & dreams" description="What the family is working toward" color="eucalypt" />
      </div>

      {detail && (
        <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-10">
          <div className="rounded-2xl border border-ink/10 bg-cream p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-widest text-eucalypt">Community connections</div>
                <h2 className="font-serif text-2xl text-ink mt-1">Where this family is linked</h2>
              </div>
              <QueueBadge value={familyCommunityLinks.length} label={familyCommunityLinks.length === 1 ? 'community link' : 'community links'} />
            </div>

            {familyCommunityLinks.length === 0 ? (
              <p className="text-sm text-ink/55 mt-4">
                This family is not linked into any community layer yet. Once a family and community both approve a link,
                the shared community pages will start to reflect that connection.
              </p>
            ) : (
              <div className="space-y-3 mt-4">
                {familyCommunityLinks.map(link => (
                  <div key={link.id} className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <Link to={`/c/${link.communitySlug}`} className="font-medium text-ink hover:text-ochre transition-colors">
                          {link.communityName}
                        </Link>
                        <div className="text-xs text-ink/45 mt-1">
                          {link.communityLocation || 'Community location not listed'}
                        </div>
                      </div>
                      <StatusPill tone={link.status === 'active' ? 'eucalypt' : link.status === 'pending' ? 'ochre' : 'desert'}>
                        {link.status}
                      </StatusPill>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs text-ink/60">
                      <div className="rounded-lg bg-cream/80 px-3 py-2">
                        Family approval: {link.familyApprovedAt ? formatShortDate(link.familyApprovedAt) : 'Pending'}
                      </div>
                      <div className="rounded-lg bg-cream/80 px-3 py-2">
                        Community approval: {link.communityApprovedAt ? formatShortDate(link.communityApprovedAt) : 'Pending'}
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-ink/55">
                      Requested from the {link.requestedBySide} side
                      {link.requestedByStorytellerName ? ` by ${link.requestedByStorytellerName}` : ''}.
                    </div>

                    {link.decisionNotes && (
                      <div className="mt-2 text-xs text-ink/55">Notes: {link.decisionNotes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-ink/10 bg-cream p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-widest text-ochre">Family people</div>
                <h2 className="font-serif text-2xl text-ink mt-1">Who is carrying this story</h2>
              </div>
              <QueueBadge value={featuredMembers.length} label={featuredMembers.length === 1 ? 'profile shown' : 'profiles shown'} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {featuredMembers.map(member => (
                <Link
                  key={member.storytellerId}
                  to={`person/${member.storytellerId}`}
                  className="rounded-xl border border-ink/8 bg-sand/15 p-4 hover:bg-sand/25 transition-colors"
                >
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
                      <div className="text-xs text-ink/45 mt-1">{formatRoleLabel(member.role)}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {member.isElder && <MiniPill tone="eucalypt">elder</MiniPill>}
                        {member.isAncestor && <MiniPill tone="desert">ancestor</MiniPill>}
                        {!member.isAncestor && !member.isElder && <MiniPill tone="ochre">living</MiniPill>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-10">
        <div className="rounded-2xl border border-ink/10 bg-cream p-5">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Governance snapshot</div>
              <h2 className="font-serif text-2xl text-ink mt-1">Family decisions at a glance</h2>
            </div>
            {governanceLoading && <div className="text-xs text-ink/40">Refreshing queue…</div>}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="Active communities" value={activeCommunityLinks.length} />
            <StatCard label="Family keepers" value={familyKeepers.length} />
          </div>

          {(canReviewFamilyKinship || canReviewFamilyLinks) ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                  <div className="text-xs uppercase tracking-widest text-ochre">Kinship review</div>
                  <div className="font-serif text-2xl text-ink mt-2">{pendingFamilyKinship.length}</div>
                  <div className="text-sm text-ink/60 mt-1">
                    {pendingFamilyKinship.length === 1 ? 'family truth decision is waiting' : 'family truth decisions are waiting'}
                  </div>
                </div>
                <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                  <div className="text-xs uppercase tracking-widest text-eucalypt">Community links</div>
                  <div className="font-serif text-2xl text-ink mt-2">{pendingFamilyCommunityLinks.length}</div>
                  <div className="text-sm text-ink/60 mt-1">
                    {pendingFamilyCommunityLinks.length === 1 ? 'community handshake is waiting' : 'community handshakes are waiting'}
                  </div>
                </div>
              </div>

              <p className="text-sm text-ink/60 mt-4 leading-relaxed">
                The operational approval queue now lives on the governance page so home stays focused on orientation and family state.
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4 text-sm text-ink/65 leading-relaxed">
              Family keepers hold this layer. Elders approve family truth, and family reps or elders approve community link handshakes.
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
          <h2 className="font-serif text-2xl text-ink mt-2">Choose the right family layer</h2>
          <div className="space-y-3 text-sm text-ink/65 mt-4">
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              <div className="font-medium text-ink">Governance</div>
              <div className="mt-1">Approvals, community handshakes, and family truth decisions.</div>
            </div>
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              <div className="font-medium text-ink">Tree</div>
              <div className="mt-1">The kinship-connected lineage layer.</div>
            </div>
            <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
              <div className="font-medium text-ink">Settings</div>
              <div className="mt-1">Folder access, workspace roles, and who can enter the family space.</div>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${canReviewFamilyKinship || canReviewFamilyLinks ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 mt-5`}>
            {(canReviewFamilyKinship || canReviewFamilyLinks) && (
              <Link
                to="governance"
                className="rounded-lg border border-ochre/15 bg-ochre/[0.05] px-4 py-3 text-sm text-ink hover:bg-ochre/[0.08] transition-colors"
              >
                Open governance
              </Link>
            )}
            <Link
              to="tree"
              className="rounded-lg border border-ink/8 bg-cream/80 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors"
            >
              Open tree
            </Link>
            <Link
              to="settings"
              className="rounded-lg border border-ink/8 bg-cream/80 px-4 py-3 text-sm text-ink hover:bg-cream transition-colors"
            >
              Open settings
            </Link>
          </div>
        </div>
      </section>

      {/* Elders */}
      {elders.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-ink/50 mb-3 pb-2 border-b border-ink/5">Elders</h2>
          <div className="flex flex-wrap gap-3">
            {elders.map(e => (
              <Link
                key={e.storytellerId}
                to={`person/${e.storytellerId}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-ochre/20 bg-ochre/5 hover:bg-ochre/10 transition-colors"
              >
                {e.avatarUrl ? (
                  <img src={e.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-sand flex items-center justify-center text-xs font-medium text-desert">
                    {e.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-ink">{e.displayName}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ochre">Elder</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      </div>

      {/* Access code reminder for elders — quiet, at the very bottom */}
      {(role === 'elder' || role === 'family_rep') && (
        <div className="max-w-3xl mx-auto mt-12 pt-6 border-t border-ink/8 text-xs text-ink/50">
          <span className="text-ochre">Family code:</span> share to invite more family →{' '}
          <Link to="/join" className="text-ochre hover:text-ink">Join page</Link>
        </div>
      )}

      {loading && <div className="py-10 text-center text-ink/50">Loading family data…</div>}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
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
  value: number
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

function QuickLink({ to, label, description, color }: { to: string; label: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    desert: 'border-desert/20 hover:bg-desert/5',
    ochre: 'border-ochre/20 hover:bg-ochre/5',
    eucalypt: 'border-eucalypt/20 hover:bg-eucalypt/5',
  }
  return (
    <Link to={to} className={`block p-5 rounded-xl border ${colorMap[color]} transition-colors`}>
      <h3 className="font-serif text-lg text-ink">{label}</h3>
      <p className="text-xs text-ink/60 mt-1">{description}</p>
    </Link>
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

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function MiniPill({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'ochre' | 'eucalypt' | 'desert'
}) {
  const tones = {
    ochre: 'bg-ochre/10 text-ochre',
    eucalypt: 'bg-eucalypt/10 text-eucalypt',
    desert: 'bg-desert/10 text-desert',
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

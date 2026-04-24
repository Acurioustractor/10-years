import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import {
  buildLedgerPalmReviewUrl,
  buildLedgerStorytellerEditUrl,
  buildLedgerStorytellerTranscriptsUrl,
  buildLedgerTranscriptAdminUrl,
  getCommunities,
  getCommunityResearch,
  getCommunityResearchClaims,
  getCommunityResearchDecisionWorksheets,
  getCommunityResearchOnlineSourceIntake,
  getCommunityResearchPeopleQueue,
} from '@/services/empathyLedgerClient'
import type {
  CommunityFamilyClaim,
  CommunityFamilyClaimRegisterResponse,
  CommunityResearchDecisionWorksheetsResponse,
  CommunityResearchLead,
  CommunityResearchOnlineSourceIntakeResponse,
  CommunityResearchPeopleQueueResponse,
  CommunityResearchQueuedPerson,
  CommunityResearchResponse,
} from '@/services/types'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream/80 px-4 py-5 text-center">
      <div className="font-serif text-3xl text-ink leading-none">{value}</div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink/45">{label}</div>
    </div>
  )
}

function LedgerLinkPill({
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
          ? 'inline-flex items-center rounded-full bg-eucalypt px-3 py-1.5 text-xs font-medium text-white'
          : 'inline-flex items-center rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs text-ink/65'
      }
    >
      {label}
    </a>
  )
}

function stageLabel(stage: 'start_here' | 'history' | 'governance' | 'family-history') {
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

function personLeadKindLabel(kind: CommunityResearchLead['personLeads'][number]['leadKind']) {
  switch (kind) {
    case 'anchor_elder':
      return 'Anchor elder'
    case 'storyteller_match':
      return 'Storyteller match'
    case 'named_relation':
      return 'Named relation'
    default:
      return kind
  }
}

function personLeadConfidenceLabel(confidence: CommunityResearchLead['personLeads'][number]['confidence']) {
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

function personLeadConfidenceClass(confidence: CommunityResearchLead['personLeads'][number]['confidence']) {
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

function claimTypeLabel(claim: CommunityFamilyClaim) {
  if (claim.claimType === 'identity') return 'Identity'
  if (claim.claimType === 'relation') return 'Relationship'
  if (claim.claimType === 'public_source') return 'Public source'
  return claim.claimType
}

function claimStatusClass(status: string) {
  switch (status) {
    case 'unreviewed':
      return 'bg-ochre text-white'
    case 'reviewed':
    case 'approved':
      return 'bg-eucalypt text-white'
    default:
      return 'border border-ink/10 bg-white/80 text-ink/55'
  }
}

function reviewDecisionLabel(decision: string) {
  switch (decision) {
    case 'same_existing_research_person':
      return 'Same existing research person'
    case 'new_relevant_research_person':
      return 'New relevant research person'
    case 'same_surname_only':
      return 'Same surname only'
    case 'exclude_from_packet':
      return 'Excluded from packet'
    case 'needs_more_source_review':
      return 'Needs more source review'
    default:
      return decision.replace(/_/g, ' ')
  }
}

function reviewDecisionClass(decision: string) {
  switch (decision) {
    case 'same_existing_research_person':
    case 'new_relevant_research_person':
      return 'bg-eucalypt text-white'
    case 'exclude_from_packet':
      return 'border border-ink/15 bg-ink/10 text-ink/70'
    case 'same_surname_only':
      return 'border border-ochre/20 bg-ochre/10 text-ochre'
    case 'needs_more_source_review':
    default:
      return 'bg-ochre text-white'
  }
}

function relationScopeLabel(scope: string) {
  switch (scope) {
    case 'indirect_context':
      return 'indirect relation'
    case 'direct_self_described':
      return 'self-described'
    case 'contextual_relation':
      return 'contextual relation'
    case 'direct_review_needed':
      return 'direct review'
    default:
      return scope.replace(/_/g, ' ')
  }
}

function queuedPersonRoleLabel(role: CommunityResearchQueuedPerson['role']) {
  switch (role) {
    case 'anchor_storyteller':
      return 'Anchor storyteller'
    case 'named_relative':
      return 'Named relative'
    case 'unresolved_bridge_person':
      return 'Bridge lead'
    case 'research_person':
      return 'Research person'
    case 'public_source_name_lead':
      return 'Public source name lead'
    default:
      return role.replace(/_/g, ' ')
  }
}

function queuedPersonStageLabel(stage: string) {
  switch (stage) {
    case 'needs_identity_before_person_record':
      return 'Hold as bridge lead'
    case 'needs_identity_review':
      return 'Resolve identity'
    case 'ready_for_family_review':
      return 'Ready for family review'
    case 'research_queue_added':
      return 'Added to research queue'
    case 'needs_identity_and_family_relevance_review':
      return 'Review public name'
    default:
      return stage.replace(/_/g, ' ')
  }
}

function queuedPersonStageClass(stage: string) {
  switch (stage) {
    case 'ready_for_family_review':
      return 'bg-eucalypt text-white'
    case 'needs_identity_review':
      return 'bg-ochre text-white'
    case 'needs_identity_before_person_record':
      return 'border border-ochre/20 bg-ochre/10 text-ochre'
    case 'needs_identity_and_family_relevance_review':
      return 'bg-ochre text-white'
    default:
      return 'border border-ink/10 bg-white/80 text-ink/55'
  }
}

function queuedClaimSummary(claim: CommunityResearchQueuedPerson['claimRefs'][number]) {
  if (claim.relationshipType && claim.objectName) {
    return `${claim.subjectName} -> ${claim.relationshipType.replace(/_/g, ' ')} -> ${claim.objectName}`
  }

  return [
    claim.subjectName,
    claim.claimType.replace(/_/g, ' '),
    claim.place,
    claim.dateOrDateRange,
  ].filter(Boolean).join(' · ')
}

function onlineClaimMatchLabel(status: string) {
  switch (status) {
    case 'matches_existing_research_person':
      return 'matches research person'
    case 'new_public_name_lead':
      return 'new public name lead'
    case 'packet_source_pathway':
      return 'source pathway'
    case 'needs_identity_triage':
      return 'needs identity triage'
    default:
      return status.replace(/_/g, ' ')
  }
}

function onlineClaimMatchClass(status: string) {
  switch (status) {
    case 'matches_existing_research_person':
      return 'bg-eucalypt text-white'
    case 'new_public_name_lead':
      return 'bg-ochre text-white'
    case 'packet_source_pathway':
      return 'border border-ink/10 bg-white/80 text-ink/55'
    default:
      return 'border border-ochre/20 bg-ochre/10 text-ochre'
  }
}

type ClaimTypeFilter = 'all' | 'identity' | 'relation' | 'public_source'

function claimMatchesSearch(claim: CommunityFamilyClaim, search: string) {
  if (!search.trim()) return true

  const query = search.toLowerCase()
  const haystack = [
    claim.subjectName,
    claim.relationshipType,
    claim.objectName,
    claim.claimText,
    claim.clusterLabel,
    claim.sourceTitle,
    claim.storytellerName,
    claim.excerpt,
    claim.reviewQuestion,
  ].filter(Boolean).join(' ').toLowerCase()

  return haystack.includes(query)
}

function claimTypeMatches(claim: CommunityFamilyClaim, type: ClaimTypeFilter) {
  if (type === 'all') return true
  return claim.claimType === type
}

function matchesCluster(cluster: CommunityResearchLead, search: string) {
  if (!search) return true
  const haystack = [
    cluster.label,
    ...cluster.coreSurnames.map(item => item.surname),
    ...cluster.anchorElders.map(item => item.displayName),
    ...cluster.matchingStorytellers.map(item => item.displayName),
    ...cluster.relationLeads.map(item => item.name),
    ...cluster.personLeads.map(item => item.name),
    ...cluster.personLeads.flatMap(item => item.sourcePackets),
    ...cluster.personLeads.flatMap(item => item.relationLabels),
  ].join(' ').toLowerCase()
  return haystack.includes(search.toLowerCase())
}

export default function CommunityResearchPage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const [data, setData] = useState<CommunityResearchResponse | null>(null)
  const [claimsData, setClaimsData] = useState<CommunityFamilyClaimRegisterResponse | null>(null)
  const [peopleQueueData, setPeopleQueueData] = useState<CommunityResearchPeopleQueueResponse | null>(null)
  const [decisionWorksheetData, setDecisionWorksheetData] = useState<CommunityResearchDecisionWorksheetsResponse | null>(null)
  const [onlineSourceIntakeData, setOnlineSourceIntakeData] = useState<CommunityResearchOnlineSourceIntakeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [claimSearch, setClaimSearch] = useState('')
  const [claimType, setClaimType] = useState<ClaimTypeFilter>('relation')
  const [claimCluster, setClaimCluster] = useState('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const communities = await getCommunities()
        const match = communities.data.find(item => item.slug === communitySlug)

        if (!match) {
          if (!cancelled) {
            setData(null)
            setClaimsData(null)
            setPeopleQueueData(null)
            setDecisionWorksheetData(null)
            setOnlineSourceIntakeData(null)
          }
          return
        }

        const [research, claims, peopleQueue, decisionWorksheets, onlineSourceIntake] = await Promise.all([
          getCommunityResearch(match.id),
          getCommunityResearchClaims(match.id).catch(() => null),
          getCommunityResearchPeopleQueue(match.id).catch(() => null),
          getCommunityResearchDecisionWorksheets(match.id).catch(() => null),
          getCommunityResearchOnlineSourceIntake(match.id).catch(() => null),
        ])
        if (!cancelled) {
          setData(research)
          setClaimsData(claims)
          setPeopleQueueData(peopleQueue)
          setDecisionWorksheetData(decisionWorksheets)
          setOnlineSourceIntakeData(onlineSourceIntake)
        }
      } catch {
        if (!cancelled) {
          setData(null)
          setClaimsData(null)
          setPeopleQueueData(null)
          setDecisionWorksheetData(null)
          setOnlineSourceIntakeData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [communitySlug])

  const filteredClusters = useMemo(() => (
    (data?.clusters || []).filter(cluster => matchesCluster(cluster, search))
  ), [data, search])
  const claimClusters = claimsData?.clusters.filter(cluster => cluster.claimCount > 0) || []
  const queueClusters = peopleQueueData?.clusters.filter(cluster => cluster.peopleCount > 0) || []
  const firstReviewClusterId = (
    peopleQueueData?.clusters.some(cluster => cluster.id === 'palmer-burns-obah')
      ? 'palmer-burns-obah'
      : queueClusters.find(cluster => cluster.relationClaimCount > 0)?.id
  )
  const firstReviewCluster = queueClusters.find(cluster => cluster.id === firstReviewClusterId) || null
  const firstReviewPeople = peopleQueueData?.people.filter(person => person.clusterId === firstReviewClusterId) || []
  const firstReviewRelationClaims = claimsData?.claims.filter(claim => (
    claim.clusterId === firstReviewClusterId && claim.claimType === 'relation'
  )) || []
  const firstReviewIdentityClaims = claimsData?.claims.filter(claim => (
    claim.clusterId === firstReviewClusterId && claim.claimType === 'identity'
  )) || []
  const firstReviewPublicSourceClaims = claimsData?.claims.filter(claim => (
    claim.clusterId === firstReviewClusterId && claim.claimType === 'public_source'
  )) || []
  const firstReviewBridgeClaims = firstReviewRelationClaims.filter(claim => claim.relationScope === 'indirect_context')
  const firstReviewProposalCandidates = firstReviewRelationClaims.filter(claim => claim.relationScope === 'direct_self_described')
  const firstReviewWorksheet = decisionWorksheetData?.worksheets.find(worksheet => worksheet.familyClusterId === firstReviewClusterId) || null
  const firstReviewFamilyNameLock = firstReviewWorksheet?.familyNameLock || null
  const firstReviewOnlineIntake = onlineSourceIntakeData?.families.find(family => family.familyClusterId === firstReviewClusterId) || null
  const firstReviewSearchTasks = firstReviewOnlineIntake?.sourceCaptureQueue || firstReviewFamilyNameLock?.onlineResearchPlan.searchStrings.map((searchString, index) => ({
    searchId: `fallback-search-${index}`,
    searchString,
    searchUrl: `https://www.google.com/search?q=${encodeURIComponent(searchString)}`,
    status: 'not_started',
    sourceTargets: [],
    captureRule: 'Capture the source descriptor and exact excerpt/page reference before extracting any family claim.',
  })) || []
  const firstReviewDecisionSequence = firstReviewWorksheet?.decisionSequence || [
    {
      step: 1,
      label: 'Lock working family name',
      count: 1,
      action: 'Use the working packet name for deep research only; do not create a family folder or tree label from it.',
    },
    {
      step: 2,
      label: 'Resolve identity',
      count: firstReviewIdentityClaims.length,
      action: 'Aliases and spelling drift before person records.',
    },
    {
      step: 3,
      label: 'Review public-source names',
      count: firstReviewPublicSourceClaims.length,
      action: 'Same person, new relevant person, same-surname-only, or exclude.',
    },
    {
      step: 4,
      label: 'Confirm people',
      count: firstReviewPeople.length,
      action: 'Anchors, named relatives, and non-lineage exclusions.',
    },
    {
      step: 5,
      label: 'Fix bridge leads',
      count: firstReviewBridgeClaims.length,
      action: 'Missing named ancestors/context people first.',
    },
    {
      step: 6,
      label: 'Review relations',
      count: firstReviewRelationClaims.length,
      action: 'Direction, relation type, and cultural context.',
    },
    {
      step: 7,
      label: 'Promote later',
      count: firstReviewProposalCandidates.length,
      action: 'Only reviewed, unambiguous proposal candidates.',
    },
  ]
  const firstReviewBridgeDecision = firstReviewWorksheet?.relationDecisions.find(decision => (
    decision.status === 'blocked_missing_bridge_identity' ||
    decision.promotionPath === 'identify_bridge_person_before_any_proposal'
  )) || null
  const filteredClaims = useMemo(() => (
    (claimsData?.claims || [])
      .filter(claim => (
        claimTypeMatches(claim, claimType) &&
        (claimCluster === 'all' || claim.clusterId === claimCluster) &&
        claimMatchesSearch(claim, claimSearch)
      ))
      .sort((a, b) => {
        const order = { relation: 0, identity: 1, public_source: 2 } as Record<string, number>
        if (a.claimType !== b.claimType) return (order[a.claimType] ?? 9) - (order[b.claimType] ?? 9)
        return 0
      })
  ), [claimsData, claimType, claimCluster, claimSearch])

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-ink/50">Loading...</div>
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink mb-2">Research page not found</h1>
        <p className="text-ink/60">No research surface is available for "{communitySlug}" yet.</p>
        <Link to="/explore" className="text-sm text-ochre mt-4 inline-block">Browse communities</Link>
      </div>
    )
  }

  const base = `/c/${data.community.slug}`

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-3 w-3 rounded-full bg-eucalypt" />
          <span className="text-xs uppercase tracking-widest text-eucalypt font-medium">Family Research</span>
        </div>
        <h1 className="font-serif text-4xl text-ink leading-tight">{data.community.name}</h1>
        {data.community.traditionalName && (
          <h2 className="font-serif text-2xl text-ink/50 mt-1">{data.community.traditionalName}</h2>
        )}
        <p className="text-base text-ink/65 max-w-3xl mt-4 leading-relaxed">
          This page is for deep reading and family discovery. Start with the Palm history and source base, then work down into likely family packets,
          named people, and only then into transcripts as one evidence layer before anything is treated as approved truth.
        </p>
      </header>

      <CrossAppGuideCard
        title="Research first, truth later"
        description="Use this page to read research leads and find likely family groupings. Use Empathy Ledger to edit source transcripts, storyteller records, and Palm review decisions. Use 10 Years only to read the research packets and eventually view the approved family/community surfaces."
        editingItems={[
          'Edit transcripts, storyteller records, and evidence review in Empathy Ledger.',
          'Re-run Palm research loops after major research updates.',
          'Keep ambiguous names and alias decisions in review until they are grounded.',
        ]}
        engagementItems={[
          'Read the Palm source base and grouped family packets inside 10 Years.',
          'Use the Palm community shell to move from research into visible family/community story later.',
          'Treat everything on this page as research leads, not settled family truth.',
        ]}
        ledgerPath="/admin/data-health/palm-tree-review?view=full_operator"
        ledgerLabel="Open Palm Review"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 mb-10">
        <StatCard label="Research families" value={data.counts?.clusters || 0} />
        <StatCard label="Palm transcripts" value={data.counts?.transcripts || 0} />
        <StatCard label="Palm storytellers" value={data.counts?.storytellers || 0} />
        <StatCard label="Corpus items" value={data.counts?.corpusItems || 0} />
      </div>

      <section className="rounded-2xl border border-ochre/20 bg-ochre/5 px-5 py-4 mb-8">
        <div className="text-xs uppercase tracking-widest text-ochre">Research note</div>
        <p className="text-sm text-ink/70 mt-2 leading-relaxed">{data.note}</p>
        {data.generatedAt && (
          <p className="text-xs text-ink/45 mt-3">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        )}
      </section>

      {firstReviewCluster && claimsData && (
        <section className="rounded-[28px] border border-ochre/25 bg-white/80 p-5 md:p-6 mb-8">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-widest text-ochre">First elder review packet</div>
              <h2 className="font-serif text-3xl text-ink mt-3">Start with {firstReviewCluster.label}</h2>
              <p className="text-sm text-ink/65 leading-relaxed mt-3">
                This is the first practical family-building step: stage the people as research people, review each source-backed claim,
                resolve identity drift, then save review decisions before any family folder or kinship proposal is created.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <StatCard label="People" value={firstReviewWorksheet?.counts.peopleDecisions ?? firstReviewPeople.length} />
              <StatCard label="Relations" value={firstReviewWorksheet?.counts.relationDecisions ?? firstReviewRelationClaims.length} />
              <StatCard label="Identity" value={firstReviewWorksheet?.counts.identityDecisions ?? firstReviewIdentityClaims.length} />
              <StatCard label="Public source" value={firstReviewWorksheet?.counts.publicSourceDecisions ?? firstReviewPublicSourceClaims.length} />
              <StatCard label="Bridge leads" value={firstReviewWorksheet?.counts.bridgeBlockers ?? firstReviewPeople.filter(person => person.role === 'unresolved_bridge_person').length} />
            </div>
          </div>

          {firstReviewFamilyNameLock && (
            <div className="rounded-2xl border border-eucalypt/20 bg-eucalypt/5 p-4 mt-7">
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                <div className="max-w-3xl">
                  <div className="text-xs uppercase tracking-widest text-eucalypt">Working family name lock</div>
                  <h3 className="font-serif text-2xl text-ink mt-2">{firstReviewFamilyNameLock.workingFamilyName}</h3>
                  <p className="text-sm text-ink/65 leading-relaxed mt-3">{firstReviewFamilyNameLock.lockedReason}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="rounded-full bg-eucalypt px-3 py-1 text-xs text-white">
                      deep research locked
                    </span>
                    <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
                      {firstReviewFamilyNameLock.truthStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="rounded-full border border-ochre/20 bg-ochre/10 px-3 py-1 text-xs text-ochre">
                      no family folder yet
                    </span>
                    <span className="rounded-full border border-ochre/20 bg-ochre/10 px-3 py-1 text-xs text-ochre">
                      no tree edges yet
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                  <StatCard label="Source refs" value={firstReviewFamilyNameLock.evidenceSummary.sourceRefs.length} />
                  <StatCard label="Aliases" value={firstReviewFamilyNameLock.aliasConflicts.length} />
                  <StatCard label="Searches" value={firstReviewOnlineIntake?.counts.searchTasks ?? firstReviewFamilyNameLock.onlineResearchPlan.searchStrings.length} />
                  <StatCard label="Anchors" value={firstReviewFamilyNameLock.anchorPeople.length} />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-5">
                <div className="rounded-xl border border-ink/8 bg-white/70 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">Surname and alias work</div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {firstReviewFamilyNameLock.surnameVariants.slice(0, 12).map(variant => (
                      <span key={`variant-${variant}`} className="rounded-full bg-cream/80 px-3 py-1 text-xs text-ink/65">
                        {variant}
                      </span>
                    ))}
                  </div>
                  {firstReviewFamilyNameLock.aliasConflicts.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {firstReviewFamilyNameLock.aliasConflicts.slice(0, 3).map(conflict => (
                        <div key={`${conflict.subjectName}-${conflict.objectName}`} className="text-sm text-ink/65">
                          {conflict.subjectName} <span className="text-ink/35">-&gt;</span> {conflict.objectName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-ink/8 bg-white/70 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ochre">Online source intake</div>
                  <div className="space-y-2 mt-3">
                    {firstReviewSearchTasks.slice(0, 5).map(task => (
                      <a
                        key={`search-${task.searchId}`}
                        href={task.searchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg border border-ink/6 bg-cream/65 px-3 py-2 text-sm text-ink/70 hover:border-ochre/40"
                      >
                        {task.searchString}
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-ink/45 leading-relaxed mt-3">
                    {firstReviewOnlineIntake
                      ? firstReviewOnlineIntake.sourceCaptureQueue[0]?.captureRule
                      : 'Capture source title, URL/archive path, exact name spelling, claim, excerpt, and sensitivity note.'}
                  </p>
                </div>
              </div>

              {firstReviewOnlineIntake && (
                <div className="rounded-xl border border-ink/8 bg-white/70 p-3 mt-4">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">Source descriptor before claim</div>
                      <p className="text-sm text-ink/65 leading-relaxed mt-2">
                        Every online result must become a source descriptor before it can become an identity, place, date, name-variant, or relationship lead.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 min-w-[240px]">
                      <StatCard label="Captured sources" value={firstReviewOnlineIntake.counts.capturedSources} />
                      <StatCard label="Captured claims" value={firstReviewOnlineIntake.counts.capturedClaims} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-4">
                    {firstReviewOnlineIntake.capturedSources.length > 0 && (
                      <div className="rounded-lg border border-eucalypt/20 bg-eucalypt/5 p-3 xl:col-span-2">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">Captured public sources</div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-3">
                          {firstReviewOnlineIntake.capturedSources.slice(0, 4).map(source => (
                            <a
                              key={source.sourceId}
                              href={source.urlOrArchivePath}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-ink/6 bg-white/75 p-3 hover:border-eucalypt/30"
                            >
                              <div className="text-sm font-medium text-ink">{source.sourceTitle}</div>
                              <p className="text-xs text-ink/55 leading-relaxed mt-2">{source.verifiedSummary}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="rounded-full bg-cream/80 px-3 py-1 text-xs text-ink/60">
                                  {source.claims.length} claim leads
                                </span>
                                <span className="rounded-full border border-ochre/20 bg-ochre/10 px-3 py-1 text-xs text-ochre">
                                  unreviewed
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {firstReviewOnlineIntake.capturedClaimReviewQueue.length > 0 && (
                      <div className="rounded-lg border border-ochre/20 bg-ochre/5 p-3 xl:col-span-2">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-ochre">Captured claim review queue</div>
                            <p className="text-xs text-ink/55 leading-relaxed mt-2">
                              Public-source claims are matched to research people where possible. New names stay as leads until identity and relevance are reviewed.
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 min-w-[280px]">
                            <StatCard label="Matched" value={firstReviewOnlineIntake.counts.matchedExistingResearchPeople} />
                            <StatCard label="New names" value={firstReviewOnlineIntake.counts.newPublicNameLeads} />
                            <StatCard label="Pathways" value={firstReviewOnlineIntake.counts.sourcePathwayClaims} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-3">
                          {firstReviewOnlineIntake.capturedClaimReviewQueue.slice(0, 6).map(claim => (
                            <div key={claim.reviewId} className="rounded-xl border border-ink/6 bg-white/75 p-3">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className={`rounded-full px-3 py-1 text-xs ${onlineClaimMatchClass(claim.personMatchStatus)}`}>
                                  {onlineClaimMatchLabel(claim.personMatchStatus)}
                                </span>
                                <span className="rounded-full border border-ink/10 bg-cream/80 px-3 py-1 text-xs text-ink/55">
                                  {claim.claimType.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-ink">
                                {claim.subjectName || claim.claimType}
                                {claim.matchedDisplayName && (
                                  <span className="text-ink/45"> -&gt; {claim.matchedDisplayName}</span>
                                )}
                              </div>
                              <div className="text-xs text-ink/45 mt-1">{claim.sourceTitle}</div>
                              <p className="text-xs text-ink/60 leading-relaxed mt-2">{claim.nextAction}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="rounded-lg border border-ink/6 bg-cream/65 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Capture fields</div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {firstReviewOnlineIntake.captureFields.slice(0, 8).map(field => (
                          <span key={`capture-field-${field}`} className="rounded-full bg-white/80 px-3 py-1 text-xs text-ink/60">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-ink/6 bg-cream/65 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Evidence rules</div>
                      <ul className="space-y-1 mt-3">
                        {firstReviewOnlineIntake.evidenceRules.slice(0, 3).map(rule => (
                          <li key={`evidence-rule-${rule}`} className="text-xs text-ink/60 leading-relaxed">{rule}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5 mt-7">
            <div className="rounded-2xl border border-ink/8 bg-cream/75 p-4">
              <div className="text-xs uppercase tracking-widest text-eucalypt">People to stage now</div>
              <div className="space-y-3 mt-4">
                {firstReviewPeople.map(person => (
                  <div key={`first-review-${person.queueId}`} className="rounded-xl border border-ink/6 bg-white/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-ink">{person.displayName}</div>
                        <div className="text-xs text-ink/45 mt-1">{queuedPersonRoleLabel(person.role)} / {queuedPersonStageLabel(person.addStage)}</div>
                      </div>
                      <span className="rounded-full border border-ink/10 bg-cream/80 px-3 py-1 text-[11px] text-ink/55">
                        tree blocked
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-ink/8 bg-cream/75 p-4">
              <div className="text-xs uppercase tracking-widest text-ochre">Claims to review before adding tree edges</div>
              <div className="space-y-3 mt-4">
                {firstReviewRelationClaims.map(claim => (
                  <div key={`first-review-${claim.claimId}`} className="rounded-xl border border-ink/6 bg-white/70 p-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="rounded-full border border-ochre/20 bg-ochre/10 px-3 py-1 text-[11px] text-ochre">
                        {relationScopeLabel(claim.relationScope)}
                      </span>
                      <span className="rounded-full border border-ink/10 bg-cream/80 px-3 py-1 text-[11px] text-ink/55">
                        {claim.visibilityStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-ink">
                      {claim.subjectName} <span className="text-ink/40">-&gt;</span> {claim.relationshipType.replace(/_/g, ' ')} <span className="text-ink/40">-&gt;</span> {claim.objectName}
                    </div>
                    <p className="text-sm text-ink/60 leading-relaxed mt-2">{claim.reviewQuestion}</p>
                    <div className="text-xs text-ink/45 mt-2">{claim.sourceTitle}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-white/70 p-4 mt-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-eucalypt">Decision worksheet</div>
                <p className="text-sm text-ink/60 leading-relaxed mt-2">
                  {firstReviewWorksheet
                    ? 'Loaded from the generated Palm review worksheet, not inferred in the interface.'
                    : 'Worksheet API is not available, showing a local fallback from the claim register.'}
                </p>
              </div>
              {firstReviewWorksheet?.generatedAt && (
                <div className="text-xs text-ink/45 md:text-right">
                  Generated {new Date(firstReviewWorksheet.generatedAt).toLocaleString()}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 mt-4">
              {firstReviewDecisionSequence.map(item => (
                <div key={item.step} className="rounded-xl border border-ink/6 bg-cream/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] text-white">{item.step}</span>
                    <span className="font-serif text-2xl text-ink leading-none">{item.count}</span>
                  </div>
                  <div className="text-sm font-medium text-ink mt-3">{item.label}</div>
                  <p className="text-xs text-ink/55 leading-relaxed mt-1">{item.action}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="rounded-xl border border-ochre/20 bg-ochre/10 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ochre">Blocked now</div>
                <p className="text-sm text-ink/70 leading-relaxed mt-2">
                  Family folders, kinship proposals, and public tree edges remain blocked until these decisions are saved.
                </p>
              </div>
              <div className="rounded-xl border border-eucalypt/20 bg-eucalypt/10 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">Can do now</div>
                <p className="text-sm text-ink/70 leading-relaxed mt-2">
                  Add these names to the research queue and prepare the elder questions with exact source excerpts.
                </p>
              </div>
              <div className="rounded-xl border border-ink/8 bg-sand/20 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">First unlock</div>
                <p className="text-sm text-ink/70 leading-relaxed mt-2">
                  {firstReviewBridgeDecision
                    ? `${firstReviewBridgeDecision.subjectName} -> ${firstReviewBridgeDecision.relationshipType.replace(/_/g, ' ')} -> ${firstReviewBridgeDecision.objectName}. ${firstReviewBridgeDecision.nextAction}`
                    : 'Identify Winifred Obah\'s grandmother before deciding any Alf Palmer relationship path.'}
                </p>
              </div>
            </div>
          </div>

          {firstReviewIdentityClaims.length > 0 && (
            <div className="rounded-2xl border border-ink/8 bg-sand/20 p-4 mt-5">
              <div className="text-xs uppercase tracking-widest text-ink/45">Identity blockers</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {firstReviewIdentityClaims.slice(0, 6).map(claim => (
                  <div key={`first-review-identity-${claim.claimId}`} className="rounded-xl border border-ink/6 bg-white/70 p-3">
                    <div className="text-sm font-medium text-ink">
                      {claim.subjectName} <span className="text-ink/40">-&gt;</span> {claim.relationshipType.replace(/_/g, ' ')} <span className="text-ink/40">-&gt;</span> {claim.objectName}
                    </div>
                    <p className="text-sm text-ink/60 leading-relaxed mt-2">{claim.reviewQuestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(firstReviewWorksheet?.publicSourceDecisions.length || firstReviewPublicSourceClaims.length) > 0 && (
            <div className="rounded-2xl border border-ochre/20 bg-ochre/5 p-4 mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs uppercase tracking-widest text-ochre">Public-source decisions</div>
                {decisionWorksheetData?.publicSourceReviewSummary && (
                  <div className="text-[11px] text-ink/55">
                    <span className="font-medium text-eucalypt">{decisionWorksheetData.publicSourceReviewSummary.reviewed}</span> reviewed
                    <span className="text-ink/30"> · </span>
                    <span className="font-medium text-ochre">{decisionWorksheetData.publicSourceReviewSummary.unreviewed}</span> unreviewed
                    <span className="text-ink/30"> · </span>
                    <span>{decisionWorksheetData.publicSourceReviewSummary.treeMutationsCreated} tree edits</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-ink/60 leading-relaxed mt-2">
                These are source/name/date/place leads only. Decide identity and family relevance before any person, folder, proposal, or tree edge exists.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {(firstReviewWorksheet?.publicSourceDecisions || []).slice(0, 6).map(decision => (
                  <div key={`public-source-decision-${decision.decisionId}`} className="rounded-xl border border-ink/6 bg-white/75 p-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] ${onlineClaimMatchClass(decision.personMatchStatus)}`}>
                        {onlineClaimMatchLabel(decision.personMatchStatus)}
                      </span>
                      <span className="rounded-full border border-ink/10 bg-cream/80 px-3 py-1 text-[11px] text-ink/55">
                        {decision.status.replace(/_/g, ' ')}
                      </span>
                      {decision.reviewDecision ? (
                        <span className={`rounded-full px-3 py-1 text-[11px] ${reviewDecisionClass(decision.reviewDecision.decision)}`}>
                          {reviewDecisionLabel(decision.reviewDecision.decision)}
                        </span>
                      ) : (
                        <span className="rounded-full border border-ochre/25 bg-white/70 px-3 py-1 text-[11px] text-ochre/80">
                          Not yet reviewed
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-ink">
                      {decision.subjectName} <span className="text-ink/40">-&gt;</span> {decision.relationshipType.replace(/_/g, ' ')} <span className="text-ink/40">-&gt;</span> {decision.objectName}
                    </div>
                    <div className="text-xs text-ink/45 mt-1">{decision.sourceTitle}</div>
                    {decision.exactSourceExcerpt && (
                      <p className="text-xs text-ink/55 leading-relaxed mt-2">{decision.exactSourceExcerpt}</p>
                    )}
                    <p className="text-sm text-ink/65 leading-relaxed mt-2">{decision.reviewQuestion}</p>
                    {decision.reviewDecision?.notes && (
                      <p className="text-xs text-ink/55 leading-relaxed mt-2 border-t border-ink/8 pt-2 italic">
                        Reviewer note: {decision.reviewDecision.notes}
                      </p>
                    )}
                  </div>
                ))}
                {!firstReviewWorksheet && firstReviewPublicSourceClaims.slice(0, 6).map(claim => (
                  <div key={`public-source-claim-${claim.claimId}`} className="rounded-xl border border-ink/6 bg-white/75 p-3">
                    <div className="text-sm font-medium text-ink">
                      {claim.subjectName} <span className="text-ink/40">-&gt;</span> {claim.relationshipType.replace(/_/g, ' ')} <span className="text-ink/40">-&gt;</span> {claim.objectName}
                    </div>
                    <div className="text-xs text-ink/45 mt-1">{claim.sourceTitle}</div>
                    <p className="text-sm text-ink/65 leading-relaxed mt-2">{claim.reviewQuestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-5">
            <LedgerLinkPill
              href={buildLedgerPalmReviewUrl({
                view: 'demo_prep',
                kinship_family: firstReviewCluster.label,
                kinship_search: firstReviewCluster.label,
              })}
              label="Open this packet in Palm review"
              tone="primary"
            />
          </div>
        </section>
      )}

      {peopleQueueData && (
        <section className="rounded-[28px] border border-eucalypt/20 bg-eucalypt/5 p-5 md:p-6 mb-8">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-widest text-eucalypt">Actual people workflow</div>
              <h2 className="font-serif text-3xl text-ink mt-3">Add people here first</h2>
              <p className="text-sm text-ink/65 leading-relaxed mt-3">
                Palm people are added as source-backed research people before they become family-folder people.
                This queue is the staging layer: names, source claims, identity conflicts, and the next review action.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
                <div className="rounded-2xl border border-ink/8 bg-white/70 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">Now</div>
                  <p className="text-sm text-ink/70 mt-2">Add source-backed names to the research queue.</p>
                </div>
                <div className="rounded-2xl border border-ink/8 bg-white/70 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ochre">Next</div>
                  <p className="text-sm text-ink/70 mt-2">Resolve identity drift and prepare one family pack.</p>
                </div>
                <div className="rounded-2xl border border-ink/8 bg-white/70 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Later</div>
                  <p className="text-sm text-ink/70 mt-2">Create governed family folders and kinship proposals after review decisions.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <StatCard label="Queued people" value={peopleQueueData.counts?.queuedPeople || 0} />
              <StatCard label="Add now" value={peopleQueueData.counts?.researchPeopleToAddNow || 0} />
              <StatCard label="Public leads" value={peopleQueueData.counts?.publicSourceNameLeads || 0} />
              <StatCard label="Public claims" value={peopleQueueData.counts?.publicSourceClaims || 0} />
              <StatCard label="Bridge leads" value={peopleQueueData.counts?.unresolvedBridgePeople || 0} />
              <StatCard label="Blocked tree" value={peopleQueueData.counts?.blockedFromTreeBuild || 0} />
            </div>
          </div>

          {!peopleQueueData.available ? (
            <div className="rounded-2xl border border-ink/8 bg-cream/70 p-4 mt-6">
              <p className="text-sm text-ink/60 leading-relaxed">{peopleQueueData.note}</p>
            </div>
          ) : (
            <div className="space-y-5 mt-7">
              {queueClusters.map(cluster => {
                const people = peopleQueueData.people.filter(person => person.clusterId === cluster.id)

                return (
                  <div key={cluster.id} className="rounded-2xl border border-ink/8 bg-cream/80 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-eucalypt">Family packet</div>
                        <h3 className="font-serif text-2xl text-ink mt-2">{cluster.label}</h3>
                        <p className="text-sm text-ink/55 mt-2">
                          {cluster.peopleCount} research people · {cluster.relationClaimCount} relationship claims · {cluster.identityClaimCount} identity claims · {cluster.publicSourceNameLeads} public name leads
                        </p>
                      </div>
                      <LedgerLinkPill
                        href={buildLedgerPalmReviewUrl({
                          view: 'demo_prep',
                          kinship_family: cluster.label,
                          kinship_search: cluster.label,
                        })}
                        label="Open review packet"
                        tone="primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-4">
                      {people.map(person => (
                        <div key={person.queueId} className="rounded-2xl border border-ink/8 bg-white/70 p-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="font-serif text-2xl text-ink leading-tight">{person.displayName}</h4>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="rounded-full border border-ink/10 bg-cream/80 px-3 py-1 text-xs text-ink/55">
                                  {queuedPersonRoleLabel(person.role)}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs ${queuedPersonStageClass(person.addStage)}`}>
                                  {queuedPersonStageLabel(person.addStage)}
                                </span>
                                <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
                                  tree blocked
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-ink/45 md:text-right shrink-0">
                              <div>{person.relationClaimCount} relation claims</div>
                              <div>{person.identityClaimCount} identity claims</div>
                              {person.publicSourceClaimCount > 0 && (
                                <div>{person.publicSourceClaimCount} public claims</div>
                              )}
                              <div>{person.sourceRefs.length} source refs</div>
                            </div>
                          </div>

                          {person.aliasCandidates.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {person.aliasCandidates.map(alias => (
                                <span key={`${person.queueId}-${alias}`} className="rounded-full bg-sand/70 px-3 py-1 text-xs text-ink/65">
                                  {alias}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="rounded-xl border border-ink/6 bg-cream/65 p-3 mt-4">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">Next action</div>
                            <p className="text-sm text-ink/70 leading-relaxed mt-2">{person.nextAction}</p>
                          </div>

                          {person.claimRefs.length > 0 && (
                            <div className="space-y-2 mt-4">
                              {person.claimRefs.slice(0, 3).map(claim => (
                                <div key={`${person.queueId}-${claim.claimId}`} className="rounded-xl border border-ink/6 bg-white/70 p-3">
                                  <div className="text-sm text-ink/75">
                                    {queuedClaimSummary(claim)}
                                  </div>
                                  <div className="text-xs text-ink/45 mt-1">{claim.sourceTitle}</div>
                                  {claim.exactSourceExcerpt && (
                                    <div className="text-xs text-ink/55 mt-2">{claim.exactSourceExcerpt}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-4">
                            {person.role !== 'unresolved_bridge_person' && (
                              <Link
                                to={`${base}/people/${person.personKey}`}
                                className="inline-flex items-center rounded-full bg-ochre px-4 py-2 text-xs font-medium text-white"
                              >
                                Open person research
                              </Link>
                            )}
                            <LedgerLinkPill
                              href={buildLedgerPalmReviewUrl({
                                view: 'demo_prep',
                                kinship_family: person.clusterLabel,
                                kinship_search: person.displayName,
                              })}
                              label="Review this person"
                              tone={person.role === 'unresolved_bridge_person' ? 'primary' : 'neutral'}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {claimsData && (
        <section className="rounded-[28px] border border-ink/10 bg-white/75 p-5 md:p-6 mb-8">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-widest text-ochre">Family claim register</div>
              <h2 className="font-serif text-3xl text-ink mt-3">Person, relationship, person, source</h2>
              <p className="text-sm text-ink/65 leading-relaxed mt-3">
                This is the actual work queue for mapping family data. Each row is one claim with one source trail and one review question.
                It stays blocked from the tree until identity and direction are reviewed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <StatCard label="Claims" value={claimsData.counts?.claims || 0} />
              <StatCard label="Relations" value={claimsData.counts?.relationClaims || 0} />
              <StatCard label="Identity" value={claimsData.counts?.identityClaims || 0} />
              <StatCard label="Public source" value={claimsData.counts?.publicSourceClaims || 0} />
              <StatCard label="Unreviewed" value={claimsData.counts?.unreviewedClaims || 0} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3 mt-6">
            <input
              value={claimSearch}
              onChange={event => setClaimSearch(event.target.value)}
              placeholder="Search names, relationships, sources, or questions"
              className="w-full rounded-full border border-ink/10 bg-cream/80 px-4 py-2.5 text-sm text-ink outline-none focus:border-eucalypt"
            />
            <select
              value={claimCluster}
              onChange={event => setClaimCluster(event.target.value)}
              className="w-full rounded-full border border-ink/10 bg-cream/80 px-4 py-2.5 text-sm text-ink outline-none focus:border-eucalypt"
            >
              <option value="all">All family packets</option>
              {claimClusters.map(cluster => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.label} ({cluster.claimCount})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {([
              ['all', 'All claims'],
              ['relation', 'Relationships'],
              ['identity', 'Identity'],
              ['public_source', 'Public source'],
            ] as Array<[ClaimTypeFilter, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setClaimType(value)}
                className={
                  claimType === value
                    ? 'rounded-full bg-ink px-4 py-2 text-xs font-medium text-white'
                    : 'rounded-full border border-ink/10 bg-cream/80 px-4 py-2 text-xs text-ink/65'
                }
              >
                {label}
              </button>
            ))}
          </div>

          {!claimsData.available || filteredClaims.length === 0 ? (
            <div className="rounded-2xl border border-ink/8 bg-cream/70 p-4 mt-6">
              <p className="text-sm text-ink/60 leading-relaxed">
                {claimsData.available ? 'No claims match the current filters.' : claimsData.note}
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-6">
              {filteredClaims.map(claim => (
                <div key={claim.claimId} className="rounded-2xl border border-ink/8 bg-cream/75 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
                          {claimTypeLabel(claim)}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs ${claimStatusClass(claim.reviewStatus)}`}>
                          {claim.reviewStatus}
                        </span>
                        <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
                          {claim.visibilityStatus.replace(/_/g, ' ')}
                        </span>
                        <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
                          {claim.clusterLabel}
                        </span>
                        {claim.claimType === 'relation' && (
                          <span className="rounded-full border border-ochre/20 bg-ochre/10 px-3 py-1 text-xs text-ochre">
                            {relationScopeLabel(claim.relationScope)}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 md:items-center">
                        <div className="font-serif text-2xl text-ink leading-tight">{claim.subjectName}</div>
                        <div className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55 w-fit">
                          {claim.relationshipType.replace(/_/g, ' ')}
                        </div>
                        <div className="font-serif text-2xl text-ink leading-tight">{claim.objectName}</div>
                      </div>
                      <p className="text-sm text-ink/60 leading-relaxed mt-3">{claim.claimText}</p>
                      {claim.excerpt && (
                        <p className="text-sm text-ink/70 leading-relaxed mt-3 rounded-xl border border-ink/6 bg-white/70 p-3">
                          {claim.excerpt}
                        </p>
                      )}
                      <div className="rounded-xl border border-ink/6 bg-white/60 p-3 mt-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-ochre">Review question</div>
                        <p className="text-sm text-ink/70 leading-relaxed mt-2">{claim.reviewQuestion}</p>
                      </div>
                    </div>
                    <div className="lg:w-72 shrink-0">
                      <div className="rounded-xl border border-ink/8 bg-white/65 p-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">Source</div>
                        <div className="text-sm font-medium text-ink mt-2">{claim.sourceTitle}</div>
                        <div className="text-xs text-ink/45 mt-1">{claim.source.authority}</div>
                        <div className="text-xs text-ink/40 mt-2 break-words">{claim.sourceIdOrPath}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <LedgerLinkPill
                          href={claim.transcriptId ? buildLedgerTranscriptAdminUrl(claim.transcriptId) : null}
                          label="Open transcript"
                        />
                        <LedgerLinkPill
                          href={claim.storytellerId ? buildLedgerStorytellerEditUrl(claim.storytellerId) : null}
                          label="Open storyteller"
                        />
                        <LedgerLinkPill
                          href={!claim.transcriptId ? claim.source.pathOrUrl : null}
                          label="Open source"
                        />
                        <LedgerLinkPill
                          href={buildLedgerPalmReviewUrl({
                            view: 'demo_prep',
                            kinship_family: claim.clusterLabel,
                            kinship_search: `${claim.subjectName} ${claim.objectName}`,
                          })}
                          label="Review claim"
                          tone="primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {claimsData.available && (
            <p className="text-xs text-ink/45 mt-4">
              Showing {filteredClaims.length} of {claimsData.claims.length} claims. This is still a review queue, not a family tree.
            </p>
          )}
        </section>
      )}

      {data.sourceBase.length > 0 && (
        <details className="rounded-[28px] border border-ink/10 bg-cream/80 p-5 md:p-6 mb-8">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-eucalypt">Secondary evidence</div>
                <h2 className="font-serif text-2xl text-ink mt-2">Palm history and source archive</h2>
              </div>
              <div className="text-sm text-ink/50">{data.sourceBase.length} sources</div>
            </div>
          </summary>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mt-6">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-widest text-eucalypt">Start with the source base</div>
              <h2 className="font-serif text-3xl text-ink mt-3">Palm history and public source map</h2>
              <p className="text-sm text-ink/60 leading-relaxed mt-3">
                These are the sources to read before jumping into transcripts. The local Palm repo docs give the working synthesis,
                and the public sources give stable external anchors for history, governance, and family-history research.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[240px]">
              <StatCard label="Source base" value={data.sourceBase.length} />
              <StatCard label="In-app docs" value={data.sourceBase.filter(item => item.readInApp).length} />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-8">
            {data.sourceBase.map(source => (
              <div key={source.id} className="rounded-2xl border border-ink/8 bg-sand/20 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">{stageLabel(source.stage)}</span>
                  <span className="rounded-full border border-ink/10 px-2.5 py-1 text-[11px] text-ink/45">
                    {source.kind === 'repo_doc' ? 'Palm repo doc' : 'Public source'}
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-ink mt-3">{source.title}</h3>
                <p className="text-xs text-ink/45 mt-2">{source.authority}</p>
                <p className="text-sm text-ink/70 leading-relaxed mt-3">{source.summary}</p>
                <div className="rounded-xl border border-ink/8 bg-white/60 p-3 mt-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Why it matters</div>
                  <p className="text-sm text-ink/68 leading-relaxed mt-2">{source.whyItMatters}</p>
                </div>
                {source.sourcePath && (
                  <p className="text-xs text-ink/40 mt-3">{source.sourcePath}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {source.readInApp ? (
                    <Link
                      to={`${base}/sources/${source.id}`}
                      className="inline-flex items-center rounded-full bg-eucalypt px-4 py-2 text-xs font-medium text-white"
                    >
                      Read in 10 Years
                    </Link>
                  ) : (
                    <LedgerLinkPill href={source.url || null} label="Open public source" tone="primary" />
                  )}
                  <LedgerLinkPill
                    href={buildLedgerPalmReviewUrl({
                      view: 'demo_prep',
                    })}
                    label="Open Palm review"
                  />
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      <details className="rounded-[28px] border border-ink/10 bg-cream/70 p-5 md:p-6">
        <summary className="cursor-pointer list-none">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-eucalypt">Secondary evidence</div>
              <h2 className="font-serif text-2xl text-ink mt-2">Research packet evidence</h2>
            </div>
            <div className="text-sm text-ink/50">
              {data.counts?.clusters || 0} packets
            </div>
          </div>
        </summary>

        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mt-6 mb-8">
          <div>
            <h3 className="font-serif text-2xl text-ink">Palm family research packets</h3>
            <p className="text-sm text-ink/55 mt-1">
              {filteredClusters.length} cluster{filteredClusters.length === 1 ? '' : 's'} in view
            </p>
          </div>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search surnames, elders, or relation leads"
            className="w-full md:w-80 rounded-full border border-ink/10 bg-white/80 px-4 py-2.5 text-sm text-ink outline-none focus:border-eucalypt"
          />
        </div>

        {!data.available ? (
          <section className="rounded-2xl border border-ink/10 bg-cream/80 px-6 py-8 text-center">
            <h3 className="font-serif text-2xl text-ink">Research loops not ready yet</h3>
            <p className="text-sm text-ink/60 max-w-2xl mx-auto mt-3 leading-relaxed">{data.note}</p>
          </section>
        ) : filteredClusters.length === 0 ? (
          <section className="rounded-2xl border border-ink/10 bg-cream/80 px-6 py-8 text-center">
            <h3 className="font-serif text-2xl text-ink">No matching research packet</h3>
            <p className="text-sm text-ink/60 max-w-2xl mx-auto mt-3 leading-relaxed">
              Try another surname, elder name, or relation lead.
            </p>
          </section>
        ) : (
          <div className="space-y-8">
          {filteredClusters.map(cluster => (
            <section key={cluster.id} className="rounded-[28px] border border-ink/10 bg-cream/80 p-5 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs uppercase tracking-widest text-eucalypt">{cluster.kind === 'hinted' ? 'Seeded cluster' : 'Automatic cluster'}</span>
                    <span className="rounded-full border border-ink/10 px-3 py-1 text-xs text-ink/55">
                      Evidence score {cluster.evidenceScore}
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl text-ink mt-3">{cluster.label}</h3>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {cluster.coreSurnames.map(item => (
                      <span key={`${cluster.id}-${item.surname}`} className="rounded-full bg-sand/70 px-3 py-1 text-xs text-ink/65">
                        {item.surname} ({item.count})
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <LedgerLinkPill
                      href={buildLedgerPalmReviewUrl({
                        view: 'demo_prep',
                        kinship_family: cluster.label,
                        kinship_search: cluster.label,
                      })}
                      label="Open Palm review"
                      tone="primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 min-w-[240px]">
                  <StatCard label="Anchor elders" value={cluster.anchorElders.length} />
                  <StatCard label="Relation leads" value={cluster.relationLeads.length} />
                  <StatCard label="Transcript hits" value={cluster.transcriptHits.length} />
                  <StatCard label="Corpus hits" value={cluster.repoHits.length} />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
                <div className="xl:col-span-2 rounded-2xl border border-ink/8 bg-eucalypt/5 p-4">
                  <div className="text-xs uppercase tracking-widest text-eucalypt">Start this family with sources</div>
                  <p className="text-sm text-ink/60 leading-relaxed mt-2">
                    Read these first for this family cluster, then use the transcript layer underneath as one evidence stream rather than the starting point.
                  </p>
                  {cluster.sourceLeads.length === 0 ? (
                    <p className="text-sm text-ink/50 mt-4">
                      No strong source-first matches surfaced yet for this family cluster.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                      {cluster.sourceLeads.map(source => (
                        <div key={`${cluster.id}-${source.sourceId}`} className="rounded-2xl border border-ink/8 bg-cream/70 p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">{stageLabel(source.stage)}</span>
                            <span className="rounded-full border border-ink/10 px-2.5 py-1 text-[11px] text-ink/45">
                              {source.kind === 'repo_doc' ? 'Palm repo doc' : 'Public source'}
                            </span>
                          </div>
                          <h4 className="font-serif text-2xl text-ink mt-3">{source.title}</h4>
                          <p className="text-xs text-ink/45 mt-2">{source.authority}</p>
                          <p className="text-sm text-ink/68 leading-relaxed mt-3">{source.summary}</p>
                          <div className="rounded-xl border border-ink/8 bg-white/60 p-3 mt-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Why it matters for this family</div>
                            <p className="text-sm text-ink/68 leading-relaxed mt-2">{source.whyItMatters}</p>
                          </div>
                          {source.excerpt && (
                            <div className="rounded-xl border border-ink/8 bg-white/60 p-3 mt-3">
                              <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Matched reading excerpt</div>
                              <p className="text-sm text-ink/68 leading-relaxed mt-2">{source.excerpt}</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {source.matchedTerms.slice(0, 4).map(term => (
                              <span key={`${cluster.id}-${source.sourceId}-${term}`} className="rounded-full bg-sand/70 px-3 py-1 text-xs text-ink/65">
                                {term}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {source.readInApp ? (
                              <Link
                                to={`${base}/sources/${source.sourceId}`}
                                className="inline-flex items-center rounded-full bg-eucalypt px-4 py-2 text-xs font-medium text-white"
                              >
                                Read source
                              </Link>
                            ) : (
                              <LedgerLinkPill href={source.url || null} label="Open public source" tone="primary" />
                            )}
                            <LedgerLinkPill
                              href={buildLedgerPalmReviewUrl({
                                view: 'demo_prep',
                                kinship_family: cluster.label,
                                kinship_search: source.matchedTerms[0] || cluster.label,
                              })}
                              label="Open Palm review with this lead"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="xl:col-span-2 rounded-2xl border border-ink/8 bg-white/60 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="max-w-3xl">
                      <div className="text-xs uppercase tracking-widest text-ochre">People to follow next</div>
                      <p className="text-sm text-ink/60 leading-relaxed mt-2">
                        Use these person leads after reading the source base for this family. This is the bridge from Palm history into likely people,
                        before you decide whether transcript review, storyteller cleanup, or elder confirmation is the next move.
                      </p>
                    </div>
                    <div className="min-w-[140px]">
                      <StatCard label="Person leads" value={cluster.personLeads.length} />
                    </div>
                  </div>

                  {cluster.personLeads.length === 0 ? (
                    <p className="text-sm text-ink/50 mt-4">
                      No person-level leads surfaced for this cluster yet beyond the family packet itself.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                      {cluster.personLeads.map(person => (
                        <div key={`${cluster.id}-${person.name}`} className="rounded-2xl border border-ink/8 bg-cream/70 p-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <div className="font-serif text-2xl text-ink">{person.name}</div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className={`rounded-full px-3 py-1 text-xs ${personLeadConfidenceClass(person.confidence)}`}>
                                  {personLeadConfidenceLabel(person.confidence)}
                                </span>
                                <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
                                  {personLeadKindLabel(person.leadKind)}
                                </span>
                                {person.isElder && (
                                  <span className="rounded-full border border-eucalypt/20 bg-eucalypt/10 px-3 py-1 text-xs text-eucalypt">
                                    Elder anchor
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-xs text-ink/45">
                              {person.storyCount !== null && <div>{person.storyCount} stories</div>}
                              {person.transcriptCount !== null && <div>{person.transcriptCount} transcripts</div>}
                              <div className="mt-1">score {person.score}</div>
                            </div>
                          </div>

                          {(person.relationLabels.length > 0 || person.sourcePackets.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {person.relationLabels.map(label => (
                                <span key={`${cluster.id}-${person.name}-${label}`} className="rounded-full bg-sand/70 px-3 py-1 text-xs text-ink/65">
                                  {label}
                                </span>
                              ))}
                              {person.sourcePackets.map(packet => (
                                <span key={`${cluster.id}-${person.name}-${packet}`} className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/55">
                                  {packet}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-4">
                            <Link
                              to={`${base}/people/${person.personKey}`}
                              className="inline-flex items-center rounded-full bg-ochre px-4 py-2 text-xs font-medium text-white"
                            >
                              Open person research
                            </Link>
                            <LedgerLinkPill
                              href={person.storytellerId ? buildLedgerStorytellerEditUrl(person.storytellerId) : null}
                              label="Open storyteller"
                            />
                            <LedgerLinkPill
                              href={person.storytellerId ? buildLedgerStorytellerTranscriptsUrl(person.storytellerId) : null}
                              label="Open transcripts"
                            />
                            <LedgerLinkPill
                              href={buildLedgerPalmReviewUrl({
                                view: 'demo_prep',
                                kinship_family: cluster.label,
                                kinship_search: person.name,
                              })}
                              label="Open Palm review with this name"
                              tone="primary"
                            />
                          </div>

                          {person.sourceMentions.length > 0 && (
                            <div className="mt-5">
                              <div className="text-[11px] uppercase tracking-[0.18em] text-eucalypt">Source-first reading path</div>
                              <div className="space-y-3 mt-3">
                                {person.sourceMentions.map(source => (
                                  <div key={`${cluster.id}-${person.name}-${source.sourceId}`} className="rounded-xl border border-ink/6 bg-white/70 p-3">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                      <div>
                                        <div className="text-sm font-medium text-ink">{source.title}</div>
                                        <div className="text-xs text-ink/45 mt-1">
                                          {stageLabel(source.stage)} · {source.authority}
                                        </div>
                                      </div>
                                      {source.readInApp ? (
                                        <Link
                                          to={`${base}/sources/${source.sourceId}`}
                                          className="inline-flex items-center rounded-full bg-eucalypt px-3 py-1.5 text-xs font-medium text-white"
                                        >
                                          Read source
                                        </Link>
                                      ) : (
                                        <LedgerLinkPill href={source.url || null} label="Open public source" tone="primary" />
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {source.matchedTerms.slice(0, 4).map(term => (
                                        <span key={`${cluster.id}-${person.name}-${source.sourceId}-${term}`} className="rounded-full bg-sand/70 px-3 py-1 text-xs text-ink/65">
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
                            </div>
                          )}

                          {person.transcriptMentions.length > 0 && (
                            <div className="mt-5">
                              <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Transcript traces underneath</div>
                              <div className="space-y-3 mt-3">
                                {person.transcriptMentions.slice(0, 4).map((mention, index) => (
                                  <div key={`${cluster.id}-${person.name}-${index}`} className="rounded-xl border border-ink/6 bg-white/70 p-3">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                      <div>
                                        <div className="text-sm font-medium text-ink">{mention.title}</div>
                                        {mention.storytellerName && (
                                          <div className="text-xs text-ink/45 mt-1">{mention.storytellerName}</div>
                                        )}
                                      </div>
                                      <LedgerLinkPill
                                        href={mention.transcriptId ? buildLedgerTranscriptAdminUrl(mention.transcriptId) : null}
                                        label={mention.transcriptId ? 'Open transcript' : 'Storyteller bio'}
                                      />
                                    </div>
                                    <p className="text-sm text-ink/68 leading-relaxed mt-3">{mention.excerpt}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-ink/8 bg-sand/20 p-4">
                  <div className="text-xs uppercase tracking-widest text-eucalypt">Anchor elders</div>
                  <div className="space-y-3 mt-4">
                    {cluster.anchorElders.map(elder => (
                      <div key={`${cluster.id}-${elder.displayName}`} className="rounded-2xl border border-ink/8 bg-cream/70 p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-ink">{elder.displayName}</div>
                            <div className="text-xs text-ink/50 mt-1">
                              {elder.transcriptCount} transcripts · {elder.storyCount} stories
                            </div>
                          </div>
                          {elder.themes.length > 0 && (
                            <div className="text-right text-xs text-ink/45 max-w-[180px]">
                              {elder.themes.slice(0, 3).join(', ')}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <LedgerLinkPill
                            href={buildLedgerStorytellerEditUrl(elder.storytellerId)}
                            label="Open storyteller"
                          />
                          <LedgerLinkPill
                            href={buildLedgerStorytellerTranscriptsUrl(elder.storytellerId)}
                            label="Open transcripts"
                          />
                        </div>

                        {elder.aliasCandidates.length > 0 && (
                          <div className="mt-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Alias leads</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {elder.aliasCandidates.slice(0, 4).map(alias => (
                                <span key={`${cluster.id}-${elder.displayName}-${alias}`} className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink/65">
                                  {alias}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {elder.transcriptRefs.length > 0 && (
                          <div className="mt-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Direct transcript entry points</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {elder.transcriptRefs.slice(0, 4).map(ref => (
                                <LedgerLinkPill
                                  key={`${cluster.id}-${elder.displayName}-${ref.id}`}
                                  href={buildLedgerTranscriptAdminUrl(ref.id)}
                                  label={ref.title}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-ink/8">
                    <div className="text-xs uppercase tracking-widest text-ochre">Additional Palm storyteller matches</div>
                    {cluster.matchingStorytellers.length === 0 ? (
                      <p className="text-sm text-ink/50 mt-3">No extra storyteller rows surfaced for this cluster yet.</p>
                    ) : (
                      <div className="space-y-3 mt-3">
                        {cluster.matchingStorytellers.map(person => (
                          <div key={person.id} className="rounded-2xl border border-ink/8 bg-cream/70 p-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="text-sm text-ink/70">
                                {person.displayName}
                                <span className="text-ink/40"> · {person.storyCount} stories{person.isElder ? ' · elder' : ''}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <LedgerLinkPill
                                href={buildLedgerStorytellerEditUrl(person.id)}
                                label="Open storyteller"
                              />
                              <LedgerLinkPill
                                href={buildLedgerStorytellerTranscriptsUrl(person.id)}
                                label="Open transcripts"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-ink/8 bg-sand/20 p-4">
                  <div className="text-xs uppercase tracking-widest text-eucalypt">Named relation leads</div>
                  {cluster.relationLeads.length === 0 ? (
                    <p className="text-sm text-ink/50 mt-3">No repeated named relations surfaced from the anchor packets yet.</p>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {cluster.relationLeads.slice(0, 10).map(lead => (
                        <div key={`${cluster.id}-${lead.name}`} className="rounded-xl border border-ink/8 bg-cream/70 p-3">
                          <div className="font-medium text-ink">{lead.name}</div>
                          <div className="text-xs text-ink/50 mt-1">
                            {lead.relations.join(', ')} · source packets: {lead.sourcePackets.join(', ')}
                          </div>
                          {lead.sources.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {lead.sources.slice(0, 3).map((source, index) => (
                                <div key={`${cluster.id}-${lead.name}-${index}`} className="rounded-xl border border-ink/6 bg-white/70 p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-xs uppercase tracking-[0.18em] text-ink/45">{source.title}</div>
                                    {source.transcriptId ? (
                                      <LedgerLinkPill
                                        href={buildLedgerTranscriptAdminUrl(source.transcriptId)}
                                        label="Open transcript"
                                      />
                                    ) : (
                                      <span className="inline-flex items-center rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs text-ink/50">
                                        Storyteller bio
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-ink/70 leading-relaxed mt-2">{source.excerpt}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                <details className="rounded-2xl border border-ink/8 bg-white/60 p-4" open>
                  <summary className="cursor-pointer text-sm uppercase tracking-widest text-ochre">History and wider Palm evidence</summary>
                  <div className="space-y-3 mt-4">
                    {cluster.repoHits.slice(0, 8).map((hit, index) => (
                      <div key={`${cluster.id}-repo-${index}`} className="rounded-xl border border-ink/6 bg-cream/70 p-3">
                        <div className="text-sm font-medium text-ink">{hit.sourcePath}</div>
                        <div className="text-xs text-ink/45 mt-1">Matched term: {hit.term}</div>
                        <p className="text-sm text-ink/70 leading-relaxed mt-2">{hit.excerpt}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <LedgerLinkPill
                            href={buildLedgerPalmReviewUrl({
                              view: 'demo_prep',
                              kinship_family: cluster.label,
                              kinship_search: hit.term,
                            })}
                            label="Open Palm review with this lead"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                <details className="rounded-2xl border border-ink/8 bg-white/60 p-4" open>
                  <summary className="cursor-pointer text-sm uppercase tracking-widest text-eucalypt">Transcript layer</summary>
                  <div className="space-y-3 mt-4">
                    {cluster.transcriptHits.slice(0, 10).map((hit, index) => (
                      <div key={`${cluster.id}-tx-${index}`} className="rounded-xl border border-ink/6 bg-cream/70 p-3">
                        <div className="text-sm font-medium text-ink">
                          {hit.storytellerName ? `${hit.storytellerName} · ` : ''}{hit.title}
                        </div>
                        <div className="text-xs text-ink/45 mt-1">Matched term: {hit.term}</div>
                        <p className="text-sm text-ink/70 leading-relaxed mt-2">{hit.excerpt}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <LedgerLinkPill
                            href={buildLedgerTranscriptAdminUrl(hit.transcriptId)}
                            label="Open transcript"
                          />
                          <LedgerLinkPill
                            href={hit.storytellerId ? buildLedgerStorytellerTranscriptsUrl(hit.storytellerId) : null}
                            label="Open storyteller transcripts"
                          />
                          <LedgerLinkPill
                            href={hit.storytellerId ? buildLedgerStorytellerEditUrl(hit.storytellerId) : null}
                            label="Open storyteller"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>

              <div className="rounded-2xl border border-ink/8 bg-eucalypt/5 p-4 mt-6">
                <div className="text-xs uppercase tracking-widest text-eucalypt">Next research moves</div>
                <div className="space-y-2 mt-3">
                  {cluster.nextMoves.map(step => (
                    <div key={step} className="text-sm text-ink/70">{step}</div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <LedgerLinkPill
                    href={buildLedgerPalmReviewUrl({
                      view: 'demo_prep',
                      kinship_family: cluster.label,
                      kinship_search: cluster.label,
                    })}
                    label="Continue in Palm review"
                    tone="primary"
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
        )}
      </details>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to={base} className="inline-flex items-center rounded-full bg-ochre px-5 py-2.5 text-sm text-white">
          Open community overview
        </Link>
        <Link to={`${base}/families`} className="inline-flex items-center rounded-full border border-ink/10 px-5 py-2.5 text-sm text-ink/65">
          See family layer
        </Link>
        <Link to={`${base}/tree`} className="inline-flex items-center rounded-full border border-ink/10 px-5 py-2.5 text-sm text-ink/65">
          Open community tree
        </Link>
      </div>
    </div>
  )
}

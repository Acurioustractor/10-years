// Mirrors the API response shapes from empathy-ledger-v2/src/types/timeline-kinship.ts
// Keep in sync.

export type Visibility = 'public' | 'org' | 'family' | 'private'
export type CulturalSensitivity = 'standard' | 'sensitive' | 'sacred' | 'restricted'

export interface PersonRef {
  id: string
  displayName: string
  avatarUrl: string | null
  isElder: boolean
}

export interface CommunityPersonRef extends PersonRef {
  familyFolderIds: string[]
  familyNames: string[]
}

export interface Storyteller extends PersonRef {
  bio: string | null
  culturalBackground: string[] | null
  role: string | null
  location: string | null
  isActive: boolean
  storyCount: number
  createdAt: string
}

export type TimelineEventKind = 'past' | 'aspiration' | 'milestone'
export type TimelineEventStatus =
  | 'dreaming' | 'planning' | 'in_progress' | 'happening'
  | 'done' | 'paused' | 'archived'

export type TimelineEventPersonRole =
  | 'subject' | 'participant' | 'supporter' | 'documenter' | 'mentor' | 'witness'

export interface TimelineEventSummary {
  id: string
  title: string
  description: string | null
  kind: TimelineEventKind
  status: TimelineEventStatus
  eventDate: string | null
  eventYear: number | null
  dateIsApproximate: boolean
  parentEventId: string | null
  domain: string[]
  location: string | null
  visibility: Visibility
  culturalSensitivityLevel: CulturalSensitivity
  celebratedAt: string | null
  celebratedNote: string | null
  organizationId: string | null
  projectId: string | null
  people: Array<PersonRef & { role: TimelineEventPersonRole }>
  mediaCount: number
  storyCount: number
  subGoalCount: number
  createdAt: string
  updatedAt: string
}

export type KinshipCategory =
  | 'parent' | 'child' | 'sibling' | 'grandparent' | 'grandchild'
  | 'extended' | 'partner' | 'chosen_family' | 'ceremonial' | 'mentor' | 'other'

export interface KinshipEdge {
  id: string
  from: PersonRef
  to: PersonRef
  relationType: string
  vocabulary: {
    code: string
    label: string
    category: KinshipCategory
    reciprocalCode: string | null
    isReciprocal: boolean
    culturalNotes: string | null
    vocabularyOrgId: string | null
    vocabularyOrgName: string | null
  }
  equivalents: Array<{
    code: string
    label: string
    vocabularyOrgId: string | null
    vocabularyOrgName: string | null
  }>
  isPrimary: boolean
  culturalContext: Record<string, unknown> | null
  notes: string | null
  visibility: Visibility
  culturalSensitivityLevel: CulturalSensitivity
  validFrom: string | null
  validTo: string | null
  recordedByOrgId: string | null
  createdAt: string
  updatedAt: string
}

export interface KinshipGraph {
  nodes: PersonRef[]
  edges: KinshipEdge[]
}

export interface FamilyAccessMember {
  id: string
  storytellerId: string
  displayName: string
  avatarUrl: string | null
  isElder: boolean
  isAncestor: boolean
  role: string
  isActive: boolean
  joinedAt: string
}

export interface CommunityKinshipEdge extends Omit<KinshipEdge, 'from' | 'to'> {
  from: CommunityPersonRef
  to: CommunityPersonRef
}

export interface CommunityKinshipGraph {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  mode?: 'approved_overlay' | 'legacy_family_graph'
  note?: string | null
  nodes: CommunityPersonRef[]
  edges: CommunityKinshipEdge[]
}

export interface CommunityResearchLead {
  id: string
  label: string
  kind: string
  evidenceScore: number
  coreSurnames: Array<{ surname: string; count: number }>
  anchorElders: Array<{
    storytellerId: string
    displayName: string
    transcriptCount: number
    storyCount: number
    themes: string[]
    aliasCandidates: string[]
    transcriptRefs: Array<{
      id: string
      title: string
    }>
  }>
  matchingStorytellers: Array<{
    id: string
    displayName: string
    isElder: boolean
    storyCount: number
  }>
  relationLeads: Array<{
    name: string
    relations: string[]
    sourcePackets: string[]
    sources: Array<{
      transcriptId: string | null
      title: string
      excerpt: string
    }>
  }>
  transcriptHits: Array<{
    transcriptId: string
    storytellerId: string | null
    storytellerName: string | null
    title: string
    term: string
    excerpt: string
  }>
  repoHits: Array<{
    sourcePath: string
    title: string
    term: string
    excerpt: string
  }>
  sourceLeads: Array<{
    sourceId: string
    title: string
    kind: 'repo_doc' | 'web_source'
    stage: 'start_here' | 'history' | 'governance' | 'family-history'
    authority: string
    summary: string
    whyItMatters: string
    sourcePath?: string
    url?: string
    readInApp: boolean
    matchedTerms: string[]
    excerpt: string | null
    score: number
  }>
  personLeads: Array<{
    personKey: string
    name: string
    leadKind: 'anchor_elder' | 'storyteller_match' | 'named_relation'
    confidence: 'grounded' | 'emerging' | 'name_only'
    storytellerId: string | null
    isElder: boolean
    storyCount: number | null
    transcriptCount: number | null
    relationLabels: string[]
    sourcePackets: string[]
    sourceMentions: Array<{
      sourceId: string
      title: string
      kind: 'repo_doc' | 'web_source'
      stage: 'start_here' | 'history' | 'governance' | 'family-history'
      authority: string
      summary: string
      whyItMatters: string
      sourcePath?: string
      url?: string
      readInApp: boolean
      matchedTerms: string[]
      excerpt: string | null
      score: number
    }>
    transcriptMentions: Array<{
      transcriptId: string | null
      title: string
      excerpt: string
      storytellerName: string | null
    }>
    score: number
  }>
  nextMoves: string[]
}

export interface CommunityResearchSourceItem {
  id: string
  title: string
  kind: 'repo_doc' | 'web_source'
  stage: 'start_here' | 'history' | 'governance' | 'family-history'
  authority: string
  summary: string
  whyItMatters: string
  sourcePath?: string
  url?: string
  readInApp: boolean
}

export interface CommunityResearchResponse {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  mode: 'research_leads'
  available: boolean
  note: string
  generatedAt: string | null
  sourceBase: CommunityResearchSourceItem[]
  counts: {
    storytellers: number
    transcripts: number
    stories: number
    corpusItems: number
    clusters: number
  } | null
  clusters: CommunityResearchLead[]
}

export interface CommunityFamilyClaim {
  claimId: string
  claimType: 'identity' | 'relation' | 'public_source' | string
  clusterId: string
  clusterLabel: string
  subjectName: string
  relationshipType: string
  objectName: string
  claimText: string
  sourceType: string
  sourceTitle: string
  sourceIdOrPath: string | null
  source: {
    sourceId: string | null
    sourceType: string
    title: string
    pathOrUrl: string | null
    authority: string
    accessStatus: string
    sensitivityLevel: string
    provenance: string
    lastChecked: string | null
    evidenceKinds: string[]
  }
  transcriptId: string | null
  storytellerId: string | null
  storytellerName: string | null
  excerpt: string
  evidenceKind: string
  relationScope: string
  confidence: string
  identityStatus: string
  reviewStatus: string
  visibilityStatus: string
  sensitivityLevel: string
  reviewQuestion: string
  provenance: string
}

export interface CommunityFamilyClaimRegisterResponse {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  mode: 'family_claim_register'
  available: boolean
  note: string
  generatedAt: string | null
  researchGeneratedAt: string | null
  counts: {
    clusters: number
    clustersWithClaims: number
    claims: number
    relationClaims: number
    identityClaims: number
    publicSourceClaims: number
    unreviewedClaims: number
    blockedFromTreeBuild: number
  } | null
  clusters: Array<{
    id: string
    label: string
    confidence: string
    reviewState: string
    sensitivityLevel: string
    claimCount: number
    relationClaimCount: number
    identityClaimCount: number
    publicSourceClaimCount: number
  }>
  claims: CommunityFamilyClaim[]
}

export interface CommunityResearchQueuedPerson {
  queueId: string
  personKey: string
  displayName: string
  clusterId: string
  clusterLabel: string
  role: 'anchor_storyteller' | 'named_relative' | 'unresolved_bridge_person' | 'research_person' | 'public_source_name_lead' | string
  sourceStatus: string
  queueStatus: string
  addStage: string
  addNowLayer: string
  treeStatus: string
  canCreateFamilyFolder: boolean
  canCreateKinshipProposal: boolean
  canShowPublicTree: boolean
  blockedReason: string
  roles: string[]
  personStatus: string
  sourceRefs: string[]
  relationClaimCount: number
  identityClaimCount: number
  publicSourceClaimCount: number
  aliasCandidates: string[]
  claimRefs: Array<{
    claimId: string
    claimType: string
    subjectName: string
    relationshipType: string
    objectName: string
    relationScope: string | null
    evidenceKind: string
    sourceTitle: string
    sourceIdOrPath: string | null
    sourceUrlOrPath: string | null
    sourceAuthority: string | null
    sourceType: string | null
    accessStatus: string | null
    culturalSensitivity: string | null
    place: string
    dateOrDateRange: string
    exactSourceExcerpt: string
    confidence: string | null
    reviewStatus: string | null
    reviewQuestion: string
  }>
  reviewQuestions: string[]
  nextAction: string
}

export interface CommunityResearchPeopleQueueResponse {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  mode: 'research_people_queue'
  available: boolean
  note: string
  generatedAt: string | null
  source: {
    familyDossierIndexPath: string | null
    onlineSourceCaptureDir: string | null
    sourceNote: string
  } | null
  boundary: {
    summary: string
    addNow: string[]
    doNotCreate: string[]
  } | null
  counts: {
    queuedPeople: number
    researchPeopleToAddNow: number
    anchorStorytellers: number
    namedRelatives: number
    unresolvedBridgePeople: number
    publicSourceNameLeads: number
    peopleWithRelationClaims: number
    peopleWithIdentityConflicts: number
    peopleWithPublicSourceClaims: number
    publicSourceClaims: number
    blockedFromTreeBuild: number
  } | null
  clusters: Array<{
    id: string
    label: string
    status: string
    peopleCount: number
    researchPeopleToAddNow: number
    unresolvedBridgePeople: number
    publicSourceNameLeads: number
    relationClaimCount: number
    identityClaimCount: number
    publicSourceClaimCount: number
    nextReviewQuestions: string[]
  }>
  people: CommunityResearchQueuedPerson[]
}

export interface CommunityResearchDecisionWorksheet {
  generatedAt: string
  familyClusterId: string
  familyLabel: string
  familyNameLock: {
    workingFamilyName: string
    status: string
    lockLayer: string
    truthStatus: string
    lockedForDeepResearch: boolean
    canCreateFamilyFolder: boolean
    canCreateKinshipProposal: boolean
    canShowPublicTree: boolean
    lockedReason: string
    anchorPeople: string[]
    surnameVariants: string[]
    aliasConflicts: Array<{
      subjectName: string
      relationshipType: string
      objectName: string
      evidenceKind: string
      reviewQuestion: string
    }>
    evidenceSummary: {
      peopleDecisions: number
      identityDecisions: number
      relationDecisions: number
      publicSourceDecisions: number
      sourceRefs: string[]
    }
    onlineResearchPlan: {
      searchStrings: string[]
      sourceTargets: string[]
      captureFields: string[]
      nextQuestions: string[]
    }
  }
  boundary: {
    summary: string
    doNotCreate: string[]
  }
  counts: {
    peopleDecisions: number
    identityDecisions: number
    publicSourceDecisions: number
    relationDecisions: number
    bridgeBlockers: number
    proposalCandidatesAfterReview: number
    blockedFromTree: number
  }
  decisionSequence: Array<{
    step: number
    label: string
    count: number
    action: string
  }>
  peopleDecisions: Array<{
    personKey: string
    displayName: string
    clusterId: string
    clusterLabel: string
    role: string
    decisionType: string
    reviewLayer: string
    sourceRefs: string[]
    relationClaimIds: string[]
    identityClaimIds: string[]
    publicSourceClaimIds: string[]
    blockedFromTree: boolean
    nextAction: string
  }>
  identityDecisions: Array<{
    decisionId: string
    claimId: string
    subjectName: string
    relationshipType: string
    objectName: string
    evidenceKind: string
    reviewLayer: string
    status: string
    promotionPath: string
    reviewQuestion: string
  }>
  publicSourceDecisions: Array<{
    decisionId: string
    claimId: string
    subjectName: string
    relationshipType: string
    objectName: string
    evidenceKind: string
    sourceTitle: string
    sourceIdOrPath: string | null
    sourceUrlOrPath: string | null
    sourceAuthority: string | null
    sourceType: string | null
    accessStatus: string | null
    culturalSensitivity: string | null
    exactSourceExcerpt: string
    confidence: string
    matchedPersonKey: string
    matchedDisplayName: string
    personMatchStatus: string
    reviewLayer: string
    status: string
    promotionPath: string
    blockedFromTree: boolean
    reviewQuestion: string
    nextAction: string
    reviewDecision: {
      id: string
      decision: string
      matchedPersonKey: string | null
      matchedDisplayName: string | null
      canonicalDisplayName: string | null
      notes: string
      reviewedAt: string
      updatedAt: string
    } | null
  }>
  relationDecisions: Array<{
    decisionId: string
    claimId: string
    subjectName: string
    relationshipType: string
    objectName: string
    relationScope: string
    evidenceKind: string
    evidenceState: string
    sourceTitle: string
    sourceIdOrPath: string | null
    excerpt: string
    reviewQuestion: string
    reviewLayer: string
    blockedFromTree: boolean
    status: string
    promotionPath: string
    nextAction: string
  }>
}

export interface CommunityResearchDecisionWorksheetsResponse {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  mode: 'palm_review_decision_worksheets'
  available: boolean
  note: string
  generatedAt: string | null
  counts: {
    worksheets: number
    familyNameLocks: number
    peopleDecisions: number
    identityDecisions: number
    publicSourceDecisions: number
    relationDecisions: number
    bridgeBlockers: number
    proposalCandidatesAfterReview: number
  } | null
  publicSourceReviewSummary?: {
    reviewed: number
    unreviewed: number
    treeMutationsCreated: number
    status: string
  }
  worksheets: CommunityResearchDecisionWorksheet[]
}

export interface CommunityResearchOnlineSourceIntakeFamily {
  familyClusterId: string
  familyLabel: string
  workingFamilyName: string
  mode: 'online_source_intake_family'
  status: string
  lockStatus: string
  truthStatus: string
  boundary: {
    summary: string
    doNotCreate: string[]
  }
  counts: {
    searchTasks: number
    sourceTargets: number
    captureFields: number
    nextQuestions: number
    capturedSources: number
    capturedClaims: number
    reviewQueueClaims: number
    matchedExistingResearchPeople: number
    newPublicNameLeads: number
    sourcePathwayClaims: number
  }
  sourceCaptureQueue: Array<{
    searchId: string
    searchString: string
    searchUrl: string
    status: string
    sourceTargets: string[]
    captureRule: string
  }>
  capturedSources: Array<{
    sourceId: string
    familyClusterId: string
    workingFamilyName: string
    sourceTitle: string
    urlOrArchivePath: string
    publisherOrHoldingInstitution: string
    sourceType: string
    authority: string
    accessStatus: string
    culturalSensitivity: string
    dateOrDateRange: string
    nameSpellingsExact: string[]
    excerptOrPageReference: string
    verifiedSummary: string
    matchedSearchTasks: string[]
    provenanceNote: string
    lastChecked: string
    claims: Array<{
      claimId: string
      claimType: string
      subjectName: string
      relationshipType: string
      objectName: string
      place: string
      dateOrDateRange: string
      exactSourceExcerpt: string
      sourceId: string
      confidence: string
      reviewStatus: string
      blockedFromTree: boolean
      reviewQuestion: string
    }>
  }>
  capturedClaims: Array<{
    claimId: string
    claimType: string
    subjectName: string
    relationshipType: string
    objectName: string
    place: string
    dateOrDateRange: string
    exactSourceExcerpt: string
    sourceId: string
    confidence: string
    reviewStatus: string
    blockedFromTree: boolean
    reviewQuestion: string
  }>
  capturedClaimReviewQueue: Array<{
    reviewId: string
    claimId: string
    sourceId: string
    sourceTitle: string
    subjectName: string
    claimType: string
    place: string
    dateOrDateRange: string
    exactSourceExcerpt: string
    matchedPersonKey: string | null
    matchedDisplayName: string | null
    personMatchStatus: string
    reviewLayer: string
    reviewStatus: string
    blockedFromTree: boolean
    reviewQuestion: string
    nextAction: string
  }>
  sourceDescriptorTemplate: {
    sourceId: string
    familyClusterId: string
    workingFamilyName: string
    sourceTitle: string
    urlOrArchivePath: string
    publisherOrHoldingInstitution: string
    sourceType: string
    authority: string
    accessStatus: string
    culturalSensitivity: string
    dateOrDateRange: string
    nameSpellingsExact: string[]
    excerptOrPageReference: string
    provenanceNote: string
    lastChecked: string
  }
  claimCaptureTemplate: {
    claimId: string
    claimType: string
    subjectName: string
    relationshipType: string
    objectName: string
    place: string
    dateOrDateRange: string
    exactSourceExcerpt: string
    sourceId: string
    confidence: string
    reviewStatus: string
    blockedFromTree: boolean
    reviewQuestion: string
  }
  captureFields: string[]
  sourceTargets: string[]
  nextQuestions: string[]
  evidenceRules: string[]
}

export interface CommunityResearchOnlineSourceIntakeResponse {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  mode: 'palm_online_source_intake'
  available: boolean
  note: string
  generatedAt: string | null
  boundary: {
    summary: string
    doNotCreate: string[]
  } | null
  counts: {
    families: number
    searchTasks: number
    sourceTargets: number
    capturedSources: number
    capturedClaims: number
    reviewQueueClaims: number
    matchedExistingResearchPeople: number
    newPublicNameLeads: number
    sourcePathwayClaims: number
  } | null
  families: CommunityResearchOnlineSourceIntakeFamily[]
}

export interface CommunityResearchSourceDetailResponse {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  mode: 'research_source'
  note: string
  source: CommunityResearchSourceItem & {
    content: string | null
  }
}

export interface CommunityResearchPersonDetailResponse {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  mode: 'research_person'
  note: string
  person: {
    personKey: string
    name: string
    confidence: 'grounded' | 'emerging' | 'name_only'
    leadKinds: Array<'anchor_elder' | 'storyteller_match' | 'named_relation' | 'public_source_name_lead' | string>
    storytellerId: string | null
    isElder: boolean
    storyCount: number | null
    transcriptCount: number | null
    relationLabels: string[]
    sourcePackets: string[]
    families: Array<{
      id: string
      label: string
      evidenceScore: number
    }>
    sourceMentions: CommunityResearchLead['sourceLeads']
    transcriptMentions: Array<{
      transcriptId: string | null
      title: string
      excerpt: string
      storytellerName: string | null
    }>
  }
}

export interface KinshipProposal {
  id: string
  requestedByKeyType: string
  requestedByOrgId: string | null
  requestedByStorytellerId: string | null
  requestedByStorytellerName: string | null
  requestedByFamilyFolderId: string | null
  fromStorytellerId: string
  fromStorytellerName: string
  toStorytellerId: string
  toStorytellerName: string
  relationType: string
  vocabularyOrgId: string | null
  isPrimary: boolean
  culturalContext: Record<string, unknown> | null
  notes: string | null
  visibility: Visibility
  culturalSensitivityLevel: CulturalSensitivity
  validFrom: string | null
  validTo: string | null
  targetCommunityId: string | null
  reviewScope: 'family' | 'community'
  reviewStatus: 'pending' | 'approved' | 'rejected'
  reviewReason: string | null
  reviewedAt: string | null
  appliedRelationIds: string[]
  appliedAt: string | null
  reviews: Array<{
    id: string
    familyFolderId: string | null
    communityId: string | null
    reviewerStorytellerId: string
    reviewerRole: string
    decision: 'approved' | 'rejected'
    notes: string | null
    createdAt: string
  }>
  requiredFamilyFolderIds: string[]
  approvedFamilyFolderIds: string[]
  communityApproved: boolean
  readyToApply: boolean
  createdAt: string
  updatedAt: string
}

export interface CommunityFamilyLink {
  id: string
  communityId: string
  communityName: string
  communitySlug: string
  communityLocation: string | null
  familyFolderId: string
  familyName: string
  familySlug: string
  requestedBySide: string
  requestedByStorytellerId: string | null
  requestedByStorytellerName: string | null
  familyApprovedAt: string | null
  communityApprovedAt: string | null
  decisionNotes: string | null
  status: 'pending' | 'active' | 'rejected' | 'revoked'
  joinedAt: string
}

export type ConnectionStatus =
  | 'suggested' | 'intro_sent' | 'talking' | 'meeting_planned'
  | 'met' | 'ongoing' | 'closed_success' | 'closed_no_fit'

export interface ExternalContact {
  name: string
  email?: string | null
  phone?: string | null
  role?: string | null
  org?: string | null
  notes?: string | null
}

export interface Connection {
  id: string
  aspirationEventId: string
  aspiration: {
    id: string
    title: string
    eventYear: number | null
    subjects: PersonRef[]
  } | null
  connector: PersonRef | null
  mentor: PersonRef | null
  externalContact: ExternalContact | null
  status: ConnectionStatus
  domain: string | null
  introSentAt: string | null
  firstMetAt: string | null
  lastActivityAt: string | null
  notes: string | null
  outcomeSummary: string | null
  visibility: Visibility
  culturalSensitivityLevel: CulturalSensitivity
  organizationId: string | null
  createdAt: string
  updatedAt: string
}

export interface TimelineEventDetail extends TimelineEventSummary {
  subGoals: Array<{
    id: string
    title: string
    kind: TimelineEventKind
    status: TimelineEventStatus
    eventDate: string | null
    eventYear: number | null
    domain: string[]
    visibility: Visibility
  }>
  stories: Array<{
    id: string
    title: string
    excerpt: string | null
    imageUrl: string | null
  }>
  media: Array<{
    id: string
    url: string | null
    thumbnailUrl: string | null
    caption: string | null
    displayOrder: number
  }>
}

export interface Paginated<T> {
  data: T[]
  pagination: { page: number; limit: number; total: number }
}

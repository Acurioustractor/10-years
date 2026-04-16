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

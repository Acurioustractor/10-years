import type { KinshipCategory, KinshipEdge, PersonRef } from './types'

export function normalizeKinshipCategory(raw: string): KinshipCategory {
  const category = (raw || 'other').toLowerCase().replace(/\s+/g, '_')

  if (category === 'spouse' || category === 'husband' || category === 'wife' || category === 'de_facto') {
    return 'partner'
  }

  const knownCategories: KinshipCategory[] = [
    'parent',
    'child',
    'sibling',
    'grandparent',
    'grandchild',
    'extended',
    'partner',
    'chosen_family',
    'ceremonial',
    'mentor',
    'other',
  ]

  return knownCategories.includes(category as KinshipCategory)
    ? (category as KinshipCategory)
    : 'other'
}

export function invertKinshipCategory(category: KinshipCategory): KinshipCategory {
  if (category === 'parent') return 'child'
  if (category === 'child') return 'parent'
  if (category === 'grandparent') return 'grandchild'
  if (category === 'grandchild') return 'grandparent'
  return category
}

export function getKinshipPerspectiveForPerson(
  edge: KinshipEdge,
  personId: string
): { counterpart: PersonRef; category: KinshipCategory } | null {
  if (edge.from.id !== personId && edge.to.id !== personId) return null

  const outgoing = edge.from.id === personId
  const counterpart = outgoing ? edge.to : edge.from
  const baseCategory = normalizeKinshipCategory(edge.vocabulary.category || edge.relationType)

  return {
    counterpart,
    category: outgoing ? invertKinshipCategory(baseCategory) : baseCategory,
  }
}

export function isPartnerKinshipEdge(edge: Pick<KinshipEdge, 'relationType' | 'vocabulary'>): boolean {
  return normalizeKinshipCategory(edge.vocabulary.category || edge.relationType) === 'partner'
}

export function getParentChildDirection(
  edge: Pick<KinshipEdge, 'relationType' | 'vocabulary' | 'from' | 'to'>
): { parentId: string; childId: string } | null {
  const category = normalizeKinshipCategory(edge.vocabulary.category || edge.relationType)

  if (category === 'parent') {
    return { parentId: edge.from.id, childId: edge.to.id }
  }

  if (category === 'child') {
    return { parentId: edge.to.id, childId: edge.from.id }
  }

  return null
}

export function relationLabelForCategory(category: KinshipCategory, fallback: string): string {
  const relation = (fallback || '').toLowerCase()

  if (category === 'parent') return 'parent'
  if (category === 'child') return 'child'
  if (category === 'grandparent') return 'grandparent'
  if (category === 'grandchild') return 'grandchild'
  if (category === 'sibling') return 'sibling'
  if (category === 'partner') return relation === 'spouse' ? 'partner' : (fallback || 'partner')

  return fallback || category
}

export function kinshipCategoryLabel(category: KinshipCategory): string {
  const labels: Record<KinshipCategory, string> = {
    partner: 'Partners',
    parent: 'Parents',
    child: 'Children',
    sibling: 'Siblings',
    grandparent: 'Grandparents',
    grandchild: 'Grandchildren',
    extended: 'Extended family',
    ceremonial: 'Ceremonial',
    mentor: 'Mentors',
    chosen_family: 'Chosen family',
    other: 'Other',
  }

  return labels[category]
}

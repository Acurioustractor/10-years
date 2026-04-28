import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import { useKinship } from '@/hooks/useKinship'
import { useSession } from '@/contexts/SessionContext'
import { getParentChildDirection, isPartnerKinshipEdge } from '@/services/kinship'
import type { KinshipEdge, PersonRef } from '@/services/types'

type ViewMode = 'tree' | 'cards'

export default function FamilyTreePage() {
  const { familySlug } = useParams<{ familySlug?: string }>()
  const { graph, loading, error, notConfigured } = useKinship()
  const { familySession } = useSession()
  const [viewMode, setViewMode] = useState<ViewMode>('tree')

  const families = useMemo(() => clusterFamilies(graph.nodes, graph.edges), [graph])

  const canEdit = familySession && ['elder', 'family_rep'].includes(familySession.member.role)

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Family tree</h1>
          <p className="text-ink/60 mt-1 max-w-2xl">
            This view only shows kinship-connected family people. Folder access and governance are managed separately.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <Link
              to={`/f/${familySession?.folder.slug || familySlug || ''}/settings`}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-ochre border border-ochre/30 hover:bg-ochre/10 transition-colors"
            >
              Manage access
            </Link>
          )}
          <div className="flex items-center gap-1 rounded-full bg-sand/40 p-1">
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${viewMode === 'tree' ? 'bg-cream text-ink shadow-sm' : 'text-ink/60 hover:text-ink'}`}
          >
            Tree
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${viewMode === 'cards' ? 'bg-cream text-ink shadow-sm' : 'text-ink/60 hover:text-ink'}`}
          >
            Cards
          </button>
        </div>
        </div>
      </header>

      <div className="mb-8">
        <CrossAppGuideCard
          title="Edit storyteller records there. Read lineage here."
          description="The family tree is the lineage view, not the source-record editor. Use Empathy Ledger to change storyteller records, transcripts, stories, or photos. Use 10 Years to read the approved family tree and move into governance when family truth changes."
          editingItems={[
            'Storyteller records, transcript evidence, stories, and photos belong in Empathy Ledger.',
            'If the source record is wrong, fix it there before treating it as family truth here.',
          ]}
          engagementItems={[
            'Read the approved family lineage here.',
            'Move into family governance when kinship or community-handshake decisions need review.',
          ]}
          ledgerPath="/admin/storytellers"
          ledgerLabel="Open storyteller records in Empathy Ledger"
        />
      </div>

      {!loading && !error && (
        <div className="mb-6 rounded-xl border border-ink/8 bg-sand/20 px-4 py-3 text-sm text-ink/65">
          People appear here when kinship is recorded. Folder access is managed separately in family settings and does not place someone into the lineage tree by itself.
        </div>
      )}

      {notConfigured && <Notice tone="ochre" title="Not configured yet" body="Add the Empathy Ledger API key to .env.local and restart." />}
      {error && !notConfigured && <Notice tone="red" title="Could not load kinship." body={error.message} />}
      {loading && !notConfigured && <div className="py-10 text-center text-ink/50">Loading…</div>}

      {!loading && !error && families.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-serif text-2xl text-ink mb-2">No kinship recorded yet.</p>
          <p className="text-ink/60">
            Once relations are seeded, each family group appears here with its elders first.
          </p>
        </div>
      )}

      {viewMode === 'tree' ? (
        <div className="space-y-12">
          {families.map((fam, idx) => (
            <FamilyTreeViz key={idx} family={fam} familySlug={familySlug} />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {families.map((fam, idx) => (
            <FamilyCard key={idx} family={fam} familySlug={familySlug} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tree Visualization ─────────────────────────────────────────────────

interface TreeNode {
  person: PersonRef
  children: TreeNode[]
  x: number
  y: number
  generation: number
}

function isPartnerEdge(edge: KinshipEdge): boolean {
  return isPartnerKinshipEdge(edge)
}

function FamilyTreeViz({ family, familySlug }: { family: Family; familySlug?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const tree = useMemo(() => buildTree(family), [family])

  const containerRef = useRef<HTMLDivElement>(null)

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: Math.max(400, tree.totalGenerations * 140 + 80),
      })
    }
  }, [tree.totalGenerations])

  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [updateDimensions])

  const nodeWidth = 120
  const nodeHeight = 52
  const genSpacing = 130
  const padding = 40

  const positioned = useMemo(() => {
    const nodes = tree.nodes
    const genGroups = new Map<number, typeof nodes>()
    for (const n of nodes) {
      const group = genGroups.get(n.generation) || []
      group.push(n)
      genGroups.set(n.generation, group)
    }

    const result: Array<{ person: PersonRef; x: number; y: number; generation: number; childIds: string[] }> = []
    const maxNodesInGen = Math.max(...[...genGroups.values()].map(g => g.length), 1)
    const effectiveWidth = Math.max(dimensions.width - padding * 2, maxNodesInGen * (nodeWidth + 20))

    for (const [gen, group] of genGroups) {
      const totalWidth = group.length * (nodeWidth + 20) - 20
      const startX = (effectiveWidth - totalWidth) / 2 + padding
      group.forEach((n, i) => {
        result.push({
          person: n.person,
          x: startX + i * (nodeWidth + 20),
          y: padding + gen * genSpacing,
          generation: gen,
          childIds: n.children.map(c => c.person.id),
        })
      })
    }
    return result
  }, [tree.nodes, dimensions.width])

  const lines = useMemo(() => {
    const posMap = new Map(positioned.map(p => [p.person.id, p]))
    const result: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
    for (const node of positioned) {
      for (const childId of node.childIds) {
        const child = posMap.get(childId)
        if (child) {
          result.push({
            x1: node.x + nodeWidth / 2,
            y1: node.y + nodeHeight,
            x2: child.x + nodeWidth / 2,
            y2: child.y,
          })
        }
      }
    }
    return result
  }, [positioned])

  const partnerLines = useMemo(() => {
    const posMap = new Map(positioned.map(p => [p.person.id, p]))
    const seen = new Set<string>()
    const result: Array<{ x1: number; y1: number; x2: number; y2: number }> = []

    for (const edge of family.edges) {
      if (!isPartnerEdge(edge)) continue
      const a = edge.from.id
      const b = edge.to.id
      const key = a < b ? `${a}|${b}` : `${b}|${a}`
      if (seen.has(key)) continue
      seen.add(key)

      const p1 = posMap.get(a)
      const p2 = posMap.get(b)
      if (!p1 || !p2) continue

      result.push({
        x1: p1.x + nodeWidth / 2,
        y1: p1.y + nodeHeight / 2,
        x2: p2.x + nodeWidth / 2,
        y2: p2.y + nodeHeight / 2,
      })
    }

    return result
  }, [family.edges, positioned])

  const anchorLabel = family.people.find(p => p.isElder)?.displayName || family.people[0]?.displayName || 'Family'
  const svgWidth = Math.max(dimensions.width, positioned.reduce((max, p) => Math.max(max, p.x + nodeWidth + padding), 0))
  const svgHeight = Math.max(dimensions.height, positioned.reduce((max, p) => Math.max(max, p.y + nodeHeight + padding), 0))

  return (
    <section className="border border-ink/10 rounded-xl bg-cream overflow-hidden">
      <header className="px-6 py-4 border-b border-ink/5">
        <div className="text-xs uppercase tracking-widest text-ochre">Family</div>
        <h2 className="font-serif text-2xl text-ink">
          {anchorLabel}{family.people.length > 1 ? ` + ${family.people.length - 1}` : ''}
        </h2>
        <div className="text-xs text-ink/40 mt-1">
          {tree.totalGenerations} generation{tree.totalGenerations !== 1 ? 's' : ''} · {family.people.length} people
        </div>
      </header>
      <div ref={containerRef} className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="block"
        >
          {/* Partner/spouse links */}
          {partnerLines.map((l, i) => (
            <line
              key={`partner-${i}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="#b15427"
              strokeOpacity={0.35}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          ))}

          {/* Connection lines */}
          {lines.map((l, i) => {
            const midY = (l.y1 + l.y2) / 2
            return (
              <path
                key={i}
                d={`M${l.x1},${l.y1} C${l.x1},${midY} ${l.x2},${midY} ${l.x2},${l.y2}`}
                fill="none"
                stroke="#1a1612"
                strokeOpacity={0.12}
                strokeWidth={1.5}
              />
            )
          })}

          {/* Person nodes */}
          {positioned.map(node => {
            const isHovered = hoveredId === node.person.id
            const isElder = node.person.isElder
            return (
              <g key={node.person.id}>
                <Link to={familySlug ? `/f/${familySlug}/person/${node.person.id}` : `/person/${node.person.id}`}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={12}
                    fill={isHovered ? '#e8dcc4' : isElder ? '#b15427' : '#f5eedf'}
                    fillOpacity={isElder ? 0.12 : 1}
                    stroke={isElder ? '#b15427' : '#1a1612'}
                    strokeOpacity={isElder ? 0.4 : 0.08}
                    strokeWidth={isHovered ? 2 : 1}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredId(node.person.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                  {node.person.avatarUrl ? (
                    <image
                      href={node.person.avatarUrl}
                      x={node.x + 8}
                      y={node.y + 10}
                      width={32}
                      height={32}
                      clipPath="inset(0 round 16px)"
                    />
                  ) : (
                    <>
                      <circle
                        cx={node.x + 24}
                        cy={node.y + 26}
                        r={14}
                        fill={isElder ? '#b15427' : '#e8dcc4'}
                        fillOpacity={isElder ? 0.2 : 1}
                      />
                      <text
                        x={node.x + 24}
                        y={node.y + 30}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={500}
                        fill="#6b3a1f"
                      >
                        {node.person.displayName.slice(0, 2).toUpperCase()}
                      </text>
                    </>
                  )}
                  <text
                    x={node.x + 44}
                    y={node.y + 22}
                    fontSize={11}
                    fontFamily="Lora, serif"
                    fill="#1a1612"
                    className="pointer-events-none"
                  >
                    {node.person.displayName.length > 10
                      ? node.person.displayName.split(' ')[0]
                      : node.person.displayName}
                  </text>
                  {isElder && (
                    <text
                      x={node.x + 44}
                      y={node.y + 36}
                      fontSize={8}
                      fill="#b15427"
                      letterSpacing={1}
                      style={{ textTransform: 'uppercase' }}
                    >
                      ELDER
                    </text>
                  )}
                  {!isElder && (
                    <text
                      x={node.x + 44}
                      y={node.y + 36}
                      fontSize={9}
                      fill="#1a1612"
                      fillOpacity={0.35}
                    >
                      {node.person.displayName.split(' ').slice(1).join(' ').slice(0, 10)}
                    </text>
                  )}
                </Link>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}

function buildTree(family: Family): { nodes: TreeNode[]; totalGenerations: number } {
  const childrenOf = new Map<string, Set<string>>()
  const parentsOf = new Map<string, Set<string>>()

  // API semantics:
  // - relationType/category "parent": from is parent of to
  // - relationType/category "child": from is child of to
  // Normalize both into parent -> child edges for tree layout.
  for (const e of family.edges) {
    const direction = getParentChildDirection(e)
    if (!direction) continue

    const { parentId, childId } = direction

    const set = childrenOf.get(parentId) || new Set<string>()
    set.add(childId)
    childrenOf.set(parentId, set)

    const parentSet = parentsOf.get(childId) || new Set<string>()
    parentSet.add(parentId)
    parentsOf.set(childId, parentSet)

  }

  const personMap = new Map(family.people.map(p => [p.id, p]))

  // Deterministic generation assignment:
  // generation(person) = 0 for roots, else 1 + max(generation(parent))
  const generationMemo = new Map<string, number>()
  function generationOf(personId: string, path = new Set<string>()): number {
    const memo = generationMemo.get(personId)
    if (memo !== undefined) return memo

    if (path.has(personId)) {
      // Defensive cycle break for bad data.
      return 0
    }

    const parents = parentsOf.get(personId)
    if (!parents || parents.size === 0) {
      generationMemo.set(personId, 0)
      return 0
    }

    path.add(personId)
    let maxParentGen = 0
    for (const parentId of parents) {
      maxParentGen = Math.max(maxParentGen, generationOf(parentId, path))
    }
    path.delete(personId)

    const gen = maxParentGen + 1
    generationMemo.set(personId, gen)
    return gen
  }

  const generationById = new Map<string, number>()
  for (const person of family.people) {
    generationById.set(person.id, generationOf(person.id))
  }

  // Keep partner/spouse nodes in the same generation to avoid split couples.
  // We align a partner cluster to its highest generation so descendants stay below.
  const partnerParent = new Map<string, string>()
  const partnerFind = (id: string): string => {
    const root = partnerParent.get(id)
    if (!root || root === id) return id
    const next = partnerFind(root)
    partnerParent.set(id, next)
    return next
  }
  const partnerUnion = (a: string, b: string) => {
    const ra = partnerFind(a)
    const rb = partnerFind(b)
    if (ra !== rb) partnerParent.set(ra, rb)
  }

  for (const person of family.people) partnerParent.set(person.id, person.id)
  for (const edge of family.edges) {
    if (isPartnerEdge(edge)) partnerUnion(edge.from.id, edge.to.id)
  }

  const partnerGroups = new Map<string, string[]>()
  for (const person of family.people) {
    const root = partnerFind(person.id)
    const group = partnerGroups.get(root) || []
    group.push(person.id)
    partnerGroups.set(root, group)
  }

  for (const ids of partnerGroups.values()) {
    if (ids.length < 2) continue
    const targetGeneration = ids.reduce(
      (max, id) => Math.max(max, generationById.get(id) ?? 0),
      0
    )
    for (const id of ids) generationById.set(id, targetGeneration)
  }

  const nodes: TreeNode[] = family.people.map(person => {
    const kids = childrenOf.get(person.id) || new Set<string>()
    const childNodes: TreeNode[] = []
    for (const kidId of kids) {
      const kidPerson = personMap.get(kidId)
      if (!kidPerson) continue
      childNodes.push({
        person: kidPerson,
        children: [],
        x: 0,
        y: 0,
        generation: generationById.get(kidId) ?? 0,
      })
    }
    return {
      person,
      children: childNodes,
      x: 0,
      y: 0,
      generation: generationById.get(person.id) ?? 0,
    }
  })

  const maxGen = nodes.reduce((max, n) => Math.max(max, n.generation), 0)
  return { nodes, totalGenerations: maxGen + 1 }
}

// ─── Card View (original) ───────────────────────────────────────────────

function FamilyCard({ family, familySlug }: { family: Family; familySlug?: string }) {
  const elders = family.people.filter(p => p.isElder)
  const rest = family.people.filter(p => !p.isElder)

  const relationsFor = (personId: string) =>
    family.edges
      .filter(e => e.from.id === personId)
      .map(e => `${e.vocabulary.label || e.relationType} of ${e.to.displayName}`)

  const anchorLabel = elders[0]?.displayName || family.people[0]?.displayName || 'Family'

  return (
    <section className="border border-ink/10 rounded-xl bg-cream p-6">
      <header className="mb-4">
        <div className="text-xs uppercase tracking-widest text-ochre">Family</div>
        <h2 className="font-serif text-2xl text-ink">
          {anchorLabel}{family.people.length > 1 ? ` + ${family.people.length - 1}` : ''}
        </h2>
      </header>

      {elders.length > 0 && (
        <div className="mb-5">
          <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">Elders</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {elders.map(p => (
              <PersonCard
                key={p.id}
                person={p}
                relations={relationsFor(p.id)}
                familySlug={familySlug}
                elder
              />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">Family people</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {rest.map(p => (
              <PersonCard
                key={p.id}
                person={p}
                relations={relationsFor(p.id)}
                familySlug={familySlug}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function PersonCard({
  person,
  relations,
  familySlug,
  elder,
}: {
  person: PersonRef
  relations: string[]
  familySlug?: string
  elder?: boolean
}) {
  return (
    <Link
      to={familySlug ? `/f/${familySlug}/person/${person.id}` : `/person/${person.id}`}
      className={[
        'block p-3 rounded-lg border transition-colors',
        elder ? 'border-ochre/40 bg-ochre/5 hover:bg-ochre/10' : 'border-ink/10 hover:bg-sand/30',
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
          {elder && <div className="text-[10px] uppercase tracking-wider text-ochre">Elder</div>}
        </div>
      </div>
      {relations.length > 0 && (
        <ul className="mt-3 text-xs text-ink/60 space-y-0.5">
          {relations.slice(0, 3).map((r, i) => <li key={i} className="truncate">{r}</li>)}
          {relations.length > 3 && <li className="text-ink/40">+ {relations.length - 3} more</li>}
        </ul>
      )}
    </Link>
  )
}

function Notice({ tone, title, body }: { tone: 'ochre' | 'red'; title: string; body: string }) {
  const cls = tone === 'red'
    ? 'border-red-200 bg-red-50 text-red-900'
    : 'border-ochre/30 bg-ochre/5 text-ink'
  return (
    <div className={`rounded-lg border ${cls} p-6 mb-6`}>
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm opacity-75">{body}</div>
    </div>
  )
}

// ─── Clustering ─────────────────────────────────────────────────────────

interface Family {
  people: PersonRef[]
  edges: KinshipEdge[]
}

function clusterFamilies(nodes: PersonRef[], edges: KinshipEdge[]): Family[] {
  const parent = new Map<string, string>()
  const find = (x: string): string => {
    const p = parent.get(x)
    if (!p || p === x) return x
    const root = find(p)
    parent.set(x, root)
    return root
  }
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }

  for (const n of nodes) parent.set(n.id, n.id)
  for (const e of edges) {
    if (!parent.has(e.from.id)) parent.set(e.from.id, e.from.id)
    if (!parent.has(e.to.id)) parent.set(e.to.id, e.to.id)
    union(e.from.id, e.to.id)
  }

  const groups = new Map<string, Family>()
  for (const n of nodes) {
    const root = find(n.id)
    const g = groups.get(root) || { people: [], edges: [] }
    g.people.push(n)
    groups.set(root, g)
  }
  for (const e of edges) {
    const root = find(e.from.id)
    const g = groups.get(root)
    if (g) g.edges.push(e)
  }

  return [...groups.values()]
    .filter(g => g.people.length > 1)
    .sort((a, b) => b.people.length - a.people.length)
}

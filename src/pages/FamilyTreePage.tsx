import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useKinship } from '@/hooks/useKinship'
import { useSession } from '@/contexts/SessionContext'
import AddPersonPanel from '@/components/AddPersonPanel'
import type { KinshipEdge, PersonRef } from '@/services/types'

type ViewMode = 'tree' | 'cards'

export default function FamilyTreePage() {
  const { graph, loading, error, notConfigured, refetch } = useKinship()
  const { familySession } = useSession()
  const [viewMode, setViewMode] = useState<ViewMode>('tree')
  const [showAddPerson, setShowAddPerson] = useState(false)

  const families = useMemo(() => clusterFamilies(graph.nodes, graph.edges), [graph])

  const canEdit = familySession && ['elder', 'family_rep'].includes(familySession.member.role)

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Family</h1>
          <p className="text-ink/60 mt-1 max-w-2xl">
            Elders, aunties, uncles, kids — every story on the timeline sits inside one of these.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddPerson(true)}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-ochre border border-ochre/30 hover:bg-ochre/10 transition-colors"
            >
              + Add person
            </button>
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

      {showAddPerson && (
        <AddPersonPanel onClose={() => setShowAddPerson(false)} onAdded={() => refetch()} />
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
            <FamilyTreeViz key={idx} family={fam} />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {families.map((fam, idx) => (
            <FamilyCard key={idx} family={fam} />
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

function FamilyTreeViz({ family }: { family: Family }) {
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
                <Link to={`/person/${node.person.id}`}>
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
  const parentEdges = family.edges.filter(e =>
    e.vocabulary.category === 'parent' || e.relationType === 'parent'
  )
  const childEdges = family.edges.filter(e =>
    e.vocabulary.category === 'child' || e.relationType === 'child'
  )

  const childrenOf = new Map<string, Set<string>>()
  for (const e of childEdges) {
    const set = childrenOf.get(e.from.id) || new Set()
    set.add(e.to.id)
    childrenOf.set(e.from.id, set)
  }
  for (const e of parentEdges) {
    const set = childrenOf.get(e.to.id) || new Set()
    set.add(e.from.id)
    childrenOf.set(e.to.id, set)
  }

  const hasParent = new Set<string>()
  for (const e of parentEdges) hasParent.add(e.from.id)
  for (const e of childEdges) hasParent.add(e.to.id)

  const roots = family.people.filter(p => !hasParent.has(p.id))
  if (roots.length === 0 && family.people.length > 0) {
    const elders = family.people.filter(p => p.isElder)
    roots.push(...(elders.length > 0 ? elders : [family.people[0]]))
  }

  const personMap = new Map(family.people.map(p => [p.id, p]))
  const visited = new Set<string>()

  function buildNode(person: PersonRef, gen: number): TreeNode {
    visited.add(person.id)
    const kids = childrenOf.get(person.id) || new Set()
    const childNodes: TreeNode[] = []
    for (const kidId of kids) {
      if (visited.has(kidId)) continue
      const kidPerson = personMap.get(kidId)
      if (kidPerson) childNodes.push(buildNode(kidPerson, gen + 1))
    }
    return { person, children: childNodes, x: 0, y: 0, generation: gen }
  }

  const treeRoots = roots.map(r => buildNode(r, 0))

  // Add unvisited people as gen-0
  for (const p of family.people) {
    if (!visited.has(p.id)) {
      treeRoots.push(buildNode(p, 0))
    }
  }

  function flatten(node: TreeNode): TreeNode[] {
    return [node, ...node.children.flatMap(flatten)]
  }

  const allNodes = treeRoots.flatMap(flatten)
  const maxGen = allNodes.reduce((max, n) => Math.max(max, n.generation), 0)

  return { nodes: allNodes, totalGenerations: maxGen + 1 }
}

// ─── Card View (original) ───────────────────────────────────────────────

function FamilyCard({ family }: { family: Family }) {
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
            {elders.map(p => <PersonCard key={p.id} person={p} relations={relationsFor(p.id)} elder />)}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">Family members</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {rest.map(p => <PersonCard key={p.id} person={p} relations={relationsFor(p.id)} />)}
          </div>
        </div>
      )}
    </section>
  )
}

function PersonCard({ person, relations, elder }: { person: PersonRef; relations: string[]; elder?: boolean }) {
  return (
    <Link
      to={`/person/${person.id}`}
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

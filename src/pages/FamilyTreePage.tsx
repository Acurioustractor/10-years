import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useKinship } from '@/hooks/useKinship'
import type { KinshipEdge, PersonRef } from '@/services/types'

/**
 * Family tree, v1: groups people into connected components (families) by
 * kinship, then renders each family as a card with elders pinned at the
 * top and each person listing their relations.
 *
 * A richer SVG / force-directed view comes later. This gets the data
 * readable and shareable immediately.
 */
export default function FamilyTreePage() {
  const { graph, loading, error, notConfigured } = useKinship()

  const families = useMemo(() => clusterFamilies(graph.nodes, graph.edges), [graph])

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Family</h1>
        <p className="text-ink/60 mt-1 max-w-2xl">
          Elders, aunties, uncles, kids — every story on the timeline sits inside one of these.
        </p>
      </header>

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

      <div className="space-y-10">
        {families.map((fam, idx) => (
          <FamilyCard key={idx} family={fam} />
        ))}
      </div>
    </div>
  )
}

function FamilyCard({ family }: { family: Family }) {
  const elders = family.people.filter(p => p.isElder)
  const rest = family.people.filter(p => !p.isElder)

  const relationsFor = (personId: string) =>
    family.edges
      .filter(e => e.from.id === personId)
      .map(e => `${e.vocabulary.label || e.relationType} of ${e.to.displayName}`)

  const anchorLabel = elders[0]?.displayName || family.people[0]?.displayName || 'Family'

  return (
    <section className="border border-ink/10 rounded-lg bg-cream p-6">
      <header className="mb-4">
        <div className="text-xs uppercase tracking-widest text-ochre">Family</div>
        <h2 className="font-serif text-2xl text-ink">
          {anchorLabel}{family.people.length > 1 ? ` + ${family.people.length - 1}` : ''}
        </h2>
      </header>

      {elders.length > 0 && (
        <div className="mb-5">
          <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">Elders</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {elders.map(p => <PersonCard key={p.id} person={p} relations={relationsFor(p.id)} elder />)}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">Family members</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
  // Union-find to group nodes by kinship edges.
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

  // Drop singletons without kinship (they just clutter the view).
  return [...groups.values()]
    .filter(g => g.people.length > 1)
    .sort((a, b) => b.people.length - a.people.length)
}

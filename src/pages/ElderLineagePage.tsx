/**
 * /elders/:slug/lineage — backwards genealogy from a living elder.
 *
 * Read-only v1: ancestors and kin drawn from existing wiki + transcripts.
 * Each entry shows confidence ('confirmed' / 'inferred' / 'pending-review')
 * and links to the person's page in the graph.
 *
 * The forward-authoring (elder + family extends their own tree via the
 * family-folder UI) is gated on visibility-control infrastructure that
 * sits outside this page.
 */
import { Link, useParams } from 'react-router-dom'
import {
  findLineageByElder,
  findPersonBySlug,
  type LineageConfidence,
  type LineageNode,
  type LineageRelation,
} from '@/palm-graph'
import {
  findElderBySlug,
  RIBBON_PALETTE,
} from '@/palm-history-timeline'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const RELATION_LABEL: Record<LineageRelation, string> = {
  father: 'Father',
  mother: 'Mother',
  'paternal-grandfather': 'Paternal grandfather',
  'paternal-grandmother': 'Paternal grandmother',
  'maternal-grandfather': 'Maternal grandfather',
  'maternal-grandmother': 'Maternal grandmother',
  'great-grandfather': 'Great-grandfather',
  'great-grandmother': 'Great-grandmother',
  'great-great-grandfather': 'Great-great-grandfather',
  'great-great-grandmother': 'Great-great-grandmother',
  sibling: 'Sibling',
  cousin: 'Cousin',
  aunt: 'Aunt',
  uncle: 'Uncle',
  'great-aunt': 'Great-aunt',
  'great-uncle': 'Great-uncle',
}

const CONFIDENCE_LABEL: Record<LineageConfidence, string> = {
  confirmed: 'Confirmed in transcript',
  inferred: 'Inferred — pending source confirmation',
  'pending-review': 'Pending elder review',
}

const CONFIDENCE_TONE: Record<LineageConfidence, string> = {
  confirmed: P.ochre,
  inferred: P.amber,
  'pending-review': P.amber,
}

export default function ElderLineagePage() {
  const { slug } = useParams<{ slug: string }>()
  const elder = slug ? findElderBySlug(slug) : undefined
  const lineage = slug ? findLineageByElder(slug) : undefined

  if (!elder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24" style={{ background: P.cream, color: P.ink }}>
        <h1 className="font-serif text-3xl mb-4">Elder not found</h1>
        <Link to="/elders" className="text-sm tracking-widest uppercase underline-offset-4 hover:underline" style={{ color: P.ochre }}>
          ← Back to all elders
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* Back link */}
      <div className="px-6 pt-8 max-w-5xl mx-auto">
        <Link
          to={`/elders/${elder.storytellerSlug}`}
          className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: P.ochre }}
        >
          ← {elder.displayName}
        </Link>
      </div>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
          Lineage
        </div>
        <h1
          className="font-serif font-light leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
        >
          {elder.displayName}'s line
        </h1>
        <p className="font-serif italic max-w-2xl mx-auto text-lg leading-relaxed opacity-80">
          What we know so far. The line is held by the family — this page surfaces the names that have
          been spoken on transcript or sourced from the wiki, marked by confidence. The elder review pass
          fills in the gaps.
        </p>
      </section>

      {/* Ancestors */}
      {lineage && lineage.ancestors.length > 0 && (
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: P.ochre }}>
            Ancestors · closest first
          </div>
          <div className="space-y-4 relative">
            {/* Vertical line connecting nodes */}
            <div
              className="absolute left-[19px] top-2 bottom-2 w-px"
              style={{ background: hexToRgba(P.ochre, 0.25) }}
            />
            <LineageEntry node={{ personSlug: elder.storytellerSlug, relation: 'father', confidence: 'confirmed' }} isElder displayLabel="The elder" />
            {lineage.ancestors.map((node, i) => (
              <LineageEntry key={i} node={node} />
            ))}
          </div>
        </section>
      )}

      {/* Kin */}
      {lineage && lineage.kin.length > 0 && (
        <section className="px-6 py-16" style={{ background: hexToRgba(P.ochre, 0.06) }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: P.ochre }}>
              Kin · siblings, cousins, aunts, uncles
            </div>
            <div className="space-y-4">
              {lineage.kin.map((node, i) => (
                <LineageEntry key={i} node={node} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!lineage || (lineage.ancestors.length === 0 && lineage.kin.length === 0)) && (
        <section className="px-6 py-16 max-w-3xl mx-auto text-center">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
            Lineage pending
          </div>
          <p className="font-serif italic text-lg leading-relaxed opacity-80">
            {elder.displayName}'s lineage hasn't been surfaced yet. Parent names, Country detail, and
            connections to other PICC families sit in the wiki research-loop and the next elder sit-down.
            The line is held — the surface comes when the family is ready.
          </p>
        </section>
      )}

      {/* Editorial note */}
      {lineage?.notes && (
        <section className="px-6 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-3">Editorial note</div>
            <p className="font-serif italic text-sm leading-relaxed opacity-70">{lineage.notes}</p>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="py-16 px-6" style={{ background: P.cream }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif italic text-base leading-relaxed opacity-70 mb-8">
            The line is yours. The family decides what's named, what's held, what's surfaced.
            This page grows when the elders say it grows.
          </p>
          <Link
            to={`/elders/${elder.storytellerSlug}`}
            className="text-xs tracking-widest uppercase underline-offset-4 hover:underline"
            style={{ color: P.ochre }}
          >
            Back to {elder.displayName}'s page →
          </Link>
        </div>
      </section>
    </div>
  )
}

function LineageEntry({
  node,
  isElder,
  displayLabel,
  compact,
}: {
  node: LineageNode
  isElder?: boolean
  displayLabel?: string
  compact?: boolean
}) {
  const person = findPersonBySlug(node.personSlug)
  const personName = person?.displayName || node.personSlug

  return (
    <div className={`relative pl-12 ${compact ? '' : 'py-2'}`}>
      {/* Marker dot */}
      <div
        className="absolute left-3 top-3 w-5 h-5 rounded-full flex items-center justify-center"
        style={{
          background: isElder ? P.ochre : hexToRgba(CONFIDENCE_TONE[node.confidence], 0.18),
          border: `2px solid ${isElder ? P.cream : CONFIDENCE_TONE[node.confidence]}`,
        }}
      />
      <Link
        to={person ? `/people/${node.personSlug}` : '#'}
        className="block p-5 transition-all hover:shadow-md"
        style={{
          background: isElder ? hexToRgba(P.ochre, 0.1) : P.cream,
          border: `1px solid ${hexToRgba(P.ink, 0.08)}`,
        }}
      >
        <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: P.ochre }}>
            {displayLabel || RELATION_LABEL[node.relation]}
          </div>
          {!isElder && (
            <div
              className="text-[10px] tracking-wider uppercase opacity-70"
              style={{ color: CONFIDENCE_TONE[node.confidence] }}
            >
              {CONFIDENCE_LABEL[node.confidence]}
            </div>
          )}
        </div>
        <h3 className="font-serif text-xl leading-tight">{personName}</h3>
        {person?.oneLine && !compact && (
          <p className="font-serif italic text-sm leading-relaxed opacity-75 mt-2">{person.oneLine}</p>
        )}
        {node.notes && (
          <p className="font-serif italic text-xs leading-relaxed opacity-65 mt-3">{node.notes}</p>
        )}
        {person && (
          <div className="text-[10px] tracking-widest uppercase opacity-50 mt-3" style={{ color: P.ochre }}>
            Open page →
          </div>
        )}
      </Link>
    </div>
  )
}

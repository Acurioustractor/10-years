import CrossAppGuideCard from '@/components/CrossAppGuideCard'
import { useConnections } from '@/hooks/useConnections'
import type { Connection, ConnectionStatus } from '@/services/types'

/**
 * Dream inbox — the queue of aspirations that need human attention to
 * move forward. Connector sees suggested, intro_sent, talking, and
 * meeting_planned items. Closed outcomes sit below the fold for record.
 */
export default function DreamInboxPage() {
  const { connections, loading, error, notConfigured } = useConnections({ needsAction: true })
  const { connections: recentlyClosed } = useConnections({ status: 'closed_success' })

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Dream inbox</h1>
        <p className="text-ink/60 mt-1">
          People with dreams waiting for the right introduction.
        </p>
      </header>

      <div className="mb-8">
        <CrossAppGuideCard
          title="Edit source stories there. Move dream support here."
          description="The dream inbox is the action layer for support and introductions, not the source-record editor. Use Empathy Ledger to change storyteller records, transcript-backed stories, or source evidence. Use 10 Years to track which dreams need help moving."
          editingItems={[
            'Storyteller records, transcript evidence, stories, and photos belong in Empathy Ledger.',
            'If the source story or person record is wrong, fix it there before acting on the dream here.',
          ]}
          engagementItems={[
            'Use the dream inbox here to see which aspirations need a connector, mentor, or next step.',
            'Keep the support workflow here while the source truth stays in Empathy Ledger.',
          ]}
          ledgerPath="/admin"
          ledgerLabel="Open Empathy Ledger admin"
        />
      </div>

      {notConfigured && <Notice title="Not configured yet" body="Add the Empathy Ledger API key to .env.local and restart." />}
      {error && !notConfigured && <Notice tone="red" title="Could not load." body={error.message} />}

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-ink/60 mb-3">Needs attention</h2>
        {loading ? (
          <div className="py-6 text-ink/50">Loading…</div>
        ) : connections.length === 0 ? (
          <div className="py-10 rounded-lg border border-dashed border-ink/15 text-center text-ink/60">
            No dreams waiting for a connection. Good work.
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map(c => <ConnectionCard key={c.id} connection={c} />)}
          </div>
        )}
      </section>

      {recentlyClosed.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink/60 mb-3">Closed — successful</h2>
          <div className="space-y-3 opacity-75">
            {recentlyClosed.slice(0, 5).map(c => <ConnectionCard key={c.id} connection={c} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function ConnectionCard({ connection: c }: { connection: Connection }) {
  const mentor = c.mentor?.displayName
    || c.externalContact?.name
    || <span className="italic text-ink/40">no mentor yet</span>
  const subjectLabel = c.aspiration?.subjects.map(s => s.displayName).join(', ')
    || <span className="italic text-ink/40">no one yet</span>

  return (
    <article className="border border-ink/10 rounded-lg bg-cream p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusPill status={c.status} />
            {c.domain && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sand text-desert">{c.domain}</span>
            )}
          </div>
          <h3 className="font-serif text-lg text-ink leading-tight">
            {c.aspiration?.title || 'Untitled dream'}
          </h3>
          <div className="text-sm text-ink/60 mt-1">
            <span className="text-ink/80">{subjectLabel}</span>
            {c.aspiration?.eventYear && <span> · by {c.aspiration.eventYear}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink/50 mb-1">Mentor</div>
          <div className="text-ink">{mentor}</div>
          {c.externalContact?.role && (
            <div className="text-xs text-ink/60">{c.externalContact.role}</div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ink/50 mb-1">Connector</div>
          <div className="text-ink">{c.connector?.displayName || <span className="italic text-ink/40">unassigned</span>}</div>
        </div>
      </div>

      {c.notes && (
        <p className="mt-4 text-sm text-ink/70 border-l-2 border-sand pl-3">{c.notes}</p>
      )}
    </article>
  )
}

function StatusPill({ status }: { status: ConnectionStatus }) {
  const styles: Record<ConnectionStatus, string> = {
    suggested:       'bg-sand text-desert',
    intro_sent:      'bg-ochre/20 text-ochre',
    talking:         'bg-ochre/20 text-ochre',
    meeting_planned: 'bg-eucalypt/20 text-eucalypt',
    met:             'bg-eucalypt/20 text-eucalypt',
    ongoing:         'bg-eucalypt text-cream',
    closed_success:  'bg-eucalypt text-cream',
    closed_no_fit:   'bg-ink/10 text-ink/50',
  }
  const label = status.replace(/_/g, ' ')
  return (
    <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {label}
    </span>
  )
}

function Notice({ tone, title, body }: { tone?: 'red'; title: string; body: string }) {
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

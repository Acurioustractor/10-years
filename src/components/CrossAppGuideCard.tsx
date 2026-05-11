import { LEDGER_BASE_URL } from '@/services/empathyLedgerClient'

interface CrossAppGuideCardProps {
  title: string
  description: string
  editingItems: string[]
  engagementItems: string[]
  ledgerPath?: string
  ledgerLabel?: string
}

function buildLedgerAdminUrl(path = '/admin') {
  if (!LEDGER_BASE_URL) return null

  try {
    return new URL(path, LEDGER_BASE_URL).toString()
  } catch {
    return null
  }
}

export default function CrossAppGuideCard({
  title,
  description,
  editingItems,
  engagementItems,
  ledgerPath = '/admin',
  ledgerLabel = 'Open Empathy Ledger',
}: CrossAppGuideCardProps) {
  const ledgerAdminUrl = buildLedgerAdminUrl(ledgerPath)

  return (
    <section className="rounded-2xl border border-ink/10 bg-cream/80 p-5 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-eucalypt">Two-system flow</div>
          <h2 className="font-serif text-2xl text-ink mt-2">{title}</h2>
          <p className="text-sm text-ink/60 mt-2 leading-relaxed">{description}</p>
        </div>

        {ledgerAdminUrl && (
          <a
            href={ledgerAdminUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
          >
            {ledgerLabel}
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pt-6 border-t border-ink/8">
        <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
          <div className="text-xs uppercase tracking-widest text-ochre">Edit in Empathy Ledger</div>
          <div className="space-y-2 mt-3 text-sm text-ink/70">
            {editingItems.map(item => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
          <div className="text-xs uppercase tracking-widest text-eucalypt">Engage in 10 Years</div>
          <div className="space-y-2 mt-3 text-sm text-ink/70">
            {engagementItems.map(item => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AddPersonPanel from '@/components/AddPersonPanel'
import { useSession } from '@/contexts/SessionContext'
import {
  getFamilyAccessMembers,
  getFamilyFolder,
  updateFamilyAccessMember,
} from '@/services/empathyLedgerClient'
import type { FamilyAccessMember } from '@/services/types'

type FolderDetail = Awaited<ReturnType<typeof getFamilyFolder>>

export default function FamilySettingsPage() {
  const { familySession } = useSession()
  const [folderDetail, setFolderDetail] = useState<FolderDetail | null>(null)
  const [accessMembers, setAccessMembers] = useState<FamilyAccessMember[]>([])
  const [accessNote, setAccessNote] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showGrantAccess, setShowGrantAccess] = useState(false)
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null)

  const role = familySession?.member.role || 'viewer'
  const canManage = role === 'elder' || role === 'family_rep'

  const loadPage = async () => {
    if (!familySession) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [accessRes, folderRes] = await Promise.all([
        getFamilyAccessMembers(familySession.folder.id),
        getFamilyFolder(familySession.folder.id),
      ])

      setAccessMembers(accessRes.data)
      setAccessNote(accessRes.meta?.note || '')
      setFolderDetail(folderRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage()
  }, [familySession])

  const activeAccessMembers = useMemo(
    () => accessMembers.filter(member => member.isActive),
    [accessMembers]
  )

  const keepers = useMemo(
    () => activeAccessMembers.filter(member => member.role === 'elder' || member.role === 'family_rep'),
    [activeAccessMembers]
  )

  const contributors = useMemo(
    () => activeAccessMembers.filter(member => member.role === 'contributor'),
    [activeAccessMembers]
  )

  const sortedMembers = useMemo(() => {
    const rank = (member: FamilyAccessMember) => {
      if (member.isActive && member.role === 'elder') return 0
      if (member.isActive && member.role === 'family_rep') return 1
      if (member.isActive && member.role === 'contributor') return 2
      if (member.isActive && member.role === 'viewer') return 3
      return 4
    }

    return [...accessMembers].sort((a, b) => {
      const rankDiff = rank(a) - rank(b)
      if (rankDiff !== 0) return rankDiff
      return a.displayName.localeCompare(b.displayName)
    })
  }, [accessMembers])

  const lineageCount = folderDetail?.stats.memberCount || 0
  const accessOnlyCount = Math.max(activeAccessMembers.length - lineageCount, 0)

  const handleMemberUpdate = async (
    member: FamilyAccessMember,
    update: { role?: 'viewer' | 'contributor'; isActive?: boolean }
  ) => {
    if (!familySession) return

    setActiveMemberId(member.id)
    setError(null)
    setMessage(null)

    try {
      const result = await updateFamilyAccessMember(familySession.folder.id, {
        memberId: member.id,
        ...update,
      })
      await loadPage()

      if (update.isActive === false) {
        setMessage(
          result.invalidatedSessionCount > 0
            ? `${member.displayName} was removed from folder access and ${result.invalidatedSessionCount} active session${result.invalidatedSessionCount === 1 ? '' : 's'} were closed.`
            : `${member.displayName} was removed from folder access.`
        )
      } else if (update.isActive === true) {
        setMessage(`${member.displayName} can access this family folder again.`)
      } else if (update.role) {
        setMessage(`${member.displayName} is now a ${formatRoleLabel(update.role).toLowerCase()}.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update access')
    } finally {
      setActiveMemberId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-eucalypt">Family settings</div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink mt-2">Access and governance</h1>
        <p className="text-ink/60 mt-2 max-w-3xl">
          Manage who can enter this family folder and what kind of workspace access they hold.
          The lineage tree is separate: people appear there when kinship is recorded, not because they were granted folder access.
        </p>
      </header>

      {showGrantAccess && (
        <AddPersonPanel
          onClose={() => setShowGrantAccess(false)}
          onAdded={() => {
            setMessage('Folder access granted.')
            loadPage()
          }}
        />
      )}

      {loading && <div className="py-10 text-center text-ink/50">Loading family settings…</div>}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !canManage && (
        <section className="rounded-2xl border border-ink/10 bg-cream/80 p-6">
          <h2 className="font-serif text-2xl text-ink">Family keeper access required</h2>
          <p className="text-sm text-ink/60 mt-3 max-w-2xl leading-relaxed">
            Only family elders or family reps can manage folder access here. You can still use the rest of the family space,
            but access and governance settings are held by the family keepers.
          </p>
          <div className="mt-5">
            <Link
              to={familySession ? `/f/${familySession.folder.slug}` : '/join'}
              className="inline-flex items-center rounded-full bg-ochre px-4 py-2 text-sm font-medium text-cream hover:bg-ochre/90 transition-colors"
            >
              Back to family home
            </Link>
          </div>
        </section>
      )}

      {!loading && !error && canManage && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Folder access" value={activeAccessMembers.length} />
            <StatCard label="Lineage people" value={lineageCount} />
            <StatCard label="Family keepers" value={keepers.length} />
            <StatCard label="Contributors" value={contributors.length} />
          </div>

          <section className="rounded-2xl border border-ink/10 bg-cream/80 p-5 md:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-widest text-ochre">Access model</div>
                <h2 className="font-serif text-2xl text-ink mt-2">Folder access is not the family tree</h2>
                <p className="text-sm text-ink/60 mt-2 leading-relaxed">
                  Use this page for workspace access, contribution, and governance roles. Use kinship recording to place someone into the lineage tree.
                </p>
                {accessNote && (
                  <p className="text-xs text-ink/45 mt-3 leading-relaxed">{accessNote}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowGrantAccess(true)}
                  className="inline-flex items-center rounded-full bg-ochre px-4 py-2 text-sm font-medium text-cream hover:bg-ochre/90 transition-colors"
                >
                  Grant folder access
                </button>
                <Link
                  to={`/f/${familySession?.folder.slug}/tree`}
                  className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:bg-sand/30 transition-colors"
                >
                  Back to family tree
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-4 mt-6 pt-6 border-t border-ink/8">
              <div className="rounded-xl border border-ink/8 bg-sand/20 p-4">
                <div className="text-xs uppercase tracking-widest text-ink/45">What this means right now</div>
                <div className="space-y-2 mt-3 text-sm text-ink/70">
                  <div>{activeAccessMembers.length} people currently hold folder access.</div>
                  <div>{lineageCount} people are visible in the kinship-connected lineage layer.</div>
                  {accessOnlyCount > 0 ? (
                    <div>{accessOnlyCount} people have workspace access without appearing in lineage views, which is expected when they help hold or contribute to the family space.</div>
                  ) : (
                    <div>Folder access and current lineage visibility are aligned right now.</div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-eucalypt/15 bg-eucalypt/[0.05] p-4">
                <div className="text-xs uppercase tracking-widest text-eucalypt">Family keepers</div>
                {keepers.length > 0 ? (
                  <div className="space-y-3 mt-3">
                    {keepers.map(member => (
                      <div key={member.id} className="flex items-center justify-between gap-3 rounded-lg bg-cream/70 px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-ink truncate">{member.displayName}</div>
                          <div className="text-xs text-ink/45">{formatRoleLabel(member.role)}</div>
                        </div>
                        <MiniPill tone="eucalypt">keeper</MiniPill>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink/60 mt-3">No active family keepers are listed yet.</p>
                )}
              </div>
            </div>
          </section>

          {message && (
            <div className="rounded-xl border border-eucalypt/15 bg-eucalypt/[0.06] px-4 py-3 text-sm text-eucalypt mb-6">
              {message}
            </div>
          )}

          <section className="rounded-2xl border border-ink/10 bg-cream/80 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-ink/45">Folder access list</div>
                <h2 className="font-serif text-2xl text-ink mt-2">Who can enter this family space</h2>
              </div>
              <div className="text-xs text-ink/45">
                Active first, then inactive access history
              </div>
            </div>

            <div className="space-y-3">
              {sortedMembers.map(member => {
                const isSelf = familySession?.member.storytellerId === member.storytellerId
                const isKeeper = member.role === 'elder' || member.role === 'family_rep'
                const isBusy = activeMemberId === member.id

                return (
                  <div
                    key={member.id}
                    className={`rounded-xl border px-4 py-4 ${member.isActive ? 'border-ink/10 bg-cream' : 'border-ink/8 bg-sand/15'}`}
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-medium text-ink truncate">{member.displayName}</div>
                          <MiniPill tone={member.isActive ? 'ink' : 'desert'}>
                            {member.isActive ? 'active' : 'inactive'}
                          </MiniPill>
                          <MiniPill tone={member.role === 'elder' || member.role === 'family_rep' ? 'eucalypt' : 'ochre'}>
                            {formatRoleLabel(member.role)}
                          </MiniPill>
                          {member.isElder && member.role !== 'elder' && <MiniPill tone="eucalypt">elder</MiniPill>}
                          {member.isAncestor && <MiniPill tone="desert">ancestor</MiniPill>}
                          {isSelf && <MiniPill tone="ink">you</MiniPill>}
                        </div>
                        <div className="text-xs text-ink/45 mt-2">
                          Joined folder access {formatShortDate(member.joinedAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isKeeper ? (
                          <div className="text-xs text-ink/50 max-w-xs leading-relaxed">
                            Keeper roles are managed through family governance, not this quick access page.
                          </div>
                        ) : (
                          <>
                            {member.isActive ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleMemberUpdate(member, { role: member.role === 'viewer' ? 'contributor' : 'viewer' })}
                                  disabled={isBusy}
                                  className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/70 hover:bg-sand/30 transition-colors disabled:opacity-50"
                                >
                                  {member.role === 'viewer' ? 'Make contributor' : 'Make viewer'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMemberUpdate(member, { isActive: false })}
                                  disabled={isBusy || isSelf}
                                  className="rounded-full border border-desert/20 px-3 py-1.5 text-xs text-desert hover:bg-desert/[0.08] transition-colors disabled:opacity-50"
                                >
                                  Remove access
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMemberUpdate(member, { isActive: true })}
                                disabled={isBusy}
                                className="rounded-full border border-eucalypt/20 px-3 py-1.5 text-xs text-eucalypt hover:bg-eucalypt/[0.08] transition-colors disabled:opacity-50"
                              >
                                Restore access
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-ink/8 bg-cream/75 px-4 py-4">
      <div className="text-2xl font-serif text-ink">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-ink/45">{label}</div>
    </div>
  )
}

function MiniPill({
  tone,
  children,
}: {
  tone: 'ochre' | 'eucalypt' | 'desert' | 'ink'
  children: ReactNode
}) {
  const tones = {
    ochre: 'bg-ochre/[0.08] text-ochre',
    eucalypt: 'bg-eucalypt/[0.08] text-eucalypt',
    desert: 'bg-desert/[0.08] text-desert',
    ink: 'bg-ink/[0.06] text-ink/70',
  } as const

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${tones[tone]}`}>
      {children}
    </span>
  )
}

function formatRoleLabel(role: string) {
  if (role === 'family_rep') return 'Family rep'
  if (role === 'contributor') return 'Contributor'
  if (role === 'viewer') return 'Viewer'
  if (role === 'elder') return 'Elder'
  return role
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

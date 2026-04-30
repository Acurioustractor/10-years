import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'
import {
  getCommunities,
  getCommunity,
  getCommunityFamilyLinks,
  requestCommunityFamilyLink,
} from '@/services/empathyLedgerClient'
import type { CommunityFamilyLink } from '@/services/types'

interface CommunityDetail {
  community: {
    id: string
    name: string
    traditionalName: string | null
    slug: string
    location: string | null
    region: string | null
  }
  families: Array<{ id: string; name: string; slug: string; memberCount: number }>
  stats: { familyCount: number; totalPeople: number }
  meta?: {
    familiesKind: 'linked_lineage'
    totalPeopleDefinition: string
    keepersDefinition: string
  }
}

export default function CommunityFamiliesPage() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const { familySession } = useSession()
  const [detail, setDetail] = useState<CommunityDetail | null>(null)
  const [links, setLinks] = useState<CommunityFamilyLink[]>([])
  const [loading, setLoading] = useState(true)
  const [linkLoading, setLinkLoading] = useState(false)
  const [governanceError, setGovernanceError] = useState<string | null>(null)
  const [requestingLink, setRequestingLink] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadCommunity() {
      setLoading(true)

      try {
        const communities = await getCommunities()
        const match = communities.data.find(community => community.slug === communitySlug)

        if (!match) {
          if (!cancelled) setDetail(null)
          return
        }

        const nextDetail = await getCommunity(match.id)
        if (!cancelled) setDetail(nextDetail)
      } catch {
        if (!cancelled) setDetail(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCommunity()

    return () => {
      cancelled = true
    }
  }, [communitySlug, familySession?.sessionToken])

  useEffect(() => {
    let cancelled = false

    async function loadLinks() {
      if (!detail || !familySession) {
        setLinks([])
        setLinkLoading(false)
        setGovernanceError(null)
        return
      }

      setLinkLoading(true)
      setGovernanceError(null)

      try {
        const result = await getCommunityFamilyLinks(detail.community.id, { status: 'all' })
        if (!cancelled) setLinks(result.links)
      } catch (err) {
        if (!cancelled) {
          setLinks([])
          setGovernanceError(err instanceof Error ? err.message : 'Failed to load community link state')
        }
      } finally {
        if (!cancelled) setLinkLoading(false)
      }
    }

    loadLinks()

    return () => {
      cancelled = true
    }
  }, [detail, familySession])

  const currentFamilyLink = useMemo(() => {
    if (!familySession) return null
    return links.find(link => link.familyFolderId === familySession.folder.id) || null
  }, [familySession, links])

  const canRequestLink = !!familySession && ['elder', 'family_rep'].includes(familySession.member.role) && !currentFamilyLink

  const refreshCommunity = async () => {
    if (!detail) return
    const nextDetail = await getCommunity(detail.community.id)
    setDetail(nextDetail)
  }

  const refreshLinks = async () => {
    if (!detail) return
    const result = await getCommunityFamilyLinks(detail.community.id, { status: 'all' })
    setLinks(result.links)
  }

  const handleRequestLink = async () => {
    if (!detail || !familySession) return

    setGovernanceError(null)
    setRequestingLink(true)

    try {
      await requestCommunityFamilyLink(detail.community.id, familySession.folder.id)
      await Promise.all([refreshCommunity(), refreshLinks()])
    } catch (err) {
      setGovernanceError(err instanceof Error ? err.message : 'Failed to request community link')
    } finally {
      setRequestingLink(false)
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-center text-ink/50">Loading...</div>
  }

  if (!detail) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-ink mb-2">Community not found</h1>
        <p className="text-ink/60">No community with slug "{communitySlug}" exists yet.</p>
        <Link to="/explore" className="text-sm text-ochre mt-4 inline-block">Browse communities</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Families in {detail.community.name}</h1>
        <p className="text-ink/60 mt-1">
          Active families appear here once both family-side and community-side approvals are complete.
        </p>
        <p className="text-sm text-ink/50 mt-3 max-w-3xl">
          This page tracks linked family trees. People counts here come from lineage-linked family people, not from the community keeper list.
        </p>
      </header>

      {governanceError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {governanceError}
        </div>
      )}

      {detail.families.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-xl text-ink mb-2">No active family links yet</p>
          <p className="text-ink/60 mb-6">
            Families can request to join this community now, but they only show up here after both approvals are recorded.
          </p>
          <Link
            to="/join"
            className="inline-block px-6 py-3 rounded-full bg-ochre text-cream font-medium text-sm hover:bg-ochre/90 transition-colors"
          >
            Create a family folder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detail.families.map(family => {
            const isCurrentFamily = familySession?.folder.id === family.id

            return (
              <div
                key={family.id}
                className={[
                  'border rounded-xl p-6 bg-cream transition-shadow',
                  isCurrentFamily ? 'border-ochre/30 shadow-sm' : 'border-ink/10 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="text-xs uppercase tracking-widest text-ochre">Family</div>
                      {isCurrentFamily && <StatusPill tone="eucalypt">your family</StatusPill>}
                    </div>
                    <h2 className="font-serif text-xl text-ink">{family.name}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-serif text-ink tabular-nums">{family.memberCount}</div>
                    <div className="text-[10px] text-ink/40">lineage people</div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Link
                    to={`/f/${family.slug}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-ochre/10 text-ochre hover:bg-ochre/15 transition-colors"
                  >
                    View family folder
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <section className="mt-10 rounded-xl border border-ink/10 bg-cream p-6">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-eucalypt">Your family and this community</div>
            <h2 className="font-serif text-2xl text-ink mt-1">Link status</h2>
          </div>
          {linkLoading && <div className="text-xs text-ink/40">Refreshing link state…</div>}
        </div>

        {!familySession ? (
          <div className="space-y-3">
            <p className="text-sm text-ink/60">
              Sign in to your family folder to see whether your family is already linked here or to request a community link.
            </p>
            <Link to="/join" className="text-sm text-ochre hover:underline">
              Join or create a family folder
            </Link>
          </div>
        ) : currentFamilyLink ? (
          <div className="rounded-lg border border-ink/8 bg-sand/20 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm font-medium text-ink">{familySession.folder.name}</div>
                <div className="text-xs text-ink/50 mt-1">
                  Requested from the {currentFamilyLink.requestedBySide} side
                  {currentFamilyLink.requestedByStorytellerName ? ` by ${currentFamilyLink.requestedByStorytellerName}` : ''}.
                </div>
              </div>
              <StatusPill
                tone={
                  currentFamilyLink.status === 'active'
                    ? 'eucalypt'
                    : currentFamilyLink.status === 'pending'
                      ? 'ochre'
                      : 'desert'
                }
              >
                {currentFamilyLink.status}
              </StatusPill>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-ink/60">
              <div className="rounded-lg bg-cream/80 px-3 py-2">
                Family approval: {currentFamilyLink.familyApprovedAt ? formatShortDate(currentFamilyLink.familyApprovedAt) : 'Pending'}
              </div>
              <div className="rounded-lg bg-cream/80 px-3 py-2">
                Community approval: {currentFamilyLink.communityApprovedAt ? formatShortDate(currentFamilyLink.communityApprovedAt) : 'Pending'}
              </div>
            </div>

            {currentFamilyLink.decisionNotes && (
              <div className="mt-3 text-xs text-ink/60">
                Notes: {currentFamilyLink.decisionNotes}
              </div>
            )}

            <div className="mt-4 text-sm text-ink/60">
              {currentFamilyLink.status === 'active' && (
                <span>Your family is actively linked and visible in this community.</span>
              )}
              {currentFamilyLink.status === 'pending' && (
                <span>This request is in progress. The families list only shows links after both approvals are complete.</span>
              )}
              {currentFamilyLink.status === 'rejected' && (
                <span>This link request was rejected. At the moment, reopening it needs help from the relevant elders or admins.</span>
              )}
              {currentFamilyLink.status === 'revoked' && (
                <span>This link was previously active and has been revoked. Re-establishing it currently needs elder or admin support.</span>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-ink/8 bg-sand/20 p-5">
            <div className="text-sm font-medium text-ink">{familySession.folder.name}</div>
            <p className="text-sm text-ink/60 mt-2">
              Your family is not linked to {detail.community.name} yet.
            </p>
            <p className="text-xs text-ink/50 mt-3">
              Requesting a link connects your family tree into the community layer after approval. It does not make someone a community keeper by itself.
            </p>

            {canRequestLink ? (
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <ActionButton
                  tone="eucalypt"
                  disabled={requestingLink}
                  onClick={handleRequestLink}
                >
                  {requestingLink ? 'Requesting…' : `Request link to ${detail.community.name}`}
                </ActionButton>
                <span className="text-xs text-ink/50">
                  This creates the handshake record. The family list updates after both family and community approval.
                </span>
              </div>
            ) : (
              <p className="text-xs text-ink/50 mt-3">
                Only family elders or family reps can request a community link from the family side.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'ochre' | 'eucalypt' | 'desert'
}) {
  const tones: Record<typeof tone, string> = {
    ochre: 'bg-ochre/10 text-ochre',
    eucalypt: 'bg-eucalypt/10 text-eucalypt',
    desert: 'bg-desert/10 text-desert',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  )
}

function ActionButton({
  children,
  disabled,
  onClick,
  tone,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
  tone: 'eucalypt'
}) {
  const tones = {
    eucalypt: 'bg-eucalypt text-cream hover:bg-eucalypt/90',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

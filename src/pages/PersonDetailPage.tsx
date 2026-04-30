/**
 * /people/:slug — detail page for any person in the graph.
 *
 * Living elders link out to /elders/:slug for the canonical surface.
 * This page is the universal "everything we know about this person":
 * dates, country, bio, key connections, connected events, places,
 * sources, cultural-sensitivity flag.
 */
import { Link, useParams } from 'react-router-dom'
import {
  findPersonBySlug,
  findPlaceBySlug,
  PEOPLE,
  type Person,
} from '@/palm-graph'
import { LIVING_ELDER_PINS, EVENT_SLOTS, RIBBON_PALETTE } from '@/palm-history-timeline'

const P = RIBBON_PALETTE

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const STATUS_LABEL: Record<Person['status'], string> = {
  'living-elder': 'Living elder',
  living: 'Living family',
  ancestor: 'Ancestor',
  'historical-figure': 'Historical figure',
  contemporary: 'Contemporary',
}

const SENSITIVITY_LABEL: Record<NonNullable<Person['culturalSensitivity']>, string> = {
  public: 'Public record',
  'consent-required': 'Consent required for new use',
  'sacred-restricted': 'Sacred-restricted — gated',
}

export default function PersonDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const person = slug ? findPersonBySlug(slug) : undefined

  if (!person) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24" style={{ background: P.cream, color: P.ink }}>
        <h1 className="font-serif text-3xl mb-4">Person not found</h1>
        <p className="font-serif italic opacity-70 mb-8">No person matches "{slug}".</p>
        <Link to="/people" className="text-sm tracking-widest uppercase underline-offset-4 hover:underline" style={{ color: P.ochre }}>
          ← Back to all people
        </Link>
      </div>
    )
  }

  const elderPin = person.elderPinSlug
    ? LIVING_ELDER_PINS.find((e) => e.storytellerSlug === person.elderPinSlug)
    : undefined
  const avatarUrl = elderPin?.avatarUrl

  const connectedPeople = person.keyConnections
    .map((s) => PEOPLE.find((pp) => pp.slug === s))
    .filter(Boolean) as Person[]
  const connectedEvents = person.connectedEventIds
    .map((id) => EVENT_SLOTS.find((e) => e.id === id))
    .filter(Boolean) as typeof EVENT_SLOTS
  const connectedPlaces = person.connectedPlaceSlugs
    .map((s) => findPlaceBySlug(s))
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof findPlaceBySlug>>>
  const countries = person.country
    .map((s) => findPlaceBySlug(s))
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof findPlaceBySlug>>>

  const dateLabel = person.birthYear
    ? `${person.birthYear}${person.deathYear ? ` – ${person.deathYear}` : ''}`
    : person.deathYear
      ? `d. ${person.deathYear}`
      : person.birthDecadeApprox
        ? `born around ${person.birthDecadeApprox}`
        : ''

  return (
    <div style={{ background: P.cream, color: P.ink }} className="min-h-screen">
      {/* Back link */}
      <div className="px-6 pt-8 max-w-5xl mx-auto">
        <Link
          to="/people"
          className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: P.ochre }}
        >
          ← All people
        </Link>
      </div>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">
          <div>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={person.displayName}
                className="w-full aspect-[4/5] object-cover"
                style={{ filter: 'sepia(0.05) saturate(0.95)' }}
              />
            ) : (
              <div
                className="w-full aspect-[4/5] flex items-center justify-center font-serif text-7xl"
                style={{ background: hexToRgba(P.ochre, 0.08), color: hexToRgba(P.ochre, 0.5) }}
              >
                {person.displayName.replace(/^(Uncle|Aunty)\s+/, '').charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
              {STATUS_LABEL[person.status]}
              {person.clusterSlug && (
                <span className="opacity-60"> · {person.clusterSlug.replace(/-/g, ' · ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
              )}
            </div>
            <h1
              className="font-serif font-light leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(40px, 5.5vw, 80px)' }}
            >
              {person.displayName}
            </h1>
            {dateLabel && <div className="text-base mb-6 opacity-60 tracking-wide tabular-nums">{dateLabel}</div>}
            {countries.length > 0 && (
              <div className="text-sm tracking-wide italic opacity-65 mb-8">
                {countries.map((c) => c.displayName).join(' · ')}
              </div>
            )}
            <p className="font-serif text-lg md:text-xl leading-[1.65] opacity-85" style={{ maxWidth: '60ch' }}>
              {person.oneLine}
            </p>
            {elderPin && (
              <Link
                to={`/elders/${elderPin.storytellerSlug}`}
                className="inline-block mt-8 px-6 py-3 font-serif text-sm hover:opacity-90 transition-opacity"
                style={{ background: P.ochre, color: P.cream }}
              >
                Open the elder profile →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Connected people */}
      {connectedPeople.length > 0 && (
        <section className="px-6 py-16" style={{ background: hexToRgba(P.ochre, 0.06) }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              Connected people
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {connectedPeople.map((cp) => (
                <Link
                  key={cp.slug}
                  to={`/people/${cp.slug}`}
                  className="group p-4 transition-all hover:shadow-md"
                  style={{ background: P.cream, border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}
                >
                  <div className="font-serif text-base leading-tight mb-1">{cp.displayName}</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase opacity-50" style={{ color: P.ochre }}>
                    {STATUS_LABEL[cp.status]}
                  </div>
                  <p className="font-serif italic text-xs leading-relaxed opacity-70 mt-2 line-clamp-2">
                    {cp.oneLine}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Connected events */}
      {connectedEvents.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              Connected events
            </div>
            <div className="space-y-4">
              {connectedEvents.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/history#${ev.id}`}
                  className="block p-6 transition-all hover:shadow-md"
                  style={{ background: hexToRgba(P.ink, 0.04), border: `1px solid ${hexToRgba(P.ink, 0.1)}` }}
                >
                  <div className="flex items-baseline gap-6 mb-2">
                    <div className="font-serif tabular-nums text-xl shrink-0" style={{ color: P.ochre }}>
                      {ev.yearLabel}
                    </div>
                    <div className="text-[10px] tracking-[0.3em] uppercase opacity-60" style={{ color: P.ochre }}>
                      {ev.eyebrow}
                    </div>
                  </div>
                  <h3 className="font-serif text-xl leading-tight">{ev.heading}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Connected places */}
      {connectedPlaces.length > 0 && (
        <section className="px-6 py-16" style={{ background: hexToRgba(P.ochre, 0.06) }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: P.ochre }}>
              Places
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {connectedPlaces.map((pl) => (
                <Link
                  key={pl.slug}
                  to={`/places/${pl.slug}`}
                  className="group p-4 transition-all hover:shadow-md"
                  style={{ background: P.cream, border: `1px solid ${hexToRgba(P.ink, 0.08)}` }}
                >
                  <div className="font-serif text-base leading-tight">{pl.displayName}</div>
                  {pl.region && (
                    <div className="text-[10px] tracking-wide opacity-50 mt-1">{pl.region}</div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sources + cultural-sensitivity */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: P.ochre }}>
            Sources
          </div>
          <ul className="font-serif text-sm leading-relaxed opacity-80 space-y-1 mb-10">
            {person.sources.length === 0 && <li className="italic opacity-60">No sources catalogued yet.</li>}
            {person.sources.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
          <div
            className="px-6 py-4 inline-block"
            style={{ background: hexToRgba(P.ochre, 0.1), color: P.ochre, border: `1px solid ${hexToRgba(P.ochre, 0.3)}` }}
          >
            <div className="text-[10px] tracking-[0.3em] uppercase">Cultural sensitivity</div>
            <div className="font-serif text-sm mt-1">{SENSITIVITY_LABEL[person.culturalSensitivity]}</div>
          </div>
        </div>
      </section>
    </div>
  )
}

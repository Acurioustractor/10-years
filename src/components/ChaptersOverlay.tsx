import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ERAS, type Era } from './eras'
import type { TimelineEventSummary } from '@/services/types'

interface Chapter {
  era: Era
  title: string
  body: string
}

const CHAPTERS: Chapter[] = [
  {
    era: ERAS[0],
    title: 'Country before fences',
    body: `The Arrernte have cared for this country since the Dreaming. When European settlers arrived in Central Australia, they brought pastoral leases, fences, and a new economy built on cattle and horses. Lewis Bloomfield walked north from Victoria in the 1890s and built Loves Creek Station into one of the Centre's great pastoral holdings. The Kunoth family — Justus and Caroline — made the same journey by bullock wagon, settling in the MacDonnell Ranges.`,
  },
  {
    era: ERAS[1],
    title: 'An empire of red dust',
    body: `Lewis married Lillian Kunoth in 1911. Together they raised children across vast stations — Peg, Jean, Harry, and Baden. Baden became an Arrernte horseman, winning the Alice Springs Cup on a horse called Terry. The homestead at Atnarpa rose from local rock, its walls a metre thick. This was a family that straddled two worlds: pastoral industry and deep country knowledge.`,
  },
  {
    era: ERAS[2],
    title: 'What was taken',
    body: `Government policy tore children from their families. On Angas Downs and Tempe Downs, Luritja children — Bob Randall, Teddy, Alfie, Tommy, June, Ruby Fay — were born and then removed. The Liddle brothers fought back: Arthur and Milton petitioned the Minister, served in the AIF, bought Angas Downs with their own wages. Bob Randall would later write "Brown Skin Baby (They Took Me Away)", a song the whole country learned.`,
  },
  {
    era: ERAS[3],
    title: 'The long return',
    body: `Decades of advocacy, court cases, and quiet persistence. Max Bloomfield survived Cyclone Tracy. Jock Nelson received a state funeral. Henry Bloomfield spent seven years managing Loves Creek — the same country his great-grandfather had built. The Land Rights movement gained momentum across the Territory, and families who had been scattered began to come home.`,
  },
  {
    era: ERAS[4],
    title: 'Back on country',
    body: `In 2012, the Arletherre Aboriginal Land Trust received the formal handback of country. Henry and Karen raised their children — Kristy, Kirsty, Kylie, Shane — between town and station. In November 2025, family and friends lifted new iron onto the Atnarpa Homestead roof, restoring what weather and time had worn away. The country is being cared for again.`,
  },
  {
    era: ERAS[5],
    title: 'What comes next',
    body: `The next ten years belong to the young ones. Braydon dreams of baseball beyond Alice Springs. Minhala plans a cultural tour that brings visitors onto country. Shane imagines a healing camp for youth who need what the bush can give. Every dream here is real — seeded by the family, waiting for the right introduction to make it happen.`,
  },
]

interface Props {
  events?: TimelineEventSummary[]
  onChapterChange?: (from: number, to: number) => void
  onExit?: () => void
  personPath?: (personId: string) => string
}

export default function ChaptersOverlay({ events = [], onChapterChange, onExit, personPath }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([])

  const eventsForChapter = useCallback((chapter: Chapter) => {
    return events.filter(ev => {
      const year = ev.eventYear ?? (ev.eventDate ? new Date(ev.eventDate).getFullYear() : null)
      return year && year >= chapter.era.from && year <= chapter.era.to
    }).sort((a, b) => (a.eventYear ?? 0) - (b.eventYear ?? 0))
  }, [events])

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + window.innerHeight * 0.4
    let closest = 0
    for (let i = 0; i < chapterRefs.current.length; i++) {
      const el = chapterRefs.current[i]
      if (el && el.offsetTop <= scrollY) closest = i
    }
    if (closest !== activeIndex) {
      setActiveIndex(closest)
      const ch = CHAPTERS[closest]
      onChapterChange?.(ch.era.from, ch.era.to)
    }
  }, [activeIndex, onChapterChange])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const ch = CHAPTERS[0]
    onChapterChange?.(ch.era.from, ch.era.to)
  }, [])

  if (!isVisible) return null

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-30 h-1 bg-sand/40">
        <div
          className="h-full bg-gradient-to-r from-desert via-ochre to-eucalypt transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / CHAPTERS.length) * 100}%` }}
        />
      </div>

      {/* Chapter navigation dots */}
      <nav className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
        {CHAPTERS.map((ch, i) => (
          <button
            key={ch.era.id}
            type="button"
            onClick={() => {
              chapterRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
            title={ch.title}
            className={`
              h-2.5 w-2.5 rounded-full transition-all duration-300
              ${i === activeIndex
                ? 'scale-150 bg-ochre shadow-sm'
                : i < activeIndex
                  ? 'bg-desert/40'
                  : 'bg-eucalypt/30'
              }
            `}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            setIsVisible(false)
            onExit?.()
          }}
          className="mt-4 text-[10px] text-ink/40 hover:text-ink transition-colors"
          title="Exit story mode"
        >
          Exit
        </button>
      </nav>

      {/* Chapters */}
      <div className="space-y-[40vh] pt-[15vh] pb-[40vh]">
        {CHAPTERS.map((ch, i) => {
          const chapterEvents = eventsForChapter(ch)
          const isActive = i === activeIndex
          const isNear = Math.abs(i - activeIndex) <= 1

          return (
            <div
              key={ch.era.id}
              ref={el => { chapterRefs.current[i] = el }}
              className={`
                max-w-5xl mx-auto px-4 md:px-8
                transition-opacity duration-700
                ${isNear ? 'opacity-100' : 'opacity-20'}
              `}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
                {/* Narrative column */}
                <div className="py-8 md:py-12">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-medium tabular-nums ${ch.era.color} opacity-60`}>
                      {ch.era.from}–{ch.era.to}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest ${ch.era.color} opacity-40`}>
                      {ch.era.label}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl text-ink mb-5 leading-tight">{ch.title}</h2>
                  <p className="text-ink/70 text-[17px] leading-relaxed">{ch.body}</p>
                  <div className="mt-4 text-xs text-ink/30">
                    Chapter {i + 1} of {CHAPTERS.length}
                  </div>
                </div>

                {/* Events sidebar — visible on larger screens */}
                {chapterEvents.length > 0 && (
                  <aside className={`
                    hidden lg:block transition-all duration-500
                    ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}>
                    <div className="sticky top-16 bg-sand/30 rounded-xl p-4 border border-ink/5">
                      <div className="text-[10px] uppercase tracking-widest text-ink/40 mb-3">
                        Events in this era
                      </div>
                      <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                        {chapterEvents.slice(0, 8).map(ev => (
                          <div key={ev.id} className="flex items-start gap-2.5">
                            <span className={`mt-1.5 shrink-0 h-2 w-2 rounded-full ${
                              ev.kind === 'milestone' ? 'bg-ochre' :
                              ev.kind === 'aspiration' ? 'border border-dashed border-eucalypt' :
                              'bg-desert/50'
                            }`} />
                            <div className="min-w-0">
                              <div className="text-xs text-ink/80 leading-snug">{ev.title}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {ev.eventYear && (
                                  <span className="text-[10px] tabular-nums text-ink/40">
                                    {ev.dateIsApproximate ? '~' : ''}{ev.eventYear}
                                  </span>
                                )}
                                {ev.people.length > 0 && (
                                  <div className="flex -space-x-1">
                                    {ev.people.slice(0, 3).map(p => (
                                      <Link
                                        key={p.id}
                                        to={personPath ? personPath(p.id) : `/person/${p.id}`}
                                        className="h-4 w-4 rounded-full bg-sand border border-cream text-[6px] flex items-center justify-center font-medium text-desert hover:scale-110 transition-transform"
                                        title={p.displayName}
                                      >
                                        {p.displayName.slice(0, 1)}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {chapterEvents.length > 8 && (
                          <div className="text-[10px] text-ink/30 pt-1">
                            + {chapterEvents.length - 8} more
                          </div>
                        )}
                      </div>
                    </div>
                  </aside>
                )}
              </div>

              {/* Mobile: compact event list below narrative */}
              {chapterEvents.length > 0 && isActive && (
                <div className="lg:hidden mt-4 bg-sand/30 rounded-xl p-4 border border-ink/5">
                  <div className="text-[10px] uppercase tracking-widest text-ink/40 mb-2">
                    {chapterEvents.length} event{chapterEvents.length !== 1 ? 's' : ''} in this era
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {chapterEvents.slice(0, 5).map(ev => (
                      <span key={ev.id} className="text-xs px-2 py-1 rounded-full bg-sand text-desert">
                        {ev.title.length > 30 ? ev.title.slice(0, 30) + '…' : ev.title}
                      </span>
                    ))}
                    {chapterEvents.length > 5 && (
                      <span className="text-xs text-ink/30 self-center">+{chapterEvents.length - 5}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

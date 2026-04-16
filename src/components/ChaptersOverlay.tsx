import { useState, useRef, useEffect, useCallback } from 'react'
import { ERAS, type Era } from './eras'

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
  onChapterChange?: (from: number, to: number) => void
  onExit?: () => void
}

export default function ChaptersOverlay({ onChapterChange, onExit }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([])

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
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
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
      <div className="space-y-[50vh] pt-[20vh] pb-[40vh]">
        {CHAPTERS.map((ch, i) => (
          <div
            key={ch.era.id}
            ref={el => { chapterRefs.current[i] = el }}
            className={`
              max-w-2xl mx-auto px-8 py-12
              transition-opacity duration-700
              ${Math.abs(i - activeIndex) <= 1 ? 'opacity-100' : 'opacity-30'}
            `}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-medium tabular-nums ${ch.era.color} opacity-60`}>
                {ch.era.from}–{ch.era.to}
              </span>
              <span className={`text-[10px] uppercase tracking-widest ${ch.era.color} opacity-40`}>
                {ch.era.label}
              </span>
            </div>
            <h2 className="font-serif text-3xl text-ink mb-4 leading-tight">{ch.title}</h2>
            <p className="text-ink/70 text-[17px] leading-relaxed">{ch.body}</p>
            <div className="mt-4 text-xs text-ink/30">
              Chapter {i + 1} of {CHAPTERS.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

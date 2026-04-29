/**
 * Palm Island journeys — the elders walking back to Country.
 *
 * Each journey is a chapter of a longer arc: the PICC elders returning
 * to the places their families were taken from. Mission Beach 2024 was
 * the first. Atherton Tablelands 2026 is planned. The bridge between
 * them is the same trust loop — Country first, then voice, then
 * younger generations carrying what was held.
 *
 * Sourced from the empathy-ledger-v2 wiki (events + transcripts) and
 * cluster-configs.ts photo library. v1 recycles photos; v2 needs
 * Mission Beach + Atherton-specific imagery sourced fresh.
 */

export type JourneyImage = {
  url: string
  title: string
  year: string
  source: string
  license: string
}

export type JourneyChapter = {
  eyebrow: string         // small uppercase label
  heading: string         // serif heading
  body: string            // framing paragraph
  pullquote?: string      // elder voice
  attribution?: string    // who said it
  bg?: JourneyImage       // optional photo backdrop
}

export type Journey = {
  slug: string
  title: string
  subtitle: string                            // italic serif
  status: 'past' | 'planned' | 'dreaming'
  date: string                                // "February 2024", "Late 2026", "When the elders decide"
  yearLabel: string                           // "2024", "2026"
  location: string                            // "Mission Beach · Djiru Country"
  hero: JourneyImage
  whyThisPlace: string                        // 2-3 sentences
  elderSlugs: string[]                        // /elders/<slug>
  chapters: JourneyChapter[]
  closingReflection?: {
    body: string
    pullquote?: string
    attribution?: string
  }
  // Cross-references
  connectedEventIds?: string[]                // matches EVENT_SLOTS[].id on /history
  notes?: string                              // editorial note (e.g. "drafted from transcripts; pending elder review pass")
}

// ─────────────────────  Photo sources (recycled)  ──────────────────────────

const IMG = {
  // ─────────────────────  Ingested 2026-04-30 from research sweep  ────────────
  innisfailCyclone1918: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Innisfail%27s_Downfall%2C_damage_from_the_cyclone%2C_1918.jpg',
    title: "Innisfail's Downfall — cyclone damage", year: '1918',
    source: 'Wikimedia Commons', license: 'PD-Australia',
  },
  innisfailAuctionMart1918: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/AUCTION_MART_AT_INNISFAIL_DESTROYED_BY_CYCLONE_-_1918_-_Flickr_-_Aussie~mobs.jpg',
    title: 'Auction Mart at Innisfail destroyed by cyclone', year: '1918',
    source: 'Wikimedia Commons · Aussie~mobs Flickr', license: 'PD-Australia',
  },
  hinchinbrookHunting1908: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/81/FMIB_36019_Hunting_grounds_at_Northeast_Bay%2C_Hinchinbrook_Island%2C_June_28%2C_1908_This_is_typical_of_the_country_prevalent_in_the_Prince.jpeg',
    title: 'Hunting grounds, Northeast Bay, Hinchinbrook Island', year: 'June 1908',
    source: 'FMIB · Wikimedia Commons', license: 'PD (US-no-renewal)',
  },
  hinchinbrookFromSea1908: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/FMIB_34701_Hinchinbrook_Island%2C_from_the_Sea.jpeg',
    title: 'Hinchinbrook Island, from the sea', year: '1908',
    source: 'FMIB · Wikimedia Commons', license: 'PD (US-no-renewal)',
  },
  brookIsland1920: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Brook_Island_off_the_Queensland_coast%2C_north_of_Ingham%2C_ca._1920.jpg',
    title: 'Brook Island, off the Queensland coast north of Ingham', year: 'ca. 1920',
    source: 'State Library of Queensland · Wikimedia Commons', license: 'Public domain',
  },
  hinchinbrookWetlands2022: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Wide_expanses_of_estuarine_wetlands._Hinchinbrook_Island_Lookout%2C_Bemerside%2C_2022.jpg',
    title: 'Coastal wetlands, North Queensland', year: '2022',
    source: 'Wikimedia Commons', license: 'CC BY-SA 4.0',
  },
  athertonTableland1954: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Rainforest_Ecologist_John_Geoffrey_Tracey_on_the_Atherton_Tableland_by_Leonard_Webb._November_1954.jpg',
    title: 'Atherton Tableland rainforest', year: 'November 1954',
    source: 'Leonard Webb · Wikimedia Commons', license: 'CC BY-SA 4.0',
  },
  millaaMillaaFalls: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Millaa_Millaa_Falls_-_Levy.jpg',
    title: 'Millaa Millaa Falls, Mamu Country', year: '',
    source: 'Wikimedia Commons', license: 'CC BY 2.0',
  },
  mtGarnet1901: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/StateLibQld_1_49744_Construction_of_Return_Creek_Railway_Bridge%2C_Mount_Garnet%2C_Queensland%2C_ca._1901.jpg/1920px-StateLibQld_1_49744_Construction_of_Return_Creek_Railway_Bridge%2C_Mount_Garnet%2C_Queensland%2C_ca._1901.jpg',
    title: 'Mt Garnet, Warrongo Country', year: 'ca. 1901',
    source: 'State Library of Queensland · Wikimedia Commons', license: 'Public domain',
  },
  hinchinbrookChannel1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Queensland_State_Archives_1381_Hinchinbrook_Channel_NQ_c_1935.png',
    title: 'Hinchinbrook Channel', year: 'ca. 1935',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  blencoeFalls2022: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Blencoe_Falls%2C_Girrigun_National_Park%2C_Far_North_Queensland%2C_2022.jpg/1920px-Blencoe_Falls%2C_Girrigun_National_Park%2C_Far_North_Queensland%2C_2022.jpg',
    title: 'Blencoe Falls, Girrigun National Park', year: '2022',
    source: 'Royal Geographical Society of QLD · Wikimedia Commons', license: 'CC BY 4.0',
  },
  palmHappyMoments1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Queensland_State_Archives_1368_Happy_moments_on_Palm_Island_c_1935.png/1920px-Queensland_State_Archives_1368_Happy_moments_on_Palm_Island_c_1935.png',
    title: 'Happy moments on Palm Island', year: 'ca. 1935',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
} satisfies Record<string, JourneyImage>

// ─────────────────────────  Journey configs  ───────────────────────────────

export const JOURNEYS: Journey[] = [
  {
    slug: 'mission-beach-2024',
    title: 'Mission Beach',
    subtitle: 'Walking back to where the families were taken from. The Hull River reserve, 106 years on.',
    status: 'past',
    date: '2024',
    yearLabel: '2024',
    location: 'Mission Beach · Djiru Country',
    hero: IMG.innisfailCyclone1918,
    whyThisPlace: "In 1918 the cyclone Leonte destroyed the Hull River Aboriginal Settlement at Mission Beach. The Aboriginal people removed there from across the Far North coast and the Tablelands were transported to Palm Island in the months that followed. This is the moment Palm Island became Bwgcolman, the place where many were sent. In 2024 the PICC elders returned to Mission Beach together. Not nostalgia. A return to the place where ancestors suffered.",
    elderSlugs: ['allan-palm-island', 'winifred-obah'],
    chapters: [
      {
        eyebrow: 'Why we went',
        heading: 'To uncover the scenery',
        body: "Allan named the trip in his own voice. Not a visit. An uncovering. To stand where the ancestors stood, to feel for himself the pain that had been passed down as story.",
        pullquote: "We are on our way up to Mission Beach to uncover a scenery that would happen back in 1918. To uncover that, to see for myself and actually feel their pain and suffering. It's like passing on a message and follow that message where it will lead you to.",
        attribution: 'Allan Palm Island · Lucinda Interview',
        bg: IMG.hinchinbrookHunting1908,
      },
      {
        eyebrow: 'The reserve',
        heading: 'Held there because',
        body: "The Hull River reserve was a removal site under the Aboriginals Protection Act. People were sent there for stealing bread, for back-chatting a superintendent, for taking something they were owed. Allan names it as a prison reserve, his ancestors among those held.",
        pullquote: "We got grandparents and aunties and uncles. All feel the same. This was a reserve, prison reserve, and they were just put there because they stole a little piece of bread or back-chat superintendent or taking something. We were like prisoners. We just like slaves.",
        attribution: 'Allan Palm Island · Elders Trip Interview',
        bg: IMG.hinchinbrookChannel1935,
      },
      {
        eyebrow: 'The cyclone',
        heading: '1918',
        body: 'The cyclone hit on the night of 10 March 1918. The settlement was destroyed. Survivors — the people who had been removed there from across the Far North coast and Tablelands — were transported to Palm in the months that followed.',
        pullquote: "The worst part of it was when Leonte hit it back in 1918. So people were devastated.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: IMG.innisfailAuctionMart1918,
      },
      {
        eyebrow: 'The Obah line',
        heading: "And from there to Mission Beach",
        body: "Winifred names the family path directly: her people were at the whole Hull River Mission, then dispersed to Mission Beach. The 1918 cyclone is part of her line too, and the 100-year corroboree on Palm in 2018 was hers as much as anyone's.",
        pullquote: "We had our hundred year anniversary, it was in 2018. You know, when they did all the corroboree in there for five minutes nonstop.",
        attribution: 'Winifred Obah · Elders Trip Interview',
        bg: IMG.brookIsland1920,
      },
    ],
    closingReflection: {
      body: 'The elders came home from Mission Beach holding what they went there to hold. Not closure. A continuation. The next walk is already named.',
      pullquote: "It's like passing on a message and follow that message where it will lead you to.",
      attribution: 'Allan Palm Island',
    },
    connectedEventIds: ['1918-hull-river-cyclone'],
    notes: 'Drafted from Allan + Winifred transcripts. Hero is the 1918 Innisfail cyclone damage (the same Leonte that destroyed Hull River — era-correct). Chapters draw on 1908 Hinchinbrook Country, 1935 channel, 1918 Innisfail, 1920 Brook Island. Mission Beach 2024 trip-day photos still pending: Ben + PICC photographer hold these family-side.',
  },
  {
    slug: 'atherton-tablelands-2026',
    title: 'Atherton Tablelands',
    subtitle: 'Where Doreen Morton was taken from, where Alf Palmer\'s mother walked, where the Mamu and Warrongo families were broken open by the 1930s removal pipeline.',
    status: 'planned',
    date: 'Late 2026',
    yearLabel: '2026',
    location: 'Atherton Tablelands · Mamu / Warrongo / Jirrbal Country',
    hero: IMG.athertonTableland1954,
    whyThisPlace: "The Tablelands hold the source landscape for three of Palm Island's family lines. Doreen Morton was removed from here at ten years old in the 1930s wave. Alf Palmer carried Warrongo language out of Mt Garnet. Allan's mother — Giribau, likely Jirrbal — has family memory of station work at Kunawara near Mt Garnet. The 2026 trip walks the Country these families were taken from. The trust loop with Mission Beach 2024 builds: each return prepares the next.",
    elderSlugs: ['marjoyie-burns', 'winifred-obah', 'elsa-watson', 'allan-palm-island'],
    chapters: [
      {
        eyebrow: 'The Country',
        heading: 'Mamu, Warrongo, Jirrbal',
        body: "Three connected language groups across the Tablelands. The 1880s tin rush brought violence to Warrongo. The 1918 cyclone pushed survivors south. By the 1930s the removal pipeline was sweeping ten-year-olds like Doreen Morton onto the Palm boats. Marjoyie's grandmother Lizzie Palmer, Alf's sister, walked this Country. Allan's mother's family worked stations here.",
        pullquote: "Where I come from, I got my mother, my mother is a Giribau. My mother and grandmother, they all worked at the station. They worked at a station called Kunawara.",
        attribution: 'Allan Palm Island · Painting Interview',
        bg: IMG.mtGarnet1901,
      },
      {
        eyebrow: 'What Country does',
        heading: "The body knows before the mind does",
        body: "The elders who have already returned to Country describe the same thing — a body recognition that arrives before the mind catches up. Marjoyie returning to Warrongo Country, Winifred to ancestors. The Atherton trip will hold this same threshold for Elsa returning to Mamu Country, for the others walking forward into where the ancestors were taken from.",
        pullquote: "I'm very happy to be here standing on Jirrbal Country from my grandmother. Just walking in, in on country there like, for me to think. It's very emotional, you know.",
        attribution: 'Marjoyie Burns · Elders Trip Interview',
        bg: IMG.blencoeFalls2022,
      },
      {
        eyebrow: 'Spirit',
        heading: "I felt the ancestor spirit",
        body: "Winifred's words from a previous return apply forward. The trip into Country is not metaphor. The elders describe a physical presence of the line, a body memory that returns when the foot meets the ground.",
        pullquote: "I felt the ancestor spirit. It's like they were around us because my back went funny. I felt like there was spikes on my back, like my hair was standing.",
        attribution: 'Winifred Obah · Elders Trip Interview',
        bg: IMG.millaaMillaaFalls,
      },
      {
        eyebrow: 'What we hope to find',
        heading: 'Doreen, Alf, Lizzie, Baja',
        body: "Names the elders carry into Country. Doreen Morton — Elsa's mother — taken to Palm at ten. Alf Palmer (Jinbilnggay) — Marjoyie's grandfather, the last native speaker of Warrongo. Lizzie Palmer — Alf's sister, Marjoyie's other line. Baja Balanar — Allan's mother's grandmother, station era. Four names walking with the elders into the Tablelands.",
        bg: IMG.athertonTableland1954,
      },
    ],
    closingReflection: {
      body: 'Pending. The page will be re-drafted from elder voice after the trip. What gets recorded here now is the framing the elders carry going in.',
    },
    connectedEventIds: ['1918-hull-river-cyclone'],
    notes: 'Pre-trip framing only. After the journey, replace chapters with elder voice from new transcripts. Photos to source: Tablelands family-held imagery (with consent).',
  },
  {
    slug: 'next-bridge',
    title: 'Where we go next',
    subtitle: "What the elders want to see — held open as the families decide.",
    status: 'dreaming',
    date: 'When the elders decide',
    yearLabel: '...',
    location: 'TBD',
    hero: IMG.palmHappyMoments1935,
    whyThisPlace: "Each journey prepares the next. After Mission Beach 2024 came Atherton 2026. After the Tablelands, the next bridge is the elders' to name. The page is here as a placeholder so the families know the door stays open.",
    elderSlugs: [],
    chapters: [],
    notes: 'Placeholder. Live-edit page that Ben + Rachel + Narelle update with the elders. Will surface candidates as they emerge: Cherbourg / Woorabinda for the Magnificent Seven exile; the South Sea Islander Erromango / Manga origins for Aunty Ethel; Bowen / Birri-gubba Country for Cyndel.',
  },
]

// ─────────────────────  Lookups  ────────────────────────────────────────────

export function findJourneyBySlug(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug)
}

/**
 * Returns journeys this elder appears in (as a goer or planned-goer).
 * Used by ElderProfilePage to show their journey arc.
 */
export function getJourneysForElder(elderSlug: string): Journey[] {
  return JOURNEYS.filter((j) => j.elderSlugs.includes(elderSlug))
}

/**
 * Returns journeys whose connectedEventIds list this event.
 * Used by TimelineRibbon EventPanel to surface "this event is held in
 * a journey the elders walked / are walking".
 */
export function getJourneysForEvent(eventId: string): Journey[] {
  return JOURNEYS.filter((j) => (j.connectedEventIds || []).includes(eventId))
}

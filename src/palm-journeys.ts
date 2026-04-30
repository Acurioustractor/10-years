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

export type JourneyVideo = {
  src: string                                 // /media/clips/<file>.mp4
  poster?: string                             // optional fallback still
  title: string
  year: string
  source: string
  license: string
}

export type JourneyGalleryItem =
  | { kind: 'still'; url: string; title: string; year: string; source: string; license: string }
  | { kind: 'clip';  url: string; poster?: string; title: string; year: string; source: string; license: string }

export type ElderQuote = {
  elderSlug: string                           // → LIVING_ELDER_PINS
  text: string                                // the quote
  source: string                              // e.g. "Elders Trip Interview"
  pendingReview?: boolean                     // true until elder approves public surface
}

export type VideoQuote = {
  videoSrc: string                            // /media/clips/<file>.mp4
  poster?: string
  quote: string
  attribution: string
  attributionElderSlug?: string               // for portrait avatar lookup in LIVING_ELDER_PINS
}

export type PlanningNote = {
  heading: string
  body: string
  status?: 'confirmed' | 'proposed' | 'dreaming'
}

export type PersonToVisit = {
  name: string                                // "Doreen Morton's family" or "Yidinji elders, Atherton"
  why: string                                 // one-line — the connection
  country?: string                            // optional Country slug → /places
  status: 'arranged' | 'reaching-out' | 'aspiring'
}

export type TripMapLocation = {
  id: string
  x: number
  y: number
  label: string
  sublabel?: string
  isOrigin?: boolean
  isPlanned?: boolean
}

export type TripMapRoute = {
  fromId: string
  toId: string
  curve?: { x: number; y: number }
  status: 'past' | 'planned'
}

export type TripMapConfig = {
  locations: TripMapLocation[]
  routes: TripMapRoute[]
  caption?: string
  heading?: string
  eyebrow?: string
}

export type LeafletStop = {
  id: string
  name: string
  description: string
  familyConnection?: string
  lat: number
  lng: number
  placeSlug?: string
}

export type LeafletTripMapConfig = {
  stops: LeafletStop[]
  status: 'past' | 'planned'
  caption?: string
  heading?: string
  eyebrow?: string
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
  heroVideo?: JourneyVideo                    // optional video hero — overrides hero image when present
  descriptEmbedUrl?: string                   // optional Descript share URL — surfaces a produced-doc embed below the hero
  descriptEmbedTitle?: string                 // caption for the embed
  whyThisPlace: string                        // 2-3 sentences
  elderSlugs: string[]                        // /elders/<slug> — who went / is going
  notGoingNote?: string                       // editorial note when an elder is conspicuously absent (e.g. Aunty Iris)
  chapters: JourneyChapter[]
  elderQuotes?: ElderQuote[]                  // per-elder voice from this trip — past trips only
  videoQuotes?: VideoQuote[]                  // full-screen video panels with overlaid quotes
  tripMap?: TripMapConfig                     // stylised SVG map of the trip route (deprecated — prefer leafletMap)
  leafletMap?: LeafletTripMapConfig           // real Leaflet map with lat/lng stops + animated playthrough
  planningNotes?: PlanningNote[]              // for planned/dreaming trips
  peopleToVisit?: PersonToVisit[]             // for planned/dreaming trips
  gallery?: JourneyGalleryItem[]              // mixed stills + clips, appears between chapters and closing
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
    heroVideo: {
      src: '/media/clips/elders-on-country.mp4',
      poster: '/media/stills/waterfall-landscape.jpg',
      title: 'Elders on Country',
      year: '2024–25',
      source: 'PICC media · Palm Island Community Company',
      license: 'PICC consent · cultural protocol',
    },
    descriptEmbedUrl: 'https://share.descript.com/embed/75MyeSD3Ujp',
    descriptEmbedTitle: 'Mission Beach 2024 — produced documentary',
    // Trip photos pulled from Empathy Ledger — actual elders-trip-2025 photoshoot
    // (elders went to Mission Beach Oct 2025, trip-day photos held in
    // Empathy Ledger media_assets table linked to project picc-elders).
    gallery: [
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380700711-7xy54e.jpg', title: 'Day one — arrival', year: '15 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380713803-fdbq7.jpg', title: 'On Country', year: '15 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380729007-kh36nv.jpg', title: 'The walk back', year: '16 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380744661-a7cq6n.jpg', title: 'Hull River reserve site', year: '16 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380761201-f9jg44.jpg', title: 'Standing where the families were', year: '16 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380779624-pqin4.jpg', title: 'Country, holding it all', year: '16 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380794739-33sdzf.jpg', title: 'Voice on the land', year: '16 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380810781-zef07k.jpg', title: 'Together on Country', year: '16 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380827389-ywl6tg.jpg', title: 'Looking out', year: '16 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380843256-gqf2kr.jpg', title: 'Day three — closing', year: '17 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380859270-8i5j3.jpg', title: 'What we carry home', year: '17 Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
      { kind: 'still', url: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1765843210165-6khdad.jpg', title: 'Returning, reconfigured', year: 'Oct 2025', source: 'PICC photography · Mission Beach trip', license: 'PICC consent · elder-approved' },
    ],
    whyThisPlace: "In 1918 the cyclone Leonte destroyed the Hull River Aboriginal Settlement at Mission Beach. The Aboriginal people removed there from across the Far North coast and the Tablelands were transported to Palm Island in the months that followed. This is the moment Palm Island became Bwgcolman, the place where many were sent. In 2024 the PICC elders returned to Mission Beach together. Not nostalgia. A return to the place where ancestors suffered.",
    elderSlugs: [
      'allan-palm-island',
      'winifred-obah',
      'marjoyie-burns',
      'frank-anderson',
      'aunty-ethel-robertson',
      'elsa-watson',
      'cyndel-pryor',
      'gurtrude-richardson',
    ],
    notGoingNote: 'Aunty Iris May Whitey did not travel on this trip — held at home with family. Her sister Aunty Ethel went and brought back the witness.',
    videoQuotes: [
      {
        videoSrc: '/media/clips/country-waterfall.mp4',
        poster: '/media/stills/waterfall.jpg',
        quote: "We are on our way up to Mission Beach to uncover a scenery that would happen back in 1918. To uncover that, to see for myself.",
        attribution: 'Allan Palm Island · Lucinda Interview',
        attributionElderSlug: 'allan-palm-island',
      },
      {
        videoSrc: '/media/clips/palm-island-aerial.mp4',
        poster: '/media/stills/jetty-aerial.jpg',
        quote: "It's verbal, it's verbally spoken where you tell your story and you're handing it down.",
        attribution: 'Winifred Obah · Elders Trip Interview',
        attributionElderSlug: 'winifred-obah',
      },
      {
        videoSrc: '/media/clips/palm-island-sunset.mp4',
        poster: '/media/stills/palm-sunset-pier.jpg',
        quote: "It's like passing on a message and follow that message where it will lead you to.",
        attribution: 'Allan Palm Island · Lucinda Interview',
        attributionElderSlug: 'allan-palm-island',
      },
    ],
    leafletMap: {
      eyebrow: 'The route',
      heading: 'Palm Island to Hull River',
      caption: 'Three days walking back to where the families were taken from. Tap any stop or play the journey to walk it through.',
      status: 'past',
      stops: [
        {
          id: 'palm-island',
          name: 'Palm Island',
          description: 'The elders\' home — Bwgcolman Country. The journey begins here, departing by barge across the Coral Sea.',
          familyConnection: 'All 8 trip elders departed from Palm — Allan, Winifred, Marjoyie, Frank, Aunty Ethel, Elsa, Cyndel, Gurtrude.',
          lat: -18.7547,
          lng: 146.5832,
          placeSlug: 'palm-island',
        },
        {
          id: 'lucinda',
          name: 'Lucinda',
          description: 'The mainland barge port. The way generations have travelled between island and mainland.',
          familyConnection: 'The 1931 Halifax-Lucinda Point relief works confirmed South Sea Islander labour at this exact place — Aunty Ethel + Iris\'s family ground.',
          lat: -18.5276,
          lng: 146.3320,
          placeSlug: 'halifax-hinchinbrook',
        },
        {
          id: 'ingham',
          name: 'Ingham',
          description: 'Sugar country. The Halifax Camp era in living memory — sugar mill labour, South Sea Islander descent, the ground that anchored the Robertson and Whitey families.',
          familyConnection: 'Aunty Ethel + Iris\'s line runs through here. Uba — the South Sea Islander elder buried at Halifax in 1934 — is a candidate ancestor-generation marker.',
          lat: -18.6515,
          lng: 146.1605,
          placeSlug: 'halifax-hinchinbrook',
        },
        {
          id: 'hull-river',
          name: 'Hull River · Mission Beach',
          description: 'The heart of the journey. The Hull River reserve site, destroyed by Cyclone Leonte 10 March 1918. Survivors transported to Palm Island in the months that followed — the moment Palm became Bwgcolman, the place where many were sent.',
          familyConnection: 'Allan\'s grandparents, aunties, uncles. Daisy Palmer\'s line. Doreen Morton\'s removal pipeline. Allan: "We are on our way up to Mission Beach to uncover a scenery that would happen back in 1918."',
          lat: -17.8736,
          lng: 146.0997,
          placeSlug: 'mission-beach',
        },
      ],
    },
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
    // Elder voices from this trip — pulled from transcripts in Empathy Ledger
    // ('Elders Trip Interview' transcripts per elder, project picc-elders).
    // Quotes flagged pendingReview need elder approval before public surface.
    elderQuotes: [
      {
        elderSlug: 'allan-palm-island',
        text: "We are on our way up to Mission Beach to uncover a scenery that would happen back in 1918. To uncover that, to see for myself and actually feel their pain and suffering. It's like passing on a message and follow that message where it will lead you to.",
        source: 'Lucinda Interview · Elders Trip',
      },
      {
        elderSlug: 'winifred-obah',
        text: "We had our hundred year anniversary, it was in 2018. When they did all the corroboree in there for five minutes nonstop.",
        source: 'Elders Trip Interview',
      },
      {
        elderSlug: 'cyndel-pryor',
        text: "I'd come up to look and search with mum's history. Meeting some of mum's people, who acknowledged her — was such a joy for my heart.",
        source: 'Elders Trip Interview',
      },
      {
        elderSlug: 'aunty-ethel-robertson',
        text: "My mother — from a young girl, soon as she started walking — her mother Gracie and my great-grandmother Polly would talk language to her. The whole girl, she spoke the language. I only wish I could see my grandmother and my great-grandmother.",
        source: 'Elders Trip Interview',
      },
      {
        elderSlug: 'marjoyie-burns',
        text: "I'm very happy to be here standing on Jirrbal Country from my grandmother. Just walking in on country there, for me to think. It's very emotional, you know.",
        source: 'Elders Trip Interview',
      },
      {
        elderSlug: 'frank-anderson',
        text: "We had to go on doing whatever any normal kid would do. Just go and play and do some chores. And so we grew up to listen.",
        source: 'Frank Full Interview · Elders Trip',
      },
      {
        elderSlug: 'elsa-watson',
        text: "Mum was a Mamu woman from Millaa Millaa. Taken to Palm at ten. Deaf — she taught us family sign language. The trip was for her line.",
        source: 'Paraphrased from Elders Trip Interview',
      },
      {
        elderSlug: 'gurtrude-richardson',
        text: "Time is very important in this process. Maintaining relations with elders is maybe a longer, longer process.",
        source: 'Elders Trip Interview',
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
    heroVideo: {
      src: '/media/clips/mountain-panorama.mp4',
      poster: '/media/stills/mountain-valley.jpg',
      title: 'Atherton Tableland · Mountain panorama',
      year: '',
      source: 'PICC media · Palm Island Community Company',
      license: 'PICC consent · cultural protocol',
    },
    gallery: [
      { kind: 'still', url: '/media/stills/mountain-valley.jpg', title: 'Mountain valley, Tablelands', year: '', source: 'PICC media · Palm Island Community Company', license: 'PICC consent · cultural protocol' },
      { kind: 'still', url: '/media/stills/waterfall.jpg', title: 'Waterfall, Tablelands ranges', year: '', source: 'PICC media · Palm Island Community Company', license: 'PICC consent · cultural protocol' },
      { kind: 'still', url: '/media/stills/waterfall-landscape.jpg', title: 'Waterfall landscape', year: '', source: 'PICC media · Palm Island Community Company', license: 'PICC consent · cultural protocol' },
      { kind: 'clip', url: '/media/clips/country-waterfall.mp4', poster: '/media/stills/waterfall.jpg', title: 'Country waterfall', year: '', source: 'PICC media · Palm Island Community Company', license: 'PICC consent · cultural protocol' },
      { kind: 'clip', url: '/media/clips/mountain-panorama.mp4', poster: '/media/stills/mountain-valley.jpg', title: 'Mountain panorama', year: '', source: 'PICC media · Palm Island Community Company', license: 'PICC consent · cultural protocol' },
    ],
    whyThisPlace: "The Tablelands hold the source landscape for three of Palm Island's family lines. Doreen Morton was removed from here at ten years old in the 1930s wave. Alf Palmer carried Warrongo language out of Mt Garnet. Allan's mother — Giribau, likely Jirrbal — has family memory of station work at Kunawara near Mt Garnet. The 2026 trip walks the Country these families were taken from. The trust loop with Mission Beach 2024 builds: each return prepares the next.",
    elderSlugs: [
      'allan-palm-island',
      'winifred-obah',
      'marjoyie-burns',
      'frank-anderson',
      'aunty-ethel-robertson',
      'aunty-iris-whitey',
      'elsa-watson',
      'cyndel-pryor',
      'gurtrude-richardson',
    ],
    chapters: [
      {
        eyebrow: 'The Country',
        heading: 'Mamu, Warrongo, Yidinji',
        body: "Three connected Country threads across the Tablelands. The 1880s tin rush brought violence to Warrongo. The 1918 cyclone pushed survivors south. By the 1930s the removal pipeline was sweeping ten-year-olds like Doreen Morton onto the Palm boats. Yidinji is the Country Atherton itself sits on. The trip walks each in turn — not as separate visits but as one continuous arc.",
        bg: IMG.mtGarnet1901,
      },
      {
        eyebrow: 'What we walk back toward',
        heading: "Returning before the trip",
        body: "Several PICC elders have already returned to Country in earlier years — Marjoyie to Warrongo, Winifred to her ancestor places. They describe a body recognition that arrives before the mind catches up. Atherton 2026 holds this same threshold for Elsa returning to Mamu Country, for the others walking forward into where the ancestors were taken from. The voice from those earlier returns is held on the Mission Beach 2024 page; this trip will record its own.",
        bg: IMG.blencoeFalls2022,
      },
      {
        eyebrow: 'Names the elders carry',
        heading: 'Doreen, Alf, Lizzie, Baja',
        body: "Names walking with the elders into the Tablelands. Doreen Morton — Elsa's mother — taken to Palm at ten. Alf Palmer (Jinbilnggay) — Marjoyie's grandfather, the last native speaker of Warrongo. Lizzie Palmer — Alf's sister, Marjoyie's other line. Baja Balanar — Allan's mother's grandmother, the Kunawara station era. Madge Thaiday — Aunty Dulcie's mother, Girramay from Tully. Each name a line into Country.",
        bg: IMG.millaaMillaaFalls,
      },
      {
        eyebrow: 'What we hope to find',
        heading: 'Country first, voice second',
        body: 'The elders walk in to feel the ground before they tell its story. Welcome-to-Country protocols at Atherton, sacred protocols at Blencoe Falls (the Lucy site, family-held), permission protocols on Mt Garnet station Country. Voice gets recorded only after the welcome.',
        bg: IMG.athertonTableland1954,
      },
      {
        eyebrow: 'The 20-year arc',
        heading: 'A permanent archive of community voice',
        body: "The Atherton trip sits inside PICC's 20-year vision — the next two decades of community-controlled infrastructure for every Palm Islander. Aged care on Palm by 2028. Delegated Authority expanded into health and justice by 2030. The voice capture sprint that this journey contributes to is the foundation: a permanent archive that grows stronger every year. The elders walking into Country are recording so the children can keep correcting.",
        bg: IMG.athertonTableland1954,
      },
    ],
    videoQuotes: [
      {
        videoSrc: '/media/clips/mountain-panorama.mp4',
        poster: '/media/stills/mountain-valley.jpg',
        quote: "The body knows before the mind does. Country recognition arrives before language for it.",
        attribution: 'PICC framing · Atherton 2026 pre-trip',
      },
    ],
    leafletMap: {
      eyebrow: 'The planned route',
      heading: 'Atherton Tablelands · 10-day Year 1 journey',
      caption: 'November 2026. The first major journey of the Voices on Country project. Tap any stop to explore the planned route.',
      status: 'planned',
      stops: [
        {
          id: 'palm-island',
          name: 'Palm Island',
          description: 'Departure from Bwgcolman Country. All 9 PICC living elders currently in planning.',
          familyConnection: 'Where the elders carry their lines from — the lines they walk back to.',
          lat: -18.7547,
          lng: 146.5832,
          placeSlug: 'palm-island',
        },
        {
          id: 'mareeba',
          name: 'Mareeba',
          description: 'Tablelands gateway · Muluridji Country. Year 1 mobilisation point. The first inland leg.',
          familyConnection: 'Cross-Country protocol: welcome from the Tablelands traditional owners before the deeper inland walks.',
          lat: -16.9970,
          lng: 145.4239,
        },
        {
          id: 'atherton',
          name: 'Atherton',
          description: 'Yidinji Country. Tablelands base camp for the Year 1 trip. The wider Voices on Country project anchors here.',
          familyConnection: 'Yidinji elders welcome PICC to Country. The Tablelands hold the source landscape for three Palm Island family lines.',
          lat: -17.2683,
          lng: 145.4757,
          placeSlug: 'atherton-tablelands',
        },
        {
          id: 'herberton',
          name: 'Herberton',
          description: 'Tin-mining heritage town · Warrongo Country edge. Echoes of the 1880s rush that broke open the Warrongo families.',
          familyConnection: 'Marjoyie\'s grandfather Alf Palmer carried Warrongo language out of this Country. The Mt Garnet station era is one valley west.',
          lat: -17.3866,
          lng: 145.3877,
        },
        {
          id: 'ravenshoe',
          name: 'Ravenshoe',
          description: 'Highest town in Queensland · upper Tablelands. Forced-walk site under the Aboriginals Protection Act.',
          familyConnection: 'Aunty Ethel\'s mother was force-walked from Halifax to Ravenshoe with police black-trackers. The weak ones falling. This is the Country her family was taken across.',
          lat: -17.6201,
          lng: 145.4843,
        },
        {
          id: 'millaa-millaa',
          name: 'Millaa Millaa',
          description: 'Mamu Country · the Tableland village. Where Doreen Morton was taken from.',
          familyConnection: 'Doreen Morton — Elsa Watson\'s mother — was removed to Palm Island at ten years old. Mamu language. Deaf — taught family sign language. The trip walks her line back.',
          lat: -17.4992,
          lng: 145.6135,
          placeSlug: 'millaa-millaa',
        },
      ],
    },
    planningNotes: [
      {
        heading: 'Voices on Country · 36-month project',
        body: 'Atherton 2026 is Year 1 of PICC\'s 36-month Voices on Country project — funded by the Indigenous Languages and Arts (ILA) Program, $600K investment, 8+ elders, 57+ language groups represented. Two major return-to-Country journeys (Atherton 2026, Central Australia 2027) plus annual exhibitions and a permanent Elders Room installation on Palm Island.',
        status: 'confirmed',
      },
      {
        heading: 'Year 1 timeline (2026–27)',
        body: 'September 2026 — Mobilisation and Elders Room installation on Palm. November 2026 — Atherton Tablelands 10-day journey. January 2027 — 200+ photographs, 10–15 short interview videos, audio language recordings captured. March 2027 — Post-production: curated photo series, draft short films, Manbarra language word list. June 2027 — Community Exhibition 1 on Palm Island.',
        status: 'confirmed',
      },
      {
        heading: 'The route — Mareeba · Atherton · Herberton · Ravenshoe · Millaa Millaa',
        body: 'Year 1 walks four Tableland anchor points. Mareeba as gateway. Atherton as Yidinji base. Herberton echoing the 1880s Warrongo tin-rush violence. Ravenshoe — where Aunty Ethel\'s mother was force-walked. Millaa Millaa — where Doreen Morton was taken from. Each stop has a family connection inside it.',
        status: 'confirmed',
      },
      {
        heading: 'Three Country threads, one trip',
        body: 'The Tablelands hold three connected Country threads: Mamu (Doreen Morton, Elsa\'s line), Warrongo (Alf Palmer, Marjoyie\'s line), Yidinji (Atherton itself). The trip walks each in turn — not as separate visits but as a single continuous arc.',
        status: 'confirmed',
      },
      {
        heading: 'The crew · 8+ elders',
        body: 'All 9 PICC living elders currently in planning. Final attendance per elder confirmed closer to date — Aunty Iris pending health check at the time. Project minimum is 8+ per ILA grant scope.',
        status: 'proposed',
      },
      {
        heading: 'Cultural protocol · Mukurtu access controls',
        body: 'Welcome-to-Country from Yidinji elders required at Atherton arrival. Sacred protocols at family-held sites. The resulting digital archive uses Mukurtu — the Indigenous-built platform — for tiered cultural access controls. Elders decide what gets surfaced where.',
        status: 'confirmed',
      },
      {
        heading: 'Year 2 (2027–28) · Central Australia · Bloomfield family at Atnarpa',
        body: 'September 2027 planning at the Bloomfield family\'s Atnarpa homestead. November 2027 — 10-day Central Australia journey, cross-cultural exchange with the Oonchiumpa youth program. Live exhibition at Atnarpa December 2027. Builds on the Year 1 method, deepens the inter-community connection.',
        status: 'proposed',
      },
      {
        heading: 'What gets captured',
        body: 'Per-elder return-to-Country voice (transcripts), language recordings, photography, video. Manbarra language word list compiled by Year 1 end. After each journey returns, the trip page rewrites from elder voice — the way Mission Beach 2024 already has.',
        status: 'confirmed',
      },
    ],
    peopleToVisit: [
      {
        name: "Doreen Morton's family · Millaa Millaa",
        why: "Elsa Watson's mother was taken from here at ten years old. Reaching out to descendants of the Mamu line who stayed.",
        country: 'mamu',
        status: 'reaching-out',
      },
      {
        name: 'Warrongo language descendants · Mt Garnet',
        why: "Alf Palmer (Marjoyie's grandfather) was the last native speaker. Rachel Cummins (Alf's granddaughter) led the language revival from 2002 — possible host for the Mt Garnet leg.",
        country: 'warrongo',
        status: 'reaching-out',
      },
      {
        name: 'Yidinji elders · Atherton',
        why: "Welcome-to-Country protocol for the Tableland leg. Working through Cairns Indigenous community contacts.",
        status: 'aspiring',
      },
      {
        name: "Cyndel's mother's people · Tully + Murray Upper",
        why: "Cyndel's Stolen Generation mother came from this Country. The 2024 trip began the search; 2026 continues it.",
        country: 'girramay',
        status: 'reaching-out',
      },
      {
        name: "Madge Thaiday's people · Tully (Girramay)",
        why: "Aunty Dulcie Isaro's mother. The Thaiday line carries Erub + Lifou + Mer + Girramay across three generations.",
        country: 'girramay',
        status: 'aspiring',
      },
      {
        name: "Baja Balanar's family · Kunawara station, Mt Garnet",
        why: "Allan's mother's grandmother worked the station. Family memory points to descendants in the area — pending elder review pass with Allan to surface names.",
        country: 'warrongo',
        status: 'aspiring',
      },
    ],
    closingReflection: {
      body: 'The page is the planning. After the trip, this rewrites from elder voice — the way Mission Beach 2024 already has. The framing here is what the elders carry going in.',
      pullquote: 'Our cultural authority is recognised alongside the law.',
      attribution: 'Bwgcolman Way · community framing',
    },
    connectedEventIds: ['1918-hull-river-cyclone'],
    notes: 'Pre-trip planning page. Elder quotes deliberately omitted — those belong on Mission Beach 2024 (the past trip). Locked dates + final route pending Rachel\'s workshop output (~late May 2026). After the journey returns, replace chapters with elder voice from new transcripts.',
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

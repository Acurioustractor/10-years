/**
 * Per-cluster editorial configs for the ClusterShowcase template.
 * Each cluster gets its own Country palette, hero/Country/bridge imagery,
 * opening quote, ancestor backgrounds + quotes.
 *
 * Order of editorial sections is fixed by ClusterShowcase:
 *   Hero → Opening Quote → Elder panels → Country → Sacred → Ancestor panels → Bridge → Photo strip → Leave a note
 */

export type BgSource = {
  url: string
  title: string
  year: string
  source: string
  license: string
}

export type ClusterConfig = {
  slug: string
  name: string[]                            // ['Palmer', 'Burns', 'Obah'] — joined with · in hero
  subtitle: string                          // hero subtitle, italic serif
  countryName: string                       // 'Warrongo' — large serif on Country panel
  countryDescription: string                // italic body
  countryFooter: string                     // small uppercase footer
  palette: {
    ink: string                              // deep tone for hero overlay + bottom bar
    cream: string                            // page paper
    ochre: string                            // accent
    amber: string                            // soft accent
    sand: string                             // sand tone
    sacred: string                           // near-black for sacred panel
    quoteSection: string                     // background for the opening quote section
  }
  heroBg: BgSource
  countryBg: BgSource
  bridgeBg: BgSource
  openingQuote: {
    text: string
    quoterMatch: string                      // displayName substring to find quoter member for avatar
    quoterCultural: string                   // small label below name
    quoterDisplayName: string                // how to render the name
  }
  // Lead elder + secondary elder match strings (displayName substring). 1st = top elder panel.
  elderOrder: string[]
  // optional per-elder quote text for the in-bio quote box (looked up by displayName substring)
  elderQuotes?: Record<string, string>
  // ancestor render order by displayName substring. Renders in this order between Country + Bridge.
  ancestorOrder: string[]
  // per-ancestor background image (displayName substring → BgSource)
  ancestorBgs?: Record<string, BgSource>
  // per-ancestor quote (displayName substring → quote + attribution + optional quoter avatar match)
  ancestorQuotes?: Record<string, { text: string; attribution: string; quoterMatch?: string }>
  // ancestor that should render in the SACRED panel (tap-to-reveal, with bg image)
  sacredAncestorMatch?: string
  bridge: {
    title: string
    body: string
    avatarMatches: string[]                  // displayName substrings to render as side-by-side circles
  }
  // closing-call line on Leave-a-note
  closingNote?: string
  // Optional editorial chapters between elder panels and Country. Each renders as a
  // full-width pull-quote on a dark background with a short framing paragraph above.
  chapters?: Array<{
    eyebrow: string         // small uppercase label
    heading: string         // large serif heading
    body: string            // short framing paragraph
    pullquote: string       // the elder voice
    attribution: string     // who said it + where from
    bg?: BgSource           // optional photo background
  }>
  // Additional images for the bottom photo strip that don't appear in a panel.
  gallery?: BgSource[]
}

// ─────────────────────  Background source library  ──────────────────────────

const BG = {
  // Palmer/Burns/Obah — Warrongo Country
  mtGarnet1901: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/StateLibQld_1_49744_Construction_of_Return_Creek_Railway_Bridge%2C_Mount_Garnet%2C_Queensland%2C_ca._1901.jpg/1920px-StateLibQld_1_49744_Construction_of_Return_Creek_Railway_Bridge%2C_Mount_Garnet%2C_Queensland%2C_ca._1901.jpg',
    title: 'Mt Garnet, Warrongo Country', year: 'ca. 1901',
    source: 'State Library of Queensland · Wikimedia Commons', license: 'Public domain',
  },
  blencoeFalls2022: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Blencoe_Falls%2C_Girrigun_National_Park%2C_Far_North_Queensland%2C_2022.jpg/1920px-Blencoe_Falls%2C_Girrigun_National_Park%2C_Far_North_Queensland%2C_2022.jpg',
    title: 'Blencoe Falls, Girrigun National Park', year: '2022',
    source: 'Royal Geographical Society of QLD · Wikimedia Commons', license: 'CC BY 4.0',
  },
  stGeorgesChurch1931: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Australian_Aboriginal_men_erecting_the_wooden_frame_of_St_George%27s_Anglican_church%2C_Palm_Island%2C_1931.jpg/1920px-Australian_Aboriginal_men_erecting_the_wooden_frame_of_St_George%27s_Anglican_church%2C_Palm_Island%2C_1931.jpg",
    title: "Aboriginal men erecting St George's Anglican Church", year: '1931',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  dancers1931: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Queensland_State_Archives_5801_Dancers_Palm_Island_June_1931.png',
    title: 'Dancers, Palm Island', year: 'June 1931',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  palmIsland1928: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Queensland_State_Archives_886_Palm_Island_North_Queensland_c_1928.png',
    title: 'Palm Island, North Queensland', year: 'ca. 1928',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  brassBand1931: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Queensland_State_Archives_5796_Brass_Band_Palm_Island_June_1931.png',
    title: 'Brass Band, Palm Island', year: 'June 1931',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  // Robertson/Whitey — Halifax + Hinchinbrook
  hinchinbrookChannel1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Queensland_State_Archives_1381_Hinchinbrook_Channel_NQ_c_1935.png',
    title: 'Hinchinbrook Channel, North Queensland', year: 'ca. 1935',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  hinchinbrookWetlands2022: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Wide_expanses_of_estuarine_wetlands._Hinchinbrook_Island_Lookout%2C_Bemerside%2C_2022.jpg',
    title: 'Hinchinbrook Island wetlands', year: '2022',
    source: 'Wikimedia Commons', license: 'CC BY-SA 4.0',
  },
  // Anderson — Ingham
  victoriaMillIngham1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/StateLibQld_1_85876_Sugar_cane_harvesting_at_Victoria_Mill_in_Ingham%2C_ca._1935.jpg',
    title: 'Sugar cane harvesting at Victoria Mill, Ingham', year: 'ca. 1935',
    source: 'State Library of Queensland · Wikimedia Commons', license: 'Public domain',
  },
  victoriaMillIngham1915: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/97/StateLibQld_1_203692_Victoria_Sugar_Mill_near_Ingham%2C_Queensland%2C_ca._1915.jpg',
    title: 'Victoria Sugar Mill near Ingham', year: 'ca. 1915',
    source: 'State Library of Queensland · Wikimedia Commons', license: 'Public domain',
  },
  // Watson — Mamu / Atherton Tablelands / Millaa Millaa
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
  // Allan Palm Island — Manbarra / Magnetic Island
  magneticIslandArcadia: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Arcadia_Lookout%2C_Magnetic_Island%2C_Queensland%2C_Australia.jpg/1920px-Arcadia_Lookout%2C_Magnetic_Island%2C_Queensland%2C_Australia.jpg',
    title: 'Arcadia Lookout, Magnetic Island, Manbarra Country', year: '',
    source: 'Wikimedia Commons', license: 'CC BY-SA 4.0',
  },
  walterSkipper: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/walter-skipper-palm-island.jpg',
    title: 'Walter Palm Island ("Skipper") · Allan\'s father', year: '',
    source: 'Palm Island family collection', license: 'Family-held',
  },
  allanPainting14: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/painting-14.jpg',
    title: 'Painting by Allan Palm Island', year: '',
    source: 'Allan Palm Island', license: 'Artist-held',
  },
  allanPainting9: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/painting-9.jpg',
    title: 'Painting by Allan Palm Island', year: '',
    source: 'Allan Palm Island', license: 'Artist-held',
  },
  allanPainting2: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/painting-2.jpg',
    title: 'Painting by Allan Palm Island', year: '',
    source: 'Allan Palm Island', license: 'Artist-held',
  },
  uncleAllan10: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/uncle-allan-10.jpg',
    title: 'Uncle Allan Palm Island', year: '',
    source: 'PICC photography', license: 'Family consent',
  },
  uncleAllan17: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/uncle-allan-17.jpg',
    title: 'Uncle Allan Palm Island', year: '',
    source: 'PICC photography', license: 'Family consent',
  },
  uncleAllan16: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/uncle-allan-16.jpg',
    title: 'Uncle Allan Palm Island', year: '',
    source: 'PICC photography', license: 'Family consent',
  },
  palmIslandScene146: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/palm-island-scene-146.jpg',
    title: 'Palm Island', year: '',
    source: 'GOODS photography', license: 'Editorial',
  },
  palmIslandScene147: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/palm-island-scene-147.jpg',
    title: 'Palm Island', year: '',
    source: 'GOODS photography', license: 'Editorial',
  },
  palmBeach1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Queensland_State_Archives_1352_The_Beach_Palm_Island_looking_south_c_1935.png/1920px-Queensland_State_Archives_1352_The_Beach_Palm_Island_looking_south_c_1935.png',
    title: 'The Beach, Palm Island looking south', year: 'ca. 1935',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  palmCoconuts1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Queensland_State_Archives_1363_Coconut_Palms_Palm_Island_c_1935.png/1920px-Queensland_State_Archives_1363_Coconut_Palms_Palm_Island_c_1935.png',
    title: 'Coconut Palms, Palm Island', year: 'ca. 1935',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  palmHappyMoments1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Queensland_State_Archives_1368_Happy_moments_on_Palm_Island_c_1935.png/1920px-Queensland_State_Archives_1368_Happy_moments_on_Palm_Island_c_1935.png',
    title: 'Happy moments on Palm Island', year: 'ca. 1935',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  allanGrandfather: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan-grandfather.jpg',
    title: 'Allan\'s grandfather', year: '',
    source: 'Palm Island family collection', license: 'Family-held',
  },
  // Pryor — Bowen / Birri-gubba
  bowenRiverHotel: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Bowen_River_Hotel%2C_2007.jpg',
    title: 'Bowen, Queensland', year: '2007',
    source: 'Wikimedia Commons', license: 'CC BY-SA 3.0',
  },
}

// ─────────────────────────  Cluster configs  ────────────────────────────────

export const CLUSTER_CONFIGS: Record<string, ClusterConfig> = {
  'palmer-burns-obah': {
    slug: 'palmer-burns-obah',
    name: ['Palmer', 'Burns', 'Obah'],
    subtitle: 'Three families on Palm Island, one Warrongo line. From Lucy at Blencoe Falls in the 1880s, to the children at Bwgcolman School today.',
    countryName: 'Warrongo',
    countryDescription: 'Mt Garnet to the Upper Herbert River. Closely related to Gudjal and Gugu Badhun. Tin was discovered there in the 1880s. The mining brought the violence.',
    countryFooter: 'The Palmer line walks from this Country to Palm Island',
    palette: { ink: '#1A2418', cream: '#F4EDE0', ochre: '#C9824B', amber: '#E8C496', sand: '#E8DCC4', sacred: '#0E0F0D', quoteSection: '#2A3D26' },
    heroBg: BG.mtGarnet1901,
    countryBg: BG.mtGarnet1901,
    bridgeBg: BG.brassBand1931,
    openingQuote: {
      text: "It's verbal, it's verbally spoken where you tell your story and you're handing it down.",
      quoterMatch: 'Winifred', quoterDisplayName: 'Winifred Obah',
      quoterCultural: 'Warrongo · Durru · Warra · Gungandji · Djiru',
    },
    elderOrder: ['Marjoyie', 'Winifred'],
    elderQuotes: {
      'Marjoyie': 'My grandparents Alf Palmer and Granny Lizzie Palmer.',
      'Winifred': "I felt the ancestor spirit. It's like they were around us because my back went funny. I felt like there was spikes on my back, like my hair was standing.",
    },
    ancestorOrder: ['Alf Palmer', 'Lizzie', 'Allison Obah'],
    ancestorBgs: {
      'Alf Palmer': BG.stGeorgesChurch1931,
      'Lizzie': BG.dancers1931,
      'Allison Obah': BG.palmIsland1928,
    },
    ancestorQuotes: {
      'Alf Palmer': {
        text: "I'm the last one to speak Warrungu. When I die this language will die. I'll teach you everything I know, so put it down properly.",
        attribution: 'Alf Palmer (Jinbilnggay) to linguist Tasaku Tsunoda, Palm Island, 1971',
      },
    },
    sacredAncestorMatch: 'Lucy',
    bridge: {
      title: 'Marjoyie and Winifred are cousins',
      body: "Through Alf Palmer. He was Marjoyie's grandfather and Winifred's grand-uncle (her grandmother's brother). Alf's mother Lucy was killed at Blencoe Falls. His granddaughter Rachel Cummins led the Warrongo language revival from 2002. The Palmer line carries one of the documented Indigenous lineages of Palm Island.",
      avatarMatches: ['Marjoyie', 'Winifred'],
    },
    chapters: [
      {
        eyebrow: 'The line through Alf',
        heading: 'My grandmother and her brother',
        body: "Alf Palmer (Jinbilnggay) was the last native speaker of Warrongo. Marjoyie's grandfather, and Winifred's grand-uncle. The two PICC elders are cousins through this line. Both grew up hearing the language hold what the archives could not.",
        pullquote: "My personal connection is through my grandmother and her brother Alf Palmer. So they sent people to my grandma up to Yuba. And then, yeah, everyone was all scattered and brown.",
        attribution: 'Marjoyie Burns · Elders Trip Interview',
        bg: BG.mtGarnet1901,
      },
      {
        eyebrow: 'Country',
        heading: 'Walking on the ground that holds you',
        body: "Marjoyie returns to Warrongo Country for the first time as an adult. She names what she feels — not a tourist returning, a granddaughter standing where she belongs.",
        pullquote: "I'm very happy to be here standing on Jirrbal Country from my grandmother. Just walking in, in on country there like, for me to think. It's very emotional, you know.",
        attribution: 'Marjoyie Burns · Elders Trip Interview',
        bg: BG.blencoeFalls2022,
      },
      {
        eyebrow: 'The thread to Allan',
        heading: 'Two clusters, one Country',
        body: "Allan Palm Island's mother is Giribau (likely Jirrbal). Her mother and grandmother worked at Kunawara station near Mt Garnet — the same Country Alf Palmer carried as the last Warrongo speaker. The Palmer/Burns/Obah cluster and the Allan Palm Island cluster are connected through the Mt Garnet pastoral station era. Two PICC elders, one ancestral landscape on the maternal side. For the elders to confirm.",
        pullquote: "Where I come from, I got my mother, my mother is a Giribau. My mother and grandmother, they all worked at the station. They worked at a station called Kunawara.",
        attribution: 'Allan Palm Island · Painting Interview',
        bg: BG.mtGarnet1901,
      },
      {
        eyebrow: 'Spirit',
        heading: 'I felt the ancestor spirit',
        body: "Winifred describes returning to Country. The body knew before the mind did.",
        pullquote: "I felt the ancestor spirit. It's like they were around us because my back went funny. I felt like there was spikes on my back, like my hair was standing.",
        attribution: 'Winifred Obah · Elders Trip Interview',
        bg: BG.dancers1931,
      },
      {
        eyebrow: 'Carrying it',
        heading: 'Verbal, handed down',
        body: "Warrongo is one of the most documented Aboriginal languages because Alf Palmer insisted his words be recorded properly. Winifred carries the spirit of that insistence into how the family does its remembering today.",
        pullquote: "It's verbal, it's verbally spoken where you tell your story and you're handing it down.",
        attribution: 'Winifred Obah · Elders Trip Interview',
        bg: BG.brassBand1931,
      },
      {
        eyebrow: 'Archive lead',
        heading: 'Ellison Obah, 1930',
        body: "On 5 May 1930 the Townsville Police Court heard the trial of Assistant Superintendent Thomas Hoffman, charged with procuring the murder of Superintendent Robert Curry. One of the witnesses was Ellison Obah, Aboriginal resident of Palm Island. Ellison testified that Hoffman offered £1 to anyone who would shoot Curry. Spelling variants of the Obah surname in Winifred's transcripts include Allison Ober, Alice, Ellison. Pending Tindale 1938 + AIATSIS confirmation. For elder review.",
        pullquote: "I will give anyone £1 to get Curry, and I will stand the responsibility.",
        attribution: 'Hoffman, as testified by Ellison Obah · The Telegraph (Brisbane) 5 May 1930 · Trove article 55363945',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Naming',
        heading: 'Marjoyie. Obah.',
        body: "Both elders spelled their own names on camera. The wiki and the database had drifted toward older spellings the families never used for themselves. Marjoyie spelled M-A-R-J-O-Y-I-E, not Marjorie. Winifred spelled OBAH, not Obar or Oba. The cluster's anti-fabrication line begins here, with the names the families chose.",
        pullquote: "My name is Marjorie Burns. To spell it is M A R. J-O-Y-I-E. Cool. Burns, B-U-R-N-S.",
        attribution: 'Marjoyie Burns · Elders Trip Interview',
        bg: BG.brassBand1931,
      },
      {
        eyebrow: 'Vision',
        heading: 'A small dark lady, thin dark lady',
        body: "Marjoyie never met her grandmother Lizzie Palmer in person. Lizzie died before Marjoyie was old enough to know her. But the granddaughter visions her grandmother clearly. The line carries even when the meeting did not.",
        pullquote: "I, we don't, I don't know much of her. She was a full blood aboriginal woman and I haven't met her, but there are times I vision her. A small dark lady, thin dark lady, and her husband is, uh, Alf Palmer.",
        attribution: 'Marjoyie Burns · Elders Trip Interview',
        bg: BG.dancers1931,
      },
      {
        eyebrow: 'First sound',
        heading: 'Allison Andrew, brought from Vanuatu',
        body: "Winifred's grandfather Allison Obah (Ellison Obah, the trumpet player) was the son of a man brought from Vanuatu in the blackbirding era. Winifred calls that great-grandfather 'Ganji', also Allison Andrew. She names him as 'first sound' — the first ancestor on the Obah line. The Andrew name runs through the family generations. The Pacific lives in this cluster alongside the Country.",
        pullquote: "It was a South Island man from Vanuatu. He sent it from Vanuatu. It was his father. The first sound we say. First sound. There's a lot of Andrews in our, in our family.",
        attribution: 'Winifred Obah · Elders Trip Interview',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Framing',
        heading: 'Hansen\'s disease, not the L word',
        body: "Winifred's parents lived through Fantome Island, the Hansen's-disease quarantine settlement off Palm. Her eldest sister was born and died there. Winifred has named how the family wants this part of their history spoken. Use Hansen's disease. Never use the other word. This is her instruction, not a softening.",
        pullquote: "They had Hansen's disease. I remember to say the other word, because this is disease to me. Because when other people come along and they ask, oh, that L word, you know? And I said, no, it's Hansen's disease.",
        attribution: 'Winifred Obah · Elders Trip Interview',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Aunt\'s name',
        heading: 'Joyce Palmer Health Service',
        body: "Joyce Palmer was Alf Palmer's daughter. She is Marjoyie's aunt. Palm Island's hospital carries her name. Marjoyie cleaned that hospital for thirteen years before retiring. The granddaughter of Alf, the niece of Joyce, the cleaner of the building that holds them both. Her grandmother visioned, her aunt named, her own work in the rooms in between.",
        pullquote: "I was a domestic cleaner over on Palm Island for Joy Palmer Health Hospital. Joyce Palmer's grand, one of granddad's daughter. I worked at the hospital for 13 years, and from there on I got sick and then I had to retire.",
        attribution: 'Marjoyie Burns · Elders Trip Interview',
        bg: BG.brassBand1931,
      },
    ],
  },

  'ethel-iris-family': {
    slug: 'ethel-iris-family',
    name: ['Robertson', 'Whitey'],
    subtitle: 'Two sisters from a family of seventeen. From Halifax to Palm Island. The documented 1919 wave their father walked through.',
    countryName: 'Halifax · Hinchinbrook',
    countryDescription: 'Cane fields and channel waters. South Sea Islander labour worked these fields. The Durabal connections through Hinchinbrook reach deep into the Country.',
    countryFooter: 'From this Country to Palm Island, in the documented 1919 removal',
    palette: { ink: '#1B2E2E', cream: '#F5EBD8', ochre: '#B07A35', amber: '#D9A766', sand: '#EDDFC4', sacred: '#0E0F0D', quoteSection: '#214141' },
    heroBg: BG.hinchinbrookChannel1935,
    countryBg: BG.victoriaMillIngham1935,
    bridgeBg: BG.hinchinbrookWetlands2022,
    openingQuote: {
      text: 'We are full of knowledge and we know our people really well, so we gotta guide the directors about how you should go about things.',
      quoterMatch: 'Ethel', quoterDisplayName: 'Aunty Ethel Taylor Robertson',
      quoterCultural: 'South Sea Islander · Durabal · Aboriginal',
    },
    elderOrder: ['Ethel', 'Iris'],
    elderQuotes: {
      'Ethel': "A lot of the young generation still don't know the stories. When I was managing the pub, the kids used to ask me the stories.",
      'Iris': "I come from a big family of seventeen. Even my father, he's born Halifax.",
    },
    ancestorOrder: ['Tom Curly', 'Peter'],
    ancestorBgs: {
      'Tom Curly': BG.palmIsland1928,
      'Peter': BG.dancers1931,
    },
    ancestorQuotes: {
      'Tom Curly': {
        text: "They changed his name to Tom Curly 'cause he had tight, curly hair.",
        attribution: "Aunty Ethel, recalling her father's renaming on Palm Island",
        quoterMatch: 'Ethel',
      },
    },
    bridge: {
      title: 'Sisters of the same family of seventeen',
      body: "Aunty Ethel and Aunty Iris share the same Halifax-born father, Tom Curly (Mga), and the same stolen-generation mother. The Robertson and Whitey lineages meet in this single sibling pair.",
      avatarMatches: ['Ethel', 'Iris'],
    },
    chapters: [
      {
        eyebrow: 'Archive lead',
        heading: 'Halifax Camp · 1927',
        body: "By 1927 Palm Island settlement had organised its residents into camps named for their place of origin: Halifax Camp, Babinda Camp, Cooktown, Clump Point, Sundown (for Cloncurry people). Halifax Camp was the home of the Halifax-born families. Tom Curly (Mga), Aunty Ethel and Aunty Iris's father, was born in Halifax and brought to Palm Island in the 1919 wave. The Halifax Camp existed as a named place when he arrived. Pending Tindale 1938 + AIATSIS confirmation. For elder review.",
        pullquote: "Tommy was regarded as a sort of doctor... he had earned the enmity of a tribe known as the Halifax Camp.",
        attribution: 'Court report on Palm Island settlement camps · December 1927 · Trove article 149876441',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Spelling lead',
        heading: 'Whitey or Whiteley',
        body: "On 14 February 1930 a Brisbane newspaper named 'Mr and Mrs Davidson' as the Baptist Church teachers of Aboriginal people at Palm Island. Mrs Davidson was Miss Whiteley, daughter of the late Town Clerk of Mount Morgan. Mrs Whiteley sen. was visiting her daughter at Palm Island during the Curry rampage. Whether the Whiteley name passed into the Aboriginal community of the settlement, or whether Aunty Iris's Whitey is a separate Aboriginal surname, is for the elders to confirm.",
        pullquote: "Mr Davidson... left there to teach the aborigines at Palm Island. Mrs Whiteley sen. was visiting the Davidsons at the time of the tragedy.",
        attribution: 'The Week (Brisbane) · 14 February 1930 · Trove article 182581966',
        bg: BG.palmIsland1928,
      },
    ],
  },

  'allan-palm-island': {
    slug: 'allan-palm-island',
    name: ['Allan Palm Island'],
    subtitle: "Manbarra Traditional Owner. Painter. Son of Walter ('Skipper') Palm Island, the family boat-maker. Born into a family of four brothers and five sisters. Welcomes people to Bwgcolman in his own language.",
    countryName: 'Manbarra · Wulgurukaba',
    countryDescription: "Magnetic Island, the Palm Islands, and the mainland west of Townsville. Allan's skin name is Nakawaraka. His language is Mulkal. The people call themselves Nakarawaraka Burbanbara, or Kunu people. The Wulgurukaba (Rukurrukaba) country is the umbrella that covers many sub-groups: Banyan (Hinchinbrook), Nywaigi (Waihingum), Bindal, and others. The boundary of Great Palm — Bougamambara — runs along the Mingina Mingina Ranges, taking the form of a Mandaray. The shield in his hand is Bukal. The surrounding islands are Daru Maru. The Manbarra were forcibly moved off the islands in the 1890s, before the 1914 reserve gazetting. The Gabul Snake creation story links Palm Islands to Magnetic Island via the Carpacini Creek (Gabul Snake Creek) between Barbara Bay and Osho Bay, then up to Ross River. Allan's mother is Giribau (likely Jirrbal). Her mother's people lived at Bajabala Station (formerly Kirama, formerly Kunawara) near Blencoe Falls in Warrongo Country — the same Country where Lucy was killed in the 1880s. Allan's uncle Rich, his dad's brother, held the Gobble Dreaming and Sister Rocks stories. Allan's father Walter ('Skipper') gave him charcoal and paper as a young boy and taught him to draw.",
    countryFooter: 'Allan represents the original Traditional Owners',
    palette: { ink: '#0F2A2E', cream: '#EFEAE0', ochre: '#3D8094', amber: '#7BA8B8', sand: '#D9DEDB', sacred: '#0E0F0D', quoteSection: '#173842' },
    heroBg: BG.uncleAllan17,
    countryBg: BG.palmIslandScene146,
    bridgeBg: BG.walterSkipper,
    openingQuote: {
      text: 'Our language is Mulkal. We speak our language, that we call Nakarawaraka Burbanbara.',
      quoterMatch: 'Allan', quoterDisplayName: 'Allan Palm Island',
      quoterCultural: 'Manbarra · Wulgurukaba',
    },
    elderOrder: ['Allan'],
    elderQuotes: {
      'Allan': 'We grew up to listen and taught how to be respected. Family is the one. Most important thing there.',
    },
    ancestorOrder: ['Skipper', 'Uncle Rich', 'elder brother', 'Reg', 'grandfather'],
    ancestorBgs: {
      'Skipper': BG.walterSkipper,
      'Uncle Rich': BG.dancers1931,
      'grandfather': BG.allanGrandfather,
    },
    ancestorQuotes: {
      'Skipper': {
        text: "My dad first taught me when I was a young boy. He gave me a piece of paper and a charcoal and he teach me how to show me. Dad always made boats.",
        attribution: 'Allan, on his father Walter ("Skipper")',
        quoterMatch: 'Allan',
      },
      'Uncle Rich': {
        text: "My uncle Rich, my dad's brother, he had all the stories, all the dream time stories, the gobble dreaming and the sister rocks and all that. I call it dad because it's my uncle and my father.",
        attribution: 'Allan, on the uncle who held the dreaming',
        quoterMatch: 'Allan',
      },
      'elder brother': {
        text: "Reg and Walter, my elder brother. And whenever they go, I follow behind.",
        attribution: 'Allan, on his brother Walter (Jr)',
        quoterMatch: 'Allan',
      },
      'Reg': {
        text: "We grew up to listen and taught how to be respected. We all shared our same interest, but family was suffering back in the day.",
        attribution: 'Allan, on growing up with his brothers',
        quoterMatch: 'Allan',
      },
      'grandfather': {
        text: "We got grandparents and aunties and uncle. All feel the same. It's all there.",
        attribution: 'Allan, on the line that holds him',
        quoterMatch: 'Allan',
      },
    },
    bridge: {
      title: 'The line through Walter',
      body: "Allan's father, Walter Palm Island, was known as 'Skipper'. Allan's transcripts confirm Walter as boat-maker — 'Dad always made boats.' Family memory also holds him as the one who saved people in his boat, an operator between Palm Island and the mainland; the captain framing is family memory, held alongside the maker on transcript. Walter taught Allan to draw with charcoal and paper as a young boy. He named one of his sons Walter Jr after himself, who along with eldest brother Reg walked ahead of Allan. The grandfather is held in the surviving photograph. Specific name on the grandfather is for the elders to confirm.",
      avatarMatches: ['Allan'],
    },
    chapters: [
      {
        eyebrow: 'Welcome to Country',
        heading: 'Bougamambara',
        body: "Allan welcomes visitors to Great Palm in his own language, with the place name his ancestors used.",
        pullquote: "You're welcome to Great Palm. But I say that Bougamambara. Bougamambara means Great Palm Island. On behalf of Borough and People, we welcome you on behalf of us and Great Palm Island where we stand.",
        attribution: 'Allan Palm Island · Welcome to Country recordings',
        bg: BG.magneticIslandArcadia,
      },
      {
        eyebrow: 'The Act',
        heading: 'We were like prisoners',
        body: "Mission Beach reserve held people sent there for stealing a piece of bread or back-chatting a superintendent. Disease swept through. The 1918 cyclone Leonte devastated what was left.",
        pullquote: "We got grandparents and aunties and uncles. All feel the same. This was a reserve, prison reserve, and they were just put there because they stole a little piece of bread or back-chat superintendent or taking something. We were like prisoners. We just like slaves.",
        attribution: 'Allan Palm Island · Elders Trip Interview',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Return to Country',
        heading: 'The Mission Beach pilgrimage',
        body: "In 2024 the PICC elders returned together to Mission Beach — the place Allan's family was sent during the 1918 cyclone era. Allan's father Walter (Skipper) had told him the story before Allan went. The trip was not nostalgia. It was a return to the place where ancestors suffered, to feel it firsthand and carry the message back to the next generation.",
        pullquote: "We are on our way up to Mission Beach to uncover a scenery that would happen back in 1918. To uncover that, to see for myself and actually feel their pain and suffering. It's like passing on a message and follow that message where it will lead you to.",
        attribution: 'Allan Palm Island · Lucinda Interview (Elders Trip)',
        bg: BG.palmIslandScene147,
      },
      {
        eyebrow: 'Painting',
        heading: 'A piece of paper and a charcoal',
        body: "Walter ('Skipper') Palm Island taught his son Allan to draw with the simplest tools. The lesson became a life.",
        pullquote: "My dad first taught me when I was a young boy. He gave me a piece of paper and a charcoal and he teach me how to show me. He draw a face and draw. Then I start learning how he done it. He showed me how to paint, how to draw, and then he taught me how to paint shields too and shells.",
        attribution: 'Allan Palm Island · Painting Interview',
        bg: BG.allanPainting14,
      },
      {
        eyebrow: 'Carrying the message',
        heading: 'Build something for them',
        body: "Allan describes the elders group's purpose. Not nostalgia, not adventure. Open doors for the next generation.",
        pullquote: "Build something for 'em. Next generation, open doors, create jobs. It's like passing on a message and follow that message where it will lead you to. And you know what that really mean to yourself and your family.",
        attribution: 'Allan Palm Island · Elders Trip Interview',
        bg: BG.brassBand1931,
      },
      {
        eyebrow: 'The emblem',
        heading: 'Boundary in the form of a Mandaray',
        body: "Allan helped design the Great Palm Island emblem. The shape comes from the Mandaray, a marine creature whose form is the boundary the families share.",
        pullquote: "We put the designs on it as a two, because our boundary comes into the form of a big Mandaray. We've been teaching them our things too. How we live in, how we go about our history.",
        attribution: 'Allan Palm Island · Painting Interview',
        bg: BG.magneticIslandArcadia,
      },
      {
        eyebrow: 'What art is',
        heading: 'A thing that you grow with',
        body: "Painting is not decoration. It is identity. Squids and crayfish in his canvases are family.",
        pullquote: "Art is just not a thing to play with. It's a thing that you grow with. This life enjoying painting. Become part of your life. Family. It's the one. Most important thing there.",
        attribution: 'Allan Palm Island · Painting Interview',
        bg: BG.allanPainting9,
      },
      {
        eyebrow: 'Skipper',
        heading: 'Dad always made boats',
        body: "Walter Palm Island, Allan's father. Allan's transcripts confirm Walter as boat-maker. Family memory also holds him as the operator who saved people in his boat between Palm Island and the mainland; that captain framing is family memory, alongside the maker on transcript. Walter named one of his sons Walter Jr after himself. The two elder brothers Allan followed were Reg and Walter Jr.",
        pullquote: "Dad always made boats and, sometime he, he, he unfinished work, so go away and then we all start doing the same things over again.",
        attribution: 'Allan Palm Island · Elders Trip Interview',
        bg: BG.walterSkipper,
      },
      {
        eyebrow: 'Mother',
        heading: 'Bajabala Station, near Blencoe Falls',
        body: "Allan's mother is Giribau (likely Jirrbal). Her grandmother is named Baja Balanar. Her people lived at the station that was first called Kunawara, then Kirama, then Bajabala — 'two rivers meet'. The station is near Blencoe Falls, in Warrongo Country. The same Blencoe Falls where Lucy, Alf Palmer's mother, was killed in the 1880s. Allan's maternal line and the Palmer/Burns/Obah cluster trace to the same Country. For elder review.",
        pullquote: "My mother, my mother's dad, grandmother, grandmother, she said that Baja Balanar changed it to Kirama Station, changing to Bajabala Station, which means 'two rivers meet'. And it's almost not far from where the Blinko Falls are. They went up there, Mount Garnet area, that side. That's where the Blinko Falls, that's where Warrung Country.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.blencoeFalls2022,
      },
      {
        eyebrow: 'Dreaming',
        heading: 'The Gabul Snake',
        body: "Allan's uncle Rich, his dad's brother, held the dreaming stories. The Gabul Snake creation story tracks the journey from the Herbert River, down to Palm Islands, across to Magnetic Island, and up to Ross River — the spine of Wulgurukaba Country. The snake at Gabul Snake Creek (called Carpacini Creek today, between Barbara Bay and Osho Bay) is the totem connection.",
        pullquote: "The Gabul, it's a totem. And it's a story connection to country, and the dreaming. He came from Herbert River, came down to Herbert, created that Herbert River, then came through it, all the way landed and came to Palm. And from there, he went over to Magnetic, and Magnetic went straight up and created Ross River.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.magneticIslandArcadia,
      },
      {
        eyebrow: 'Formal training',
        heading: 'TAFE, NTU, RMIT',
        body: "Allan's painting started with charcoal from his dad and progressed through Uncle Bill Congo's mentorship. From there: Cairns College of TAFE in 1982-83, then five years at Kasserina (Charles Darwin) University in the Northern Territory for a Diploma of Fine Arts. RMIT student residency in Melbourne for another five years, teaching students Aboriginal culture through art. He came back to Palm Island around 1993. Specialised in lino printing, screen printing, batik, etching — alongside the traditional painting.",
        pullquote: "I went up to Northern Territory then, to Kasserina University, and did my diploma of fine arts. I would stay there for five years. Then they asked for a student to go down to Melbourne, the RMIT. I went down for a student residency and worked with the students in RMIT. Teach them our culture through there.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.allanPainting2,
      },
      {
        eyebrow: 'A respected brother',
        heading: 'Peter Pryor, who shot Curry',
        body: "Allan calls Peter Pryor 'our brother' — using the kinship term Manbarra elders extend to those who carried the community's resistance. He acknowledges Peter Pryor as the Aboriginal man who shot Curry in 1930 (confirmed in Trove article 4084734, see Pryor/Brear cluster). The story is still respected and celebrated on Palm Island today. The connection back to Cyndel Pryor's cluster is through this respected ancestor. For elder review.",
        pullquote: "You also have the memories of our brother, Peter Fry, who would tell the stories of having shot Curry. And that's a respect for that's the story, his stories, and it's still celebrated today. And respected.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Vision',
        heading: 'Lorde\'s Bay culture camp',
        body: "Allan's vision for the next generation: a camping place at Lorde's Bay (North East Bay) on Palm where young people can return to culture. Walking, hunting, fishing, painting, making shields and spears. Putting the mobile phone down. Education first, but culture before everything.",
        pullquote: "I was looking at Lorde's Bay. It's beautiful. It's quiet. The beach, the water. I want to create this camping so that they can go walkabout, bush walking, seek other places and story connection too. Hunting and fishing. It's all part of culture. We get to learn to hunt, to feed ourselves. Culture first.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.palmCoconuts1935,
      },
      {
        eyebrow: 'Tambo came home',
        heading: 'A Manbarra man returns, 1994',
        body: "In 1883, Tambo (Kukamunburra) — a Manbarra man — was taken to the United States by showman R.A. Cunningham for P.T. Barnum's circus. He died the following year in Ohio. His mummified remains were exhibited in a dime museum and then stored in the basement of a Cleveland funeral parlour. They were rediscovered a century later when the business closed down. The Manbarra community successfully petitioned for his repatriation. He was returned to Country in 1994 and reburied according to traditional funeral rites that had fallen into abeyance for decades. The reburial played an important role in the cultural renewal of Manbarra and Bwgcolman identity.",
        pullquote: "His reburial there according to traditional funeral rites that had fallen into abeyance for decades played an important role in the cultural renewal and reconsolidation of Manbarra identity.",
        attribution: 'Repatriation history · Wikipedia · 1994',
        bg: BG.magneticIslandArcadia,
      },
      {
        eyebrow: 'Native title still unfinished',
        heading: 'The recognition that has not yet come',
        body: "In July 2012, six hectares of Magnetic Island were granted to the Wulgurukaba people under freehold native title, with another 55 hectares pending trusteeship. But the Manbarra have not been given legal status as Traditional Owners of the Palm Islands themselves. The legal framework recognises the Bwgcolman — the descendants of those forcibly moved from the mainland after 1918 — as the 'historical people' of the island. Allan holds the inaugural PICC Traditional Owner Director position for the Manbarra people. The recognition the legal framework has not yet given is what his role exists to argue for.",
        pullquote: "We come back to respect the traditional owners and also the people here too, also respected as the Wulgurukaba people. And Mambara also to be a first priority.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.palmIslandScene146,
      },
      {
        eyebrow: 'Ten siblings',
        heading: 'Four brothers, five sisters',
        body: "Allan grew up in a family of ten. Reg the eldest. Walter Jr (named after their dad Walter 'Skipper') the second elder brother. Stu. Allan. Sisters Annie, Chrissy, Peggy, Judy, and one more whose name is for the elders to confirm.",
        pullquote: "I got Annie, Chrissy, Peggy, Judy, and Stu. And four, five sisters I think. We grew up to listen and taught how to be respected.",
        attribution: 'Allan Palm Island · Elders Trip Interview',
        bg: BG.uncleAllan10,
      },
      {
        eyebrow: 'Uncle Bill Congo',
        heading: 'The painter who passed it on',
        body: "After Allan's dad gave him the charcoal and paper, Uncle Bill Congo was the next teacher. Bill taught Allan to paint in his way. The stories Allan and the others learned under Bill became the basis of a children's storybook for the people.",
        pullquote: "He sent us down to Uncle Bill, Uncle Bill Congo. And we went down there and he taught us how to paint in his way, see? And we learned by his way. And that's how eventually the story has started to develop as a concept of children's storybook for the people.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.allanPainting2,
      },
      {
        eyebrow: 'Bill Blackley',
        heading: 'The schoolteacher who stayed',
        body: "At the Palm Island State School, the place now called Bwgcolman School, Bill Blackley was a teacher. Allan remembers him as someone who taught the kids of the island.",
        pullquote: "We had Bill Blackley, who was also a teacher at Palm Island State School. We called it State School before, but today they call it Bwgcolman School.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.brassBand1931,
      },
    ],
    gallery: [
      BG.allanPainting2,
      BG.uncleAllan10,
      BG.uncleAllan16,
      BG.palmIslandScene147,
      BG.palmBeach1935,
      BG.palmCoconuts1935,
      BG.palmHappyMoments1935,
    ],
  },

  'anderson': {
    slug: 'anderson',
    name: ['Anderson'],
    subtitle: "Brought to Palm Island in 1945. The oldest in the elders group. He lived through the 1957 Magnificent Seven strike at age seventeen.",
    countryName: 'Ingham · Innisfail',
    countryDescription: 'Sugar cane country. Frank\'s family came from Ingham. Tommy Anderson and his family (possible Frank ancestors) were forcibly removed from Innisfail to Palm Island in 1926.',
    countryFooter: 'From the cane fields to the dormitory',
    palette: { ink: '#2C2014', cream: '#F1E8D5', ochre: '#A86A3A', amber: '#D4A574', sand: '#EBDFC8', sacred: '#0E0F0D', quoteSection: '#3A2C1C' },
    heroBg: BG.victoriaMillIngham1935,
    countryBg: BG.victoriaMillIngham1915,
    bridgeBg: BG.brassBand1931,
    openingQuote: {
      text: "If we've got problems here, we should all know about it and try and work it out together. We're trying to make it a community thing, instead of a group.",
      quoterMatch: 'Frank', quoterDisplayName: 'Uncle Frank Daniel Anderson',
      quoterCultural: 'Aboriginal',
    },
    elderOrder: ['Frank'],
    elderQuotes: {
      'Frank': "You were made to do what you didn't want to do in them days. But now you can choose. We've got our own choices now. That's the difference between then and now.",
    },
    ancestorOrder: [],
    bridge: {
      title: 'A witness to the strike',
      body: 'Uncle Frank was seventeen in June 1957 when the Magnificent Seven (Albie Geia, Willie Thaiday, Eric Lymburner, Sonny Sibley, Bill Congoo, George Watson, Gordon Tapau) were chained at gunpoint and exiled to Woorabinda, Cherbourg, and Bamaga. Aunty Dulcie Isaro (William Thaiday\'s daughter) wrote The Day Palm Island Fought Back about that morning.',
      avatarMatches: ['Frank'],
    },
    chapters: [
      {
        eyebrow: 'Choice',
        heading: 'The difference between then and now',
        body: "Frank lived under the Aboriginals Protection Act. Brought to Palm Island in 1945 at the age of about five. The dormitory generation. He names what changed and what cost.",
        pullquote: "You were made to do what you didn't want to do in them days. But now you can choose. We've got our own choices now. That's the difference between then and now.",
        attribution: 'Uncle Frank Daniel Anderson · Elders Trip Interview',
        bg: BG.victoriaMillIngham1935,
      },
      {
        eyebrow: 'Archive lead',
        heading: 'Innisfail to Palm Island, traffic both ways',
        body: "On 22 March 1943 a Cairns newspaper reported a 'native policeman' arriving from Palm Island at Innisfail and leaving the next day to escort another Aboriginal man back to the settlement. The Innisfail-to-Palm Island corridor was active in the era when Frank was a boy. The Tommy Anderson family removal of 1926 (Innisfail → Palm) is documented in QSA correspondence registers — possibly Frank's paternal line. Pending Tindale 1938 + AIATSIS confirmation. For elder review.",
        pullquote: "A native policeman arrived on Saturday at Innisfail from Palm Island, and left again on Sunday escorting another aboriginal.",
        attribution: 'Cairns Post · 22 March 1943 · Trove article 212232552',
        bg: BG.victoriaMillIngham1935,
      },
      {
        eyebrow: 'Community',
        heading: 'Make it a community thing',
        body: "Frank's framing for what PICC is doing now. Not a group of advocates. A community.",
        pullquote: "If we've got problems here, we should all know about it and try and work it out together. We're trying to make it a community thing, instead of a group.",
        attribution: 'Uncle Frank Daniel Anderson · Elders Trip Interview',
        bg: BG.brassBand1931,
      },
      {
        eyebrow: '1945',
        heading: 'They burnt the place we were living in',
        body: "Frank was six. Born 1939 in Ingham, raised in the cane-field barracks around Victoria Mill. By 1945 the family was big, his father drank, and the law came for the children. They were taken to Palm Island. The settler authorities then burned the family's home so they could not come back to it.",
        pullquote: "They burnt the place we were living in. Why do you think they burned it? Probably don't come back there no more.",
        attribution: 'Uncle Frank Daniel Anderson · Elders Trip Interview #1',
        bg: BG.victoriaMillIngham1935,
      },
      {
        eyebrow: 'Sent to the dormitories',
        heading: 'Mother got sick, family broken up',
        body: "On Palm the family stayed together in the village briefly. Then Frank's mother got sick and was sent away to hospital. The children were split — sisters to the girls' dormitory, brothers to the boys' home. The dormitory generation begins here, in a hospital admission and a separation that was never repaired.",
        pullquote: "We stayed in the village for a while until my mother got sick. And, uh, so they sent her away to the hospital and they put us in different, uh, what shall we say? We call 'em dormitories boys' homes, and they put us in the boys' homes. And the girl's sisters were in the dorm, girl dormitories.",
        attribution: 'Uncle Frank Daniel Anderson · Interview Transcript',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Discipline',
        heading: 'The 7am bell or jail',
        body: "Settlement work on Palm meant being at the muster point at seven o'clock every morning. Missing the bell without an accepted reason meant seven days down the road in the lock-up. The Aboriginals Protection Act made wage labour compulsory and absence criminal. Frank lived inside that bell for years.",
        pullquote: "During the week. Be there seven o'clock. If you don't turn up there, you could go. That put you in jail, you gotta be there. You know? So that's the rules. So if you missed out, you had no reason. You go in seven days down, down the road, they put you down there.",
        attribution: 'Uncle Frank Daniel Anderson · Interview Transcript',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'The boss',
        heading: 'Working under Senator Bonner',
        body: "Before he was Australia's first Aboriginal senator, Neville Bonner was an assistant overseer on Palm Island. Frank handed him the tools. The senator and the toolboy, in the same workshop, before either of them was anything else. Frank says it plainly.",
        pullquote: "I work in the, uh, with the, uh, this Senator, Senator Bonner. He was, he was just, uh, he was my boss then and uh, and I used to hand out tools to all the working men there.",
        attribution: 'Uncle Frank Daniel Anderson · Interview Transcript',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Out west',
        heading: 'Sheep station, three years',
        body: "When Frank was about nineteen the system sent him out to a sheep station on the mainland. The mob asked if he could ride a horse. He could not. They taught him on the job and kept him three years.",
        pullquote: "They sent me out to, uh, sheep station. I. Can you ride a horse? No, go anyway. They'll teach you. And uh, I went out, I stayed there for three years.",
        attribution: 'Uncle Frank Daniel Anderson · Interview Transcript',
        bg: BG.victoriaMillIngham1935,
      },
      {
        eyebrow: '1960',
        heading: 'Twenty-first birthday on the Strand',
        body: "Frank was born 1939. Twenty-one years later he was on the Strand in Townsville, his mob shouting him drinks at a pub that is still standing. The pub is the dateable witness — Frank can take you there now.",
        pullquote: "I had my 21st birthday in up one of the pubs in town town, they shouting me 21st at uh uh, down strandy. That pub's still there.",
        attribution: 'Uncle Frank Daniel Anderson · Interview Transcript',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Brand new life',
        heading: 'Sober, eighty-five, the oldest in the room',
        body: "Frank gave up drink in 2012 and smoking in 2017. He is the oldest man in the elders group. He uses the words 'brand new life' for what came after. The line he draws between then and now is the same line he draws between drinking and seeing. He sees now.",
        pullquote: "This all seems like a brand new life. Well, the life I was living out, he was drinking, you know? Yes. It stands sober all the time. You see everything, know where you're going. It's good.",
        attribution: 'Uncle Frank Daniel Anderson · Elders Trip Interview',
        bg: BG.brassBand1931,
      },
    ],
  },

  'mortoa-watson': {
    slug: 'mortoa-watson',
    name: ['Watson'],
    subtitle: "Mamu lineage from the Tablelands. Doreen Morton was sent to Palm Island as a ten-year-old. She was deaf, and she taught the family sign.",
    countryName: 'Mamu · Atherton Tablelands',
    countryDescription: 'The Mamu people are Traditional Owners of the Millaa Millaa area. During the 1920s-30s Aboriginal people from the Tablelands were "shipped in chains" to Palm Island. Doreen Morton was among that wave.',
    countryFooter: 'Two surnames, one mother. Mortoa is hers. Watson is his',
    palette: { ink: '#1B2E1F', cream: '#EFE8DC', ochre: '#5A8A3F', amber: '#A4C170', sand: '#D9DEC5', sacred: '#0E0F0D', quoteSection: '#243F29' },
    heroBg: BG.athertonTableland1954,
    countryBg: BG.millaaMillaaFalls,
    bridgeBg: BG.palmIsland1928,
    openingQuote: {
      text: "If you don't have good relationship, you're not gonna make good decisions. If you have that good trust and relationship with one another, you can be silly together and make strong decisions.",
      quoterMatch: 'Elsa', quoterDisplayName: 'Elsa Watson',
      quoterCultural: 'Mamu · Aboriginal',
    },
    elderOrder: ['Elsa'],
    elderQuotes: {
      'Elsa': 'I would like us to have our own little section area, like a history-based thing for Palm, where we can come and share stories.',
    },
    ancestorOrder: ['Doreen Morton'],
    ancestorBgs: { 'Doreen Morton': BG.dancers1931 },
    bridge: {
      title: 'Watson is what she calls herself',
      body: 'Elsa names herself Watson. That is her father\'s side. Mortoa is her mother Doreen Morton, the Mamu woman from Millaa Millaa. The DB initially recorded Mortoa; Elsa\'s own dictation in transcript c176abc7 said Watson. There is also a George Watson among the 1957 Magnificent Seven strike leaders. Possible family connection worth asking.',
      avatarMatches: ['Elsa'],
    },
    chapters: [
      {
        eyebrow: 'Mother',
        heading: 'Doreen Morton, sent at ten',
        body: "Doreen Morton was a Mamu girl from Millaa Millaa, sent to Palm Island as a ten-year-old child during the 1920s-30s removals. She was deaf, and she taught the family sign so they could speak with her.",
        pullquote: "I would like us to have our own little section area, like a history-based thing for Palm, where we can come and share stories.",
        attribution: 'Elsa Watson · Elders Trip Interview',
        bg: BG.millaaMillaaFalls,
      },
      {
        eyebrow: 'The Jirrbal thread',
        heading: 'Mamu, Warrongo, the same family of languages',
        body: "Mamu is one of eight tribes in the Jirrbal (Dyirbal) language group. Warrongo is another. So is Allan Palm Island's mother's people. Three PICC elders — Elsa, Marjoyie, and Allan — share maternal lineage through this Tablelands-and-stations Country. The Tablelands tribes were broken up and scattered, but the language family holds them together.",
        pullquote: "If you don't have good relationship, you're not gonna make good decisions. If you have that good trust and relationship with one another, you can be silly together and make strong decisions.",
        attribution: 'Elsa Watson · Elders Trip Interview',
        bg: BG.athertonTableland1954,
      },
      {
        eyebrow: 'Archive lead',
        heading: 'A Mamu woman buried at Millaa Millaa, 1937',
        body: "On 14 August 1937 a Millaa Millaa newspaper protested the burial of an Aboriginal woman in shocking circumstances. Her husband had to ask townspeople for materials to make a coffin. Her body was carried by lorry from the camp to a creek-side grave dug by other Aboriginal people. The Mamu Country generation Doreen Morton was born into. Pending Tindale 1938 + AIATSIS confirmation. For elder review.",
        pullquote: "There exists an Act for the Protection of Aboriginals. How does it apply here, and who is responsible for such a state of affairs.",
        attribution: 'Cairns Post · 4 September 1937 · Trove article 289310365',
        bg: BG.millaaMillaaFalls,
      },
    ],
  },

  'pryor-brear': {
    slug: 'pryor-brear',
    name: ['Pryor', 'Brear'],
    subtitle: "Cyndel Louise Pryor's line. Her father was Peter Pryor Junior. Her mother's father was Peter Brear, the rare-surname half of the cluster name.",
    countryName: 'Birri-gubba (Bowen) · Palm Island',
    countryDescription: "Birri-gubba Country runs from Bowen up the coast. The Pryor surname has multiple Palm Island lineages. Cyndel's is distinct from the famous Boori Monty Pryor / Eugene Stell branch.",
    countryFooter: 'The Brear surname has not yet been found in any public archive',
    palette: { ink: '#2C2424', cream: '#F1E8DD', ochre: '#946150', amber: '#C18C77', sand: '#E8DAD0', sacred: '#0E0F0D', quoteSection: '#3A2E2E' },
    heroBg: BG.bowenRiverHotel,
    countryBg: BG.bowenRiverHotel,
    bridgeBg: BG.dancers1931,
    openingQuote: {
      text: 'The young people thinking different about their future.',
      quoterMatch: 'Cyndel', quoterDisplayName: 'Cyndel Louise Pryor',
      quoterCultural: 'Aboriginal',
    },
    elderOrder: ['Cyndel'],
    elderQuotes: {
      'Cyndel': "Knowing mum would really love me searching for her history, because she didn't. I have felt the presence of mum, the spirit of mum. I know she'd be very happy that I'm looking into her history. I think the journey will never end. It's always gonna be there for generations to come.",
    },
    ancestorOrder: ['Peter Brear', 'Peter Pryor'],
    ancestorBgs: { 'Peter Brear': BG.dancers1931, 'Peter Pryor': BG.palmIsland1928 },
    ancestorQuotes: {
      'Peter Brear': {
        text: "Mum's never known her history. She said that's why she had ten of us, she didn't want us to be lonely like she did.",
        attribution: "Cyndel, on her mother's father Peter Brear",
        quoterMatch: 'Cyndel',
      },
    },
    bridge: {
      title: 'A grandfather we cannot find in the archives',
      body: "Peter Brear was Cyndel's maternal grandfather, confirmed by family. Brear is a rare enough surname that no public archive has a hit. The Tindale Genealogical Collection at the State Library of Queensland and AIATSIS family history are the next paths.",
      avatarMatches: ['Cyndel'],
    },
    chapters: [
      {
        eyebrow: 'Searching',
        heading: 'For her mother',
        body: "Cyndel's mother is Stolen Generation. She passed at 52, never knowing her own history. Cyndel carries the search now.",
        pullquote: "Knowing mum would really love me searching for her history, because she didn't. I have felt the presence of mum, the spirit of mum. I know she'd be very happy that I'm looking into her history. I think the journey will never end. It's always gonna be there for generations to come.",
        attribution: 'Cyndel Louise Pryor · Elders Trip Interview',
        bg: BG.bowenRiverHotel,
      },
      {
        eyebrow: 'Archive lead',
        heading: 'Peter Pryor, 1930',
        body: "On 2 May 1930 the Townsville Police Court committed Peter Pryor — described in court records as a 'half-caste' Aboriginal man on Palm Island — for trial on a charge of murdering Superintendent Robert Curry. Hoffman and Pattison were charged with procuring him. This is a probable ancestor of Cyndel's father Peter Pryor Junior. Pending Tindale 1938 + AIATSIS confirmation. For elder review.",
        pullquote: "Peter Pryor, a half-caste, was committed for trial on a charge of having murdered Robert Curry, superintendent of the Palm Island aborigine settlement.",
        attribution: 'The Brisbane Courier · 2 May 1930 · Trove article 4084734',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'Allan honours him',
        heading: 'Our brother, Peter',
        body: "On the Allan Palm Island cluster, Allan calls Peter Pryor 'our brother' and tells the story of Peter shooting Curry as one that is still respected and celebrated on Palm Island today. The two clusters are connected through this respected ancestor. For elder review with both Cyndel and Allan.",
        pullquote: "You also have the memories of our brother, Peter Fry, who would tell the stories of having shot Curry. And that's a respect for that's the story, his stories, and it's still celebrated today. And respected.",
        attribution: 'Allan Palm Island · Uncle Alan Interview',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'The ruling',
        heading: 'Justifiable community defence',
        body: "On 14 August 1930, Justice Douglas of the North Queensland Supreme Court at Townsville told the Crown the case against Peter Pryor should never have been filed. He ruled the shooting of Curry was justifiable community self-defence. The Crown filed a nolle prosequi. Peter Pryor walked free. A rare colonial-era ruling that Aboriginal self-defence was legitimate, even when the man defended-against was a white superintendent. The community has held this judgement for 96 years.",
        pullquote: "If a man attacks a community as Curry did there, the community would be justified in defending itself, even to the extent of killing him. I don't think any reasonable man could think otherwise.",
        attribution: 'Justice Douglas, Northern Supreme Court · 14 August 1930 · Townsville Daily Bulletin · Trove article 80596980',
        bg: BG.palmIsland1928,
      },
      {
        eyebrow: 'For the children',
        heading: 'I need to hand it down',
        body: "Cyndel's mother had ten children so they would not be lonely. Cyndel is now passing what she's recovered to her own children, grandchildren, great-grandchildren.",
        pullquote: "I need to hand what I got down to my children, grandchildren, great-grandchildren. I think it's my job to do that closure for mom.",
        attribution: 'Cyndel Louise Pryor · Elders Trip Interview',
        bg: BG.dancers1931,
      },
    ],
  },

  'richardson': {
    slug: 'richardson',
    name: ['Richardson'],
    subtitle: "Gurtrude Grace Richardson. Cluster identity confirmed without conflict. The family's deeper lineage waits to be drawn.",
    countryName: 'Palm Island · Bwgcolman',
    countryDescription: 'The Richardson line is currently held by Gurtrude alone. Her transcripts mention parents named Dorothy and "Geo". The recording was rough. Tuesday\'s elder review is the right place to confirm.',
    countryFooter: 'A line waiting to be filled in',
    palette: { ink: '#241F2C', cream: '#EEE8DC', ochre: '#7A5894', amber: '#A88BC1', sand: '#D9D2E0', sacred: '#0E0F0D', quoteSection: '#2E263A' },
    heroBg: BG.palmIsland1928,
    countryBg: BG.brassBand1931,
    bridgeBg: BG.palmIsland1928,
    openingQuote: {
      text: 'The kids on Palm Island today carry what we carried.',
      quoterMatch: 'Gurtrude', quoterDisplayName: 'Gurtrude Grace Richardson',
      quoterCultural: 'Aboriginal',
    },
    elderOrder: ['Gurtrude'],
    elderQuotes: {
      'Gurtrude': "I love hanging with people. The knowledge, the sarcasm that comes with it. The love, the joy. It's just amazing.",
    },
    ancestorOrder: [],
    bridge: {
      title: 'Richardson, a line still being drawn',
      body: 'The Richardson cluster currently holds Gurtrude alone. Her transcripts mention "my mother Iona" and a father whose name sounds like "Geo" or "George". The audio quality made transcription unreliable. Tuesday\'s elder review will fill in what the AI could not.',
      avatarMatches: ['Gurtrude'],
    },
    chapters: [
      {
        eyebrow: 'Joy',
        heading: 'The sarcasm that comes with it',
        body: "Gurtrude's voice on what she loves. Not solemn. Specific.",
        pullquote: "I love hanging with people. The knowledge, the sarcasm that comes with it. The love, the joy. It's just amazing.",
        attribution: 'Gurtrude Grace Richardson · Elders Trip Interview',
        bg: BG.brassBand1931,
      },
      {
        eyebrow: 'Research log',
        heading: 'What we have, what we need',
        body: "The Richardson cluster currently holds Gurtrude alone. Her transcripts mention parents named 'Iona' (mother) and 'Geo' or 'George' (father). The audio quality made transcription unreliable. Trove returns no specific Richardson + Palm Island matches in early-20th-century newspapers, which is normal for Aboriginal people on Palm in that era. The next paths are Tindale 1938 fieldwork notes (SA Museum), AIATSIS Family History Unit, and Tuesday's elder review with Gurtrude herself.",
        pullquote: "The kids on Palm Island today carry what we carried.",
        attribution: 'Gurtrude Grace Richardson · Elders Trip Interview',
        bg: BG.palmIsland1928,
      },
    ],
  },
}

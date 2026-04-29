/**
 * Palm Island History Ribbon — data for the public /history scroll.
 *
 * Sourced from the empathy-ledger-v2 wiki:
 *   wiki/events/{1918-hull-river-cyclone-leonte, 1930-curry-rampage,
 *                1957-magnificent-seven-strike, 1994-tambo-repatriation}.md
 * Photo bg sources lifted from cluster-configs.ts. v1 recycles those; the
 * sourcing pass for additional eras is v2.
 *
 * Open elder-review gates are tracked on the proposal at
 *   thoughts/shared/proposals/palm-history-ribbon.md
 *
 * Three layers: public history (this), cluster rooms, family folders.
 */

export type RibbonImage = {
  url: string
  title: string
  year: string
  source: string
  license: string
}

export type EventSlot = {
  id: string
  year: number
  yearLabel: string             // displayed on the ribbon ("1918", "Feb 1994")
  eyebrow: string               // small uppercase label
  heading: string               // serif heading
  body: string                  // framing paragraph
  pullquote?: string            // elder/historical voice
  attribution?: string          // who said it + where from
  bg: RibbonImage               // hero photo for this panel
  connectedClusters: string[]   // cluster slugs this event threads through
  connectedElders?: string[]    // living-elder slugs whose family memory holds it
  wikiSource: string            // path to the wiki event page
}

export type DecadeBackdrop = {
  id: string
  decadeStart: number           // 1880, 1900, 1920, etc.
  label: string                 // "the 1880s"
  caption: string               // single-sentence frame
  bg: RibbonImage
}

export type LivingElderPin = {
  storytellerSlug: string       // for /elders/<slug>
  displayName: string           // "Frank Anderson"
  cultural: string              // "Bwgcolman · Mamu"
  clusterSlug: string           // for "see in cluster room" CTA
  birthYear?: number            // exact if transcript-confirmed
  birthDecade: number           // always given (1930s = 1930)
  birthDecadeLabel: string      // "born around 1939", "born late 1940s"
  oneLine: string               // appears on portal card
  bio: string                   // 1-2 sentences for the profile page
  country?: string              // "Warrongo · Mt Garnet to Upper Herbert" — optional Country detail
  avatarUrl?: string            // optional, falls back to initial
}

export type TodayPortalCard = {
  storytellerSlug: string
  displayName: string
  clusterSlug: string
  clusterLabel: string          // "Anderson", "Palmer · Burns · Obah"
  oneLine: string
  avatarUrl?: string
}

export type RibbonPalette = {
  ink: string
  cream: string
  ochre: string
  amber: string
  sand: string
  ribbonBg: string
  ribbonAccent: string
}

// ─────────────────────  Photo sources (recycled from cluster-configs)  ──────

const IMG = {
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
  dancers1931: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Queensland_State_Archives_5801_Dancers_Palm_Island_June_1931.png',
    title: 'Dancers, Palm Island', year: 'June 1931',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  stGeorgesChurch1931: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Australian_Aboriginal_men_erecting_the_wooden_frame_of_St_George%27s_Anglican_church%2C_Palm_Island%2C_1931.jpg/1920px-Australian_Aboriginal_men_erecting_the_wooden_frame_of_St_George%27s_Anglican_church%2C_Palm_Island%2C_1931.jpg",
    title: "Aboriginal men erecting St George's Anglican Church", year: '1931',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
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
  hinchinbrookChannel1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Queensland_State_Archives_1381_Hinchinbrook_Channel_NQ_c_1935.png',
    title: 'Hinchinbrook Channel, North Queensland', year: 'ca. 1935',
    source: 'Queensland State Archives · Wikimedia Commons', license: 'Public domain',
  },
  victoriaMillIngham1935: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/StateLibQld_1_85876_Sugar_cane_harvesting_at_Victoria_Mill_in_Ingham%2C_ca._1935.jpg',
    title: 'Sugar cane harvesting at Victoria Mill, Ingham', year: 'ca. 1935',
    source: 'State Library of Queensland · Wikimedia Commons', license: 'Public domain',
  },
  athertonTableland1954: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Rainforest_Ecologist_John_Geoffrey_Tracey_on_the_Atherton_Tableland_by_Leonard_Webb._November_1954.jpg',
    title: 'Atherton Tableland rainforest', year: 'November 1954',
    source: 'Leonard Webb · Wikimedia Commons', license: 'CC BY-SA 4.0',
  },
  magneticIslandArcadia: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Arcadia_Lookout%2C_Magnetic_Island%2C_Queensland%2C_Australia.jpg/1920px-Arcadia_Lookout%2C_Magnetic_Island%2C_Queensland%2C_Australia.jpg',
    title: 'Arcadia Lookout, Magnetic Island, Manbarra Country', year: '',
    source: 'Wikimedia Commons', license: 'CC BY-SA 4.0',
  },
  uncleAllan10: {
    url: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/084f851c-72e0-41fb-b5ba-f3088f44862d/allan/uncle-allan-10.jpg',
    title: 'Uncle Allan Palm Island', year: '',
    source: 'PICC photography', license: 'Family consent',
  },
  bowenRiverHotel: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Bowen_River_Hotel%2C_2007.jpg',
    title: 'Bowen, Birri-gubba Country', year: '2007',
    source: 'Wikimedia Commons', license: 'CC BY-SA 3.0',
  },
} satisfies Record<string, RibbonImage>

// ─────────────────────  Palette (PICC-neutral earth-tone)  ──────────────────

export const RIBBON_PALETTE: RibbonPalette = {
  ink: '#1A1612',
  cream: '#F5EEDF',
  ochre: '#B15427',
  amber: '#D4A574',
  sand: '#E8DCC4',
  ribbonBg: '#1A1612',
  ribbonAccent: '#B15427',
}

// ─────────────────────  Year markers (pinned ribbon)  ───────────────────────

export type YearMarker = {
  year: number
  label: string
  major: boolean              // big tick or small tick
}

export const YEAR_MARKERS: YearMarker[] = [
  { year: 1880, label: '1880', major: true },
  { year: 1900, label: '1900', major: false },
  { year: 1918, label: '1918', major: true },
  { year: 1930, label: '1930', major: true },
  { year: 1939, label: '1939', major: false },
  { year: 1957, label: '1957', major: true },
  { year: 1971, label: '1971', major: false },
  { year: 1994, label: '1994', major: true },
  { year: 2018, label: '2018', major: false },
  { year: 2026, label: 'today', major: true },
]

// ─────────────────────  Decade backdrops  ───────────────────────────────────

export const DECADE_BACKDROPS: DecadeBackdrop[] = [
  {
    id: 'pre-removal',
    decadeStart: 1880,
    label: 'Before the removals',
    caption: 'Warrongo, Mamu, Manbarra, Birri, Bwgcolman. Country with names older than the maps.',
    bg: IMG.mtGarnet1901,
  },
  {
    id: 'twenties-thirties',
    decadeStart: 1920,
    label: 'The settlement years',
    caption: 'After 1918, Palm Island became the place where many were sent. Brass bands, dormitories, the Aboriginals Protection Act.',
    bg: IMG.palmIsland1928,
  },
  {
    id: 'midcentury',
    decadeStart: 1940,
    label: 'Mid-century, the dormitory era',
    caption: 'The seven-am bell. Wages held in trust. Frank Anderson grew up under it.',
    bg: IMG.palmBeach1935,
  },
  {
    id: 'protection-breaking',
    decadeStart: 1970,
    label: 'The Protection Act breaks',
    caption: '1971 the Act is repealed. Aunty Ethel takes the pub. Rachel Cummins begins the Warrongo language revival.',
    bg: IMG.palmCoconuts1935,
  },
  {
    id: 'cultural-renewal',
    decadeStart: 1990,
    label: 'Cultural renewal, the long return',
    caption: 'Tambo comes home in 1994. The elders take their families back to Country.',
    bg: IMG.palmHappyMoments1935,
  },
]

// ─────────────────────  Event slots (named full-screen panels)  ─────────────

export const EVENT_SLOTS: EventSlot[] = [
  {
    id: 'lucy-blencoe-falls',
    year: 1880,
    yearLabel: '1880s',
    eyebrow: 'Frontier · Warrongo Country',
    heading: 'Lucy at Blencoe Falls',
    body: 'Tin was discovered in the Wild River area in 1880. The mining brought the violence. At Blencoe Falls a group of Warrongo people were driven off the cliffs to plunge into the gorge. Lucy was among them. Her son Alf Palmer became the last native speaker of Warrongo. He taught the language so it would not die with him.',
    pullquote: "I'm the last one to speak Warrungu. When I die this language will die. I'll teach you everything I know, so put it down properly.",
    attribution: 'Alf Palmer (Jinbilnggay) to linguist Tasaku Tsunoda, Palm Island, 1971',
    bg: IMG.blencoeFalls2022,
    connectedClusters: ['palmer-burns-obah'],
    connectedElders: ['marjoyie-burns', 'winifred-obah'],
    wikiSource: 'wiki/people/lucy.md',
  },
  {
    id: '1918-hull-river-cyclone',
    year: 1918,
    yearLabel: '10 March 1918',
    eyebrow: 'Cyclone Leonte · Hull River',
    heading: 'The cyclone that made Palm Island Bwgcolman',
    body: 'The cyclone destroyed the Hull River Aboriginal Settlement. Survivors — Aboriginal people removed there from across the Far North coast and Tablelands — were transported to Palm Island in the months that followed. The Brisbane Courier reported the relocation complete on 6 June 1918. This is the moment Palm Island formally became Bwgcolman, the place where many were sent.',
    pullquote: 'The worst part of it was when Leonte hit it back in 1918. So people were devastated.',
    attribution: 'Allan Palm Island · Uncle Alan Interview',
    bg: IMG.hinchinbrookChannel1935,
    connectedClusters: ['allan-palm-island', 'mortoa-watson', 'palmer-burns-obah'],
    connectedElders: ['allan-palm-island', 'elsa-watson', 'winifred-obah'],
    wikiSource: 'wiki/events/1918-hull-river-cyclone-leonte.md',
  },
  {
    id: '1930-curry-rampage',
    year: 1930,
    yearLabel: '3 February 1930',
    eyebrow: 'The Curry rampage · Hoffman trial',
    heading: 'The community defended itself',
    body: 'Superintendent Robert Curry burned his own house, killed his children, and went on a rampage across the settlement. Peter Pryor shot him. Justice Douglas, in the Townsville Supreme Court, ruled the shooting was justifiable community self-defence. A rare colonial-era ruling. Peter Pryor walked free.',
    pullquote: 'If a man attacks a community as Curry did there, the community would be justified in defending itself, even to the extent of killing him. I don\'t think any reasonable man could think otherwise.',
    attribution: 'Justice Douglas · North Queensland Supreme Court · 14 August 1930',
    bg: IMG.palmIsland1928,
    connectedClusters: ['pryor-brear', 'palmer-burns-obah', 'allan-palm-island'],
    connectedElders: ['cyndel-pryor', 'winifred-obah', 'allan-palm-island'],
    wikiSource: 'wiki/events/1930-curry-rampage.md',
  },
  {
    id: '1957-magnificent-seven',
    year: 1957,
    yearLabel: '10 June 1957',
    eyebrow: 'The Magnificent Seven',
    heading: 'Five days of strike, then dawn raids',
    body: 'Seven Palm Island men declared a strike against working conditions, unpaid wages, and authoritarian management. The strike lasted five days. It ended in dawn raids — chains, leg irons, families forcibly removed and exiled to Woorabinda, Cherbourg, Bamaga. Frank Anderson was seventeen, on Palm. He saw it.',
    pullquote: "Five or six got kicked off the island. They put 'em off, come and grab them at night. And put 'em on the boat. Family and all.",
    attribution: 'Uncle Frank Daniel Anderson · Interview Transcript',
    bg: IMG.victoriaMillIngham1935,
    connectedClusters: ['anderson', 'allan-palm-island'],
    connectedElders: ['frank-anderson', 'allan-palm-island'],
    wikiSource: 'wiki/events/1957-magnificent-seven-strike.md',
  },
  {
    id: '1971-protection-breaks',
    year: 1971,
    yearLabel: '1971',
    eyebrow: 'After the Protection Act',
    heading: 'The Act breaks, the families take ground',
    body: 'The Aboriginals Protection Act gives way. Aunty Ethel Robertson manages the pub. Rachel Cummins begins the Warrongo language revival from her grandfather Alf Palmer\'s teaching. Linguist Tasaku Tsunoda records Alf\'s words "so put it down properly". The settlement era is not over, but the families begin reclaiming ground that was already theirs.',
    bg: IMG.athertonTableland1954,
    connectedClusters: ['ethel-iris-family', 'palmer-burns-obah'],
    connectedElders: ['ethel-robertson', 'iris-whitey', 'marjoyie-burns', 'winifred-obah'],
    wikiSource: 'wiki/people/alf-palmer.md',
  },
  {
    id: '1994-tambo',
    year: 1994,
    yearLabel: 'February 1994',
    eyebrow: 'Tambo (Kukamunburra) repatriation',
    heading: 'A Manbarra ancestor came home',
    body: 'Tambo, whose Manbarra name was Kukamunburra, was shipped to America in 1883 by R.A. Cunningham as a "specimen" for P.T. Barnum\'s circus. He died in Cleveland 1884, age 21. His body was held in a funeral parlour basement for over a century. In February 1994 his remains were repatriated to Palm Island and buried with traditional rites that had fallen into abeyance for decades. A turning point in Manbarra and Bwgaman cultural renewal.',
    bg: IMG.magneticIslandArcadia,
    connectedClusters: ['allan-palm-island'],
    connectedElders: ['allan-palm-island'],
    wikiSource: 'wiki/events/1994-tambo-repatriation.md',
  },
]

// ─────────────────────  Living-elder pins  ──────────────────────────────────
//
// Birth years marked exact only where transcript-confirmed.
// Where unknown, birthDecade is given and the label uses "born around" framing.
// All nine PICC living elders surfaced in the wiki are pinned. Six were named
// in the proposal; the cluster set has grown to nine since.

// Real portrait URLs sourced from storytellers.public_avatar_url on
// 2026-04-30. Hard-coded rather than fetched at runtime because the
// /api/v2/communities/.../family-links endpoint is org-scoped and returns
// zero rows for any non-PICC API key. Refresh via the seed script if a
// portrait gets re-uploaded.

export const LIVING_ELDER_PINS: LivingElderPin[] = [
  {
    storytellerSlug: 'allan-palm-island',
    displayName: 'Allan Palm Island',
    cultural: 'Manbarra · Birri',
    clusterSlug: 'allan-palm-island',
    birthDecade: 1950,
    birthDecadeLabel: 'born around the 1950s',
    oneLine: 'Manbarra Traditional Owner. Painter. PICC inaugural Traditional Owner Director.',
    bio: 'Manbarra Traditional Owner and PICC inaugural Traditional Owner Director. Painter — uncle-allan and painting series carry law and Country in pigment. His father Walter Skipper was the boat-maker. The Tambo repatriation in 1994 and the elders\' return to Mission Beach in 2024 sit inside his living arc.',
    country: 'Manbarra · Magnetic Island and Greater Palm Island',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/d0a162d2-282e-4653-9d12-aa934c9dfa4e/1775114118938_20251216-1E5A8879.jpg',
  },
  {
    storytellerSlug: 'frank-anderson',
    displayName: 'Uncle Frank Daniel Anderson',
    cultural: 'Bwgcolman',
    clusterSlug: 'anderson',
    birthYear: 1939,
    // Born 1939 but came of age in the 40s/50s — pinned on the dormitory-era
    // panel since that's where his witness sits narratively. Birth year is
    // preserved in the label.
    birthDecade: 1940,
    birthDecadeLabel: 'born 1939',
    oneLine: 'Seventeen on Palm in 1957. Witnessed the dawn raids on the Magnificent Seven.',
    bio: 'Born 1939. Grew up under the seven-am bell, the wages held in trust, the Aboriginals Protection Act. Seventeen on Palm in 1957 when the dawn raids took the Magnificent Seven — leg irons, families forcibly removed. He saw it from his own street. Carries the dormitory era and the strike in living memory.',
    country: 'Bwgcolman',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/d0a162d2-282e-4653-9d12-aa934c9dfa4e/1775115444540_20251216-1E5A8934.jpg',
  },
  {
    storytellerSlug: 'marjoyie-burns',
    displayName: 'Marjoyie Burns',
    cultural: 'Warrongo',
    clusterSlug: 'palmer-burns-obah',
    birthDecade: 1950,
    birthDecadeLabel: 'born around the 1950s',
    oneLine: "Granddaughter of Alf Palmer, the last native speaker of Warrongo.",
    bio: 'Granddaughter of Alf Palmer (Jinbilnggay), the last native speaker of Warrongo. Cousin to Winifred Obah through Alf. Returned to Warrongo Country — Mt Garnet to the Upper Herbert — for the first time as an adult on the elders\' trip. Felt the spirit before the mind caught up.',
    country: 'Warrongo · Mt Garnet to Upper Herbert River',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/d0a162d2-282e-4653-9d12-aa934c9dfa4e/1775115408529_20251216-1E5A8907.jpg',
  },
  {
    storytellerSlug: 'winifred-obah',
    displayName: 'Winifred Obah',
    cultural: 'Warrongo · Durru · Warra · Gungandji · Djiru',
    clusterSlug: 'palmer-burns-obah',
    birthDecade: 1950,
    birthDecadeLabel: 'born around the 1950s',
    oneLine: "Carries the verbal handing-down: \"It's verbally spoken where you tell your story.\"",
    bio: 'Carries the verbal handing-down of the Palmer / Burns / Obah line. Cousin to Marjoyie through Alf Palmer (her grandmother\'s brother). Her grandfather is probably Allison Obah, witness at the 1930 Hoffman trial. Pending Tindale and AIATSIS confirmation.',
    country: 'Warrongo · Durru · Warra · Gungandji · Djiru',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/d0a162d2-282e-4653-9d12-aa934c9dfa4e/1775115466337_20251216-1E5A8891.jpg',
  },
  {
    storytellerSlug: 'aunty-ethel-robertson',
    displayName: 'Aunty Ethel Taylor Robertson',
    cultural: 'South Sea Islander · Bwgcolman',
    clusterSlug: 'ethel-iris-family',
    birthDecade: 1940,
    birthDecadeLabel: 'born around the 1940s',
    oneLine: "Managed the Palm Island pub after the Aboriginals Protection Act lifted.",
    bio: 'Eldest of seventeen children, fourteen who lived. After the Protection Act lifted in 1971 she managed the Palm Island pub — among the first Aboriginal women to hold that role on the island. Sister to Aunty Iris May Whitey. South Sea Islander heritage running back through Halifax Camp.',
    country: 'South Sea Islander · Bwgcolman · Halifax Camp',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/d0a162d2-282e-4653-9d12-aa934c9dfa4e/1775115007139_20251216-1E5A8914.jpg',
  },
  {
    storytellerSlug: 'aunty-iris-whitey',
    displayName: 'Aunty Iris May Whitey',
    cultural: 'South Sea Islander · Bwgcolman',
    clusterSlug: 'ethel-iris-family',
    birthDecade: 1940,
    birthDecadeLabel: 'born around the 1940s',
    oneLine: 'Robertson and Whitey families. The Halifax Camp era is in living memory.',
    bio: 'Sister to Aunty Ethel. Robertson and Whitey families on Palm. The Halifax Camp era — South Sea Islander labour, sugar mills, the Hinchinbrook line — sits in living memory and is held in her witness.',
    country: 'South Sea Islander · Bwgcolman · Halifax / Hinchinbrook',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/profile-images/storytellers/aunty_iris_may_whitey.jpg',
  },
  {
    storytellerSlug: 'elsa-watson',
    displayName: 'Elsa Watson',
    cultural: 'Mamu · Bwgcolman',
    clusterSlug: 'mortoa-watson',
    birthDecade: 1950,
    birthDecadeLabel: 'born around the 1950s',
    oneLine: "Daughter of Doreen Morton, who came to Palm at ten in the 1930s removal wave.",
    bio: 'Daughter of Doreen Morton, who was removed to Palm at ten years old in the 1930s wave from the Atherton Tablelands. Mamu people. Carries the removal generation\'s testimony into the living elder line. Cousin link to Winifred Obah pending elder review.',
    country: 'Mamu · Atherton Tablelands · Millaa Millaa',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/d0a162d2-282e-4653-9d12-aa934c9dfa4e/1775115312323_20251216-1E5A8943.jpg',
  },
  {
    storytellerSlug: 'cyndel-pryor',
    displayName: 'Cyndel Louise Pryor',
    cultural: 'Birri-gubba · Bwgcolman',
    clusterSlug: 'pryor-brear',
    birthDecade: 1960,
    birthDecadeLabel: 'born around the 1960s',
    oneLine: "Carries the Pryor line. The 1930 Hoffman trial sits in family memory.",
    bio: 'Carries the Pryor line on Palm. Birri-gubba and Bwgcolman. The 1930 Hoffman trial — her ancestor Peter Pryor (probable) shot Curry; Justice Douglas ruled the community\'s defence justifiable — sits in family memory. Brear / Pryor name-variant question pending elder review.',
    country: 'Birri-gubba · Bowen / Bwgcolman',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/d0a162d2-282e-4653-9d12-aa934c9dfa4e/1775115278246_20251216-1E5A8955.jpg',
  },
  {
    storytellerSlug: 'gurtrude-richardson',
    displayName: 'Gurtrude Grace Richardson',
    cultural: 'Bwgcolman',
    clusterSlug: 'richardson',
    birthDecade: 1950,
    birthDecadeLabel: 'born around the 1950s',
    oneLine: 'Richardson family. Three transcript-confirmed chapters; more pending elder review.',
    bio: 'Richardson family on Palm. Three transcript-confirmed chapters surfaced to public; further detail (parent names, Country) pending an elder-review re-listen pass before public publish.',
    country: 'Bwgcolman',
    avatarUrl: 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/d0a162d2-282e-4653-9d12-aa934c9dfa4e/1775115335268_20251216-1E5A8927.jpg',
  },
]

// ─────────────────────  Today gallery (portal cards at the end)  ────────────

export const TODAY_GALLERY: TodayPortalCard[] = LIVING_ELDER_PINS.map((p) => ({
  storytellerSlug: p.storytellerSlug,
  displayName: p.displayName,
  clusterSlug: p.clusterSlug,
  clusterLabel: p.clusterSlug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' · '),
  oneLine: p.oneLine,
  avatarUrl: p.avatarUrl,
}))

// ─────────────────────  Attribution-string elder lookup  ────────────────────
//
// Used by ClusterShowcase chapter attributions, history-ribbon event panels,
// and anywhere else an elder voice is named. Returns the matching pin so the
// caller can render an avatar + tree link instead of plain text.

const NAME_TOKENS = LIVING_ELDER_PINS.map((pin) => {
  // First name after stripping Uncle/Aunty (e.g. "Ethel", "Frank", "Marjoyie").
  const stripped = pin.displayName.replace(/^(Uncle|Aunty)\s+/i, '')
  const first = stripped.split(' ')[0] || stripped
  return { pin, token: first.toLowerCase() }
})

export function findElderInAttribution(text: string): LivingElderPin | null {
  if (!text) return null
  const lower = text.toLowerCase()
  // Walk in registry order; first names are unique within the 9-elder set.
  for (const { pin, token } of NAME_TOKENS) {
    // Word-boundary check so "Allan" doesn't match a word containing "all".
    const re = new RegExp(`\\b${token}\\b`, 'i')
    if (re.test(lower)) return pin
  }
  return null
}

// ─────────────────────  Per-elder data collection  ──────────────────────────
//
// Lookup by slug + auto-collect quotes/events attributed to a specific elder.
// Used by ElderProfilePage at /elders/<slug>.

export function findElderBySlug(slug: string): LivingElderPin | undefined {
  return LIVING_ELDER_PINS.find((p) => p.storytellerSlug === slug)
}

export type ElderEventReference = {
  eventId: string
  year: number
  yearLabel: string
  heading: string
  eyebrow: string
}

/**
 * Returns history events that this elder is named in (via connectedElders).
 * Used to render "Events that hold this elder's voice" on the profile page.
 */
export function getEventsForElder(elderSlug: string): ElderEventReference[] {
  return EVENT_SLOTS.filter((e) => e.connectedElders?.includes(elderSlug)).map((e) => ({
    eventId: e.id,
    year: e.year,
    yearLabel: e.yearLabel,
    heading: e.heading,
    eyebrow: e.eyebrow,
  }))
}

// ─────────────────────  Sorted scroll-order spine  ──────────────────────────

export type SpineNode =
  | { kind: 'decade'; data: DecadeBackdrop }
  | { kind: 'event'; data: EventSlot }

/**
 * Produces the ordered list of panels rendered between the hero and the
 * today gallery. Decades anchor the eras; events sit inside each decade.
 */
export function buildSpine(): SpineNode[] {
  const out: SpineNode[] = []
  for (const decade of DECADE_BACKDROPS) {
    out.push({ kind: 'decade', data: decade })
    const events = EVENT_SLOTS
      .filter((e) => e.year >= decade.decadeStart && e.year < decade.decadeStart + 20)
      .sort((a, b) => a.year - b.year)
    for (const ev of events) out.push({ kind: 'event', data: ev })
  }
  return out
}

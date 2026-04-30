/**
 * Palm Island knowledge graph — single typed source for People, Places,
 * Years, and the edges between them.
 *
 * Sourced from the empathy-ledger-v2 wiki (people, country, events,
 * clusters) plus the existing data files (palm-history-timeline.ts
 * EVENT_SLOTS, palm-journeys.ts, LIVING_ELDER_PINS).
 *
 * Living-elder canonical data lives in LIVING_ELDER_PINS and is read
 * forward via the elderSlug field. The graph adds ancestors, historical
 * figures, and contemporary non-elder people from the wiki.
 *
 * Usage:
 *   findPersonBySlug('alf-palmer') → Person
 *   getPeopleByPlace('djirru') → Person[]
 *   getEventsByYear(1930) → EventRef[]
 *   getYearByYear(1918) → AnchorYear with all connections
 */
import { LIVING_ELDER_PINS, EVENT_SLOTS, type LivingElderPin } from './palm-history-timeline'
import { JOURNEYS } from './palm-journeys'

// ─────────────────────  Types  ──────────────────────────────────────────────

export type PersonStatus =
  | 'living-elder'      // PICC's 9 living elders
  | 'living'            // currently-living non-elder named in wiki
  | 'ancestor'          // deceased family-line member
  | 'historical-figure' // public-record colonial / settler / state actor
  | 'contemporary'      // non-elder figure in PICC's recent history

export type CulturalSensitivity = 'public' | 'consent-required' | 'sacred-restricted'

export type Person = {
  slug: string
  displayName: string
  status: PersonStatus
  birthYear?: number
  deathYear?: number
  birthDecadeApprox?: string  // e.g. "1880s"
  country: string[]            // place slugs
  clusterSlug?: string
  oneLine: string
  keyConnections: string[]     // slugs of OTHER people
  connectedEventIds: string[]  // matches EVENT_SLOTS or wiki event slugs
  connectedPlaceSlugs: string[]
  sources: string[]
  culturalSensitivity: CulturalSensitivity
  // For living elders only — points back to LIVING_ELDER_PINS for portrait + bio
  elderPinSlug?: string
}

export type PlaceCategory =
  | 'country'              // Indigenous Country (Warrongo, Mamu)
  | 'language-group'       // Language family (Jirrbal Dyirbalic)
  | 'settlement'           // Mission, Aboriginal Reserve
  | 'station'              // Pastoral station
  | 'specific-place'       // Single named location (Blencoe Falls)
  | 'town'                 // Settler town

export type Place = {
  slug: string
  displayName: string
  category: PlaceCategory
  region?: string
  oneLine: string
  connectedPersonSlugs: string[]
  connectedEventIds: string[]
  relatedPlaceSlugs: string[]
  culturalSensitivity?: CulturalSensitivity
}

export type AnchorYear = {
  year: number
  yearLabel: string
  significance: string         // one-line summary of why this year matters
  connectedPersonSlugs: string[]
  connectedEventIds: string[]
  connectedPlaceSlugs: string[]
}

// ─────────────────────  People  ─────────────────────────────────────────────
//
// Living elders link out to LIVING_ELDER_PINS via elderPinSlug. Their bio +
// portrait + Country come from there. The graph entry adds the genealogical
// connections (keyConnections, connectedEventIds, etc.) that the elders'
// short oneLine can't carry.

export const PEOPLE: Person[] = [
  // ─── Lucy line (Djirru → Palmer/Burns/Obah cluster) ─────
  {
    slug: 'lucy',
    displayName: 'Lucy',
    status: 'ancestor',
    birthDecadeApprox: '1800s',
    country: ['djirru'],
    clusterSlug: 'palmer-burns-obah',
    oneLine: 'Djirru woman; great-great-grandmother of Winifred Obah; mother of Daisy and Alf Palmer. Carried at Blencoe Falls in family memory.',
    keyConnections: ['daisy-palmer', 'alf-palmer', 'winifred-obah'],
    connectedEventIds: ['lucy-blencoe-falls'],
    connectedPlaceSlugs: ['djirru', 'blencoe-falls'],
    sources: ['transcript-winifred-elders-trip', 'tsunoda-warrongo-grammar-2012'],
    culturalSensitivity: 'sacred-restricted',
  },
  {
    slug: 'alf-palmer',
    displayName: 'Alf Palmer (Jinbilnggay)',
    status: 'ancestor',
    birthYear: 1891,
    deathYear: 1981,
    birthDecadeApprox: '1890s',
    country: ['warrongo', 'djirru'],
    clusterSlug: 'palmer-burns-obah',
    oneLine: 'The last native speaker of Warrongo. Marjoyie Burns\' grandfather; brother of Daisy Palmer; uncle of Winifred Obah. Insisted his words be recorded by linguist Tasaku Tsunoda 1971.',
    keyConnections: ['daisy-palmer', 'lucy', 'winifred-obah', 'marjoyie-burns'],
    connectedEventIds: ['1971-protection-breaks'],
    connectedPlaceSlugs: ['warrongo', 'djirru', 'palm-island'],
    sources: ['transcript-winifred-elders-trip', 'tsunoda-warrongo-grammar-2012'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'daisy-palmer',
    displayName: 'Daisy Bell / Daisy Palmer / Daisy Obah',
    status: 'ancestor',
    birthDecadeApprox: '1900s',
    country: ['djirru'],
    clusterSlug: 'palmer-burns-obah',
    oneLine: 'Djirru woman taken at age 5 to Yarrabah. Married Allison Obah. Grandmother of Winifred Obah.',
    keyConnections: ['lucy', 'alf-palmer', 'allison-obah', 'winifred-obah'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    connectedPlaceSlugs: ['djirru', 'yarrabah', 'palm-island'],
    sources: ['transcript-winifred-elders-trip'],
    culturalSensitivity: 'consent-required',
  },
  {
    slug: 'allison-obah',
    displayName: "Allison ('Ellison') Obah",
    status: 'ancestor',
    birthDecadeApprox: '1880s',
    country: ['palm-island'],
    clusterSlug: 'palmer-burns-obah',
    oneLine: 'Trumpet player, mango grower at Mount Bentley, married Daisy Palmer at Yarrabah. Probable witness at the 1930 Hoffman trial. Grandfather of Winifred Obah.',
    keyConnections: ['daisy-palmer', 'winifred-obah', 'allison-andrew'],
    connectedEventIds: ['1930-curry-rampage'],
    connectedPlaceSlugs: ['yarrabah', 'palm-island'],
    sources: ['transcript-winifred-elders-trip', 'trove-55363945'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'allison-andrew',
    displayName: 'Allison Andrew (Ganji)',
    status: 'ancestor',
    birthDecadeApprox: '1860s',
    country: ['vanuatu'],
    clusterSlug: 'palmer-burns-obah',
    oneLine: 'South Sea Islander blackbirded from Vanuatu. "Ganji". Great-grandfather of Winifred Obah. Patriarch of the Andrew name line.',
    keyConnections: ['allison-obah', 'winifred-obah'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['vanuatu', 'palm-island'],
    sources: ['transcript-winifred-elders-trip'],
    culturalSensitivity: 'public',
  },

  // ─── PICC living elders (link out to LIVING_ELDER_PINS) ─────
  {
    slug: 'winifred-obah',
    displayName: 'Winifred Obah',
    status: 'living-elder',
    birthDecadeApprox: '1950s',
    country: ['djirru', 'manbarra-wulgurukaba', 'jirrbal-language-group'],
    clusterSlug: 'palmer-burns-obah',
    oneLine: 'PICC elders advisory secretary. 22 years at Bwgcolman Community School. Organised the 2024 Mission Beach trip.',
    keyConnections: ['allison-obah', 'daisy-palmer', 'alf-palmer', 'lucy', 'marjoyie-burns', 'elsa-watson'],
    connectedEventIds: ['1918-hull-river-cyclone', '1930-curry-rampage'],
    connectedPlaceSlugs: ['djirru', 'manbarra-wulgurukaba', 'palm-island'],
    sources: ['transcript-winifred-elders-trip', 'transcript-winifred-lucinda-pretrip'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'winifred-obah',
  },
  {
    slug: 'marjoyie-burns',
    displayName: 'Marjoyie Burns',
    status: 'living-elder',
    birthDecadeApprox: '1950s',
    country: ['warrongo', 'manbarra-wulgurukaba'],
    clusterSlug: 'palmer-burns-obah',
    oneLine: 'Granddaughter of Alf Palmer, the last native speaker of Warrongo. Cousin to Winifred Obah through Alf.',
    keyConnections: ['alf-palmer', 'winifred-obah', 'toby-watson'],
    connectedEventIds: ['1971-protection-breaks'],
    connectedPlaceSlugs: ['warrongo', 'palm-island', 'manbarra-wulgurukaba'],
    sources: ['transcript-marjoyie-burns-elders-trip'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'marjoyie-burns',
  },
  {
    slug: 'frank-anderson',
    displayName: 'Uncle Frank Daniel Anderson',
    status: 'living-elder',
    birthYear: 1939,
    birthDecadeApprox: '1930s',
    country: ['manbarra-wulgurukaba'],
    clusterSlug: 'anderson',
    oneLine: 'Seventeen on Palm in 1957. Witnessed the dawn raids on the Magnificent Seven.',
    keyConnections: ['albie-geia', 'willie-thaiday'],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['transcript-frank-anderson-elders-trip'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'frank-anderson',
  },
  {
    slug: 'aunty-ethel-robertson',
    displayName: 'Aunty Ethel Taylor Robertson',
    status: 'living-elder',
    birthDecadeApprox: '1940s',
    country: ['manbarra-wulgurukaba'],
    clusterSlug: 'ethel-iris-family',
    oneLine: 'Eldest of seventeen children, fourteen who lived. Managed the Palm Island pub after the Aboriginals Protection Act lifted.',
    keyConnections: ['aunty-iris-whitey'],
    connectedEventIds: ['1971-protection-breaks'],
    connectedPlaceSlugs: ['palm-island', 'halifax-hinchinbrook'],
    sources: ['transcript-aunty-ethel-robertson-elders-trip'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'aunty-ethel-robertson',
  },
  {
    slug: 'aunty-iris-whitey',
    displayName: 'Aunty Iris May Whitey',
    status: 'living-elder',
    birthDecadeApprox: '1940s',
    country: ['manbarra-wulgurukaba'],
    clusterSlug: 'ethel-iris-family',
    oneLine: 'Sister to Aunty Ethel. Robertson and Whitey families on Palm. The Halifax Camp era is in living memory.',
    keyConnections: ['aunty-ethel-robertson'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['palm-island', 'halifax-hinchinbrook'],
    sources: ['transcript-aunty-iris-whitey-elders-trip'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'aunty-iris-whitey',
  },
  {
    slug: 'elsa-watson',
    displayName: 'Elsa Watson',
    status: 'living-elder',
    birthDecadeApprox: '1950s',
    country: ['mamu', 'manbarra-wulgurukaba'],
    clusterSlug: 'mortoa-watson',
    oneLine: 'Daughter of Doreen Morton, Mamu woman taken to Palm at ten years old in the 1930s wave. Cousin link to Winifred Obah pending elder review.',
    keyConnections: ['doreen-morton', 'winifred-obah'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    connectedPlaceSlugs: ['mamu', 'palm-island', 'millaa-millaa'],
    sources: ['transcript-elsa-watson'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'elsa-watson',
  },
  {
    slug: 'cyndel-pryor',
    displayName: 'Cyndel Louise Pryor',
    status: 'living-elder',
    birthDecadeApprox: '1960s',
    country: ['birri-gubba', 'manbarra-wulgurukaba'],
    clusterSlug: 'pryor-brear',
    oneLine: 'Daughter of Peter Pryor Junior; granddaughter of Peter Brear (1930 Curry-shooter). Carries the search for her Stolen Generation mother\'s history.',
    keyConnections: ['peter-brear', 'peter-pryor-junior', 'peter-pryor-1930'],
    connectedEventIds: ['1930-curry-rampage'],
    connectedPlaceSlugs: ['birri-gubba', 'hull-river', 'yarrabah', 'palm-island'],
    sources: ['transcript-cyndel-pryor', 'trove-4084734', 'trove-80596980'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'cyndel-pryor',
  },
  {
    slug: 'gurtrude-richardson',
    displayName: 'Gurtrude Grace Richardson',
    status: 'living-elder',
    birthDecadeApprox: '1950s',
    country: ['manbarra-wulgurukaba'],
    clusterSlug: 'richardson',
    oneLine: 'Richardson family on Palm. Three transcript-confirmed chapters; further detail pending elder review.',
    keyConnections: [],
    connectedEventIds: [],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['transcript-gurtrude-richardson'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'gurtrude-richardson',
  },
  {
    slug: 'allan-palm-island',
    displayName: 'Allan Palm Island',
    status: 'living-elder',
    birthDecadeApprox: '1950s',
    country: ['manbarra-wulgurukaba'],
    clusterSlug: 'allan-palm-island',
    oneLine: 'Manbarra Traditional Owner. Painter. PICC inaugural Traditional Owner Director. Carries boat-tradition memory from his father Walter Skipper.',
    keyConnections: ['walter-skipper-palm-island', 'mick-ryan'],
    connectedEventIds: ['1918-hull-river-cyclone', '1994-tambo-repatriation'],
    connectedPlaceSlugs: ['manbarra-wulgurukaba', 'palm-island'],
    sources: ['transcript-allan-palm-island', 'transcript-allan-lucinda-interview'],
    culturalSensitivity: 'consent-required',
    elderPinSlug: 'allan-palm-island',
  },

  // ─── Pryor / Brear line ─────
  {
    slug: 'peter-brear',
    displayName: 'Peter Brear',
    status: 'ancestor',
    birthDecadeApprox: '1850s',
    country: ['palm-island'],
    clusterSlug: 'pryor-brear',
    oneLine: 'Cyndel Pryor\'s paternal grandfather. Lived to 95. At Hull River 1918, Yarrabah, Palm Island. Likely same person as Peter Pryor Senior under name variant.',
    keyConnections: ['cyndel-pryor', 'peter-pryor-junior', 'peter-pryor-1930'],
    connectedEventIds: ['1918-hull-river-cyclone', '1930-curry-rampage'],
    connectedPlaceSlugs: ['hull-river', 'yarrabah', 'palm-island'],
    sources: ['transcript-cyndel-pryor', 'clusters-pryor-brear'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'peter-pryor-junior',
    displayName: 'Peter Pryor Junior',
    status: 'ancestor',
    deathYear: 1971,
    birthDecadeApprox: '1920s',
    country: ['birri-gubba'],
    clusterSlug: 'pryor-brear',
    oneLine: 'Cyndel Pryor\'s father; son of Peter Brear/Peter Pryor Senior. Died 1971 when Cyndel was 13.',
    keyConnections: ['cyndel-pryor', 'peter-brear', 'peter-pryor-1930'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['birri-gubba'],
    sources: ['transcript-cyndel-pryor'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'peter-pryor-1930',
    displayName: 'Peter Pryor (Senior)',
    status: 'ancestor',
    birthDecadeApprox: '1850s',
    country: ['palm-island'],
    clusterSlug: 'pryor-brear',
    oneLine: 'Shot Superintendent Robert Curry on Palm Island night of 3 February 1930. Acquitted by Justice Douglas 14 August 1930 (justifiable community self-defence). Likely same person as Peter Brear under name variant.',
    keyConnections: ['cyndel-pryor', 'peter-brear', 'peter-pryor-junior'],
    connectedEventIds: ['1930-curry-rampage'],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['trove-4084734', 'trove-80596980'],
    culturalSensitivity: 'public',
  },

  // ─── Mortoa / Watson line ─────
  {
    slug: 'doreen-morton',
    displayName: 'Doreen Morton',
    status: 'ancestor',
    birthDecadeApprox: '1910s',
    country: ['mamu'],
    clusterSlug: 'mortoa-watson',
    oneLine: 'Mamu woman from Millaa Millaa, removed to Palm Island at ten years old in the 1920s-30s removal wave. Deaf. Taught family sign language. Mother of Elsa Watson.',
    keyConnections: ['elsa-watson'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    connectedPlaceSlugs: ['mamu', 'palm-island', 'millaa-millaa'],
    sources: ['transcript-elsa-watson'],
    culturalSensitivity: 'consent-required',
  },
  {
    slug: 'toby-watson',
    displayName: 'Toby Watson',
    status: 'ancestor',
    birthDecadeApprox: '1900s',
    country: ['manbarra-wulgurukaba'],
    clusterSlug: 'mortoa-watson',
    oneLine: '"Granddad" figure to Marjoyie Burns; taught her language as young girl on Palm Island. Possible kin to Elsa Watson\'s Watson line.',
    keyConnections: ['marjoyie-burns', 'elsa-watson'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['transcript-marjoyie-burns', 'transcript-elsa-watson'],
    culturalSensitivity: 'public',
  },

  // ─── Allan line (Manbarra) ─────
  {
    slug: 'walter-skipper-palm-island',
    displayName: "Walter ('Skipper') Palm Island",
    status: 'ancestor',
    birthDecadeApprox: '1930s',
    deathYear: 2010, // approximate, marked as ancestor
    country: ['manbarra-wulgurukaba'],
    clusterSlug: 'allan-palm-island',
    oneLine: 'Boat-maker. Allan Palm Island\'s father. Mid-20th-century boat operator/captain. Successor to Mick Ryan\'s 1930 launch tradition.',
    keyConnections: ['mick-ryan', 'allan-palm-island'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['palm-island', 'manbarra-wulgurukaba'],
    sources: ['transcript-allan-palm-island'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'mick-ryan',
    displayName: 'Mick Ryan',
    status: 'ancestor',
    birthDecadeApprox: '1900s',
    country: ['palm-island'],
    oneLine: 'Aboriginal launch operator on Palm Island in 1930. "The boy who worked the launch". Boat-tradition predecessor to Walter Skipper.',
    keyConnections: ['walter-skipper-palm-island'],
    connectedEventIds: ['1930-curry-rampage'],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['trove-60762162'],
    culturalSensitivity: 'public',
  },

  // ─── 1957 Magnificent Seven ─────
  {
    slug: 'albie-geia',
    displayName: 'Albie Geia',
    status: 'ancestor',
    birthDecadeApprox: '1930s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'Trigger of the 1957 strike — refused deportation. One of the Magnificent Seven. Exiled to Woorabinda.',
    keyConnections: ['frank-anderson'],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island', 'woorabinda'],
    sources: ['1957-magnificent-seven-strike', 'trove-236324405'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'willie-thaiday',
    displayName: 'Willie Thaiday',
    status: 'ancestor',
    birthDecadeApprox: '1920s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'One of the Magnificent Seven 1957 strike leaders. Father of Aunty Dulcie Isaro. Erub/Lifou/Mer descent (Torres Strait).',
    keyConnections: ['frank-anderson', 'aunty-dulcie-isaro'],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island', 'woorabinda'],
    sources: ['1957-magnificent-seven-strike', 'trove-236324405', 'trove-255498051'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'eric-lymburner',
    displayName: 'Eric Lymburner',
    status: 'ancestor',
    birthDecadeApprox: '1920s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'One of the Magnificent Seven 1957 strike leaders. Exiled to Cherbourg with wife and family.',
    keyConnections: [],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island', 'cherbourg'],
    sources: ['1957-magnificent-seven-strike', 'trove-236324405'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'sonny-sibley',
    displayName: 'Sonny Sibley',
    status: 'ancestor',
    birthDecadeApprox: '1920s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'Deputation member of the Magnificent Seven 1957 strike. Fitter, paid 30/- a week. Wife and seven children. Exiled to Wooroobinda.',
    keyConnections: [],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island', 'woorabinda'],
    sources: ['1957-magnificent-seven-strike', 'trove-236324405'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'bill-congoo',
    displayName: 'Bill Congoo',
    status: 'ancestor',
    birthDecadeApprox: '1920s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'One of the Magnificent Seven 1957 strike leaders. Exiled to Cherbourg with wife.',
    keyConnections: [],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island', 'cherbourg'],
    sources: ['1957-magnificent-seven-strike', 'trove-236324405'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'george-watson',
    displayName: 'George Watson',
    status: 'ancestor',
    birthDecadeApprox: '1920s',
    country: ['manbarra-wulgurukaba'],
    clusterSlug: 'mortoa-watson',
    oneLine: 'One of the Magnificent Seven 1957 strike leaders. Possible kin to Elsa Watson\'s Watson line. Pending elder review.',
    keyConnections: ['elsa-watson'],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island', 'cherbourg'],
    sources: ['1957-magnificent-seven-strike', 'transcript-elsa-watson', 'trove-236324405'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'gordon-tapau',
    displayName: 'Gordon Tapau',
    status: 'ancestor',
    birthDecadeApprox: '1920s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'One of the Magnificent Seven 1957 strike leaders.',
    keyConnections: [],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['1957-magnificent-seven-strike'],
    culturalSensitivity: 'public',
  },

  // ─── Tambo (Manbarra circus exhibit, 1883-1894) ─────
  {
    slug: 'tambo',
    displayName: 'Tambo (Kukamunburra)',
    status: 'ancestor',
    birthYear: 1863, // approximate; agent extraction had 1883 birth which was likely the year taken
    deathYear: 1884,
    birthDecadeApprox: '1860s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'Manbarra man taken to the United States in 1883 by R.A. Cunningham for P.T. Barnum\'s circus. Died Cleveland 1884 age ~21. Mummified remains held in funeral parlour basement 110 years. Repatriated February 1994.',
    keyConnections: [],
    connectedEventIds: ['1994-tambo-repatriation'],
    connectedPlaceSlugs: ['manbarra-wulgurukaba', 'palm-island', 'cleveland-usa'],
    sources: ['1994-tambo-repatriation', 'poignant-professional-savages-2004'],
    culturalSensitivity: 'sacred-restricted',
  },

  // ─── Aunty Dulcie Isaro (named in Trove findings, contemporary writer) ─────
  {
    slug: 'aunty-dulcie-isaro',
    displayName: 'Aunty Dulcie Isaro',
    status: 'living',
    birthDecadeApprox: '1940s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'Daughter of Willie Thaiday (Magnificent Seven 1957). Author of *The Day Palm Island Fought Back*. Sister to Mick Thaiday. The family-side written record of the 1957 dawn raid.',
    keyConnections: ['willie-thaiday', 'frank-anderson'],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['isaro-day-palm-fought-back', 'trove-255498051'],
    culturalSensitivity: 'consent-required',
  },

  // ─── Rachel Atkinson (PICC CEO) ─────
  {
    slug: 'rachel-atkinson-picc',
    displayName: 'Rachel Atkinson',
    status: 'living',
    birthDecadeApprox: '1960s',
    country: ['manbarra-wulgurukaba'],
    oneLine: 'PICC CEO. Cultural authority sign-off for all elder content. Manages ethical protocols for the wiki and research coordination.',
    keyConnections: ['winifred-obah', 'cyndel-pryor', 'elsa-watson', 'marjoyie-burns'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['picc-coordination'],
    culturalSensitivity: 'public',
  },

  // ─── Historical figures (settler / state) ─────
  {
    slug: 'robert-curry',
    displayName: 'Robert Curry',
    status: 'historical-figure',
    deathYear: 1930,
    country: [],
    oneLine: 'Superintendent of Palm Island Aboriginal Settlement. On the night of 3 February 1930 burned his own house, killed his children, and went on a rampage. Shot by Peter Pryor.',
    keyConnections: ['peter-pryor-1930', 'thomas-hoffman'],
    connectedEventIds: ['1930-curry-rampage'],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['trove-4084734', 'trove-80596980'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'thomas-hoffman',
    displayName: 'Thomas Hoffman',
    status: 'historical-figure',
    country: [],
    oneLine: 'Assistant Superintendent. Charged in May 1930 with procuring the murder of Robert Curry — said he would "stand the responsibility" and offered £1 to anyone who would shoot Curry.',
    keyConnections: ['robert-curry', 'allison-obah', 'peter-pryor-1930'],
    connectedEventIds: ['1930-curry-rampage'],
    connectedPlaceSlugs: ['palm-island'],
    sources: ['trove-55363945'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'justice-douglas',
    displayName: 'Justice Douglas',
    status: 'historical-figure',
    country: [],
    oneLine: 'North Queensland Supreme Court justice. Ruled 14 August 1930 that the community\'s shooting of Curry was justifiable self-defence. A rare colonial-era ruling that Aboriginal community self-defence was legitimate.',
    keyConnections: ['peter-pryor-1930'],
    connectedEventIds: ['1930-curry-rampage'],
    connectedPlaceSlugs: ['townsville'],
    sources: ['trove-80596980'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'tasaku-tsunoda',
    displayName: 'Tasaku Tsunoda',
    status: 'historical-figure',
    country: [],
    oneLine: 'Linguist. Recorded Alf Palmer 1971-72 producing *A Grammar of Warrongo* (Mouton de Gruyter, 2012). The reason Warrongo language survives in writing.',
    keyConnections: ['alf-palmer'],
    connectedEventIds: ['1971-protection-breaks'],
    connectedPlaceSlugs: ['palm-island', 'warrongo'],
    sources: ['tsunoda-warrongo-grammar-2012'],
    culturalSensitivity: 'public',
  },
  {
    slug: 'roslyn-poignant',
    displayName: 'Roslyn Poignant',
    status: 'historical-figure',
    country: [],
    oneLine: 'Anthropologist. Identified Tambo\'s remains in Cleveland; led the 1994 repatriation. Author of *Professional Savages* (Yale UP, 2004) — the documentary record of the Cunningham/Barnum expedition.',
    keyConnections: ['tambo'],
    connectedEventIds: ['1994-tambo-repatriation'],
    connectedPlaceSlugs: ['cleveland-usa', 'palm-island'],
    sources: ['poignant-professional-savages-2004', 'nla-2036105'],
    culturalSensitivity: 'public',
  },
]

// ─────────────────────  Places  ─────────────────────────────────────────────

export const PLACES: Place[] = [
  // ─── Indigenous Country ─────
  {
    slug: 'manbarra-wulgurukaba',
    displayName: 'Manbarra · Wulgurukaba',
    category: 'country',
    region: 'Palm Islands · Magnetic Island',
    oneLine: 'Palm Islands Country. Bwgcolman settlement location. Allan Palm Island carries it as Traditional Owner. Wulgurukaba is the related mainland Country.',
    connectedPersonSlugs: ['allan-palm-island', 'walter-skipper-palm-island', 'tambo', 'winifred-obah', 'marjoyie-burns', 'frank-anderson', 'aunty-ethel-robertson', 'aunty-iris-whitey'],
    connectedEventIds: ['1918-hull-river-cyclone', '1930-curry-rampage', '1957-magnificent-seven', '1994-tambo-repatriation'],
    relatedPlaceSlugs: ['palm-island'],
  },
  {
    slug: 'warrongo',
    displayName: 'Warrongo Country',
    category: 'country',
    region: 'Mt Garnet to Upper Herbert River',
    oneLine: 'Mt Garnet to the Upper Herbert. Closely related to Gudjal and Gugu Badhun. The 1880 tin rush brought the violence. At Blencoe Falls a group of Warrongo people were driven off the cliffs — Lucy among them.',
    connectedPersonSlugs: ['alf-palmer', 'marjoyie-burns', 'lucy'],
    connectedEventIds: ['lucy-blencoe-falls', '1971-protection-breaks'],
    relatedPlaceSlugs: ['mt-garnet', 'blencoe-falls'],
    culturalSensitivity: 'sacred-restricted',
  },
  {
    slug: 'mamu',
    displayName: 'Mamu Country',
    category: 'country',
    region: 'Atherton Tablelands · Millaa Millaa',
    oneLine: 'Tablelands Country. Dialect of the Jirrbal language family. Doreen Morton was taken from here to Palm at ten years old. Elsa Watson carries the line.',
    connectedPersonSlugs: ['doreen-morton', 'elsa-watson'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    relatedPlaceSlugs: ['jirrbal-language-group', 'millaa-millaa', 'atherton-tablelands'],
  },
  {
    slug: 'djirru',
    displayName: 'Djirru Country',
    category: 'country',
    region: 'Mission Beach hinterland',
    oneLine: 'Mission Beach hinterland. Lucy\'s Country (Winifred\'s great-great-grandmother). Daisy Palmer\'s original Country before removal to Yarrabah age 5.',
    connectedPersonSlugs: ['lucy', 'daisy-palmer', 'alf-palmer', 'winifred-obah'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    relatedPlaceSlugs: ['jirrbal-language-group', 'mamu', 'mission-beach'],
  },
  {
    slug: 'jirrbal-language-group',
    displayName: 'Jirrbal Language Family (Dyirbalic)',
    category: 'language-group',
    region: 'North Queensland Tablelands + coast',
    oneLine: 'Dyirbalic language family with seven dialects: Djirru, Mamu, Girramay, Gulngay, Ngadjan, Walmalbarra, Jirrbal. Spans Mission Beach hinterland to Atherton Tablelands. Broken open by the 1920s-30s removals.',
    connectedPersonSlugs: ['winifred-obah', 'elsa-watson', 'alf-palmer', 'daisy-palmer', 'lucy'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    relatedPlaceSlugs: ['djirru', 'mamu', 'girramay', 'atherton-tablelands'],
  },
  {
    slug: 'birri-gubba',
    displayName: 'Birri-gubba (Bowen)',
    category: 'country',
    region: 'Bowen coast',
    oneLine: 'Bowen coast Country. Paternal Country of Peter Pryor Junior and Cyndel Pryor.',
    connectedPersonSlugs: ['cyndel-pryor', 'peter-pryor-junior'],
    connectedEventIds: [],
    relatedPlaceSlugs: ['bowen'],
  },
  {
    slug: 'girramay',
    displayName: 'Girramay Country',
    category: 'country',
    region: 'Atherton Tablelands · Tully',
    oneLine: 'Atherton Tablelands Country. Dialect of the Jirrbal language family. Madge Thaiday (Aunty Dulcie\'s mother) was Girramay from Tully.',
    connectedPersonSlugs: ['aunty-dulcie-isaro'],
    connectedEventIds: [],
    relatedPlaceSlugs: ['jirrbal-language-group', 'tully'],
  },
  {
    slug: 'halifax-hinchinbrook',
    displayName: 'Halifax · Hinchinbrook',
    category: 'country',
    region: 'North coast · sugar country',
    oneLine: 'Hinchinbrook coast Country. Halifax Camp was the South Sea Islander labour town in the sugar mill era. Aunty Ethel + Iris\'s family line is here.',
    connectedPersonSlugs: ['aunty-ethel-robertson', 'aunty-iris-whitey'],
    connectedEventIds: [],
    relatedPlaceSlugs: ['ingham-innisfail'],
  },
  {
    slug: 'ingham-innisfail',
    displayName: 'Ingham · Innisfail',
    category: 'country',
    region: 'North Queensland sugar coast',
    oneLine: 'The 1918 Cyclone Leonte destroyed the Hull River settlement nearby. Sugar mills, Halifax Camp, settler infrastructure of the era.',
    connectedPersonSlugs: [],
    connectedEventIds: ['1918-hull-river-cyclone'],
    relatedPlaceSlugs: ['hull-river', 'halifax-hinchinbrook', 'mission-beach'],
  },

  // ─── Settlements / removal sites ─────
  {
    slug: 'palm-island',
    displayName: 'Palm Island · Bwgcolman',
    category: 'settlement',
    region: 'Greater Palm Group · Manbarra Country',
    oneLine: '"The place where many were sent". Aboriginal Settlement from 1918 (post Hull River cyclone). The settlement era under the Aboriginals Protection Act ran until 1971.',
    connectedPersonSlugs: ['allan-palm-island', 'winifred-obah', 'marjoyie-burns', 'frank-anderson', 'cyndel-pryor', 'elsa-watson', 'walter-skipper-palm-island', 'mick-ryan', 'robert-curry', 'thomas-hoffman'],
    connectedEventIds: ['1918-hull-river-cyclone', '1930-curry-rampage', '1957-magnificent-seven', '1971-protection-breaks', '1994-tambo-repatriation'],
    relatedPlaceSlugs: ['manbarra-wulgurukaba'],
  },
  {
    slug: 'hull-river',
    displayName: 'Hull River Aboriginal Settlement',
    category: 'settlement',
    region: 'Mission Beach (Djiru Country)',
    oneLine: 'The Aboriginal settlement at Hull River, established ca. 1914. Destroyed by Cyclone Leonte 10 March 1918. Survivors were transported to Palm Island.',
    connectedPersonSlugs: ['daisy-palmer', 'peter-brear'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    relatedPlaceSlugs: ['mission-beach', 'palm-island'],
  },
  {
    slug: 'mission-beach',
    displayName: 'Mission Beach',
    category: 'settlement',
    region: 'Djiru Country',
    oneLine: 'Where Hull River was. The 2024 PICC elders trip returned here, walking back to where their families were taken from.',
    connectedPersonSlugs: ['allan-palm-island', 'winifred-obah'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    relatedPlaceSlugs: ['hull-river', 'djirru'],
  },
  {
    slug: 'yarrabah',
    displayName: 'Yarrabah',
    category: 'settlement',
    region: 'Cairns coast',
    oneLine: 'Aboriginal mission. Daisy Palmer was sent here from Djirru Country at age five. Where she married Allison Obah.',
    connectedPersonSlugs: ['daisy-palmer', 'allison-obah'],
    connectedEventIds: [],
    relatedPlaceSlugs: [],
  },
  {
    slug: 'woorabinda',
    displayName: 'Wooroobinda',
    category: 'settlement',
    region: 'Central Queensland',
    oneLine: 'Aboriginal Settlement. Where Sonny Sibley, Albie Geia and Willie Thaiday were exiled after the 1957 strike — chained at gunpoint.',
    connectedPersonSlugs: ['albie-geia', 'willie-thaiday', 'sonny-sibley'],
    connectedEventIds: ['1957-magnificent-seven'],
    relatedPlaceSlugs: [],
  },
  {
    slug: 'cherbourg',
    displayName: 'Cherbourg',
    category: 'settlement',
    region: 'Southern Queensland',
    oneLine: 'Aboriginal Settlement. Where Bill Congoo, Eric Lymburner, and George Watson were exiled after the 1957 strike — with their wives and families.',
    connectedPersonSlugs: ['bill-congoo', 'eric-lymburner', 'george-watson'],
    connectedEventIds: ['1957-magnificent-seven'],
    relatedPlaceSlugs: [],
  },
  {
    slug: 'cleveland-usa',
    displayName: 'Cleveland, Ohio',
    category: 'specific-place',
    region: 'United States',
    oneLine: "Where Tambo died in 1884 age 21. His mummified remains were held in a funeral parlour basement here for over a century, until repatriated to Palm in 1994.",
    connectedPersonSlugs: ['tambo'],
    connectedEventIds: ['1994-tambo-repatriation'],
    relatedPlaceSlugs: [],
  },

  // ─── Specific places ─────
  {
    slug: 'blencoe-falls',
    displayName: 'Blencoe Falls',
    category: 'specific-place',
    region: 'Girrigun National Park · Warrongo Country',
    oneLine: "Sacred site. A group of Warrongo people, including Lucy, were driven off the cliffs to plunge into the gorge during the 1880s tin rush. Documented in Tasaku Tsunoda's *A Grammar of Warrongo*.",
    connectedPersonSlugs: ['lucy', 'alf-palmer'],
    connectedEventIds: ['lucy-blencoe-falls'],
    relatedPlaceSlugs: ['warrongo'],
    culturalSensitivity: 'sacred-restricted',
  },
  {
    slug: 'mt-garnet',
    displayName: 'Mt Garnet',
    category: 'town',
    region: 'Warrongo Country',
    oneLine: 'Tin-mining frontier town from 1880. The mining brought the violence. Allan\'s mother\'s family worked stations here including Kunawara.',
    connectedPersonSlugs: ['alf-palmer', 'allan-palm-island'],
    connectedEventIds: [],
    relatedPlaceSlugs: ['warrongo'],
  },
  {
    slug: 'millaa-millaa',
    displayName: 'Millaa Millaa',
    category: 'town',
    region: 'Atherton Tablelands · Mamu Country',
    oneLine: 'Atherton Tablelands. Doreen Morton was taken from here to Palm Island at ten years old in the 1920s-30s removal wave.',
    connectedPersonSlugs: ['doreen-morton', 'elsa-watson'],
    connectedEventIds: [],
    relatedPlaceSlugs: ['mamu', 'atherton-tablelands'],
  },
  {
    slug: 'atherton-tablelands',
    displayName: 'Atherton Tablelands',
    category: 'specific-place',
    region: 'Far North Queensland highlands',
    oneLine: 'The Tablelands hold the source landscape for three of Palm Island\'s family lines: Doreen Morton (Mamu), Alf Palmer (Warrongo), Allan\'s mother (Giribau / Jirrbal). The 2026 elders trip walks here.',
    connectedPersonSlugs: ['doreen-morton', 'elsa-watson', 'alf-palmer'],
    connectedEventIds: [],
    relatedPlaceSlugs: ['mamu', 'jirrbal-language-group', 'millaa-millaa'],
  },
  {
    slug: 'townsville',
    displayName: 'Townsville',
    category: 'town',
    region: 'North Queensland coast · Wulgurukaba',
    oneLine: '1930 the Townsville Supreme Court heard the Hoffman trial; Justice Douglas ruled on 14 August 1930. The Townsville watch-house held the 1957 strikers without charge.',
    connectedPersonSlugs: ['justice-douglas'],
    connectedEventIds: ['1930-curry-rampage', '1957-magnificent-seven'],
    relatedPlaceSlugs: [],
  },
  {
    slug: 'vanuatu',
    displayName: 'Vanuatu',
    category: 'specific-place',
    region: 'Melanesia',
    oneLine: 'Where Allison Andrew (Ganji) was blackbirded from in the 1860s. The South Sea Islander origin point of the Andrew name line on Palm.',
    connectedPersonSlugs: ['allison-andrew'],
    connectedEventIds: [],
    relatedPlaceSlugs: [],
  },
  {
    slug: 'tully',
    displayName: 'Tully',
    category: 'town',
    region: 'Far North Queensland · Girramay Country',
    oneLine: 'Madge Thaiday\'s home Country. Aunty Dulcie Isaro\'s mother\'s side of the family.',
    connectedPersonSlugs: ['aunty-dulcie-isaro'],
    connectedEventIds: [],
    relatedPlaceSlugs: ['girramay'],
  },
]

// ─────────────────────  Anchor years  ───────────────────────────────────────

export const ANCHOR_YEARS: AnchorYear[] = [
  {
    year: 1880,
    yearLabel: '1880',
    significance: 'The Wild River tin rush begins. Mining brings violence to Warrongo Country. Lucy is among those killed at Blencoe Falls in this era.',
    connectedPersonSlugs: ['lucy', 'alf-palmer'],
    connectedEventIds: ['lucy-blencoe-falls'],
    connectedPlaceSlugs: ['warrongo', 'mt-garnet', 'blencoe-falls'],
  },
  {
    year: 1883,
    yearLabel: '1883',
    significance: 'Tambo (Kukamunburra) is shipped from Manbarra Country to the United States by R.A. Cunningham for P.T. Barnum\'s circus.',
    connectedPersonSlugs: ['tambo'],
    connectedEventIds: ['1994-tambo-repatriation'],
    connectedPlaceSlugs: ['manbarra-wulgurukaba', 'cleveland-usa'],
  },
  {
    year: 1884,
    yearLabel: '1884',
    significance: 'Tambo dies in Cleveland, Ohio of pneumonia, age 21.',
    connectedPersonSlugs: ['tambo'],
    connectedEventIds: ['1994-tambo-repatriation'],
    connectedPlaceSlugs: ['cleveland-usa'],
  },
  {
    year: 1891,
    yearLabel: '1891',
    significance: 'Alf Palmer (Jinbilnggay) is born. He will become the last native speaker of Warrongo.',
    connectedPersonSlugs: ['alf-palmer'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['warrongo'],
  },
  {
    year: 1918,
    yearLabel: '10 March 1918',
    significance: 'Cyclone Leonte destroys the Hull River Aboriginal Settlement. Survivors are transported to Palm Island in the months that follow. Palm becomes Bwgcolman, the place where many were sent.',
    connectedPersonSlugs: ['daisy-palmer', 'alf-palmer', 'lucy', 'winifred-obah', 'doreen-morton', 'elsa-watson', 'peter-brear'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    connectedPlaceSlugs: ['hull-river', 'mission-beach', 'palm-island', 'ingham-innisfail'],
  },
  {
    year: 1930,
    yearLabel: '3 February 1930',
    significance: 'Superintendent Robert Curry rampages across Palm Island settlement. Peter Pryor shoots him. Justice Douglas later rules the shooting was justifiable community self-defence — a rare colonial-era ruling.',
    connectedPersonSlugs: ['robert-curry', 'thomas-hoffman', 'peter-pryor-1930', 'peter-brear', 'cyndel-pryor', 'justice-douglas', 'mick-ryan', 'allison-obah'],
    connectedEventIds: ['1930-curry-rampage'],
    connectedPlaceSlugs: ['palm-island', 'townsville'],
  },
  {
    year: 1939,
    yearLabel: '1939',
    significance: 'Frank Anderson is born on Palm Island. He will be 17 when the 1957 dawn raids hit.',
    connectedPersonSlugs: ['frank-anderson'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['palm-island'],
  },
  {
    year: 1957,
    yearLabel: '10 June 1957',
    significance: 'The Magnificent Seven strike. Five days against working conditions, unpaid wages, and the Aboriginals Protection Act. Ended in dawn raids — chains, leg irons, families forcibly removed.',
    connectedPersonSlugs: ['albie-geia', 'willie-thaiday', 'eric-lymburner', 'sonny-sibley', 'bill-congoo', 'george-watson', 'gordon-tapau', 'frank-anderson', 'aunty-dulcie-isaro'],
    connectedEventIds: ['1957-magnificent-seven'],
    connectedPlaceSlugs: ['palm-island', 'woorabinda', 'cherbourg'],
  },
  {
    year: 1971,
    yearLabel: '1971',
    significance: "The Aboriginals Protection Act gives way. Aunty Ethel takes the pub. Tasaku Tsunoda records Alf Palmer's words 'so put it down properly'. Peter Pryor Junior dies.",
    connectedPersonSlugs: ['aunty-ethel-robertson', 'aunty-iris-whitey', 'alf-palmer', 'tasaku-tsunoda', 'marjoyie-burns', 'winifred-obah', 'peter-pryor-junior'],
    connectedEventIds: ['1971-protection-breaks'],
    connectedPlaceSlugs: ['palm-island', 'warrongo'],
  },
  {
    year: 1981,
    yearLabel: '1981',
    significance: 'Alf Palmer dies age 90. Rachel Wilson of Palm Island addresses parliament in Canberra: "We feel this is our home."',
    connectedPersonSlugs: ['alf-palmer'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['palm-island', 'warrongo'],
  },
  {
    year: 1994,
    yearLabel: 'February 1994',
    significance: "Tambo (Kukamunburra) is repatriated to Palm Island and buried with traditional rites that had fallen into abeyance for decades. A turning point in Manbarra and Bwgaman cultural renewal.",
    connectedPersonSlugs: ['tambo', 'allan-palm-island', 'roslyn-poignant'],
    connectedEventIds: ['1994-tambo-repatriation'],
    connectedPlaceSlugs: ['palm-island', 'cleveland-usa'],
  },
  {
    year: 2018,
    yearLabel: '2018',
    significance: 'The 100-year anniversary of the Hull River cyclone. Five-minute corroboree on Palm Island.',
    connectedPersonSlugs: ['winifred-obah'],
    connectedEventIds: ['1918-hull-river-cyclone'],
    connectedPlaceSlugs: ['palm-island'],
  },
  {
    year: 2024,
    yearLabel: '2024',
    significance: 'PICC elders return to Mission Beach together — walking back to where their families were taken from. Allan, Winifred, and others.',
    connectedPersonSlugs: ['allan-palm-island', 'winifred-obah'],
    connectedEventIds: [],
    connectedPlaceSlugs: ['mission-beach', 'hull-river'],
  },
]

// ─────────────────────  Lineage  ───────────────────────────────────────────
//
// Backwards genealogy from each living elder. Read-only v1 — drawn from
// existing wiki + transcripts. Empty lineage where elder review is still
// pending. The forward-authoring (elder + family extends their own tree
// via family-folder UI) is a separate sprint, gated on visibility controls.

export type LineageRelation =
  | 'father' | 'mother'
  | 'paternal-grandfather' | 'paternal-grandmother'
  | 'maternal-grandfather' | 'maternal-grandmother'
  | 'great-grandfather' | 'great-grandmother'
  | 'great-great-grandmother' | 'great-great-grandfather'
  | 'sibling' | 'cousin' | 'aunt' | 'uncle' | 'great-uncle' | 'great-aunt'

export type LineageConfidence = 'confirmed' | 'inferred' | 'pending-review'

export type LineageNode = {
  personSlug: string             // → PEOPLE
  relation: LineageRelation
  confidence: LineageConfidence
  notes?: string
}

export type ElderLineage = {
  elderSlug: string              // → LIVING_ELDER_PINS
  ancestors: LineageNode[]       // ordered closest-to-furthest by generation
  kin: LineageNode[]             // siblings, cousins, aunts/uncles
  notes?: string                 // editorial note (gaps, pending review, etc.)
}

export const ELDER_LINEAGES: ElderLineage[] = [
  {
    elderSlug: 'allan-palm-island',
    ancestors: [
      { personSlug: 'walter-skipper-palm-island', relation: 'father', confidence: 'confirmed', notes: 'Boat-maker. Carried the Manbarra line forward.' },
    ],
    kin: [],
    notes: 'Maternal line (Giribau / Jirrbal) and great-grandmother Baja Balanar (Kunawara station near Mt Garnet) named in transcripts but full lineage chain pending elder review pass with Allan.',
  },
  {
    elderSlug: 'frank-anderson',
    ancestors: [],
    kin: [],
    notes: 'Father / mother names + Country detail beyond Bwgcolman pending the next sit-down. Frank\'s transcripts hold his witness of 1957 but the parental-line names need a re-listen pass.',
  },
  {
    elderSlug: 'marjoyie-burns',
    ancestors: [
      { personSlug: 'alf-palmer', relation: 'paternal-grandfather', confidence: 'confirmed', notes: 'Last native speaker of Warrongo. Recorded by linguist Tasaku Tsunoda 1971-72. Marjoyie\'s grandmother is Alf\'s sister — pending name confirmation.' },
      { personSlug: 'lucy', relation: 'great-great-grandmother', confidence: 'confirmed', notes: 'Mother of Alf and Daisy Palmer. Killed at Blencoe Falls in family memory.' },
    ],
    kin: [
      { personSlug: 'winifred-obah', relation: 'cousin', confidence: 'confirmed', notes: 'Cousin through Alf Palmer (Marjoyie\'s grandfather, Winifred\'s grand-uncle).' },
      { personSlug: 'toby-watson', relation: 'great-uncle', confidence: 'pending-review', notes: '"Granddad" Toby Watson — taught Marjoyie language. Possible kin to Elsa Watson\'s line.' },
    ],
    notes: 'Marjoyie\'s grandmother (Alf Palmer\'s sister) needs a name in her own voice — currently inferred.',
  },
  {
    elderSlug: 'winifred-obah',
    ancestors: [
      { personSlug: 'allison-obah', relation: 'paternal-grandfather', confidence: 'confirmed', notes: 'Trumpet player. Mango grower at Mount Bentley. Probable witness at the 1930 Hoffman trial — pending Tindale and AIATSIS confirmation.' },
      { personSlug: 'daisy-palmer', relation: 'paternal-grandmother', confidence: 'confirmed', notes: 'Djirru woman taken to Yarrabah age 5. Married Allison at Yarrabah.' },
      { personSlug: 'allison-andrew', relation: 'great-great-grandfather', confidence: 'confirmed', notes: 'South Sea Islander blackbirded from Vanuatu. "Ganji". Patriarch of the Andrew name line.' },
      { personSlug: 'alf-palmer', relation: 'great-uncle', confidence: 'confirmed', notes: 'Brother of Daisy Palmer. The Warrongo language line.' },
      { personSlug: 'lucy', relation: 'great-great-grandmother', confidence: 'confirmed', notes: 'Daisy and Alf\'s mother. Killed at Blencoe Falls in family memory.' },
    ],
    kin: [
      { personSlug: 'marjoyie-burns', relation: 'cousin', confidence: 'confirmed', notes: 'Cousin through Alf Palmer.' },
      { personSlug: 'elsa-watson', relation: 'cousin', confidence: 'pending-review', notes: 'Cousin link through the Watson side — pending elder review.' },
    ],
    notes: 'The Andrew → Obah → Palmer line carries from Vanuatu (Ganji) through Djirru Country (Lucy) into Palm Island. Winifred carries the verbal handing-down.',
  },
  {
    elderSlug: 'aunty-ethel-robertson',
    ancestors: [],
    kin: [
      { personSlug: 'aunty-iris-whitey', relation: 'sibling', confidence: 'confirmed', notes: 'Sister. Eldest of seventeen children, fourteen who lived.' },
    ],
    notes: 'South Sea Islander origin (Erromango / Manga spelling pending) and Robertson + Whitey family-line names beyond Aunty Iris pending elder review. The 1934 Halifax burial of SSI elder Uba (Trove 172783148) is a candidate ancestor-generation marker — to confirm with the family.',
  },
  {
    elderSlug: 'aunty-iris-whitey',
    ancestors: [],
    kin: [
      { personSlug: 'aunty-ethel-robertson', relation: 'sibling', confidence: 'confirmed' },
    ],
    notes: 'Same gates as Aunty Ethel.',
  },
  {
    elderSlug: 'elsa-watson',
    ancestors: [
      { personSlug: 'doreen-morton', relation: 'mother', confidence: 'confirmed', notes: 'Mamu woman from Millaa Millaa. Removed to Palm Island at ten years old in the 1920s-30s wave. Deaf — taught family sign language.' },
    ],
    kin: [
      { personSlug: 'winifred-obah', relation: 'cousin', confidence: 'pending-review', notes: 'Cousin link through the Watson side — pending elder review.' },
    ],
    notes: 'Doreen Morton\'s parents and removal year still pending elder review. The George Watson 1957 strike leader may be kin — pending review.',
  },
  {
    elderSlug: 'cyndel-pryor',
    ancestors: [
      { personSlug: 'peter-pryor-junior', relation: 'father', confidence: 'confirmed', notes: 'Died 1971 when Cyndel was 13.' },
      { personSlug: 'peter-brear', relation: 'paternal-grandfather', confidence: 'confirmed', notes: 'Lived to 95. At Hull River 1918, Yarrabah, Palm Island. Family memory holds him as the man who shot Curry.' },
      { personSlug: 'peter-pryor-1930', relation: 'paternal-grandfather', confidence: 'inferred', notes: 'Likely the same person as Peter Brear under name variant. The 1930 Curry-shooter ruled justifiable by Justice Douglas. Pending Tindale and AIATSIS confirmation.' },
    ],
    kin: [],
    notes: 'Brear / Pryor name variant — for elder confirmation with Cyndel which name the family uses. Maternal line (Stolen Generation mother) actively being researched.',
  },
  {
    elderSlug: 'gurtrude-richardson',
    ancestors: [],
    kin: [],
    notes: 'Parent names + Country detail pending elder review re-listen pass before public surface.',
  },
]

export function findLineageByElder(elderSlug: string): ElderLineage | undefined {
  return ELDER_LINEAGES.find((l) => l.elderSlug === elderSlug)
}

// ─────────────────────  Lookups  ────────────────────────────────────────────

export function findPersonBySlug(slug: string): Person | undefined {
  return PEOPLE.find((p) => p.slug === slug)
}

export function findPlaceBySlug(slug: string): Place | undefined {
  return PLACES.find((p) => p.slug === slug)
}

export function findYearByYear(year: number): AnchorYear | undefined {
  return ANCHOR_YEARS.find((y) => y.year === year)
}

export function getPeopleByPlace(placeSlug: string): Person[] {
  return PEOPLE.filter((p) => p.connectedPlaceSlugs.includes(placeSlug) || p.country.includes(placeSlug))
}

export function getPeopleByEvent(eventId: string): Person[] {
  return PEOPLE.filter((p) => p.connectedEventIds.includes(eventId))
}

export function getPeopleByYear(year: number): Person[] {
  const ay = findYearByYear(year)
  return ay ? (ay.connectedPersonSlugs.map(findPersonBySlug).filter(Boolean) as Person[]) : []
}

export function getPlacesForPerson(personSlug: string): Place[] {
  const person = findPersonBySlug(personSlug)
  if (!person) return []
  const slugs = new Set([...person.country, ...person.connectedPlaceSlugs])
  return PLACES.filter((pl) => slugs.has(pl.slug))
}

export function getPlacesByEvent(eventId: string): Place[] {
  return PLACES.filter((p) => p.connectedEventIds.includes(eventId))
}

export function getPeopleByCluster(clusterSlug: string): Person[] {
  return PEOPLE.filter((p) => p.clusterSlug === clusterSlug)
}

export function getPeopleByStatus(status: PersonStatus): Person[] {
  return PEOPLE.filter((p) => p.status === status)
}

/** Returns the LIVING_ELDER_PIN for a person if they're a living elder. */
export function getElderPinForPerson(person: Person): LivingElderPin | undefined {
  if (!person.elderPinSlug) return undefined
  return LIVING_ELDER_PINS.find((e) => e.storytellerSlug === person.elderPinSlug)
}

/** Returns connected events for a year, drawing from EVENT_SLOTS + JOURNEYS. */
export function getEventsByYear(year: number) {
  const events = EVENT_SLOTS.filter((e) => e.year === year)
  const journeys = JOURNEYS.filter((j) => parseInt(j.yearLabel, 10) === year)
  return { events, journeys }
}

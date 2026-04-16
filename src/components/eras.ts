export interface Era {
  id: string
  label: string
  from: number
  to: number
  color: string
  bg: string
  borderColor: string
  description: string
}

export const ERAS: Era[] = [
  {
    id: 'colonial',
    label: 'Colonial & Pastoral',
    from: 1615,
    to: 1908,
    color: 'text-desert',
    bg: 'bg-desert/8',
    borderColor: 'border-desert/30',
    description:
      'European arrival in the Centre. The Kunoth family trek north; Lewis Bloomfield acquires Loves Creek.',
  },
  {
    id: 'family-empire',
    label: 'Family Empire',
    from: 1909,
    to: 1943,
    color: 'text-ochre',
    bg: 'bg-ochre/10',
    borderColor: 'border-ochre/30',
    description:
      'Lewis and Lillian build the Loves Creek pastoral dynasty. Baden wins the Alice Springs Cup. Atnarpa Homestead rises from local rock.',
  },
  {
    id: 'stolen-gen',
    label: 'Stolen Generations & Resistance',
    from: 1928,
    to: 1969,
    color: 'text-ink',
    bg: 'bg-ink/6',
    borderColor: 'border-ink/20',
    description:
      'Children removed from country. Luritja kids born on Angas Downs disappear into institutions. The Liddle brothers petition for land rights. Bob Randall writes "Brown Skin Baby".',
  },
  {
    id: 'land-rights',
    label: 'Land Rights & Return',
    from: 1970,
    to: 2011,
    color: 'text-eucalypt',
    bg: 'bg-eucalypt/8',
    borderColor: 'border-eucalypt/30',
    description:
      'Decades of advocacy. Cyclone Tracy evacuations. Jock Nelson\'s state funeral. The long road toward the land handback.',
  },
  {
    id: 'reclamation',
    label: 'Reclamation',
    from: 2012,
    to: 2025,
    color: 'text-eucalypt',
    bg: 'bg-eucalypt/12',
    borderColor: 'border-eucalypt/40',
    description:
      'Land handed back to Arletherre Aboriginal Land Trust. Henry manages Loves Creek. Atnarpa Homestead roof restored. The family rebuilds on country.',
  },
  {
    id: 'ten-years',
    label: 'Ten Years Ahead',
    from: 2026,
    to: 2036,
    color: 'text-eucalypt',
    bg: 'bg-eucalypt/15',
    borderColor: 'border-eucalypt/50',
    description:
      'What the next generation is dreaming: baseball, tours, healing camps, youth on country.',
  },
]

export function eraForYear(year: number): Era | undefined {
  for (let i = ERAS.length - 1; i >= 0; i--) {
    if (year >= ERAS[i].from && year <= ERAS[i].to) return ERAS[i]
  }
  return undefined
}

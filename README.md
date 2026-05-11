# 10 Years

A living story map: families, their dreams, and the decade ahead.
Built on the Empathy Ledger — every person, photo, and story is the same
source of truth as Oonchiumpa's other surfaces.

## What this is

Two axes, one surface:

- **Horizontal** — time. Years 2024→2035. Past events, aspirations for the
  future, and milestones (aspirations that came true) plotted in place.
- **Vertical** — people. Elders, aunties, uncles, kids, mentors. Click a
  person to filter the timeline to their story.

A dream logged here (Brydon → baseballer by 2030, Minhala → link future
tour to country) becomes a row that the dream inbox surfaces for
introductions. When a dream comes true, its dot flips from dashed ring
to filled ochre — and that year's annual report writes itself.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS
- React Router
- Empathy Ledger v2 API (read: storytellers, timeline-events, kinship)
- Supabase (optional, for editor auth — not needed for v1 browse)

## Setup

```bash
cp .env.example .env.local
# Fill in VITE_EMPATHY_LEDGER_API_KEY with the default org-scoped read key
# Fill in VITE_EMPATHY_LEDGER_NETWORK_API_KEY with the cross-community map key
npm install
npm run dev
```

App runs on <http://localhost:5180>.

## Screens

- `/` — Timeline (years × people grid)
- `/family` — Family tree (kinship graph) *(coming next)*
- `/inbox` — Dream inbox *(coming next)*
- `/person/:id` — Person page *(coming next)*

## Backing schema

Lives in `empathy-ledger-v2` on branch `feat/timeline-kinship`:

- `kinship_vocabularies` — per-org kinship term dictionaries
- `kinship_relations` — directed edges between storytellers
- `timeline_events` — past / aspiration / milestone, with sub-goals
- `timeline_event_{people,stories,media}` — junctions
- `connections` — dream → mentor pairings

See the three migration files in that repo for the full shape.

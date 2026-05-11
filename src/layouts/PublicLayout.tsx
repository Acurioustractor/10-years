import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/history', label: 'History' },
  { to: '/elders', label: 'Elders' },
  { to: '/people', label: 'People' },
  { to: '/places', label: 'Places' },
  { to: '/years', label: 'Years' },
  { to: '/journeys', label: 'Journeys' },
  { to: '/vision', label: 'Vision' },
]

const SEGMENT_LABELS: Record<string, string> = {
  explore: 'Explore',
  join: 'Join your family',
  family: 'Family tree',
  history: 'History',
  elders: 'Elders',
  lineage: 'Lineage',
  journeys: 'Journeys',
  people: 'People',
  places: 'Places',
  years: 'Years',
  vision: 'Vision',
  inbox: 'Goals',
  person: 'Person',
}

function labelForSegment(segment: string) {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment]
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((segment, index) => ({
    label: labelForSegment(segment),
    to: `/${segments.slice(0, index + 1).join('/')}`,
  }))
}

export default function PublicLayout() {
  const { pathname } = useLocation()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="border-b border-ink/10 bg-cream/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <NavLink to="/" className="shrink-0">
            <div className="font-serif text-xl md:text-2xl text-ink leading-none">10 Years</div>
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-ink/60 mt-0.5">
              A living story map
            </div>
          </NavLink>
          <nav className="flex min-w-0 items-center gap-3 overflow-x-auto pl-4 text-sm md:gap-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `shrink-0 transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/join"
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium bg-ochre text-cream hover:bg-ochre/90 transition-colors"
            >
              Join your family
            </NavLink>
          </nav>
        </div>
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="border-t border-ink/5">
            <ol className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto px-4 md:px-6 py-2 text-[11px] uppercase tracking-[0.2em] text-ink/45">
              <li className="shrink-0">
                <Link to="/" className="hover:text-ink/70 transition-colors">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((item, index) => {
                const current = index === breadcrumbs.length - 1
                return (
                  <li key={item.to} className="flex shrink-0 items-center gap-2">
                    <span aria-hidden="true" className="text-ink/20">/</span>
                    {current ? (
                      <span className="text-ink/65">{item.label}</span>
                    ) : (
                      <Link to={item.to} className="hover:text-ink/70 transition-colors">
                        {item.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 py-6 text-center text-xs text-ink/50">
        Built on the Empathy Ledger. Your family's data belongs to your family.
      </footer>
    </div>
  )
}

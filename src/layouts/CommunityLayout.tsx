import { useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'

export default function CommunityLayout() {
  const { communitySlug } = useParams<{ communitySlug: string }>()
  const [menuOpen, setMenuOpen] = useState(false)
  const base = `/c/${communitySlug}`

  const navItems = [
    { to: base, label: 'Overview', end: true },
    { to: `${base}/families`, label: 'Families' },
    { to: `${base}/timeline`, label: 'Timeline' },
    { to: `${base}/goals`, label: 'Goals' },
  ]

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `pb-1 border-b-2 transition-colors ${isActive ? 'border-eucalypt text-ink' : 'border-transparent text-ink/60 hover:text-ink'}`

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="border-b border-ink/10 bg-cream/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/" className="shrink-0">
              <div className="font-serif text-lg text-ink leading-none">10 Years</div>
            </NavLink>
            <span className="text-ink/20">·</span>
            <div className="text-[10px] uppercase tracking-widest text-eucalypt font-medium">Community</div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 -mr-2 text-ink/60"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav className="hidden md:flex items-center gap-5 text-sm">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navCls}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/explore" className="text-xs text-ink/40 hover:text-ink/60 ml-2">
              All communities
            </NavLink>
          </nav>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-ink/5 px-4 py-3 flex flex-col gap-1 bg-cream">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-eucalypt/10 text-ink font-medium' : 'text-ink/60'}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 py-6 text-center text-xs text-ink/50">
        Built on the Empathy Ledger. Community-led, family-owned.
      </footer>
    </div>
  )
}

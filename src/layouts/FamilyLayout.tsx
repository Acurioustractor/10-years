import { useState } from 'react'
import { NavLink, Outlet, Navigate, useParams } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'

export default function FamilyLayout() {
  const { familyCode } = useParams<{ familyCode: string }>()
  const { mode, familySession, logout } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  // If no family session, redirect to join
  if (mode !== 'family' && mode !== 'org') {
    return <Navigate to="/join" replace />
  }

  const familyName = familySession?.folder.name || 'Family'
  const memberName = familySession?.member.displayName || ''
  const role = familySession?.member.role || 'viewer'
  const base = `/f/${familyCode}`

  const navItems = [
    { to: base, label: 'Home', end: true },
    { to: `${base}/tree`, label: 'Tree' },
    { to: `${base}/timeline`, label: 'Timeline' },
    { to: `${base}/story`, label: 'Story' },
    { to: `${base}/goals`, label: 'Goals' },
  ]

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `pb-1 border-b-2 transition-colors ${isActive ? 'border-ochre text-ink' : 'border-transparent text-ink/60 hover:text-ink'}`

  const mobileNavCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-ochre/10 text-ink font-medium' : 'text-ink/60'}`

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="border-b border-ink/10 bg-cream/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/" className="shrink-0">
              <div className="font-serif text-lg text-ink leading-none">10 Years</div>
            </NavLink>
            <span className="text-ink/20">·</span>
            <div>
              <div className="font-serif text-base text-ink leading-tight">{familyName}</div>
              {memberName && (
                <div className="text-[10px] text-ink/50">{memberName} · {role}</div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navCls}>
                {item.label}
              </NavLink>
            ))}
            {(role === 'elder' || role === 'family_rep') && (
              <NavLink to={`${base}/settings`} className={navCls}>Settings</NavLink>
            )}
            <button onClick={logout} className="text-xs text-ink/40 hover:text-ink/60 ml-2">
              Leave
            </button>
          </nav>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <nav className="md:hidden border-t border-ink/5 px-4 py-3 flex flex-col gap-1 bg-cream">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={mobileNavCls} onClick={() => setMenuOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            {(role === 'elder' || role === 'family_rep') && (
              <NavLink to={`${base}/settings`} className={mobileNavCls} onClick={() => setMenuOpen(false)}>
                Settings
              </NavLink>
            )}
            <button onClick={logout} className="text-left px-3 py-2 text-sm text-ink/40">
              Leave family
            </button>
          </nav>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-cream border-t border-ink/10 flex justify-around py-2 px-1">
        {navItems.slice(0, 4).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] ${isActive ? 'text-ochre' : 'text-ink/40'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  )
}

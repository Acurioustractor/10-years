import { NavLink, Outlet } from 'react-router-dom'

export default function PublicLayout() {
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
          <nav className="flex items-center gap-3 md:gap-4 text-sm">
            <NavLink to="/history" className={({ isActive }) =>
              `hidden md:inline-block transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
            }>
              History
            </NavLink>
            <NavLink to="/elders" className={({ isActive }) =>
              `transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
            }>
              Elders
            </NavLink>
            <NavLink to="/people" className={({ isActive }) =>
              `hidden sm:inline-block transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
            }>
              People
            </NavLink>
            <NavLink to="/places" className={({ isActive }) =>
              `hidden md:inline-block transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
            }>
              Places
            </NavLink>
            <NavLink to="/years" className={({ isActive }) =>
              `hidden md:inline-block transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
            }>
              Years
            </NavLink>
            <NavLink to="/journeys" className={({ isActive }) =>
              `hidden sm:inline-block transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
            }>
              Journeys
            </NavLink>
            <NavLink to="/vision" className={({ isActive }) =>
              `hidden md:inline-block transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
            }>
              Vision
            </NavLink>
            <NavLink
              to="/join"
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-ochre text-cream hover:bg-ochre/90 transition-colors"
            >
              Join your family
            </NavLink>
          </nav>
        </div>
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

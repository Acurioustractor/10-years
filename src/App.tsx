import { NavLink, Route, Routes } from 'react-router-dom'
import TimelinePage from './pages/TimelinePage'
import FamilyTreePage from './pages/FamilyTreePage'
import DreamInboxPage from './pages/DreamInboxPage'
import PersonPage from './pages/PersonPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="border-b border-ink/10 bg-cream/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-serif text-2xl text-ink leading-none">10 Years</div>
            <div className="text-xs uppercase tracking-widest text-ink/60 mt-1">
              A living story map
            </div>
          </div>
          <nav className="flex gap-6 text-sm">
            <NavLink to="/" end className={navCls}>Timeline</NavLink>
            <NavLink to="/family" className={navCls}>Family</NavLink>
            <NavLink to="/inbox" className={navCls}>Dream inbox</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<TimelinePage />} />
          <Route path="/family" element={<FamilyTreePage />} />
          <Route path="/inbox" element={<DreamInboxPage />} />
          <Route path="/person/:id" element={<PersonPage />} />
        </Routes>
      </main>

      <footer className="border-t border-ink/10 py-6 text-center text-xs text-ink/50">
        Built on the Empathy Ledger.
      </footer>
    </div>
  )
}

function navCls({ isActive }: { isActive: boolean }) {
  return [
    'pb-1 border-b-2 transition-colors',
    isActive ? 'border-ochre text-ink' : 'border-transparent text-ink/60 hover:text-ink',
  ].join(' ')
}


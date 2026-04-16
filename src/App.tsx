import { Route, Routes, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useSession } from './contexts/SessionContext'
import { setAuthToken } from './services/empathyLedgerClient'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import FamilyLayout from './layouts/FamilyLayout'
import CommunityLayout from './layouts/CommunityLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import JoinPage from './pages/JoinPage'
import ExplorePage from './pages/ExplorePage'

// Community pages
import CommunityHomePage from './pages/CommunityHomePage'
import CommunityFamiliesPage from './pages/CommunityFamiliesPage'

// Family-scoped pages
import TimelinePage from './pages/TimelinePage'
import FamilyTreePage from './pages/FamilyTreePage'
import DreamInboxPage from './pages/DreamInboxPage'
import PersonPage from './pages/PersonPage'

function FamilyHomePage() {
  const { familySession } = useSession()
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl text-ink">
        {familySession?.folder.name || 'Family folder'}
      </h1>
      <p className="text-ink/60 mt-2">
        Welcome{familySession ? `, ${familySession.member.displayName}` : ''}.
        Explore your family's timeline, tree, and dreams.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <QuickLink to="tree" label="Family tree" description="See how everyone connects" color="desert" />
        <QuickLink to="timeline" label="Timeline" description="Century of family history" color="ochre" />
        <QuickLink to="story" label="Read the story" description="Scrollytelling chapters" color="eucalypt" />
        <QuickLink to="goals" label="Goals & dreams" description="What the family is working toward" color="eucalypt" />
      </div>
    </div>
  )
}

function QuickLink({ to, label, description, color }: { to: string; label: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    desert: 'border-desert/20 hover:bg-desert/5',
    ochre: 'border-ochre/20 hover:bg-ochre/5',
    eucalypt: 'border-eucalypt/20 hover:bg-eucalypt/5',
  }
  return (
    <Link to={to} className={`block p-5 rounded-xl border ${colorMap[color]} transition-colors`}>
      <h3 className="font-serif text-lg text-ink">{label}</h3>
      <p className="text-xs text-ink/60 mt-1">{description}</p>
    </Link>
  )
}

// Placeholder for community timeline/goals (reuses existing components)
function CommunityTimelinePlaceholder() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-center">
      <h1 className="font-serif text-2xl text-ink mb-3">Community timeline</h1>
      <p className="text-ink/60">
        The combined timeline of all families in this community will appear here,
        showing shared history alongside each family's individual story.
      </p>
    </div>
  )
}

function CommunityGoalsPlaceholder() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-center">
      <h1 className="font-serif text-2xl text-ink mb-3">Community goals</h1>
      <p className="text-ink/60">
        Community-level aspirations and dreams, alongside individual and family goals.
        The Dream Inbox connects each goal to mentors and resources.
      </p>
    </div>
  )
}

export default function App() {
  const { authToken } = useSession()

  useEffect(() => {
    if (authToken) setAuthToken(authToken)
  }, [authToken])

  return (
    <Routes>
      {/* Public shell */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Route>

      {/* Family shell */}
      <Route path="/f/:familyCode" element={<FamilyLayout />}>
        <Route index element={<FamilyHomePage />} />
        <Route path="tree" element={<FamilyTreePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="story" element={<TimelinePage />} />
        <Route path="goals" element={<DreamInboxPage />} />
        <Route path="person/:id" element={<PersonPage />} />
      </Route>

      {/* Community shell */}
      <Route path="/c/:communitySlug" element={<CommunityLayout />}>
        <Route index element={<CommunityHomePage />} />
        <Route path="families" element={<CommunityFamiliesPage />} />
        <Route path="timeline" element={<CommunityTimelinePlaceholder />} />
        <Route path="goals" element={<CommunityGoalsPlaceholder />} />
      </Route>

      {/* Legacy routes */}
      <Route element={<PublicLayout />}>
        <Route path="/family" element={<FamilyTreePage />} />
        <Route path="/inbox" element={<DreamInboxPage />} />
        <Route path="/person/:id" element={<PersonPage />} />
      </Route>
    </Routes>
  )
}

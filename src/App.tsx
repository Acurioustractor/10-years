import { Route, Routes } from 'react-router-dom'
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

// Family pages
import FamilyHomePage from './pages/FamilyHomePage'
import TimelinePage from './pages/TimelinePage'
import FamilyTreePage from './pages/FamilyTreePage'
import DreamInboxPage from './pages/DreamInboxPage'
import PersonPage from './pages/PersonPage'

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

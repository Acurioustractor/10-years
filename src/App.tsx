import { Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useSession } from './contexts/SessionContext'
import { setAuthToken } from '@/services/empathyLedgerClient'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import FamilyLayout from './layouts/FamilyLayout'
import CommunityLayout from './layouts/CommunityLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import JoinPage from './pages/JoinPage'
import ExplorePage from './pages/ExplorePage'
import HistoryPage from './pages/HistoryPage'
import EldersIndexPage from './pages/EldersIndexPage'
import ElderProfilePage from './pages/ElderProfilePage'
import JourneyIndexPage from './pages/JourneyIndexPage'
import JourneyDetailPage from './pages/JourneyDetailPage'
import PeopleIndexPage from './pages/PeopleIndexPage'
import PersonDetailPage from './pages/PersonDetailPage'
import PlacesIndexPage from './pages/PlacesIndexPage'
import PlaceDetailPage from './pages/PlaceDetailPage'
import YearsIndexPage from './pages/YearsIndexPage'
import YearDetailPage from './pages/YearDetailPage'

// Community pages
import CommunityHomePage from './pages/CommunityHomePage'
import CommunityFamiliesPage from './pages/CommunityFamiliesPage'
import CommunityGovernancePage from './pages/CommunityGovernancePage'
import CommunityResearchPage from './pages/CommunityResearchPage'
import CommunityResearchPersonPage from './pages/CommunityResearchPersonPage'
import CommunityResearchSourcePage from './pages/CommunityResearchSourcePage'
import CommunityTreePage from './pages/CommunityTreePage'
import CommunityTimelinePage from './pages/CommunityTimelinePage'
import CommunityGoalsPage from './pages/CommunityGoalsPage'
import CommunityPhotoGalleryPage from './pages/CommunityPhotoGalleryPage'

// Family pages
import FamilyHomePage from './pages/FamilyHomePage'
import FamilyGovernancePage from './pages/FamilyGovernancePage'
import FamilySettingsPage from './pages/FamilySettingsPage'
import TimelinePage from './pages/TimelinePage'
import FamilyTreePage from './pages/FamilyTreePage'
import DreamInboxPage from './pages/DreamInboxPage'
import PersonPage from './pages/PersonPage'

export default function App() {
  const { authToken } = useSession()

  useEffect(() => {
    setAuthToken(authToken || '')
  }, [authToken])

  return (
    <Routes>
      {/* Public shell */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Route>

      {/* Full-bleed standalone — escapes PublicLayout chrome */}
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/elders" element={<EldersIndexPage />} />
      <Route path="/elders/:slug" element={<ElderProfilePage />} />
      <Route path="/journeys" element={<JourneyIndexPage />} />
      <Route path="/journeys/:slug" element={<JourneyDetailPage />} />
      <Route path="/people" element={<PeopleIndexPage />} />
      <Route path="/people/:slug" element={<PersonDetailPage />} />
      <Route path="/places" element={<PlacesIndexPage />} />
      <Route path="/places/:slug" element={<PlaceDetailPage />} />
      <Route path="/years" element={<YearsIndexPage />} />
      <Route path="/years/:year" element={<YearDetailPage />} />

      {/* Family shell */}
      <Route path="/f/:familySlug" element={<FamilyLayout />}>
        <Route index element={<FamilyHomePage />} />
        <Route path="tree" element={<FamilyTreePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="story" element={<TimelinePage />} />
        <Route path="goals" element={<DreamInboxPage />} />
        <Route path="governance" element={<FamilyGovernancePage />} />
        <Route path="settings" element={<FamilySettingsPage />} />
        <Route path="person/:id" element={<PersonPage />} />
      </Route>

      {/* Community shell */}
      <Route path="/c/:communitySlug" element={<CommunityLayout />}>
        <Route index element={<CommunityHomePage />} />
        <Route path="governance" element={<CommunityGovernancePage />} />
        <Route path="research" element={<CommunityResearchPage />} />
        <Route path="research/people/:personKey" element={<CommunityResearchPersonPage />} />
        <Route path="research/sources/:sourceId" element={<CommunityResearchSourcePage />} />
        <Route path="tree" element={<CommunityTreePage />} />
        <Route path="families" element={<CommunityFamiliesPage />} />
        <Route path="timeline" element={<CommunityTimelinePage />} />
        <Route path="goals" element={<CommunityGoalsPage />} />
        <Route path="gallery" element={<CommunityPhotoGalleryPage />} />
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

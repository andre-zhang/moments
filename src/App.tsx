import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { StorybookPage } from './pages/StorybookPage'
import { AddHubPage } from './pages/AddHubPage'
import { AddMomentPage } from './pages/AddMomentPage'
import { AddTripPage } from './pages/AddTripPage'
import { FriendDetailPage } from './pages/FriendDetailPage'
import { FriendsPage } from './pages/FriendsPage'
import { JournalPage } from './pages/JournalPage'
import { MapPage } from './pages/MapPage'
import { MomentDetailPage } from './pages/MomentDetailPage'
import { PassportKindPage } from './pages/PassportKindPage'
import { PassportPage } from './pages/PassportPage'
import { SettingsPage } from './pages/SettingsPage'
import { DestinationDetailPage } from './pages/DestinationDetailPage'
import { PlacesPage } from './pages/PlacesPage'
import { TravelProvider } from './store/travelStore'

export default function App() {
  return (
    <BrowserRouter>
      <TravelProvider>
        <Routes>
          <Route path="storybook" element={<StorybookPage />} />
          <Route element={<Layout />}>
            <Route index element={<JournalPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="passport" element={<PassportPage />} />
            <Route path="passport/:kind" element={<PassportKindPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="friends/:friendId" element={<FriendDetailPage />} />
            <Route path="moment/:memoryId" element={<MomentDetailPage />} />
            <Route path="places" element={<PlacesPage />} />
            <Route path="places/:destinationId" element={<DestinationDetailPage />} />
            <Route path="trips" element={<Navigate to="/places" replace />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="add" element={<AddHubPage />} />
            <Route path="add/moment" element={<AddMomentPage />} />
            <Route path="add/trip" element={<AddTripPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </TravelProvider>
    </BrowserRouter>
  )
}

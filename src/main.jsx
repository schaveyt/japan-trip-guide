import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import 'leaflet/dist/leaflet.css'
import BottomNav from './components/BottomNav'
import OfflineIndicator from './components/OfflineIndicator'
import InstallPrompt from './components/InstallPrompt'
import Home from './pages/Home.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import MapPage from './pages/MapPage.jsx'
import ItineraryPage from './pages/ItineraryPage.jsx'
import DayDetailPage from './pages/DayDetailPage.jsx'
import FoodPage from './pages/FoodPage.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import TodayPage from './pages/TodayPage.jsx'

// Register service worker — autoUpdate mode handles reload automatically
// immediate: true ensures SW is registered on first load (not just after page interaction)
registerSW({ immediate: true })

// Layout wrapper: renders child pages + PWA UI + fixed bottom nav
// Note: no `path` property — this is a pathless layout route
// OfflineIndicator and InstallPrompt use fixed bottom-16 (above BottomNav at bottom-0 h-16)
function AppLayout() {
  return (
    <>
      <Outlet />
      <OfflineIndicator />
      <InstallPrompt />
      <BottomNav />
    </>
  )
}

const router = createBrowserRouter([
  // Home: editorial cover — no bottom nav (intentional)
  { path: '/', element: <Home />, errorElement: <ErrorPage /> },
  // Navigable pages: wrapped in AppLayout (bottom nav present)
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/today',                    element: <TodayPage /> },
      { path: '/itinerary',                element: <ItineraryPage /> },
      { path: '/itinerary/:dayNumber',     element: <DayDetailPage /> },
      { path: '/map',                      element: <MapPage /> },
      { path: '/food',                     element: <FoodPage /> },
      { path: '/activities',               element: <ActivitiesPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

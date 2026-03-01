import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router'
import './index.css'
import 'leaflet/dist/leaflet.css'
import BottomNav from './components/BottomNav'
import Home from './pages/Home.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import MapPage from './pages/MapPage.jsx'
import ItineraryPage from './pages/ItineraryPage.jsx'
import DayDetailPage from './pages/DayDetailPage.jsx'
import FoodPage from './pages/FoodPage.jsx'
import TodayPage from './pages/TodayPage.jsx'

// Layout wrapper: renders child pages + fixed bottom nav
// Note: no `path` property — this is a pathless layout route
function AppLayout() {
  return (
    <>
      <Outlet />
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
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

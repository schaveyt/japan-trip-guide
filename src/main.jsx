import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import 'leaflet/dist/leaflet.css'
import Home from './pages/Home.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import MapPage from './pages/MapPage.jsx'
import ItineraryPage from './pages/ItineraryPage.jsx'
import DayDetailPage from './pages/DayDetailPage.jsx'
import FoodPage from './pages/FoodPage.jsx'

const router = createBrowserRouter([
  { path: '/',                     element: <Home />,          errorElement: <ErrorPage /> },
  { path: '/map',                  element: <MapPage />,       errorElement: <ErrorPage /> },
  { path: '/itinerary',            element: <ItineraryPage />, errorElement: <ErrorPage /> },
  { path: '/itinerary/:dayNumber', element: <DayDetailPage />, errorElement: <ErrorPage /> },
  { path: '/food',                 element: <FoodPage />,      errorElement: <ErrorPage /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router'
import TripMap from '../components/map/TripMap'
import DayFilterBar from '../components/map/DayFilterBar'
import itinerary from '../data/itinerary.json'
import activitiesData from '../data/activities.json'
import { useAuth } from '../auth/useAuth'
import { useHotels } from '../hooks/useHotels'
import { api } from '../lib/api'

export default function MapPage() {
  const { trip } = itinerary
  const location = useLocation()
  const { role } = useAuth()
  const hotels = useHotels()
  const focusState = location.state ?? {}
  const daysWithLocations = trip.days.filter(d =>
    d.activities.some(a => a.location)
  )
  const [visibleDays, setVisibleDays] = useState(() => {
    const passedDay = focusState.activeDayNumber
    if (passedDay && daysWithLocations.some(d => d.day_number === passedDay)) {
      return new Set([passedDay])
    }
    return new Set(daysWithLocations.map(d => d.day_number))
  })

  const [photoPins, setPhotoPins] = useState([])
  const [showPhotos, setShowPhotos] = useState(!!focusState.focusPhotoId)
  const [focusPhotoId, setFocusPhotoId] = useState(focusState.focusPhotoId ?? null)

  useEffect(() => {
    if (!role) return
    api.get('/api/photos/map-pins')
      .then(data => setPhotoPins(data.pins))
      .catch(() => {})
  }, [role])

  // Clear the focus after TripMap has had a chance to fly there
  useEffect(() => {
    if (!focusPhotoId) return
    const t = setTimeout(() => setFocusPhotoId(null), 2000)
    return () => clearTimeout(t)
  }, [focusPhotoId])

  const toggleDay = (dayNum) => {
    setVisibleDays(prev => {
      const next = new Set(prev)
      next.has(dayNum) ? next.delete(dayNum) : next.add(dayNum)
      return next
    })
  }

  const allActivityEntries = activitiesData.activities.days.flatMap(d =>
    d.entries.filter(e => e.location)
  )
  const [showActivities, setShowActivities] = useState(true)
  const [showHotels, setShowHotels] = useState(true)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-paper">
      <header className="px-5 py-3 border-b border-ink/10 flex items-center gap-4">
        <Link to="/" className="text-muted text-sm hover:text-ink transition-colors">
          ← Home
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">
          Japan Trip Map
        </h1>
      </header>
      <DayFilterBar
        days={daysWithLocations}
        visibleDays={visibleDays}
        onToggle={toggleDay}
      />
      <div className="px-4 py-2 border-b border-ink/10 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-muted">Activities</span>
          <button
            onClick={() => setShowActivities(prev => !prev)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded-sm transition-colors ${
              showActivities
                ? 'bg-ink text-paper'
                : 'bg-transparent text-muted border border-ink/20'
            }`}
          >
            {showActivities ? 'Visible' : 'Hidden'}
          </button>
        </div>
        {role !== null && (
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-muted">Hotels</span>
            <button
              onClick={() => setShowHotels(prev => !prev)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded-sm transition-colors ${
                showHotels
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-transparent text-muted border border-ink/20'
              }`}
            >
              {showHotels ? 'Visible' : 'Hidden'}
            </button>
          </div>
        )}
        {role !== null && (
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-muted">
              Photos {photoPins.length > 0 && <span className="text-ink/40">· {photoPins.length}</span>}
            </span>
            <button
              onClick={() => setShowPhotos(prev => !prev)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded-sm transition-colors ${
                showPhotos
                  ? 'bg-[#D97706] text-white'
                  : 'bg-transparent text-muted border border-ink/20'
              }`}
            >
              {showPhotos ? 'Visible' : 'Hidden'}
            </button>
          </div>
        )}
      </div>
      <div className="flex-1">
        <TripMap
          days={trip.days}
          visibleDays={visibleDays}
          activityEntries={allActivityEntries}
          showActivities={showActivities}
          hotels={hotels}
          showHotels={showHotels}
          photoPins={photoPins}
          showPhotos={showPhotos}
          focusPhotoId={focusPhotoId}
        />
      </div>
    </div>
  )
}

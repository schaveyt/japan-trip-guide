import { useState } from 'react'
import { useLocation, Link } from 'react-router'
import TripMap from '../components/map/TripMap'
import DayFilterBar from '../components/map/DayFilterBar'
import itinerary from '../data/itinerary.json'

export default function MapPage() {
  const { trip } = itinerary
  const location = useLocation()
  const daysWithLocations = trip.days.filter(d =>
    d.activities.some(a => a.location)
  )
  const [visibleDays, setVisibleDays] = useState(() => {
    const passedDay = location.state?.activeDayNumber
    if (passedDay && daysWithLocations.some(d => d.day_number === passedDay)) {
      return new Set([passedDay])
    }
    return new Set(daysWithLocations.map(d => d.day_number))
  })

  const toggleDay = (dayNum) => {
    setVisibleDays(prev => {
      const next = new Set(prev)
      next.has(dayNum) ? next.delete(dayNum) : next.add(dayNum)
      return next
    })
  }

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
      <div className="flex-1">
        <TripMap days={trip.days} visibleDays={visibleDays} />
      </div>
    </div>
  )
}

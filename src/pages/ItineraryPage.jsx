import { Link } from 'react-router'
import itinerary from '../data/itinerary.json'
import { ReadingContainer } from '../components/Layout'

export default function ItineraryPage() {
  const { trip } = itinerary

  return (
    <div className="bg-paper min-h-screen font-body">
      <header className="px-5 py-3 border-b border-ink/10 flex items-center gap-4">
        <Link to="/" className="text-muted text-sm hover:text-ink transition-colors">
          ← Home
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Itinerary</h1>
      </header>

      <ReadingContainer className="py-12">
        <p className="text-muted text-sm uppercase tracking-wider mb-6">
          {trip.route.join(' → ')}
        </p>

        <ul>
          {trip.days.map(day => (
            <Link
              key={day.day_number}
              to={`/itinerary/${day.day_number}`}
              className="flex items-baseline gap-4 py-4 border-b border-ink/10 last:border-0 hover:bg-ink/5 -mx-2 px-2 transition-colors"
            >
              <span className="text-muted text-sm font-medium min-w-[3rem] shrink-0">
                Day {day.day_number}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-ink font-medium">{day.title}</span>
                <span className="block text-muted text-sm">{day.cities.join(' → ')}</span>
              </div>
              {day.travel_day && (
                <span className="text-xs uppercase tracking-wider text-torii shrink-0">Travel</span>
              )}
              <span className="text-muted text-sm shrink-0">{day.date}</span>
              <span className="text-ink/30 shrink-0">→</span>
            </Link>
          ))}
        </ul>
      </ReadingContainer>
    </div>
  )
}

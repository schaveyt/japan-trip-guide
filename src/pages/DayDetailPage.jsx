import { useParams, Link } from 'react-router'
import itinerary from '../data/itinerary.json'
import { ReadingContainer } from '../components/Layout'
import activitiesData from '../data/activities.json'

const TIME_PERIOD_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  'all-day': 'Full Day',
}

export default function DayDetailPage() {
  const { dayNumber } = useParams()
  const { trip } = itinerary
  const day = trip.days.find(d => d.day_number === Number(dayNumber))
  const dayHasActivities = activitiesData.activities.days.some(
    d => d.day_number === day?.day_number
  )

  if (!day) {
    return (
      <div className="bg-paper min-h-screen font-body flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-muted">Day not found</p>
          <Link to="/itinerary" className="text-link text-sm hover:underline mt-2 block">← Back to itinerary</Link>
        </div>
      </div>
    )
  }

  const orderedPeriods = ['morning', 'afternoon', 'evening', 'all-day']
  const activityGroups = orderedPeriods
    .map(period => ({
      period,
      label: TIME_PERIOD_LABELS[period],
      activities: day.activities.filter(a => a.time_period === period),
    }))
    .filter(group => group.activities.length > 0)

  return (
    <div className="bg-paper min-h-screen font-body pb-20">
      {/* Header */}
      <header className="px-5 py-3 border-b border-ink/10 flex items-center gap-4">
        <Link to="/itinerary" className="text-muted text-sm hover:text-ink transition-colors">
          ← Itinerary
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">
          Day {day.day_number}
        </h1>
        {day.travel_day && (
          <span className="text-xs uppercase tracking-wider text-torii ml-auto">Travel</span>
        )}
      </header>

      <ReadingContainer className="py-10">
        {/* Day title block */}
        <div className="mb-8">
          <p className="text-muted text-sm uppercase tracking-wider mb-1">{day.date}</p>
          <h2 className="font-display text-subhead font-bold text-ink">{day.title}</h2>
          <p className="text-muted text-sm mt-1">{day.cities.join(' → ')}</p>
        </div>

        {/* Map deep-link for the whole day */}
        <Link
          to="/map"
          state={{ activeDayNumber: day.day_number }}
          className="flex items-center justify-between px-4 py-3 border border-ink/20 hover:border-ink/60 transition-colors group mb-8 text-sm"
        >
          <span className="text-ink">View Day {day.day_number} on map</span>
          <span className="text-ink/40 group-hover:text-ink transition-colors">→</span>
        </Link>

        {dayHasActivities && (
          <Link
            to="/activities"
            state={{ dayNumber: day.day_number }}
            className="flex items-center justify-between px-4 py-3 border border-ink/20 hover:border-ink/60 transition-colors group mb-8 text-sm"
          >
            <span className="text-ink">See activities for Day {day.day_number}</span>
            <span className="text-ink/40 group-hover:text-ink transition-colors">→</span>
          </Link>
        )}

        {/* Activity groups by time period */}
        {activityGroups.map(group => (
          <section key={group.period} className="mb-8">
            <h3 className="text-xs uppercase tracking-widest text-muted mb-4 border-b border-ink/10 pb-2">
              {group.label}
            </h3>
            <ul className="space-y-5">
              {group.activities.map(activity => (
                <li key={activity.id} className="border-b border-ink/10 pb-5 last:border-0">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-xs uppercase tracking-wider text-muted border border-ink/20 px-2 py-0.5 shrink-0 mt-0.5">
                      {activity.type}
                    </span>
                    <p className="font-body font-medium text-ink">{activity.name}</p>
                  </div>
                  {activity.description && (
                    <p className="text-muted text-sm leading-relaxed mb-2">{activity.description}</p>
                  )}
                  {activity.notes.length > 0 && (
                    <ul className="space-y-1 mb-2">
                      {activity.notes.map((note, i) => (
                        <li key={i} className="text-muted text-sm">— {note}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-4 mt-2">
                    {activity.location && (
                      <Link
                        to="/map"
                        state={{ activeDayNumber: day.day_number }}
                        className="text-link text-sm hover:underline"
                      >
                        View on map →
                      </Link>
                    )}
                    {activity.type === 'food' && (
                      <Link
                        to="/food"
                        state={{ city: day.cities[0] }}
                        className="text-link text-sm hover:underline"
                      >
                        See in food guide →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </ReadingContainer>
    </div>
  )
}

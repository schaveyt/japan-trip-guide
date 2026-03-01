import itinerary from '../data/itinerary.json'
import { ReadingContainer } from '../components/Layout'
import { Link } from 'react-router'
import activitiesData from '../data/activities.json'

const { trip } = itinerary

// Normalize a Date to local midnight (avoids UTC timezone drift)
function toLocalMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// Parse ISO date string "2026-05-17" → local midnight Date
function parseLocalDate(str) {
  const [year, month, day] = str.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getTripState() {
  const now = new Date()
  const today = toLocalMidnight(now)

  const startDate = parseLocalDate(trip.start_date)
  const lastDayDate = parseLocalDate(trip.days[trip.days.length - 1].date)

  if (today < startDate) {
    const diffMs = startDate - today
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const day1 = trip.days[0]
    return { state: 'pre-trip', daysUntil, day1 }
  }

  if (today > lastDayDate) {
    return { state: 'post-trip' }
  }

  // Find today's matching day
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const todayDay = trip.days.find(d => d.date === todayStr)
  return { state: 'in-trip', day: todayDay }
}

function getCurrentTimePeriod() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

// Returns the first time period that hasn't fully passed
function getWhatsNextPeriod(activities, currentPeriod) {
  const order = ['morning', 'afternoon', 'evening']
  const currentIndex = order.indexOf(currentPeriod)
  // Look for the current or next period that has activities
  for (let i = currentIndex; i < order.length; i++) {
    const period = order[i]
    const hasActivities = activities.some(a =>
      a.time_period === period || (i === currentIndex && a.time_period === 'all-day')
    )
    if (hasActivities) return period
  }
  return null // all periods past
}

const TIME_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  'all-day': 'Full Day',
}

// --- Sub-components ---

function PreTripState({ daysUntil, day1 }) {
  const firstActivity = day1.activities[0]
  return (
    <ReadingContainer className="py-12">
      {/* Countdown hero */}
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-widest text-muted mb-4">Japan Countdown</p>
        <p className="font-display text-[5rem] font-bold text-ink leading-none">{daysUntil}</p>
        <p className="font-display text-2xl text-muted mt-2">
          {daysUntil === 1 ? 'day until Japan' : 'days until Japan'}
        </p>
      </div>

      {/* Day 1 preview */}
      <div className="border-t border-ink/10 pt-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-4">Day 1 Preview</p>
        <h2 className="font-display text-xl font-bold text-ink mb-2">{day1.title}</h2>
        <p className="text-muted text-sm mb-4">{day1.cities.join(' → ')}</p>
        {firstActivity && (
          <p className="text-ink text-sm">
            First up: <span className="font-medium">{firstActivity.name}</span>
          </p>
        )}
      </div>

      {/* Browse itinerary CTA — mirrors PostTripState Link pattern */}
      <div className="mt-8">
        <Link
          to="/itinerary"
          className="text-sm text-link hover:text-ink transition-colors"
        >
          Browse Full Itinerary →
        </Link>
      </div>
    </ReadingContainer>
  )
}

function PostTripState() {
  const cities = trip.route
  return (
    <ReadingContainer className="py-12">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-4">Trip Complete</p>
        <p className="font-display text-5xl font-bold text-ink leading-none">{trip.duration_days}</p>
        <p className="font-display text-2xl text-muted mt-2">days in Japan</p>
      </div>
      <div className="border-t border-ink/10 pt-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">Cities Visited</p>
        <p className="font-display text-lg text-ink">{cities.join(' · ')}</p>
      </div>
      <div className="mt-8">
        <Link
          to="/itinerary"
          className="text-sm text-link hover:text-ink transition-colors"
        >
          ← View full itinerary
        </Link>
      </div>
    </ReadingContainer>
  )
}

function InTripState({ day }) {
  const currentPeriod = getCurrentTimePeriod()
  const whatsNextPeriod = getWhatsNextPeriod(day.activities, currentPeriod)
  const allPast = whatsNextPeriod === null

  const todayActivities = activitiesData.activities.days.find(
    d => d.day_number === day.day_number
  )?.entries ?? []

  // Group activities by time period (preserving order)
  const periodOrder = ['morning', 'afternoon', 'evening', 'all-day']
  const grouped = periodOrder
    .map(period => ({
      period,
      activities: day.activities.filter(a => a.time_period === period),
    }))
    .filter(g => g.activities.length > 0)

  return (
    <ReadingContainer className="py-8">
      {/* Day header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-2">
          Day {day.day_number} · {day.date}
        </p>
        <h1 className="font-display text-2xl font-bold text-ink">{day.title}</h1>
        <p className="text-muted text-sm mt-1">{day.cities.join(' → ')}</p>
      </div>

      {/* Travel day notice */}
      {day.travel_day && (
        <div className="border-l-4 border-torii pl-4 py-3 mb-6">
          <p className="text-xs uppercase tracking-wider text-torii mb-1 font-medium">Travel Day</p>
          <p className="text-ink text-sm">Check transport details in the itinerary.</p>
        </div>
      )}

      {/* What's Next highlight (only if not all past) */}
      {!day.travel_day && !allPast && whatsNextPeriod && (
        <div className="border-l-4 border-torii pl-4 py-3 mb-8 bg-torii/5">
          <p className="text-xs uppercase tracking-wider text-torii mb-2 font-medium">What&apos;s Next</p>
          {day.activities
            .filter(a => a.time_period === whatsNextPeriod)
            .slice(0, 2)
            .map(activity => (
              <div key={activity.id} className="mb-1 last:mb-0">
                <p className="text-ink font-medium text-sm">{activity.name}</p>
                {activity.description && (
                  <p className="text-muted text-xs mt-0.5">{activity.description}</p>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Optional activities from activities.json */}
      {!day.travel_day && todayActivities.length > 0 && (
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-ink/10 pb-2">
            Optional Activities Today
          </p>
          <ul className="space-y-3">
            {todayActivities.map(a => (
              <li key={a.id} className="py-1">
                <p className="text-ink font-medium text-sm">{a.name}</p>
                {a.description && (
                  <p className="text-muted text-xs mt-0.5 leading-relaxed">{a.description}</p>
                )}
                {a.booking_required && (
                  <p className="text-torii text-xs mt-1 uppercase tracking-wider">
                    Book ahead — {a.booking_note}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <Link
            to="/activities"
            state={{ dayNumber: day.day_number }}
            className="text-sm text-link hover:text-ink transition-colors mt-4 block"
          >
            See all activities for Day {day.day_number} →
          </Link>
        </div>
      )}

      {/* Day complete notice */}
      {allPast && (
        <div className="border-l-4 border-ink/20 pl-4 py-3 mb-6">
          <p className="text-ink/60 text-sm">Day complete.</p>
          {day.day_number < trip.duration_days && (
            <Link
              to={`/itinerary/${day.day_number + 1}`}
              className="text-link text-sm hover:text-ink transition-colors"
            >
              View Day {day.day_number + 1} →
            </Link>
          )}
        </div>
      )}

      {/* Activities grouped by time period */}
      {!day.travel_day && (
        <div className="space-y-6">
          {grouped.map(({ period, activities }) => (
            <div key={period}>
              <h2 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-ink/10 pb-2">
                {TIME_LABELS[period] || period}
              </h2>
              <ul className="space-y-3">
                {activities.map(activity => (
                  <li key={activity.id} className="py-1">
                    <p className="text-ink font-medium text-sm">{activity.name}</p>
                    {activity.description && (
                      <p className="text-muted text-xs mt-0.5">{activity.description}</p>
                    )}
                    {activity.notes && activity.notes.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {activity.notes.map((note, i) => (
                          <li key={i} className="text-muted text-xs">· {note}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Link to full day detail */}
      <div className="mt-8 pt-6 border-t border-ink/10">
        <Link
          to={`/itinerary/${day.day_number}`}
          className="text-sm text-link hover:text-ink transition-colors"
        >
          Full Day {day.day_number} details →
        </Link>
      </div>
    </ReadingContainer>
  )
}

// --- Main component ---

export default function TodayPage() {
  const tripState = getTripState()

  return (
    <div className="bg-paper min-h-screen font-body pb-20">
      {tripState.state === 'pre-trip' && (
        <PreTripState daysUntil={tripState.daysUntil} day1={tripState.day1} />
      )}
      {tripState.state === 'in-trip' && tripState.day && (
        <InTripState day={tripState.day} />
      )}
      {tripState.state === 'post-trip' && (
        <PostTripState />
      )}
      {tripState.state === 'in-trip' && !tripState.day && (
        // Edge case: in-trip date but no matching day found (shouldn't happen with good data)
        <ReadingContainer className="py-12">
          <p className="text-muted">No itinerary found for today.</p>
          <Link to="/itinerary" className="text-link text-sm mt-2 block">View full itinerary →</Link>
        </ReadingContainer>
      )}
    </div>
  )
}

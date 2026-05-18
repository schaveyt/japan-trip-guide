import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { ReadingContainer } from '../components/Layout'
import { NotesList } from '../components/journal/NotesList'
import { PhotoGrid } from '../components/journal/PhotoGrid'
import itinerary from '../data/itinerary.json'

const { trip } = itinerary

export default function JournalPage() {
  const { role, loading } = useAuth()
  const navigate = useNavigate()
  const [expandedDay, setExpandedDay] = useState(null)

  useEffect(() => {
    if (!loading && !role) navigate('/login')
  }, [role, loading, navigate])

  if (loading) return <div className="bg-paper min-h-screen" />

  return (
    <div className="bg-paper min-h-screen font-body pb-20">
      <header className="px-5 py-3 border-b border-ink/10 flex items-center gap-4">
        <Link to="/" className="text-muted text-sm hover:text-ink transition-colors">← Home</Link>
        <h1 className="font-display text-lg font-bold text-ink">Journal</h1>
        {role === 'guest' && (
          <span className="ml-auto text-xs uppercase tracking-wider text-muted border border-ink/20 px-2 py-0.5">
            Read only
          </span>
        )}
      </header>

      <ReadingContainer className="py-10">
        <p className="text-muted text-sm uppercase tracking-wider mb-6">
          {trip.route.join(' → ')}
        </p>

        {trip.days.map(day => (
          <div key={day.day_number} className="border-b border-ink/10 last:border-0">
            <button
              onClick={() => setExpandedDay(expandedDay === day.day_number ? null : day.day_number)}
              className="w-full flex items-center justify-between py-4 text-left group"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-muted text-sm min-w-[3rem] shrink-0">Day {day.day_number}</span>
                <span className="text-ink font-medium">{day.title}</span>
              </div>
              <span className="text-muted text-sm ml-2 shrink-0">{expandedDay === day.day_number ? '↑' : '↓'}</span>
            </button>

            {expandedDay === day.day_number && (
              <div className="pb-6">
                <NotesList entityType="day" entityId={`day-${day.day_number}`} />
                <PhotoGrid entityType="day" entityId={`day-${day.day_number}`} />
              </div>
            )}
          </div>
        ))}
      </ReadingContainer>
    </div>
  )
}

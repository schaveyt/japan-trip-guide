import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router'
import activities from '../data/activities.json'
import { ReadingContainer } from '../components/Layout'

const CATEGORIES = ['Outdoor', 'Anime & Pop Culture']
const SUBTYPES = {
  'Outdoor': ['Hiking', 'Biking', 'Water'],
  'Anime & Pop Culture': ['Pokemon', 'One Piece', 'Akihabara'],
}

export default function ActivitiesPage() {
  const location = useLocation()
  const targetDay = location.state?.dayNumber ? Number(location.state.dayNumber) : null

  // Accordion state — all days open by default, or targeted day only on deep-link
  const [openDays, setOpenDays] = useState(() => {
    if (targetDay && activities.activities.days.some(d => d.day_number === targetDay)) {
      return new Set([targetDay])
    }
    return new Set(activities.activities.days.map(d => d.day_number))
  })

  // Two-level filter
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeSubtype, setActiveSubtype] = useState(null)

  const dayRefs = useRef({})

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (targetDay && dayRefs.current[targetDay]) {
      dayRefs.current[targetDay].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const toggleDay = (dayNumber) => {
    setOpenDays(prev => {
      const next = new Set(prev)
      next.has(dayNumber) ? next.delete(dayNumber) : next.add(dayNumber)
      return next
    })
  }

  const toggleCategory = (cat) => {
    setActiveCategory(prev => {
      setActiveSubtype(null)
      return prev === cat ? null : cat
    })
  }

  const toggleSubtype = (sub) => {
    setActiveSubtype(prev => prev === sub ? null : sub)
  }

  return (
    <div className="bg-paper min-h-screen font-body pb-20">
      <header className="px-5 py-3 border-b border-ink/10 flex items-center gap-4">
        <h1 className="font-display text-lg font-bold text-ink">Activities</h1>
      </header>

      <ReadingContainer className="py-10">
        {/* Category filter */}
        <div className="mb-4">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Filter by category</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveCategory(null); setActiveSubtype(null) }}
              className={activeCategory === null
                ? "text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/60 text-ink bg-ink/5"
                : "text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/20 text-muted hover:border-ink/40 transition-colors"
              }
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className={activeCategory === cat
                  ? "text-xs uppercase tracking-wider px-3 py-1.5 border border-torii text-torii"
                  : "text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/20 text-muted hover:border-ink/40 transition-colors"
                }
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Sub-type filter — only when category is selected */}
        {activeCategory && (
          <div className="mb-8">
            <p className="text-muted text-xs uppercase tracking-wider mb-3">Filter by type</p>
            <div className="flex flex-wrap gap-2">
              {SUBTYPES[activeCategory].map(sub => (
                <button key={sub} onClick={() => toggleSubtype(sub)}
                  className={activeSubtype === sub
                    ? "text-xs uppercase tracking-wider px-3 py-1.5 border border-torii text-torii"
                    : "text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/20 text-muted hover:border-ink/40 transition-colors"
                  }
                >{sub}</button>
              ))}
            </div>
          </div>
        )}

        {/* Day sections */}
        {activities.activities.days.map(day => {
          const filtered = day.entries.filter(a => {
            if (activeCategory && a.category !== activeCategory) return false
            if (activeSubtype && a.type !== activeSubtype) return false
            return true
          })

          if (activeCategory && filtered.length === 0) return null

          return (
            <section key={day.day_number} className="mb-8">
              <button
                ref={el => { dayRefs.current[day.day_number] = el }}
                onClick={() => toggleDay(day.day_number)}
                className="w-full flex items-center justify-between py-3 border-b border-ink/20"
              >
                <h2 className="font-display text-subhead font-bold text-ink">
                  Day {day.day_number} — {day.title}
                </h2>
                <span className="text-muted text-sm">
                  {filtered.length} {filtered.length !== 1 ? 'activities' : 'activity'} {openDays.has(day.day_number) ? '↑' : '↓'}
                </span>
              </button>

              {openDays.has(day.day_number) && (
                <ul className="mt-4 space-y-6">
                  {filtered.map(a => (
                    <li key={a.id} className="border-b border-ink/10 pb-6 last:border-0">
                      <div className="flex items-start gap-3">
                        <span className="text-xs uppercase tracking-wider text-muted border border-ink/20 px-2 py-0.5 shrink-0 mt-0.5">
                          {a.type}
                        </span>
                        <div className="min-w-0">
                          <p className="font-body font-medium text-ink">{a.name}</p>
                          {a.description && (
                            <p className="text-muted text-sm mt-1 leading-relaxed">{a.description}</p>
                          )}
                          {a.booking_required && (
                            <div className="mt-2 px-3 py-2 border border-torii/40 bg-torii/5 text-torii text-xs uppercase tracking-wider">
                              Book ahead — {a.booking_note}
                            </div>
                          )}
                          {a.notes?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {a.notes.map((note, i) => (
                                <li key={i} className="text-muted text-sm">— {note}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </ReadingContainer>
    </div>
  )
}

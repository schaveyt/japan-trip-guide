import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import foodGuide from '../data/food-guide.json'
import { ReadingContainer } from '../components/Layout'

export default function FoodPage() {
  // All cities expanded by default
  const [openCities, setOpenCities] = useState(
    () => new Set(foodGuide.cities.map(c => c.name))
  )
  // Type filter — null means "show all"
  const [activeType, setActiveType] = useState(null)

  // Collect all unique types across all restaurants for filter buttons
  const allTypes = Array.from(
    new Set(
      foodGuide.cities.flatMap(c => c.restaurants.map(r => r.type))
    )
  ).sort()

  const toggleCity = (name) => {
    setOpenCities(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const toggleType = (type) => {
    setActiveType(prev => (prev === type ? null : type))
  }

  return (
    <div className="bg-paper min-h-screen font-body pb-20">
      {/* Header */}
      <header className="px-5 py-3 border-b border-ink/10 flex items-center gap-4">
        <Link to="/" className="text-muted text-sm hover:text-ink transition-colors">
          ← Home
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">Food Guide</h1>
      </header>

      <ReadingContainer className="py-10">
        {/* Type filter bar */}
        <div className="mb-8">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Filter by type</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveType(null)}
              className={activeType === null
                ? "text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/60 text-ink bg-ink/5"
                : "text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/20 text-muted hover:border-ink/40 transition-colors"
              }
            >
              All
            </button>
            {allTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={activeType === type
                  ? "text-xs uppercase tracking-wider px-3 py-1.5 border border-torii text-torii"
                  : "text-xs uppercase tracking-wider px-3 py-1.5 border border-ink/20 text-muted hover:border-ink/40 transition-colors"
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* City sections */}
        {foodGuide.cities.map(city => {
          const filtered = activeType
            ? city.restaurants.filter(r => r.type === activeType)
            : city.restaurants

          // Skip city section entirely if type filter yields no results for this city
          if (activeType && filtered.length === 0) return null

          return (
            <section key={city.name} className="mb-8">
              <button
                onClick={() => toggleCity(city.name)}
                className="w-full flex items-center justify-between py-3 border-b border-ink/20"
              >
                <h2 className="font-display text-subhead font-bold text-ink">
                  {city.name}
                </h2>
                <span className="text-muted text-sm">
                  {filtered.length} spot{filtered.length !== 1 ? 's' : ''} {openCities.has(city.name) ? '↑' : '↓'}
                </span>
              </button>

              {openCities.has(city.name) && (
                <ul className="mt-4 space-y-6">
                  {filtered.map(r => (
                    <li key={r.id} className="border-b border-ink/10 pb-6 last:border-0">
                      <div className="flex items-start gap-3">
                        <span className="text-xs uppercase tracking-wider text-muted border border-ink/20 px-2 py-0.5 shrink-0 mt-0.5">
                          {r.type}
                        </span>
                        <div className="min-w-0">
                          <p className="font-body font-medium text-ink">{r.name}</p>
                          <p className="text-torii text-sm mt-1">{r.what_to_order}</p>
                          {r.notes?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {r.notes.map((note, i) => (
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

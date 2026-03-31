import { Link } from 'react-router'
import HeroImage from '../components/HeroImage'
import { ReadingContainer } from '../components/Layout'
import itinerary from '../data/itinerary.json'
import foodGuide from '../data/food-guide.json'
import pkg from '../../package.json'

// Local hero images — WebP with JPEG fallback for offline caching via service worker.
// Served from public/images/, precached by SW (configured in vite.config.js VitePWA globPatterns).
// Replaces Unsplash CDN URLs which produce cross-origin opaque responses not reliably cacheable.
const japanHero = {
  webp: {
    '800':  '/images/japan-hero-800.webp',
    '1600': '/images/japan-hero-1600.webp',
  },
  jpg: {
    '800':  '/images/japan-hero-800.jpg',
    '1600': '/images/japan-hero-1600.jpg',
  },
}

export default function Home() {
  const { trip } = itinerary
  const route = trip.route.join(' → ')
  const firstRestaurant = foodGuide.cities[0].restaurants[0].name
  const lastDay = trip.days[trip.days.length - 1]

  return (
    <div className="bg-paper min-h-screen font-body">

      {/* Hero — full-bleed Japan photo with editorial headline */}
      <HeroImage
        srcSet={japanHero}
        alt="Tokyo street at dusk — Shibuya crossing"
      >
        <span className="text-sm uppercase tracking-widest text-white/70 mb-2 block">
          May 2026 · Dad &amp; Son · v{pkg.version}
        </span>
        <h1 className="font-display text-4xl md:text-headline lg:text-hero font-bold leading-tight">
          Japan
        </h1>
        <p className="mt-2 text-lg md:text-intro text-white/90">
          {trip.duration_days} days across {route}
        </p>
      </HeroImage>

      {/* Content — reading-width container */}
      <ReadingContainer className="py-16">

        {/* Trip overview */}
        <section className="mb-12">
          <h2 className="font-display text-subhead font-bold text-ink mb-1">
            The Trip
          </h2>
          <p className="text-muted text-sm uppercase tracking-wider mb-6">
            {trip.start_date} — {lastDay.date}
          </p>
          <p className="text-ink leading-relaxed">
            <strong>{trip.duration_days} days</strong> across {route}.
            Traveling as <strong>{trip.travelers.join(' and ')}</strong>.
          </p>
        </section>

        {/* Itinerary teaser — first 3 days + CTA */}
        <section className="mb-12">
          <h2 className="font-display text-subhead font-bold text-ink mb-6">
            Itinerary
          </h2>
          <ul className="space-y-3 mb-6">
            {trip.days.slice(0, 3).map(day => (
              <li
                key={day.day_number}
                className="flex items-baseline gap-4 py-3 border-b border-ink/10 last:border-0"
              >
                <span className="text-muted text-sm font-medium min-w-[4rem] shrink-0">
                  Day {day.day_number}
                </span>
                <span className="text-ink font-medium">{day.title}</span>
                {day.travel_day && (
                  <span className="text-xs uppercase tracking-wider text-torii ml-auto shrink-0">
                    Travel
                  </span>
                )}
              </li>
            ))}
          </ul>
          <Link
            to="/itinerary"
            className="flex items-center justify-between px-5 py-4 border border-ink/20 hover:border-ink/60 transition-colors group"
          >
            <div>
              <p className="font-display font-bold text-ink text-lg">View Full Itinerary</p>
              <p className="text-muted text-sm mt-0.5">All {trip.days.length} days · tap to explore each day</p>
            </div>
            <span className="text-ink/40 group-hover:text-ink transition-colors text-xl">→</span>
          </Link>
        </section>

        {/* Map CTA */}
        <section className="mb-12">
          <Link
            to="/map"
            className="flex items-center justify-between px-5 py-4 border border-ink/20 hover:border-ink/60 transition-colors group"
          >
            <div>
              <p className="font-display font-bold text-ink text-lg">Explore the Map</p>
              <p className="text-muted text-sm mt-0.5">{trip.days.reduce((sum, day) => sum + day.activities.length, 0)} locations · filter by day</p>
            </div>
            <span className="text-ink/40 group-hover:text-ink transition-colors text-xl">→</span>
          </Link>
        </section>

        {/* Food guide teaser */}
        <section className="mb-12">
          <h2 className="font-display text-subhead font-bold text-ink mb-3">
            Food Guide
          </h2>
          <p className="text-ink leading-relaxed">
            {foodGuide.cities.length} cities covered with restaurant recommendations.
          </p>
          <p className="text-muted mt-1 mb-4">
            First stop: <em className="text-ink">{firstRestaurant}</em> in {foodGuide.cities[0].name}
          </p>
          <Link
            to="/food"
            className="flex items-center justify-between px-5 py-4 border border-ink/20 hover:border-ink/60 transition-colors group"
          >
            <div>
              <p className="font-display font-bold text-ink text-lg">Explore Food Guide</p>
              <p className="text-muted text-sm mt-0.5">{foodGuide.cities.reduce((sum, c) => sum + c.restaurants.length, 0)} restaurants · {foodGuide.cities.length} cities</p>
            </div>
            <span className="text-ink/40 group-hover:text-ink transition-colors text-xl">→</span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-ink/10">
          <p className="text-muted text-sm">
            {trip.days.length} days · {trip.days.reduce((sum, day) => sum + day.activities.length, 0)} activities
          </p>
        </footer>

      </ReadingContainer>
    </div>
  )
}

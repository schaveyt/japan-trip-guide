# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test suite is configured. Deploy via Cloudflare Pages (auto-deploys on push to main).

## Architecture

Mobile-first Japan trip guide — React 19 + Vite + Tailwind v4, deployed to Cloudflare Pages.

### Routing (`src/main.jsx`)

The router is defined entirely in `main.jsx` — `App.jsx` is unused. Two-level structure:

- `/` — `Home` (editorial cover page, **no** bottom nav)
- `AppLayout` (pathless layout route wrapping all navigable pages — renders `<Outlet>` + `<BottomNav>`)
  - `/today` — `TodayPage`
  - `/itinerary` — `ItineraryPage`
  - `/itinerary/:dayNumber` — `DayDetailPage`
  - `/map` — `MapPage`
  - `/food` — `FoodPage`

### Data

All trip data lives in two JSON files:

- `src/data/itinerary.json` — 10-day itinerary; activities have `location.coordinates` in **GeoJSON order `[lng, lat]`**. Leaflet requires `[lat, lng]` — always use the `toLeaflet(coords)` helper in `TripMap.jsx` when passing coordinates to react-leaflet.
- `src/data/food-guide.json` — food recommendations for `FoodPage`

### Design System

Tailwind v4 with custom tokens defined in `src/index.css` under `@theme`:

| Token | Value | Usage |
|---|---|---|
| `font-display` | Playfair Display | Headlines |
| `font-body` | Roboto | Body text |
| `color-ink` | `#1A1A1A` | Primary text |
| `color-paper` | `#F8F7F4` | Page background |
| `color-muted` | `#8B8680` | Secondary text |
| `color-torii` | `#C73E3A` | Accents, active nav |
| `color-link` | `#2B4C7E` | Links |

Use `ReadingContainer` from `src/components/Layout.jsx` for any page body content — constrains width to 45rem (`--max-w-reading`) on desktop.

### Map

`TripMap` (`src/components/map/TripMap.jsx`) uses CARTO Voyager tiles. Day markers are color-coded by city: Fukuoka = torii red, Osaka = link blue, Kyoto = muted gray, Tokyo = ink. The `BoundsFitter` child component auto-fits map bounds on mount. `DayFilterBar` controls which days are visible via a `Set<number>` passed as `visibleDays`.

**Known Leaflet gotcha:** Tailwind's base reset applies `max-width: 100%` to `img`, which breaks map tile rendering. The fix is already in `src/index.css`:
```css
.leaflet-container img { max-width: none; max-height: none; }
```

### TodayPage States

`TodayPage` computes one of three states from the current date vs. `trip.start_date`:
- `pre-trip` — countdown + Day 1 preview
- `in-trip` — today's activities with "What's Next" highlight based on current hour
- `post-trip` — trip summary

Date math uses local midnight (not UTC) to avoid timezone drift. See `toLocalMidnight` and `parseLocalDate` helpers in `TodayPage.jsx`.

### Bundle Splitting

Vite is configured with manual chunks: `vendor` (react, react-dom, react-router) and `leaflet` (leaflet, react-leaflet) to keep the initial bundle small.

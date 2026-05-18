# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

**Local dev with API (requires both processes running simultaneously):**
```bash
npm run dev                          # Vite on :5173 — proxies /api → :8787
wrangler dev --port 8787 --local     # Worker + local D1 on :8787
```
Apply the D1 schema locally first if you haven't: `wrangler d1 migrations apply japan-trip --local`

No test suite is configured.

## Deployment

Hosted on **Cloudflare Workers** at https://japan-trip-guide.schaveyt.workers.dev. Auto-deploys on push to `main` via Workers Builds (Git-connected, not Direct Upload).

- **GitHub repo**: https://github.com/schaveyt/japan-trip-guide
- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy`
- **Manual deploy**: `npm run build && wrangler deploy` from local
- **Rollback**: `wrangler rollback` reverts to the previous Worker version

> Note: this uses **Workers Builds** (not the legacy Cloudflare Pages product). The deploy command must be `npx wrangler deploy`, NOT `npx wrangler pages deploy dist`.

### Cloudflare Resources

| Resource | Name | Binding |
|---|---|---|
| D1 Database | `japan-trip` | `env.DB` |
| R2 Bucket | `japan-trip-photos` | `env.PHOTOS` |
| Static Assets | `dist/` | `env.ASSETS` |

**Required Worker secrets** (set via `wrangler secret put <NAME>`):
- `TRAVELER_PASSCODE` — full read/write access (Todd + Jack)
- `GUEST_SHARE_CODE` — read-only access for family/friends
- `SESSION_SIGNING_KEY` — HMAC key for session cookies (32+ random bytes)

## Versioning

App version is managed in `package.json` and displayed on the Home cover page.

- Bump `package.json` version with every meaningful release
- **Always update `CHANGELOG.md`** at the repo root with a new version entry
- Follow [Keep a Changelog](https://keepachangelog.com) format: `Added / Changed / Fixed / Removed` sections under each `## [x.y.z] - YYYY-MM-DD` header

## Architecture

Mobile-first Japan trip guide — React 19 + Vite + Tailwind v4 + Cloudflare Worker backend (D1 + R2).

```
Request
  └── Worker (worker/index.js)
        ├── /api/*  → API handlers (notes, photos, auth)
        └── /*      → env.ASSETS.fetch() → SPA shell (dist/)
```

The Worker fronts both the API and the static SPA. `not_found_handling = "single-page-application"` on the assets binding handles SPA client-side routing on hard refresh.

### Routing (`src/main.jsx`)

Router defined entirely in `main.jsx`. `App.jsx` is unused. `ThemeProvider` is outermost, wrapping `AuthProvider`, which wraps `RouterProvider`.

- `/login` — `LoginPage` (no bottom nav, top-level like Home)
- `/` — `Home` (editorial cover page, **no** bottom nav)
- `AppLayout` (pathless layout — renders `<AuthBar>` + `<Outlet>` + `<BottomNav>`)
  - `/today` — `TodayPage`
  - `/itinerary` — `ItineraryPage`
  - `/itinerary/:dayNumber` — `DayDetailPage`
  - `/map` — `MapPage`
  - `/food` — `FoodPage`
  - `/activities` — `ActivitiesPage`
  - `/journal` — `JournalPage` (auth-gated: redirects to `/login` if not logged in)

### Auth Model

Three access tiers enforced by the Worker on every API request:

| Role | How to get it | Access |
|---|---|---|
| `traveler` | `TRAVELER_PASSCODE` | Full read/write, sees all notes/photos (published + private) |
| `guest` | `GUEST_SHARE_CODE` | Read-only, sees only published notes/photos |
| public | no code | Static pages (itinerary/map/food/today) only; `/api/*` returns 401 |

Sessions are **stateless signed cookies** (HMAC-SHA256, 90-day TTL). No session table in D1.

`whoAmI` (traveler name: `'todd'` or `'jack'`) is stored in `localStorage` — it's display-only attribution, not a security boundary. Cleared on logout.

Key files:
- `src/auth/AuthProvider.jsx` — context (`role`, `whoAmI`, `login()`, `logout()`, `setName()`)
- `src/auth/RequireRole.jsx` — client-side gate for write affordances
- `src/components/AuthBar.jsx` — slim status strip shown at top of all AppLayout pages
- `worker/auth.js` — `issueSession()`, `getSession()`, `timingSafeEqual()`, rate limiter
- `worker/index.js` — Worker entry, routes `/api/*` and falls through to ASSETS

### Data

**Static JSON (build-time):**
- `src/data/itinerary.json` — 11-day itinerary (May 19–29, 2026); activity coordinates in GeoJSON `[lng, lat]` order. Always use `toLeaflet(coords)` helper in `TripMap.jsx` when passing to react-leaflet.
- `src/data/food-guide.json` — restaurant guide for `FoodPage`
- `src/data/activities.json` — optional activities; IDs prefixed `act-` to avoid collision with itinerary activity IDs

**Hotel data (Worker-side static, never in client bundle):**
- `worker/hotels.js` — `HOTELS` array + `handleHotels()` request handler. Contains hotel names, cities, check-in/check-out dates, confirmation numbers, and GeoJSON coordinates. **IMPORTANT: confirmation numbers are sensitive — do not move this data into `src/data/` or any file that gets bundled into `dist/`.** Served only via `GET /api/hotels` after a valid session cookie.
- Hotels: Hilton Fukuoka Sea Hawk (May 20–22), DoubleTree Osaka Castle (May 22–24), DoubleTree Kyoto Station (May 24–26), DoubleTree Tokyo Ariake (May 26–29).
- Client-side: `src/hooks/useHotels.js` fetches from `/api/hotels` and caches in module state. `src/lib/hotelForDate.js` is a pure helper matching a date ISO string to the active hotel.

**Dynamic (D1 + R2):**
- Notes: `entity_type` + `entity_id` polymorphic FK. Day IDs: `day-{N}`. Itinerary activity IDs: e.g. `day3-fukuoka-castle`. Activities IDs: e.g. `act-day3-ohori-cycling`.
- Photos: stored in R2 at `photos/{uuid}.jpg`. Served via `GET /api/photos/:id/bytes` (auth-checked). Client resizes to max 2048px JPEG before upload — see `src/lib/imageResize.js`.
- Worker API: `src/lib/api.js` is the client-side fetch wrapper (handles credentials, `X-Author` header, error shapes).

### Theme System

3-state dark mode (`system` / `light` / `dark`) stored in `localStorage` under key `theme`.

- `src/theme/ThemeProvider.jsx` — context (`theme`, `resolvedTheme`, `setTheme()`); sets `document.documentElement.dataset.theme`; listens to `prefers-color-scheme` media query for system sync
- `src/components/ThemeToggle.jsx` — icon button cycling light → dark → system; used in `AuthBar` (all AppLayout pages) and floating in `Home` hero (top-right, visible when logged out)

### Design System

Tailwind v4 with custom tokens in `src/index.css` under `@theme`. Dark overrides declared in `[data-theme="dark"]` — all 5 color tokens flip automatically, no utility changes needed.

| Token | Light | Dark |
|---|---|---|
| `color-ink` | `#1A1A1A` | `#EDEAE3` |
| `color-paper` | `#F8F7F4` | `#16161A` |
| `color-muted` | `#8B8680` | `#9A958E` |
| `color-torii` | `#C73E3A` | `#E05551` |
| `color-link` | `#2B4C7E` | `#7FA4D4` |

`font-display` = Playfair Display (headlines), `font-body` = Roboto (body).

Use `ReadingContainer` from `src/components/Layout.jsx` for all page body content (constrains to 45rem on desktop). Journal components (`NotesList`, `PhotoGrid`) are reusable — used on both `DayDetailPage` and `JournalPage`.

### Map

`TripMap` (`src/components/map/TripMap.jsx`) uses CARTO Voyager tiles in light mode and CARTO `dark_all` in dark mode — switched via `useTheme()` with `key={resolvedTheme}` on `<TileLayer>` to force a re-fetch. Day markers color-coded by city: Fukuoka = torii red, Osaka = link blue, Kyoto = muted gray, Tokyo = ink.

**Known Leaflet gotcha:** Tailwind's base reset applies `max-width: 100%` to `img`, breaking map tile rendering. Fix already in `src/index.css`:
```css
.leaflet-container img { max-width: none; max-height: none; }
```

### TodayPage States

Computes one of three states from current date vs. `trip.start_date`:
- `pre-trip` — countdown + Day 1 preview
- `in-trip` — today's activities with "What's Next" highlight based on current hour
- `post-trip` — trip summary

Date math uses local midnight (not UTC) to avoid timezone drift. See `toLocalMidnight` and `parseLocalDate` helpers in `TodayPage.jsx`.

### Bundle Splitting

Vite manual chunks: `vendor` (react, react-dom, react-router) and `leaflet` (leaflet, react-leaflet).

### PWA / Service Worker

Workbox in `generateSW` mode. Key rules:
- `/api/*` is excluded from the SW via `navigateFallbackDenylist` — the SW never intercepts API calls
- `/api/photos/:id/bytes` is runtime-cached (CacheFirst, 30 days) — photo bytes are immutable per ID
- SW is only registered in production (`import.meta.env.PROD` guard in `main.jsx`) to avoid dev-mode staleness
- `vite.config.js` proxies `/api → http://localhost:8787` in dev so Vite and wrangler dev can run side-by-side

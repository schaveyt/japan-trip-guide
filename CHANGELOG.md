# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.4.0] - 2026-05-27

### Added
- **Photo ↔ Map integration** — two-way navigation between photos and the map
- **GPS extraction on upload** — EXIF GPS coordinates are read from each photo before the canvas strips them (via `exifr`); `lat`/`lng` stored in D1 alongside every uploaded photo that carries GPS metadata
- **Photo pins on map** — new "Photos" toggle in MapPage shows amber 📷 markers at each geotagged photo's exact location; clicking a pin shows a thumbnail popup with an "Open in Journal →" link back to the day
- **Map link in photo lightbox** — when a photo has GPS coordinates, a `📍 Map` button appears in the lightbox footer; tapping it navigates to the map, flies to that exact location, and opens the photo's pin popup automatically
- **`GET /api/photos/map-pins` endpoint** — returns lightweight `[{ id, lat, lng, entity_type, entity_id }]` for all geotagged photos without loading photo bytes; auth-gated

### Changed
- `POST /api/photos` now accepts optional `lat`/`lng` form fields and stores them in D1
- `GET /api/photos` response now includes `lat`/`lng` per photo
- `PATCH /api/photos/:id` now accepts optional `lat`/`lng` updates

## [1.3.3] - 2026-05-27

### Added
- **Batch photo upload** — `+ Photo` now accepts multiple selections at once; photos upload sequentially and appear in the grid as each one lands; button label shows `Uploading N of M…` progress; partial failures reported as `X of N failed — try those again`

## [1.3.2] - 2026-05-27

### Fixed
- **Photo upload on mobile** — removed `capture="environment"` from the photo file input so iOS/Android now shows the native sheet (Take Photo / Photo Library / Browse) instead of jumping straight to the camera; existing photos can now be selected from the library

## [1.3.1] - 2026-05-18

### Changed
- **Day 2 (May 20) itinerary** — expanded arrival day: added IC card/subway notes, Tenjin Underground City as optional evening activity, upgraded dinner to name Ichiran Ramen HQ and Canal City Ramen Stadium as specific options
- **Day 3 (May 21) itinerary** — restructured as "Okagaki Active Day Trip": JR train to Ebitsu Station, 12 km coastal cycling on Sanri Matsubara (bike rental details + pricing), Mt. Yukawa hike (470m, Ghost Slope, Narita-san Fudoji temple en route), SUP & surfing at RUN'A WAVE surf school (phone + website included); Ichiran and Canal City Ramen Stadium kept as city-day alternatives; yatai evening kept
- **Day 4 (May 22) itinerary** — added Ohori Park cycling loop as early morning activity before checkout/shinkansen; moved from Day 3

## [1.3.0] - 2026-05-18

### Added
- **Hotel info on Map page** — teal house-icon pins for all 4 hotels; Hotels toggle visible only when authenticated; popup shows name, address, check-in/out dates, and confirmation number
- **Hotel card on Day Detail pages** — "Tonight's Stay" card with hotel name, address, dates, and conf# shown to authenticated users (guest+); omitted on travel days or days with no lodging match
- **Tonight's hotel on Today page** — compact "Tonight" card in the in-trip state; "Night 1 Lodging" teaser shown in the pre-trip countdown for authenticated users
- **`/api/hotels` Worker endpoint** — returns full hotel array (name, city, dates, conf#, coordinates) for any authenticated session; returns 401 for public requests
- **Hotel data in Worker** (`worker/hotels.js`) — confirmation numbers never bundled in the client; served only after session cookie passes the role gate

## [1.2.0] - 2026-05-18

### Added
- **Dark mode** — 3-state theme toggle (`system` / `light` / `dark`) stored in `localStorage`; defaults to OS preference via `prefers-color-scheme`
- **Theme toggle** — floating button in the Home hero (top-right) and inline in the AuthBar on all other pages; cycles sun → moon → monitor icons
- **Dark palette** — warm off-black surface (`#16161A`), off-white text (`#EDEAE3`), lifted muted (`#9A958E`), brightened torii red (`#E05551`), accessible link blue (`#7FA4D4`)
- **Dark map tiles** — CARTO `dark_all` tiles load automatically when dark mode is active; pin shadows invert for legibility
- **Browser chrome sync** — dual `theme-color` meta tags for iOS Safari / Android Chrome address bar; manual override injected dynamically

### Changed
- Body gains a `200ms` background/color cross-fade transition on theme switch
- Map popup labels now use `var(--color-muted)` token instead of hardcoded hex
- Error page muted text now uses `text-muted` class instead of hardcoded `#999`

## [1.1.0] - 2026-05-18

### Added
- **Trip journal** — notes and photos attached to any itinerary day, visible inline on Today, Day Detail, and the new Journal tab
- **Photo uploads** — travelers can upload photos from their phone; client-side resize (max 2048px, JPEG) and EXIF strip before upload; stored in Cloudflare R2
- **Publish/private toggle** — each note and photo defaults to private (travelers only); travelers can publish individual items to make them visible to guests
- **Three-tier auth** — traveler passcode (full read/write), guest share code (read-only published items), public (itinerary/map/food still accessible without any code)
- **Auth bar** — slim persistent strip on all nav pages showing current user, role (Traveler / Guest), and Sign out button
- **Login/logout on Home** — Sign In card when logged out, signed-in status card with Sign out button when logged in
- **Journal tab** — replaces the Activities tab in bottom nav; day-grouped feed of all notes and photos; Activities still accessible from the Itinerary page
- **Cloudflare Worker backend** — D1 database (notes, photos tables) + R2 bucket; Worker fronts both the API and static SPA assets
- **Offline-aware writes** — compose and upload buttons disabled when offline; note drafts autosaved to localStorage to prevent loss

### Changed
- Worker deployment model switched from pure static assets to a Worker script with ASSETS binding, enabling the API layer while preserving SPA routing

## [1.0.1] - 2026-03-31

### Fixed
- Hero banner was excessively tall on wide desktop screens — `aspect-ratio: 16/9` at 1440px width produced an 810px hero on a 900px viewport. Added `max-h-[70vh]` cap to `HeroImage` container.
- "Traveling as …" text on Home page now renders on its own line for better readability.

## [1.0.0] - 2026-03-31

### Added
- 11-day itinerary (May 19–29, 2026): Fukuoka → Osaka → Kyoto → Tokyo
- Day-by-day detail pages with activities, timing, and map locations
- Interactive map with city color-coding and day filter bar (Leaflet + CARTO tiles)
- Food guide covering 4 cities with restaurant recommendations
- TodayPage with pre-trip countdown, in-trip live view, and post-trip summary
- PWA support — offline-capable via Workbox service worker
- App version displayed on Home cover page (sourced from package.json)
- Cloudflare Workers deployment with GitHub auto-deploy on push to main

### Fixed
- Favicon was pointing to Vite's default `vite.svg` instead of `favicon.ico`
- PWA icons (192x192, 512x512, etc.) returning 404 in production — `*.png` was gitignored by a leftover Playwright rule, preventing icons from reaching Cloudflare's CI build

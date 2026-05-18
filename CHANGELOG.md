# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

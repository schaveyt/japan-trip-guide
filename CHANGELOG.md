# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

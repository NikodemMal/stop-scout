# Stop Scout

A PWA with live bus and tram departures in Gdansk, built on the city's open
transit data. Works offline.

<!-- After deploying, add the link and a screenshot:
**[Live demo](https://stop-scout.vercel.app)**

![Stop Scout](docs/screenshot.png)
-->

## Features

- Live departure board with delays, refreshed every 10 seconds
- Search across ~1500 ZTM stops in the Gdansk area
- Favourite stops, stored per user
- Offline mode: the last known departures stay visible, and the board says
  the data is stale instead of showing it as current
- Installable as a Progressive Web App

## Caching

Caching runs on two levels.

**Service worker (Workbox):**

| Resource | Strategy | Reason |
|---|---|---|
| `/departures` | `NetworkFirst`, 5 min | departures change constantly, cache is only a safety net |
| `/stops.json` | `CacheFirst`, 24 h | the stop list changes once a day |

**Application level:** `src/services/departuresApi.js` catches a failed request,
reads the last response from IndexedDB (Dexie) and returns
`{ departures, fromCache, updatedAt }`.

The second level is needed because the service worker is not active on the
first visit, and a request that fails mid-flight still has to resolve to
something the UI can render. `fromCache` is what lets the board show an
"Offline" badge with a timestamp rather than passing stale times off as live.

Covered by `src/services/departuresApi.test.js`.

## Stack

Vue 3 (`<script setup>`), Vite, Pinia, Vue Router, Tailwind CSS,
Dexie (IndexedDB), vite-plugin-pwa (Workbox), Vitest.

## Running locally

```bash
npm install
npm run dev     # dev server
npm test        # unit tests
npm run build   # production build
```

## The stop list

The raw dump from Otwarty Gdansk is about 14.4 MB: 16 timetable days, roughly
2600 stops each, 23 fields per stop. The app uses one day and five fields.

`npm run trim-stops` cuts `public/stops.json` down to the newest day and the
fields that are actually rendered, which brings it to about 0.16 MB.

## Known limitations

This started as a university project and the scope reflects that:

- Authentication is client-side. Users live in IndexedDB and passwords are
  hashed with `bcryptjs` in the browser. There is no backend, so this shows the
  login flow and password hashing, not a usable auth system. Real auth needs a
  server, HTTP-only cookies or tokens, and rate limiting.
- The stop list is a snapshot refreshed by re-running the trim script, not a
  live feed.
- Search results are capped at 20 items instead of virtualised.
- The PWA icon is an SVG. App stores would need 192 and 512 px rasters.

## Data

Transit data comes from [Otwarte dane ZTM w Gdansku](https://ckan.multimediagdansk.pl/dataset/tristar),
published by the City of Gdansk under a Creative Commons Attribution licence.
Using it means accepting the terms published with the dataset.

The user interface is in Polish.

## Licence

MIT, see [LICENSE](LICENSE). Covers the code in this repository, not the
transit data.

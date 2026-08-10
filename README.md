# Stop Scout

A PWA with live bus and tram departures in Gdansk, built on the city's open
transit data. Works offline.

<!-- After deploying, add the link and a screenshot:
**[Live demo](https://stop-scout.vercel.app)**

![Stop Scout](docs/screenshot.png)
-->

## Features

- Live departure board with delays, refreshed every 10 seconds
- Search across the ZTM stop list, diacritic-insensitive, so "gdansk" finds "Gdańsk"
- Favourite stops, stored per user
- Offline mode: the last known departures stay visible and are labelled as such
- Installable as a Progressive Web App

## Caching, and what the labels mean

Departures and the stop list are cached differently on purpose.

**The stop list** goes through the service worker with `StaleWhileRevalidate`:
served from cache immediately, refreshed in the background when there is a
network. Cache-first with an expiry was the obvious choice and the wrong one,
because Workbox treats an aged-out entry as a miss and falls through to the
network, which broke the stop list offline after a day.

**Departures are deliberately not handled by the service worker.** A
`NetworkFirst` route there resolves an offline request with `ok: true` from its
own cache, so the app cannot tell a live response from a cached one and would
present minutes-old times as current. They are cached in IndexedDB (Dexie)
instead, where the app owns the metadata and can label what it is showing.

`fetchDepartures` therefore reports one of three states, because they need
different messages:

| `status` | Meaning | Shown as |
|---|---|---|
| `live` | fresh from the API | no badge |
| `offline` | request failed, `navigator.onLine` is false | amber "Brak sieci - dane z HH:MM" |
| `error` | request failed while online, so the ZTM service is down | red "Serwis ZTM nie odpowiada" |

Collapsing the last two into one "offline" message tells a user with a working
connection to go and fix their connection.

The cache write sits outside the request's `try`, so a storage failure (private
browsing, blocked site data, quota) cannot discard a response that arrived
successfully.

All of this is covered by `src/services/departuresApi.test.js`.

## Delays

ZTM sends `delayInSeconds`, including negative values for a vehicle running
ahead of its timetable, so an early departure is real data rather than a bug.

The board prints minutes, not raw seconds: `+403s` is a number the passenger
has to convert. Anything under a minute reads "punktualnie", because departure
times are rendered to the minute anyway, so a smaller deviation cannot be seen
in the time itself and the values jitter by a few seconds between polls. The
colour is driven by the same threshold, so the text and the colour can never
disagree.

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
2600 stops each, 23 fields per stop. The app uses one day and six fields.

`npm run trim-stops` reduces `public/stops.json` to the newest day and the
fields that are rendered, which brings it to about 0.15 MB.

Entries are individual poles, not stops: 1530 poles carry 696 distinct names,
and 535 of those names are used more than once. "Dworzec Główny" alone is
twelve poles, so the name cannot identify a row on its own.

The list therefore shows `subName`, the pole number printed on the physical
sign, which is set for all 1530 entries, next to the vehicle type.

`stopDesc` was doing this job first and was the wrong field for it. Counted
across the 1530 poles it splits into three groups, none of which identifies
anything:

| Group | Count | Example |
|---|---|---|
| identical to the name | 911 | all twelve at Dworzec Główny |
| the name plus a city `zoneName` already gives | 585 | `Kameliowa` → `Gdynia Kameliowa` |
| a spelling variant of the same name | 34 | `al. Płażyńskiego` → `Aleja Płażyńskiego` |

So the rows it was meant to separate were exactly the rows it could not, and
where it did render it printed the name a second time. The field is dropped.

The one fact buried in it was the `(N/Ż)` request-stop marker, which `onDemand`
carries as a boolean, so that is kept and shown as "na żądanie" instead. The
two disagree, and neither is authoritative: 414 poles carry the marker in
`stopDesc` while 366 have `onDemand` set, overlapping on 361. The boolean is
used because it is the field meant for this, not because it is provably right.

Name plus pole number still collides 22 times out of 1530. Those need the
coordinates, which the trim script drops.

## Known limitations

This started as a university project and the scope reflects that:

- Authentication is client-side. Users live in IndexedDB and passwords are
  hashed with `bcryptjs` in the browser. Only `{ id, username }` is kept in
  localStorage, never the hash, but there is still no backend: this shows the
  login flow, not a usable auth system. Real auth needs a server, HTTP-only
  cookies or tokens, and rate limiting.
- The stop list is a snapshot refreshed by re-running the trim script, not a
  live feed.
- Search results are capped at 20 items instead of virtualised.
- Polling pauses on a hidden tab, but each favourite still polls on its own
  timer rather than through one batched request.
- The PWA icon is an SVG. App stores would need 192 and 512 px rasters.

## Data

Transit data comes from [Otwarte dane ZTM w Gdansku](https://ckan.multimediagdansk.pl/dataset/tristar),
published by the City of Gdansk under a Creative Commons Attribution licence.
Using it means accepting the terms published with the dataset.

The user interface is in Polish.

## Licence

MIT, see [LICENSE](LICENSE). Covers the code in this repository, not the
transit data.

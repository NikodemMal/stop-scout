/**
 * Shrinks public/stops.json to what the app actually renders.
 *
 * The raw Otwarty Gdansk dump holds 16 timetable days, ~2600 stops each,
 * 23 fields per stop. We render one day and five fields.
 *
 * Usage: node scripts/trim-stops.mjs [input] [output]
 */

import { readFileSync, writeFileSync, statSync } from 'node:fs'

const INPUT = process.argv[2] ?? 'public/stops.json'
const OUTPUT = process.argv[3] ?? 'public/stops.json'

// stopDesc and zoneName stay because Gdansk has plenty of stops sharing a name.
const KEPT_FIELDS = ['stopId', 'stopName', 'stopDesc', 'zoneName', 'type']

const sizeInMb = (path) => (statSync(path).size / 1024 / 1024).toFixed(2)

const raw = JSON.parse(readFileSync(INPUT, 'utf8'))

// Keys are ISO dates, so sorting them as strings sorts them by date.
const newestDate = Object.keys(raw).sort().at(-1)

if (!newestDate) {
  throw new Error(`No timetable day found in ${INPUT}`)
}

const day = raw[newestDate]
const seen = new Set()
const stops = []

for (const stop of day.stops ?? []) {
  if (seen.has(stop.stopId)) continue
  seen.add(stop.stopId)

  stops.push(Object.fromEntries(KEPT_FIELDS.map((field) => [field, stop[field]])))
}

const before = sizeInMb(INPUT)

writeFileSync(
  OUTPUT,
  JSON.stringify({ [newestDate]: { lastUpdate: day.lastUpdate, stops } })
)

console.log(
  `${INPUT} (${before} MB) -> ${OUTPUT} (${sizeInMb(OUTPUT)} MB)\n` +
    `day: ${newestDate}, unique stops: ${stops.length}`
)

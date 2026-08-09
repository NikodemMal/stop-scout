import { db } from './db'

const DEPARTURES_URL = 'https://ckan2.multimediagdansk.pl/departures'

/**
 * Departures for a stop, falling back to the local cache when the request fails.
 *
 * The return shape is the same either way, so the UI can tell "we are offline,
 * this is the last known state" from "we are online and nothing is due".
 * Without the flag both look the same and stale times read as live ones.
 *
 * @returns {Promise<{departures: Array, fromCache: boolean, updatedAt: number|null}>}
 */
export const fetchDepartures = async (stopId) => {
  try {
    const response = await fetch(`${DEPARTURES_URL}?stopId=${stopId}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const departures = data.departures ?? []
    const updatedAt = Date.now()

    await db.departures.put({ stopId, data: departures, updatedAt })

    return { departures, fromCache: false, updatedAt }
  } catch {
    const cached = await db.departures.get(stopId)

    return {
      departures: cached?.data ?? [],
      fromCache: true,
      updatedAt: cached?.updatedAt ?? null
    }
  }
}

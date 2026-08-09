import { db } from './db'

const DEPARTURES_URL = 'https://ckan2.multimediagdansk.pl/departures'

/**
 * Departures for a stop.
 *
 * `status` says which of three things happened, because they need different
 * messages in the UI:
 *   'live'    fresh from the API
 *   'offline' the request failed and the device has no network
 *   'error'   the request failed while the device is online, so the ZTM
 *             service is the problem
 *
 * Reporting a server outage as "offline" tells the user to check a connection
 * that is already working, so the two are kept apart.
 *
 * @returns {Promise<{departures: Array, status: 'live'|'offline'|'error', updatedAt: number|null}>}
 */
export const fetchDepartures = async (stopId) => {
  let departures

  try {
    const response = await fetch(`${DEPARTURES_URL}?stopId=${stopId}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    departures = (await response.json()).departures ?? []
  } catch (error) {
    console.warn(`Departures request for stop ${stopId} failed:`, error)

    return readFromCache(stopId)
  }

  const updatedAt = Date.now()

  // Deliberately outside the request try/catch. Storage can fail on its own
  // (private browsing, blocked site data, quota) and that must not throw away
  // departures we already hold, nor be reported as a failed request.
  try {
    await db.departures.put({ stopId, data: departures, updatedAt })
  } catch (error) {
    console.warn(`Could not cache departures for stop ${stopId}:`, error)
  }

  return { departures, status: 'live', updatedAt }
}

const readFromCache = async (stopId) => {
  const status = navigator.onLine ? 'error' : 'offline'

  try {
    const cached = await db.departures.get(stopId)

    return {
      departures: cached?.data ?? [],
      status,
      updatedAt: cached?.updatedAt ?? null
    }
  } catch (error) {
    // The caller relies on this function always resolving, so a broken
    // IndexedDB must not turn into a rejected promise every 10 seconds.
    console.warn(`Could not read cached departures for stop ${stopId}:`, error)

    return { departures: [], status, updatedAt: null }
  }
}

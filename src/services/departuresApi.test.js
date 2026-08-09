import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('./db', () => ({
  db: {
    departures: {
      put: vi.fn(),
      get: vi.fn()
    }
  }
}))

const { db } = await import('./db')
const { fetchDepartures } = await import('./departuresApi')

const DEPARTURE = { id: 'a1', routeId: '158', headsign: 'Gdansk Glowny', delayInSeconds: 60 }
const CACHED = { data: [DEPARTURE], updatedAt: 1_700_000_000_000 }

const setOnline = (value) =>
  Object.defineProperty(navigator, 'onLine', { value, configurable: true })

const respondWith = (departures) =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => ({ departures }) })

describe('fetchDepartures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setOnline(true)
    db.departures.put.mockResolvedValue(undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns live departures and caches them', async () => {
    vi.stubGlobal('fetch', respondWith([DEPARTURE]))

    const result = await fetchDepartures(1993)

    expect(result).toEqual({
      departures: [DEPARTURE],
      status: 'live',
      updatedAt: expect.any(Number)
    })
    expect(db.departures.put).toHaveBeenCalledWith(
      expect.objectContaining({ stopId: 1993, data: [DEPARTURE] })
    )
  })

  // A failing cache write used to land in the same catch as a failing request,
  // so a successful fetch was thrown away and reported as offline.
  it('keeps live departures when the cache write fails', async () => {
    vi.stubGlobal('fetch', respondWith([DEPARTURE]))
    db.departures.put.mockRejectedValue(new Error('QuotaExceededError'))

    const result = await fetchDepartures(1993)

    expect(result.departures).toEqual([DEPARTURE])
    expect(result.status).toBe('live')
  })

  it('reports a lost connection as offline', async () => {
    setOnline(false)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    db.departures.get.mockResolvedValue(CACHED)

    const result = await fetchDepartures(1993)

    expect(result).toEqual({
      departures: [DEPARTURE],
      status: 'offline',
      updatedAt: CACHED.updatedAt
    })
    expect(db.departures.put).not.toHaveBeenCalled()
  })

  // A 503 from the ZTM service used to be labelled "offline", which tells the
  // user to fix a connection that is working fine.
  it('reports a server failure as an error, not as offline', async () => {
    setOnline(true)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    db.departures.get.mockResolvedValue(CACHED)

    const result = await fetchDepartures(1993)

    expect(result.status).toBe('error')
    expect(result.departures).toEqual([DEPARTURE])
  })

  it('returns an empty list when there is neither network nor cache', async () => {
    setOnline(false)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    db.departures.get.mockResolvedValue(undefined)

    const result = await fetchDepartures(1993)

    expect(result).toEqual({ departures: [], status: 'offline', updatedAt: null })
  })

  // The board polls this every 10 s with no handler, so a rejection here would
  // become an unhandled rejection on repeat.
  it('resolves rather than rejecting when the cache read also fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    db.departures.get.mockRejectedValue(new Error('DatabaseClosedError'))

    await expect(fetchDepartures(1993)).resolves.toEqual({
      departures: [],
      status: 'error',
      updatedAt: null
    })
  })
})

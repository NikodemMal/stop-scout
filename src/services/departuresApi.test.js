import { describe, it, expect, vi, beforeEach } from 'vitest'

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

describe('fetchDepartures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns departures from the network and caches them', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ departures: [DEPARTURE] })
      })
    )

    const result = await fetchDepartures(1993)

    expect(result.departures).toEqual([DEPARTURE])
    expect(result.fromCache).toBe(false)
    expect(db.departures.put).toHaveBeenCalledWith(
      expect.objectContaining({ stopId: 1993, data: [DEPARTURE] })
    )
  })

  // This is what the whole offline story rests on: when the network dies,
  // the user sees the last known timetable instead of an empty board.
  it('falls back to the cache and marks the result as stale', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
    db.departures.get.mockResolvedValue({ data: [DEPARTURE], updatedAt: 1_700_000_000_000 })

    const result = await fetchDepartures(1993)

    expect(result.departures).toEqual([DEPARTURE])
    expect(result.fromCache).toBe(true)
    expect(result.updatedAt).toBe(1_700_000_000_000)
    expect(db.departures.put).not.toHaveBeenCalled()
  })

  it('treats a non-OK response the same as no network', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    db.departures.get.mockResolvedValue({ data: [DEPARTURE], updatedAt: 1 })

    const result = await fetchDepartures(1993)

    expect(result.fromCache).toBe(true)
    expect(result.departures).toEqual([DEPARTURE])
  })

  it('returns an empty list when there is neither network nor cache', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
    db.departures.get.mockResolvedValue(undefined)

    const result = await fetchDepartures(1993)

    expect(result.departures).toEqual([])
    expect(result.fromCache).toBe(true)
    expect(result.updatedAt).toBeNull()
  })
})

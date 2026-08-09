import { describe, it, expect, vi } from 'vitest'

import { fetchStops } from './ztmApi'

const stopsFile = {
  '2026-05-16': { stops: [{ stopId: 1, stopName: 'Oldest day' }] },
  '2026-05-31': { stops: [{ stopId: 2, stopName: 'Newest day' }] },
  '2026-05-20': { stops: [{ stopId: 3, stopName: 'Middle day' }] }
}

describe('fetchStops', () => {
  // Regression: this used to be Object.keys(data)[0], so it picked the
  // oldest day even though the variable was called latestKey.
  it('picks the newest day, not the first key in the file', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => stopsFile })
    )

    const stops = await fetchStops()

    expect(stops).toEqual([{ stopId: 2, stopName: 'Newest day' }])
  })

  it('throws on a failed HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))

    await expect(fetchStops()).rejects.toThrow(/404/)
  })

  it('returns an empty list when the day has no stops', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ '2026-05-31': {} }) })
    )

    await expect(fetchStops()).resolves.toEqual([])
  })
})

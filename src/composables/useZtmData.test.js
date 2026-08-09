import { describe, it, expect, vi } from 'vitest'

import { useZtmData } from './useZtmData'

describe('useZtmData', () => {
  it('stores the result and clears the error state', async () => {
    const fetchFunction = vi.fn().mockResolvedValue([{ stopId: 1 }])

    const { data, loading, error, load } = useZtmData(fetchFunction)

    expect(loading.value).toBe(false)

    await load()

    expect(data.value).toEqual([{ stopId: 1 }])
    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('exposes the error message when the fetching function throws', async () => {
    const fetchFunction = vi.fn().mockRejectedValue(new Error('No network'))

    const { error, loading, load } = useZtmData(fetchFunction)

    await load()

    expect(error.value).toBe('No network')
    // loading has to go back to false on the failure path too, otherwise
    // the view is stuck on the loading message forever.
    expect(loading.value).toBe(false)
  })

  it('passes arguments through to the fetching function', async () => {
    const fetchFunction = vi.fn().mockResolvedValue([])

    const { load } = useZtmData(fetchFunction)

    await load(1993, 'extra')

    expect(fetchFunction).toHaveBeenCalledWith(1993, 'extra')
  })
})

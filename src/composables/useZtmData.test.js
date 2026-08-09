import { describe, it, expect, vi, afterEach } from 'vitest'

import { useZtmData } from './useZtmData'

describe('useZtmData', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores the result and clears the error state', async () => {
    const fetchFunction = vi.fn().mockResolvedValue([{ stopId: 1 }])

    const { data, loading, error, load } = useZtmData(fetchFunction)

    expect(loading.value).toBe(false)

    await load()

    expect(data.value).toEqual([{ stopId: 1 }])
    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  // The raw message is an English engine string, so it must not reach the
  // Polish interface; it belongs in the console.
  it('shows an interface-language message and logs the real error', async () => {
    const cause = new TypeError('Failed to fetch')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { error, loading, load } = useZtmData(vi.fn().mockRejectedValue(cause))

    await load()

    expect(error.value).toBe('Błąd pobierania danych')
    expect(consoleError).toHaveBeenCalledWith(cause)
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

import { describe, it, expect } from 'vitest'

import { formatDelay } from './delay'

describe('formatDelay', () => {
  it('reports a late departure in minutes', () => {
    expect(formatDelay(403)).toBe('+7 min')
  })

  it('reports an early departure in minutes', () => {
    // ZTM sends negative values for a vehicle ahead of its timetable.
    expect(formatDelay(-250)).toBe('-4 min')
  })

  it('calls a sub-minute deviation on time', () => {
    expect(formatDelay(30)).toBe('punktualnie')
    expect(formatDelay(-30)).toBe('punktualnie')
    expect(formatDelay(0)).toBe('punktualnie')
  })

  it('treats a full minute as a delay, not as on time', () => {
    expect(formatDelay(60)).toBe('+1 min')
    expect(formatDelay(-60)).toBe('-1 min')
  })

  it('returns nothing when the API omits the field', () => {
    // The board renders whatever comes back, so a missing delay must not
    // become "NaN min" on screen.
    expect(formatDelay(undefined)).toBe('')
    expect(formatDelay(null)).toBe('')
    expect(formatDelay(Number.NaN)).toBe('')
  })
})

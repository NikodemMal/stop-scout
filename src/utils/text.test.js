import { describe, it, expect } from 'vitest'

import { fold } from './text'

describe('fold', () => {
  // Nobody types Polish diacritics on a phone keyboard, and the stop list is
  // full of them, so an exact-match search finds nothing for most queries.
  it('matches a query typed without diacritics', () => {
    expect(fold('Gdańsk')).toBe(fold('gdansk'))
    expect(fold('Żaglowa - AmberExpo')).toContain('zaglowa')
    expect(fold('al. Płażyńskiego')).toContain('plazynskiego')
  })

  it('lowercases', () => {
    expect(fold('Dworzec Główny')).toBe('dworzec glowny')
  })

  it('handles missing values', () => {
    expect(fold(undefined)).toBe('')
    expect(fold(null)).toBe('')
  })
})

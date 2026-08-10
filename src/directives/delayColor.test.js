import { describe, it, expect } from 'vitest'

import { delayColor } from './delayColor'

const createElement = () => ({ style: {} })

describe('v-delay-color', () => {
  it('paints a late departure red', () => {
    const el = createElement()

    delayColor.mounted(el, { value: 120 })

    expect(el.style.color).toBe('red')
  })

  it('paints an early departure green', () => {
    const el = createElement()

    delayColor.mounted(el, { value: -120 })

    expect(el.style.color).toBe('green')
  })

  it('leaves an on-time departure white', () => {
    const el = createElement()

    delayColor.mounted(el, { value: 0 })

    expect(el.style.color).toBe('white')
  })

  it('leaves a sub-minute deviation white, matching what the board prints', () => {
    const el = createElement()

    delayColor.mounted(el, { value: 30 })
    expect(el.style.color).toBe('white')

    delayColor.updated(el, { value: -30 })
    expect(el.style.color).toBe('white')
  })

  it('recolours when the value changes', () => {
    const el = createElement()

    delayColor.mounted(el, { value: 60 })
    expect(el.style.color).toBe('red')

    delayColor.updated(el, { value: 0 })
    expect(el.style.color).toBe('white')
  })
})

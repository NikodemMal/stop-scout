import { ON_TIME_WITHIN_SECONDS } from '../utils/delay'

// The threshold is shared with formatDelay on purpose: a deviation the board
// spells out as "punktualnie" must not be painted red or green underneath it.
const setColor = (el, delay) => {
  if (delay >= ON_TIME_WITHIN_SECONDS) {
    el.style.color = 'red'
  }

  else if (delay <= -ON_TIME_WITHIN_SECONDS) {
    el.style.color = 'green'
  }

  else {
    el.style.color = 'white'
  }
}

export const delayColor = {
  mounted(el, binding) {
    setColor(el, binding.value)
  },

  updated(el, binding) {
    setColor(el, binding.value)
  }
}

const setColor = (el, delay) => {
  if (delay > 0) {
    el.style.color = 'red'
  }

  else if (delay < 0) {
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
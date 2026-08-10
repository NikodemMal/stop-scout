/**
 * The board renders times to the minute, so a deviation under a minute cannot
 * be seen in the time itself. Reporting it as a delay is noise, and ZTM values
 * jitter by a few seconds between polls.
 */
export const ON_TIME_WITHIN_SECONDS = 60

/**
 * A delay in seconds, as something readable while standing at a stop.
 *
 * ZTM reports whole seconds and does use negative values for a vehicle running
 * ahead of its timetable, so an early departure is real data, not a bug.
 * "+403s" is still a number the passenger has to convert; "+7 min" is not.
 */
export const formatDelay = (seconds) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return ''

  if (Math.abs(seconds) < ON_TIME_WITHIN_SECONDS) return 'punktualnie'

  const minutes = Math.round(Math.abs(seconds) / 60)

  return `${seconds > 0 ? '+' : '-'}${minutes} min`
}

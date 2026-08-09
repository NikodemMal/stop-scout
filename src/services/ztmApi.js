/**
 * Stop list from Otwarty Gdansk, trimmed by scripts/trim-stops.mjs
 * to a single day.
 */
export const fetchStops = async () => {
  const response = await fetch('/stops.json')

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać listy przystanków (HTTP ${response.status})`)
  }

  const data = await response.json()

  // Keys are ISO dates, so sorting them as strings sorts them by date.
  // This used to be Object.keys(data)[0], which picked the oldest day.
  const newestDate = Object.keys(data).sort().at(-1)

  return data[newestDate]?.stops ?? []
}

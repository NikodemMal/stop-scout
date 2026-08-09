export const fetchStops = async () => {
  try {
    const response = await fetch('/stops.json')
    const data = await response.json()

    console.log('RAW DATA:', data)

    const latestKey = Object.keys(data)[0]

    console.log('LATEST KEY:', latestKey)

    const stopsData = data[latestKey]?.stops || []

    return stopsData
  } catch (error) {
    console.error(error)
    return []
  }
}
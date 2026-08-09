import { db } from './db'

export const fetchDepartures = async (stopId) => {
    try {
    const res = await fetch(
      `https://ckan2.multimediagdansk.pl/departures?stopId=${stopId}`
    )

    const data = await res.json()

    console.log('DEPARTURES RAW:', data)

    await db.departures.put({
      stopId,
      data: data.departures,
      updatedAt: Date.now()
    })

    return data.departures || []
  }

  catch (err) {
    console.log('OFFLINE MODE')

    const cached = await db.departures.get(stopId)

    return cached?.data || []
  }
}
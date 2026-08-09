import Dexie from 'dexie'

export const db = new Dexie('StopScoutDB')

db.version(2).stores({
  users: '++id, username, password',

  favoriteStops: '++id, userId, stopId, stopName',
  departures: 'stopId, updatedAt'
})
import Dexie from 'dexie'

export const db = new Dexie('StopScoutDB')

db.version(2).stores({
  users: '++id, username, password',
  favoriteStops: '++id, userId, stopId, stopName',
  departures: 'stopId, updatedAt'
})

// v3 drops the index over the password hashes, which served no query, and
// makes username unique so the read-then-write check in RegisterView cannot
// race two tabs into two accounts sharing one login.
db.version(3).stores({
  users: '++id, &username',
  favoriteStops: '++id, userId, stopId, stopName',
  departures: 'stopId, updatedAt'
})

import { defineStore } from 'pinia'

const STORAGE_KEY = 'user'

// The store is first instantiated inside the router guard, so anything that
// throws here aborts navigation and leaves a blank page with no way back.
const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch (error) {
    console.warn('Discarding unreadable stored session:', error)
    localStorage.removeItem(STORAGE_KEY)

    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readStoredUser()
  }),

  actions: {
    login(user) {
      // Only what the app actually uses. The record from Dexie also carries
      // the bcrypt hash, which has no reason to sit in localStorage where any
      // extension or injected script can read it.
      this.user = { id: user.id, username: user.username }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user))
    },

    logout() {
      this.user = null
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})

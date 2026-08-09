<script setup>
import { onMounted, ref } from 'vue'

import { fetchStops } from '../services/ztmApi'
import { db } from '../services/db'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import DeparturesBoard from '../components/DeparturesBoard.vue'
import { computed } from 'vue'
import { useZtmData } from '../composables/useZtmData'
const auth = useAuthStore()
const router = useRouter()

const {
  data: rawStops,
  loading,
  error,
  load
} = useZtmData(fetchStops)

const favoriteStops = ref([])
const searchQuery = ref('')

const stops = computed(() => {
  return Array.from(
    new Map(
      (rawStops.value || []).map(stop => [stop.stopId, stop])
    ).values()
  )
})
// stop name filtering
const filteredStops = computed(() => {
  if (!searchQuery.value) return stops.value

  return stops.value.filter(stop =>
    stop.stopName
      ?.toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  )
})

const logout = () => {
  auth.logout()
  router.push('/login')
}

// const loadStops = async () => {
//   const data = await fetchStops()

//   console.log('STOPS:', data)

//   stops.value = data || []
// }

const loadFavorites = async () => {
  if (!auth.user) return

  favoriteStops.value = await db.favoriteStops
    .where('userId')
    .equals(auth.user.id)
    .toArray()
}

const addFavorite = async (stop) => {
  if (!auth.user) {
    alert('Najpierw się zaloguj')
    return
  }

  await db.favoriteStops.add({
    userId: auth.user.id,
    stopId: stop.stopId,
    stopName: stop.stopName
  })

  await loadFavorites()
}

const removeFavorite = async (id) => {
  await db.favoriteStops.delete(id)

  await loadFavorites()
}

onMounted(async () => {
  await load()
  await loadFavorites()
})
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-8">

    <h1 class="text-4xl font-bold mb-6">
      Stop Scout 🚋
    </h1>

    <div class="mb-10">
      <h2 class="text-2xl mb-4">
        Ulubione przystanki
      </h2>

      <div
        v-for="favorite in favoriteStops"
        :key="favorite.id"
        class="bg-slate-800 p-4 rounded-xl mb-4"
      >

        <div class="flex justify-between items-center mb-2">
          <span>
            {{ favorite.stopName }}
          </span>

          <button
            @click="removeFavorite(favorite.id)"
            class="bg-red-600 px-4 py-2 rounded"
          >
            Usuń
          </button>
        </div>

        <DeparturesBoard
          :stopId="favorite.stopId"
          :stopName="favorite.stopName"
        />

      </div>
    </div>

    <div>
      <h2 class="text-2xl mb-4">
        Lista przystanków
      </h2>

      <p class="mb-4">
        Liczba przystanków: {{ stops.length }}
      </p>
      <p v-if="loading" class="mb-4 text-yellow-400">
        Ładowanie przystanków...
      </p>

      <p v-if="error" class="mb-4 text-red-400">
        {{ error }}
      </p>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Szukaj przystanku..."
        class="w-full p-3 mb-4 rounded bg-slate-800 text-white"
      />

      <div
        v-for="stop in filteredStops.slice(0, 20)"
        :key="stop.stopId"
        class="bg-slate-800 p-4 rounded-xl mb-3 flex justify-between"
      >
        <span>
          {{ stop.stopName }}
        </span>

        <button
          @click="addFavorite(stop)"
          class="bg-green-600 px-4 py-2 rounded"
        >
          Dodaj
        </button>
      </div>
    </div>

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">
        Stop Scout 🚋
      </h1>

      <button
        @click="logout"
        class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Wyloguj
      </button>
  </div>

  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { fetchStops } from '../services/ztmApi'
import { db } from '../services/db'
import { useAuthStore } from '../stores/auth'
import { useZtmData } from '../composables/useZtmData'
import DeparturesBoard from '../components/DeparturesBoard.vue'

const VISIBLE_STOPS_LIMIT = 20

const auth = useAuthStore()
const router = useRouter()

const { data: rawStops, loading, error, load } = useZtmData(fetchStops)

const favoriteStops = ref([])
const searchQuery = ref('')

// One stop can appear several times, once per physical pole.
const stops = computed(() =>
  Array.from(new Map((rawStops.value ?? []).map((stop) => [stop.stopId, stop])).values())
)

const filteredStops = computed(() => {
  if (!searchQuery.value) return stops.value

  const query = searchQuery.value.toLowerCase()

  return stops.value.filter((stop) => stop.stopName?.toLowerCase().includes(query))
})

const visibleStops = computed(() => filteredStops.value.slice(0, VISIBLE_STOPS_LIMIT))

const favoriteIds = computed(() => new Set(favoriteStops.value.map((item) => item.stopId)))

const loadFavorites = async () => {
  if (!auth.user) return

  favoriteStops.value = await db.favoriteStops.where('userId').equals(auth.user.id).toArray()
}

const addFavorite = async (stop) => {
  if (!auth.user || favoriteIds.value.has(stop.stopId)) return

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

const logout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  await load()
  await loadFavorites()
})
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-8">
    <header class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold">Stop Scout 🚋</h1>

      <button @click="logout" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
        Wyloguj
      </button>
    </header>

    <section class="mb-10">
      <h2 class="text-2xl mb-4">Ulubione przystanki</h2>

      <p v-if="favoriteStops.length === 0" class="text-gray-400">
        Nie masz jeszcze ulubionych przystanków. Dodaj je z listy poniżej.
      </p>

      <div
        v-for="favorite in favoriteStops"
        :key="favorite.id"
        class="bg-slate-800 p-4 rounded-xl mb-4"
      >
        <div class="flex justify-between items-center mb-2">
          <span>{{ favorite.stopName }}</span>

          <button
            @click="removeFavorite(favorite.id)"
            class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Usuń
          </button>
        </div>

        <DeparturesBoard :stopId="favorite.stopId" :stopName="favorite.stopName" />
      </div>
    </section>

    <section>
      <h2 class="text-2xl mb-4">Lista przystanków</h2>

      <p v-if="loading" class="mb-4 text-yellow-400">Ładowanie przystanków...</p>
      <p v-else-if="error" class="mb-4 text-red-400">{{ error }}</p>
      <p v-else class="mb-4 text-gray-400">
        Znaleziono {{ filteredStops.length }} z {{ stops.length }} przystanków.
      </p>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Szukaj przystanku..."
        class="w-full p-3 mb-4 rounded bg-slate-800 text-white"
      />

      <div
        v-for="stop in visibleStops"
        :key="stop.stopId"
        class="bg-slate-800 p-4 rounded-xl mb-3 flex justify-between items-center"
      >
        <span>
          {{ stop.stopName }}
          <small v-if="stop.zoneName" class="text-gray-400 ml-2">{{ stop.zoneName }}</small>
        </span>

        <button
          @click="addFavorite(stop)"
          :disabled="favoriteIds.has(stop.stopId)"
          class="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded"
        >
          {{ favoriteIds.has(stop.stopId) ? 'Dodano' : 'Dodaj' }}
        </button>
      </div>

      <p v-if="filteredStops.length > VISIBLE_STOPS_LIMIT" class="text-gray-400 mt-4">
        Pokazano {{ VISIBLE_STOPS_LIMIT }} wyników. Zawęź wyszukiwanie, żeby znaleźć resztę.
      </p>
    </section>
  </div>
</template>

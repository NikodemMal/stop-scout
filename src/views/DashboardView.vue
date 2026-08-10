<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { fetchStops } from '../services/ztmApi'
import { db } from '../services/db'
import { fold } from '../utils/text'
import { useAuthStore } from '../stores/auth'
import { useZtmData } from '../composables/useZtmData'
import DeparturesBoard from '../components/DeparturesBoard.vue'

const VISIBLE_STOPS_LIMIT = 20

const auth = useAuthStore()
const router = useRouter()

const { data: rawStops, loading, error, load } = useZtmData(fetchStops)

const favoriteStops = ref([])
const searchQuery = ref('')
const actionError = ref('')
const pendingStopId = ref(null)

// Folding once per stop instead of on every keystroke.
const stops = computed(() =>
  (rawStops.value ?? []).map((stop) => ({ ...stop, searchName: fold(stop.stopName) }))
)

const filteredStops = computed(() => {
  if (!searchQuery.value) return stops.value

  const query = fold(searchQuery.value)

  return stops.value.filter((stop) => stop.searchName.includes(query))
})

const visibleStops = computed(() => filteredStops.value.slice(0, VISIBLE_STOPS_LIMIT))

const favoriteIds = computed(() => new Set(favoriteStops.value.map((item) => item.stopId)))

const loadFavorites = async () => {
  if (!auth.user) return

  try {
    favoriteStops.value = await db.favoriteStops.where('userId').equals(auth.user.id).toArray()
  } catch (err) {
    // Called without await from onMounted, so an unguarded rejection here
    // would surface as an unhandled rejection and nothing else.
    console.error(err)
    actionError.value = 'Nie udało się wczytać ulubionych przystanków.'
  }
}

const addFavorite = async (stop) => {
  if (!auth.user || favoriteIds.value.has(stop.stopId)) return

  // Guards a second click landing before the first insert resolves.
  if (pendingStopId.value !== null) return
  pendingStopId.value = stop.stopId
  actionError.value = ''

  try {
    await db.favoriteStops.add({
      userId: auth.user.id,
      stopId: stop.stopId,
      stopName: stop.stopName
    })

    await loadFavorites()
  } catch (err) {
    console.error(err)
    actionError.value = 'Nie udało się zapisać przystanku.'
  } finally {
    pendingStopId.value = null
  }
}

const removeFavorite = async (id) => {
  actionError.value = ''

  try {
    await db.favoriteStops.delete(id)
    await loadFavorites()
  } catch (err) {
    console.error(err)
    actionError.value = 'Nie udało się usunąć przystanku.'
  }
}

const logout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  // Favourites come from IndexedDB and do not depend on the stop list, so they
  // are not made to wait for a 1500-entry fetch.
  loadFavorites()
  await load()
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

    <p v-if="actionError" class="mb-6 text-red-400">{{ actionError }}</p>

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
        <div class="flex justify-between items-center gap-3 mb-2">
          <!-- The only place the name is rendered. The board used to print it a
               second time, so every card read its stop twice. -->
          <h3 class="text-lg font-bold">{{ favorite.stopName }}</h3>

          <button
            @click="removeFavorite(favorite.id)"
            class="shrink-0 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Usuń
          </button>
        </div>

        <DeparturesBoard :stopId="favorite.stopId" />
      </div>
    </section>

    <section>
      <h2 class="text-2xl mb-4">Lista przystanków</h2>

      <p v-if="loading" class="mb-4 text-yellow-400">Ładowanie przystanków...</p>
      <p v-else-if="error" class="mb-4 text-red-400">{{ error }}</p>
      <p v-else class="mb-4 text-gray-400">
        Znaleziono {{ filteredStops.length }} z {{ stops.length }} słupków przystankowych.
      </p>

      <label class="sr-only" for="stop-search">Szukaj przystanku</label>
      <input
        id="stop-search"
        v-model="searchQuery"
        type="search"
        placeholder="Szukaj przystanku..."
        class="w-full p-3 mb-4 rounded bg-slate-800 text-white"
      />

      <div
        v-for="stop in visibleStops"
        :key="stop.stopId"
        class="bg-slate-800 p-4 rounded-xl mb-3 flex justify-between items-center gap-3"
      >
        <span>
          {{ stop.stopName }}
          <!-- Most names repeat across poles, so the description is what makes
               the rows tell each other apart. -->
          <small v-if="stop.stopDesc && stop.stopDesc !== stop.stopName" class="text-gray-400 ml-2">
            {{ stop.stopDesc }}
          </small>
          <small v-if="stop.zoneName" class="text-gray-500 ml-2">{{ stop.zoneName }}</small>
        </span>

        <button
          @click="addFavorite(stop)"
          :disabled="favoriteIds.has(stop.stopId) || pendingStopId !== null"
          class="shrink-0 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded"
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

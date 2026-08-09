<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { fetchDepartures } from '../services/departuresApi'

const REFRESH_MS = 10_000

const props = defineProps({
  stopId: Number,
  stopName: String
})

const departures = ref([])
const status = ref('live')
const updatedAt = ref(null)
// Separate from status, which describes the outcome of a request that has
// already happened. Without it an empty board claims there are no departures
// before the first request has even resolved.
const loading = ref(true)

let interval = null

const load = async () => {
  const result = await fetchDepartures(props.stopId)

  departures.value = result.departures
  status.value = result.status
  updatedAt.value = result.updatedAt
  loading.value = false
}

const startPolling = () => {
  if (interval) return

  load()
  interval = setInterval(load, REFRESH_MS)
}

const stopPolling = () => {
  clearInterval(interval)
  interval = null
}

// Every favourite mounts its own board, so without pausing on a hidden tab a
// user with a dozen favourites keeps hammering the public ZTM endpoint in the
// background and risks being throttled.
const handleVisibilityChange = () => {
  if (document.hidden) stopPolling()
  else startPolling()
}

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

onMounted(() => {
  startPolling()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="bg-slate-800 p-4 rounded-xl mt-3">
    <div class="flex justify-between items-center gap-3 mb-2">
      <h3 class="text-lg font-bold">{{ stopName }}</h3>

      <span
        v-if="status === 'offline'"
        class="text-xs bg-amber-900 text-amber-200 px-2 py-1 rounded"
      >
        Brak sieci<template v-if="updatedAt"> - dane z {{ formatTime(updatedAt) }}</template>
      </span>

      <span
        v-else-if="status === 'error'"
        class="text-xs bg-red-900 text-red-200 px-2 py-1 rounded"
      >
        Serwis ZTM nie odpowiada<template v-if="updatedAt">
          - dane z {{ formatTime(updatedAt) }}</template>
      </span>
    </div>

    <p v-if="loading" class="text-gray-400">Ładowanie odjazdów...</p>

    <p v-else-if="departures.length === 0" class="text-gray-400">
      <template v-if="status === 'live'">Brak najbliższych odjazdów.</template>
      <template v-else>Brak zapisanych danych dla tego przystanku.</template>
    </p>

    <div
      v-for="departure in departures.slice(0, 5)"
      :key="departure.id"
      class="flex justify-between border-b border-slate-700 py-1"
    >
      <div>
        <b>{{ departure.routeId }}</b> → {{ departure.headsign }}
      </div>

      <div>
        {{ formatTime(departure.estimatedTime) }}

        <span v-delay-color="departure.delayInSeconds" class="ml-2">
          {{ departure.delayInSeconds > 0 ? '+' : '' }}{{ departure.delayInSeconds }}s
        </span>
      </div>
    </div>
  </div>
</template>

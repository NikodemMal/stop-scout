<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { fetchDepartures } from '../services/departuresApi'

const REFRESH_MS = 10_000

const props = defineProps({
  stopId: Number,
  stopName: String
})

const departures = ref([])
const fromCache = ref(false)
const updatedAt = ref(null)

let interval = null

const load = async () => {
  const result = await fetchDepartures(props.stopId)

  departures.value = result.departures
  fromCache.value = result.fromCache
  updatedAt.value = result.updatedAt
}

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

onMounted(() => {
  load()
  interval = setInterval(load, REFRESH_MS)
})

// Without this every unmounted board keeps polling in the background.
onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="bg-slate-800 p-4 rounded-xl mt-3">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-bold">
        {{ stopName }}
      </h3>

      <span
        v-if="fromCache"
        class="text-xs bg-amber-900 text-amber-200 px-2 py-1 rounded"
      >
        Offline<template v-if="updatedAt"> - dane z {{ formatTime(updatedAt) }}</template>
      </span>
    </div>

    <p v-if="departures.length === 0" class="text-gray-400">
      {{ fromCache ? 'Brak zapisanych danych dla tego przystanku.' : 'Brak najbliższych odjazdów.' }}
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

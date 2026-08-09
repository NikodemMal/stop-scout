<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { fetchDepartures } from '../services/departuresApi'

const props = defineProps({
  stopId: Number,
  stopName: String
})

const departures = ref([])
let interval = null

const load = async () => {
  const data = await fetchDepartures(props.stopId)
  departures.value = data
}

onMounted(() => {
  load()

  interval = setInterval(load, 10000) // live, every 10s
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="bg-slate-800 p-4 rounded-xl mt-3">
    <h3 class="text-lg font-bold mb-2">
      {{ stopName }}
    </h3>

    <div v-if="departures.length === 0" class="text-gray-400">
      Brak danych...
    </div>

    <div
      v-for="d in departures.slice(0, 5)"
      :key="d.id"
      class="flex justify-between border-b border-slate-700 py-1"
    >
      <div>
        <b>{{ d.routeId }}</b> → {{ d.headsign }}
      </div>

      <div>
        {{ new Date(d.estimatedTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}

        <span
          v-delay-color="d.delayInSeconds"
          class="ml-2"
        >
          {{ d.delayInSeconds > 0 ? '+' : '' }}{{ d.delayInSeconds }}
        </span>
      </div>
    </div>
  </div>
</template>
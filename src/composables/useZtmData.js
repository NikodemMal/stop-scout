import { ref } from 'vue'

/**
 * Wraps a fetching function in loading and error state so views do not
 * repeat the same try/catch.
 */
export function useZtmData(fetchFunction) {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)

  const load = async (...args) => {
    loading.value = true
    error.value = null

    try {
      data.value = await fetchFunction(...args)
    } catch (err) {
      error.value = err?.message ?? 'Błąd pobierania danych'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
}

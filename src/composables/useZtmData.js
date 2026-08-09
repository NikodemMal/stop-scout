import { ref } from 'vue'

export function useZtmData(fetchFunction) {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)

  const load = async (...args) => {
    loading.value = true
    error.value = null

    try {
      data.value = await fetchFunction(...args)
    }

    catch (err) {
      console.error(err)

      error.value = 'Błąd pobierania danych'
    }

    finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    load
  }
}
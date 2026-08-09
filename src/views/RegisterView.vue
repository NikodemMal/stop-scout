<script setup>
import { ref } from 'vue'
import bcrypt from 'bcryptjs'
import { useRouter } from 'vue-router'

import { db } from '../services/db'

const BCRYPT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 8

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const busy = ref(false)

const register = async () => {
  errorMessage.value = ''

  const login = username.value.trim()

  if (!login) {
    errorMessage.value = 'Podaj login.'
    return
  }

  if (password.value.length < MIN_PASSWORD_LENGTH) {
    errorMessage.value = `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`
    return
  }

  busy.value = true

  try {
    await db.users.add({
      username: login,
      password: await bcrypt.hash(password.value, BCRYPT_ROUNDS)
    })

    router.push('/login')
  } catch (error) {
    // The username index is unique, so the duplicate check is the failed
    // insert itself rather than a read beforehand, which two tabs could race.
    if (error?.name === 'ConstraintError') {
      errorMessage.value = 'Taki login już istnieje.'
      return
    }

    console.error(error)
    errorMessage.value = 'Nie udało się utworzyć konta. Spróbuj ponownie.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <form @submit.prevent="register" class="bg-slate-800 p-8 rounded-xl w-96">
      <h1 class="text-3xl font-bold mb-6">Rejestracja</h1>

      <label class="sr-only" for="register-username">Login</label>
      <input
        id="register-username"
        v-model="username"
        type="text"
        placeholder="Login"
        autocomplete="username"
        class="w-full mb-4 p-3 rounded bg-slate-700"
      />

      <label class="sr-only" for="register-password">Hasło</label>
      <input
        id="register-password"
        v-model="password"
        type="password"
        placeholder="Hasło"
        autocomplete="new-password"
        class="w-full mb-4 p-3 rounded bg-slate-700"
      />

      <p v-if="errorMessage" role="alert" class="mb-4 text-red-400">{{ errorMessage }}</p>

      <button
        type="submit"
        :disabled="busy"
        class="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 p-3 rounded"
      >
        {{ busy ? 'Tworzenie konta...' : 'Zarejestruj' }}
      </button>

      <p class="mt-4 text-sm text-gray-400">
        Masz już konto?
        <RouterLink to="/login" class="text-blue-400 hover:underline">Zaloguj się</RouterLink>
      </p>
    </form>
  </div>
</template>

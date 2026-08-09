<script setup>
import { ref } from 'vue'
import bcrypt from 'bcryptjs'
import { useRouter } from 'vue-router'

import { db } from '../services/db'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const busy = ref(false)

const login = async () => {
  errorMessage.value = ''
  busy.value = true

  try {
    const user = await db.users.where('username').equals(username.value.trim()).first()

    // Same message for a wrong username and a wrong password, otherwise
    // the form tells an attacker which accounts exist.
    if (!user || !(await bcrypt.compare(password.value, user.password))) {
      errorMessage.value = 'Nieprawidłowy login lub hasło.'
      return
    }

    auth.login(user)
    router.push('/')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <form
      @submit.prevent="login"
      class="bg-slate-800 p-8 rounded-xl w-96"
    >
      <h1 class="text-3xl font-bold mb-6">Logowanie</h1>

      <input
        v-model="username"
        type="text"
        placeholder="Login"
        autocomplete="username"
        class="w-full mb-4 p-3 rounded bg-slate-700"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Hasło"
        autocomplete="current-password"
        class="w-full mb-4 p-3 rounded bg-slate-700"
      />

      <p v-if="errorMessage" class="mb-4 text-red-400">{{ errorMessage }}</p>

      <button
        type="submit"
        :disabled="busy"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 p-3 rounded"
      >
        {{ busy ? 'Logowanie...' : 'Zaloguj' }}
      </button>

      <p class="mt-4 text-sm text-gray-400">
        Nie masz konta?
        <RouterLink to="/register" class="text-blue-400 hover:underline">
          Zarejestruj się
        </RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import bcrypt from 'bcryptjs'

import { db } from '../services/db'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')

const login = async () => {
  const user = await db.users
    .where('username')
    .equals(username.value)
    .first()

  if (!user) {
    alert('Nie znaleziono użytkownika')
    return
  }

  const validPassword = await bcrypt.compare(
    password.value,
    user.password
  )

  if (!validPassword) {
    alert('Błędne hasło')
    return
  }

  auth.login(user)

  alert('Zalogowano!')
  auth.login(user)

  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div class="bg-slate-800 p-8 rounded-xl w-96">
      <h1 class="text-3xl font-bold mb-6">
        Login
      </h1>

      <input
        v-model="username"
        type="text"
        placeholder="Login"
        class="w-full mb-4 p-3 rounded bg-slate-700"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Hasło"
        class="w-full mb-4 p-3 rounded bg-slate-700"
      />

      <button
        @click="login"
        class="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded"
      >
        Zaloguj
      </button>
    </div>
  </div>
</template>
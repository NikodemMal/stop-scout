<script setup>
import { ref } from 'vue'
import bcrypt from 'bcryptjs'

import { db } from '../services/db'

const username = ref('')
const password = ref('')

const register = async () => {
  const hashedPassword = await bcrypt.hash(password.value, 10)

  await db.users.add({
    username: username.value,
    password: hashedPassword
  })

  alert('Użytkownik utworzony!')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div class="bg-slate-800 p-8 rounded-xl w-96">
      <h1 class="text-3xl font-bold mb-6">
        Rejestracja
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
        @click="register"
        class="w-full bg-green-600 hover:bg-green-700 p-3 rounded"
      >
        Zarejestruj
      </button>
    </div>
  </div>
</template>
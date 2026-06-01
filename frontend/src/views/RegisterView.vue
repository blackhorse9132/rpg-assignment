<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { register } = useAuth()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  isSubmitting.value = true
  try {
    await register(email.value, password.value)
    await router.push({ name: 'feed' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Registration failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="page">
    <h1>Register</h1>
    <form class="form" @submit.prevent="handleSubmit">
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" required minlength="6" />
      </label>
      <label>
        Confirm password
        <input v-model="confirmPassword" type="password" required minlength="6" />
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.form {
  display: grid;
  gap: 1rem;
}
label {
  display: grid;
  gap: 0.5rem;
}
input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
button {
  border: 0;
  border-radius: 6px;
  padding: 0.65rem 1rem;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error {
  color: #dc2626;
}
</style>

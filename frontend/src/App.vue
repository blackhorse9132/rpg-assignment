<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import { useToast } from '@/composables/useToast'
import ToastContainer from '@/components/ToastContainer.vue'
import NotificationBell from '@/components/NotificationBell.vue'

const router = useRouter()
const auth = useAuth()
const notificationsState = useNotifications()
const { clearToasts } = useToast()
const isAuthenticated = computed(() => auth.isAuthenticated.value)
const currentUser = computed(() => auth.user.value)

const handleLogout = async () => {
  auth.logout()
  clearToasts()
  notificationsState.clearNotifications()
  await router.push({ name: 'login' })
}

onMounted(() => {
  notificationsState.startNotifications()
})

onUnmounted(() => {
  notificationsState.stopNotifications()
})
</script>

<template>
  <header class="header">
    <div class="container header-row">
      <div>
        <div class="brand">RPG Blog</div>

        <nav class="nav">
          <RouterLink to="/">Feed</RouterLink>
          <RouterLink v-if="isAuthenticated" to="/posts/new">New Post</RouterLink>
          <RouterLink v-if="!isAuthenticated" to="/login">Login</RouterLink>
          <RouterLink v-if="!isAuthenticated" to="/register">Register</RouterLink>
          <button v-if="isAuthenticated" type="button" class="link-button" @click="handleLogout">
            Logout
          </button>
        </nav>
      </div>

      <NotificationBell />
    </div>
    <div v-if="currentUser" class="container info-row">
      <span>Signed in as {{ currentUser.email }}</span>
    </div>
  </header>

  <RouterView />
  <ToastContainer />
</template>

<style scoped>
.header {
  border-bottom: 1px solid #d1d5db;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
}
.brand {
  font-size: 1.1rem;
  font-weight: 700;
}
.nav {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.info-row {
  font-size: 0.9rem;
  color: #64748b;
}
.link-button {
  border: 0;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
}
</style>

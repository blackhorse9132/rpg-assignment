<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = useNotifications()

const isOpen = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)

const hasNotifications = computed(() => notifications.value.length > 0)

const formatTime = (dateText: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(dateText),
  )

function togglePanel() {
  isOpen.value = !isOpen.value
  if (isOpen.value && unreadCount.value > 0) {
    markAllAsRead()
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (
    isOpen.value &&
    panelRef.value &&
    buttonRef.value &&
    !panelRef.value.contains(target) &&
    !buttonRef.value.contains(target)
  ) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="notification-bell">
    <button
      ref="buttonRef"
      type="button"
      class="bell-button"
      :class="{ 'bell-button--active': isOpen }"
      aria-label="Notifications"
      :aria-expanded="isOpen"
      @click="togglePanel"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span v-if="unreadCount > 0" class="bell-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <Transition name="panel">
      <div v-if="isOpen" ref="panelRef" class="notification-panel">
        <div class="panel-header">
          <div>
            <h2>Notifications</h2>
            <p v-if="unreadCount > 0">{{ unreadCount }} unread</p>
            <p v-else-if="hasNotifications">All caught up</p>
            <p v-else>No notifications yet</p>
          </div>
          <button
            v-if="hasNotifications"
            type="button"
            class="panel-action"
            @click="clearNotifications"
          >
            Clear all
          </button>
        </div>

        <ul v-if="hasNotifications" class="notification-list">
          <li
            v-for="item in notifications"
            :key="item.id"
            class="notification-item"
            :class="{ 'notification-item--unread': !item.read }"
            @click="markAsRead(item.id)"
          >
            <div class="notification-item__dot" aria-hidden="true" />
            <div class="notification-item__content">
              <p class="notification-item__title">{{ item.title }}</p>
              <p class="notification-item__message">{{ item.message }}</p>
              <time class="notification-item__time">{{ formatTime(item.createdAt) }}</time>
            </div>
          </li>
        </ul>

        <p v-else class="panel-empty">
          New blog posts from other users will show up here.
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.bell-button svg {
  width: 1.15rem;
  height: 1.15rem;
}

.bell-button:hover,
.bell-button--active {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.18);
  color: #2563eb;
}

.bell-badge {
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.1rem;
  text-align: center;
  box-shadow: 0 0 0 2px #fff;
}

.notification-panel {
  position: absolute;
  top: calc(100% + 0.65rem);
  right: 0;
  width: min(22rem, calc(100vw - 2rem));
  max-height: 24rem;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 20px 45px rgba(15, 23, 42, 0.14),
    0 6px 16px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.panel-header h2 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.panel-header p {
  margin-top: 0.15rem;
  font-size: 0.78rem;
  color: #64748b;
}

.panel-action {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.notification-list {
  list-style: none;
  max-height: 18rem;
  overflow-y: auto;
}

.notification-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.notification-item:hover {
  background: rgba(15, 23, 42, 0.03);
}

.notification-item + .notification-item {
  border-top: 1px solid rgba(15, 23, 42, 0.05);
}

.notification-item--unread {
  background: rgba(37, 99, 235, 0.04);
}

.notification-item__dot {
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.45rem;
  border-radius: 999px;
  background: transparent;
}

.notification-item--unread .notification-item__dot {
  background: #2563eb;
}

.notification-item__title {
  font-size: 0.84rem;
  font-weight: 700;
  color: #0f172a;
}

.notification-item__message {
  margin-top: 0.15rem;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.45;
}

.notification-item__time {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.72rem;
  color: #94a3b8;
}

.panel-empty {
  padding: 1rem;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.5;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-0.35rem);
}

@media (prefers-color-scheme: dark) {
  .bell-button {
    background: rgba(15, 23, 42, 0.85);
    border-color: rgba(148, 163, 184, 0.18);
    color: #e2e8f0;
  }

  .bell-badge {
    box-shadow: 0 0 0 2px #0f172a;
  }

  .notification-panel {
    background: rgba(15, 23, 42, 0.98);
    border-color: rgba(148, 163, 184, 0.18);
  }

  .panel-header h2,
  .notification-item__title {
    color: #f8fafc;
  }

  .notification-item__message {
    color: #cbd5e1;
  }
}
</style>

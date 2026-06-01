<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismissToast } = useToast()
</script>

<template>
  <div class="toast-viewport" aria-live="polite" aria-label="Notifications">
    <TransitionGroup name="toast">
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        role="status"
      >
        <div class="toast__accent" aria-hidden="true" />

        <div class="toast__icon" aria-hidden="true">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12.75 11.25 15 15.75 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <path
              d="M12 6v6h4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div class="toast__content">
          <p class="toast__title">{{ toast.title }}</p>
          <p class="toast__message">{{ toast.message }}</p>
        </div>

        <button
          type="button"
          class="toast__close"
          aria-label="Dismiss notification"
          @click="dismissToast(toast.id)"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div
          class="toast__progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
          aria-hidden="true"
        />
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-viewport {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(22rem, calc(100vw - 2rem));
  pointer-events: none;
}

.toast {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
  padding: 0.9rem 0.9rem 0.9rem 0.75rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.12),
    0 4px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.toast--success {
  --toast-accent: #059669;
  --toast-icon-bg: rgba(5, 150, 105, 0.12);
}

.toast--info {
  --toast-accent: #2563eb;
  --toast-icon-bg: rgba(37, 99, 235, 0.12);
}

.toast__accent {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--toast-accent);
}

.toast__icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  color: var(--toast-accent);
  background: var(--toast-icon-bg);
}

.toast__icon svg {
  width: 1.2rem;
  height: 1.2rem;
}

.toast__content {
  min-width: 0;
  padding-top: 0.1rem;
}

.toast__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.toast__message {
  margin-top: 0.2rem;
  font-size: 0.84rem;
  color: #475569;
  line-height: 1.45;
  word-break: break-word;
}

.toast__close {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.toast__close svg {
  width: 0.95rem;
  height: 0.95rem;
}

.toast__close:hover {
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.toast__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  transform-origin: left center;
  background: linear-gradient(90deg, var(--toast-accent), rgba(255, 255, 255, 0));
  animation: toast-progress linear forwards;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(calc(100% + 1rem));
  opacity: 0;
}

.toast-move {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

@media (prefers-color-scheme: dark) {
  .toast {
    background: rgba(15, 23, 42, 0.94);
    border-color: rgba(148, 163, 184, 0.18);
    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.35),
      0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .toast__title {
    color: #f8fafc;
  }

  .toast__message {
    color: #cbd5e1;
  }

  .toast__close {
    color: #94a3b8;
  }

  .toast__close:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #f8fafc;
  }
}
</style>

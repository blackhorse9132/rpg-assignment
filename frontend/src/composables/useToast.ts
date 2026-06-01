import { ref } from 'vue'

export type ToastType = 'info' | 'success'

export type ToastItem = {
  id: string
  title: string
  message: string
  type: ToastType
  duration: number
}

const toasts = ref<ToastItem[]>([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function dismissToast(id: string) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function showToast(options: {
  title: string
  message: string
  type?: ToastType
  duration?: number
}) {
  const id = crypto.randomUUID()
  const duration = options.duration ?? 6000

  toasts.value.unshift({
    id,
    title: options.title,
    message: options.message,
    type: options.type ?? 'info',
    duration,
  })

  timers.set(
    id,
    setTimeout(() => dismissToast(id), duration),
  )

  return id
}

function clearToasts() {
  for (const id of timers.keys()) {
    dismissToast(id)
  }
}

export function useToast() {
  return {
    toasts,
    showToast,
    dismissToast,
    clearToasts,
  }
}

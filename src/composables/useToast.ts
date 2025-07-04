import { useToastStore } from '@/stores/toast'

export function useToast() {
  const store = useToastStore()
  
  return {
    toasts: store.toasts,
    success: (message: string) => store.success(message),
    error: (message: string) => store.error(message),
    info: (message: string) => store.info(message),
    warning: (message: string) => store.warning(message),
    add: store.add,
    remove: store.remove,
    clear: store.clear
  }
}

// Global toast instance - create lazily
let _toast: ReturnType<typeof useToast> | null = null

export const toast = {
  get toasts() {
    if (!_toast) _toast = useToast()
    return _toast.toasts
  },
  success(message: string) {
    if (!_toast) _toast = useToast()
    return _toast.success(message)
  },
  error(message: string) {
    if (!_toast) _toast = useToast()
    return _toast.error(message)
  },
  info(message: string) {
    if (!_toast) _toast = useToast()
    return _toast.info(message)
  },
  warning(message: string) {
    if (!_toast) _toast = useToast()
    return _toast.warning(message)
  },
  add(toast: any) {
    if (!_toast) _toast = useToast()
    return _toast.add(toast)
  },
  remove(id: string) {
    if (!_toast) _toast = useToast()
    return _toast.remove(id)
  },
  clear() {
    if (!_toast) _toast = useToast()
    return _toast.clear()
  }
}
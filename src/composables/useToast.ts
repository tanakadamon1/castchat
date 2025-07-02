import { ref, reactive, readonly } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
}

const toasts = ref<Toast[]>([])

let toastIdCounter = 0

export function useToast() {
  const add = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastIdCounter}`
    const newToast: Toast = {
      id,
      closable: true,
      duration: 5000,
      ...toast
    }
    
    toasts.value.push(newToast)
    
    // Auto remove if duration is set
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, newToast.duration)
    }
    
    return id
  }
  
  const remove = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const clear = () => {
    toasts.value = []
  }
  
  const success = (message: string, options?: Partial<Toast>) => {
    return add({ ...options, type: 'success', message })
  }
  
  const error = (message: string, options?: Partial<Toast>) => {
    return add({ ...options, type: 'error', message, duration: 0 })
  }
  
  const warning = (message: string, options?: Partial<Toast>) => {
    return add({ ...options, type: 'warning', message })
  }
  
  const info = (message: string, options?: Partial<Toast>) => {
    return add({ ...options, type: 'info', message })
  }
  
  return {
    toasts: readonly(toasts),
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info
  }
}

// Global toast instance
export const toast = useToast()
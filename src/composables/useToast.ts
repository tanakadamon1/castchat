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

// Global toast instance
export const toast = useToast()
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Permission } from '@/lib/permissions'

export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Validate session before checking authentication
  const isSessionValid = await authStore.validateSession()
  
  if (!isSessionValid || !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  next()
}

export const requireGuest = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Validate session to make sure we have the latest state
  await authStore.validateSession()
  
  if (authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }
  
  next()
}

export const requirePermission = (permission: Permission) => {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()
    
    // Validate session first
    const isSessionValid = await authStore.validateSession()
    
    if (!isSessionValid || !authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    if (!authStore.permissions.hasPermission(permission)) {
      next({ name: 'home' })
      return
    }
    
    next()
  }
}

export const requireAdmin = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  const isSessionValid = await authStore.validateSession()
  
  if (!isSessionValid || !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  if (!authStore.isAdmin) {
    next({ name: 'home' })
    return
  }
  
  next()
}

export const requireModerator = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  const isSessionValid = await authStore.validateSession()
  
  if (!isSessionValid || !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  if (!authStore.isModerator) {
    next({ name: 'home' })
    return
  }
  
  next()
}

// Utility function to create guards for specific permissions
export const createPermissionGuard = (permission: Permission) => requirePermission(permission)

// Common permission guards
export const requireCreatePost = createPermissionGuard(Permission.CREATE_POSTS)
export const requireManageUsers = createPermissionGuard(Permission.MANAGE_USERS)
export const requireModerateContent = createPermissionGuard(Permission.MODERATE_CONTENT)
export const requireViewAnalytics = createPermissionGuard(Permission.VIEW_ANALYTICS)
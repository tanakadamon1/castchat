import type { Tables } from './database.types'

type UserRole = Tables<'users'>['role']
type UserProfile = Tables<'users'>

export enum Permission {
  // User permissions
  READ_POSTS = 'read_posts',
  CREATE_POSTS = 'create_posts',
  UPDATE_OWN_POSTS = 'update_own_posts',
  DELETE_OWN_POSTS = 'delete_own_posts',
  
  // Application permissions
  CREATE_APPLICATIONS = 'create_applications',
  VIEW_OWN_APPLICATIONS = 'view_own_applications',
  UPDATE_OWN_APPLICATIONS = 'update_own_applications',
  DELETE_OWN_APPLICATIONS = 'delete_own_applications',
  
  // Post owner permissions
  VIEW_POST_APPLICATIONS = 'view_post_applications',
  MANAGE_POST_APPLICATIONS = 'manage_post_applications',
  
  // Profile permissions
  UPDATE_OWN_PROFILE = 'update_own_profile',
  VIEW_PROFILES = 'view_profiles',
  
  // Moderator permissions
  UPDATE_ANY_POSTS = 'update_any_posts',
  DELETE_ANY_POSTS = 'delete_any_posts',
  VIEW_ALL_APPLICATIONS = 'view_all_applications',
  MODERATE_CONTENT = 'moderate_content',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SYSTEM = 'manage_system',
  
  // Premium features
  FEATURE_POSTS = 'feature_posts',
  EXTENDED_POST_CONTENT = 'extended_post_content',
  ADVANCED_ANALYTICS = 'advanced_analytics'
}

const USER_PERMISSIONS: Permission[] = [
  Permission.READ_POSTS,
  Permission.CREATE_POSTS,
  Permission.UPDATE_OWN_POSTS,
  Permission.DELETE_OWN_POSTS,
  Permission.CREATE_APPLICATIONS,
  Permission.VIEW_OWN_APPLICATIONS,
  Permission.UPDATE_OWN_APPLICATIONS,
  Permission.DELETE_OWN_APPLICATIONS,
  Permission.VIEW_POST_APPLICATIONS,
  Permission.MANAGE_POST_APPLICATIONS,
  Permission.UPDATE_OWN_PROFILE,
  Permission.VIEW_PROFILES
]

const MODERATOR_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  Permission.UPDATE_ANY_POSTS,
  Permission.DELETE_ANY_POSTS,
  Permission.VIEW_ALL_APPLICATIONS,
  Permission.MODERATE_CONTENT
]

const ADMIN_PERMISSIONS: Permission[] = [
  ...MODERATOR_PERMISSIONS,
  Permission.MANAGE_USERS,
  Permission.MANAGE_ROLES,
  Permission.VIEW_ANALYTICS,
  Permission.MANAGE_SYSTEM,
  Permission.FEATURE_POSTS,
  Permission.ADVANCED_ANALYTICS
]

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: USER_PERMISSIONS,
  moderator: MODERATOR_PERMISSIONS,
  admin: ADMIN_PERMISSIONS
}

export class PermissionManager {
  private static instance: PermissionManager

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager()
    }
    return PermissionManager.instance
  }

  hasPermission(userProfile: UserProfile | null, permission: Permission): boolean {
    if (!userProfile) return false
    
    const userPermissions = this.getUserPermissions(userProfile)
    return userPermissions.includes(permission)
  }

  hasAnyPermission(userProfile: UserProfile | null, permissions: Permission[]): boolean {
    if (!userProfile || permissions.length === 0) return false
    
    return permissions.some(permission => this.hasPermission(userProfile, permission))
  }

  hasAllPermissions(userProfile: UserProfile | null, permissions: Permission[]): boolean {
    if (!userProfile || permissions.length === 0) return false
    
    return permissions.every(permission => this.hasPermission(userProfile, permission))
  }

  getUserPermissions(userProfile: UserProfile): Permission[] {
    const basePermissions = ROLE_PERMISSIONS[userProfile.role] || []
    
    // Add premium permissions based on subscription
    // This would be expanded when subscription system is implemented
    return basePermissions
  }

  canReadPost(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.READ_POSTS)
  }

  canCreatePost(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.CREATE_POSTS)
  }

  canUpdatePost(userProfile: UserProfile | null, postOwnerId: string): boolean {
    if (!userProfile) return false
    
    // User can update their own posts
    if (userProfile.id === postOwnerId) {
      return this.hasPermission(userProfile, Permission.UPDATE_OWN_POSTS)
    }
    
    // Moderators and admins can update any posts
    return this.hasPermission(userProfile, Permission.UPDATE_ANY_POSTS)
  }

  canDeletePost(userProfile: UserProfile | null, postOwnerId: string): boolean {
    if (!userProfile) return false
    
    // User can delete their own posts
    if (userProfile.id === postOwnerId) {
      return this.hasPermission(userProfile, Permission.DELETE_OWN_POSTS)
    }
    
    // Moderators and admins can delete any posts
    return this.hasPermission(userProfile, Permission.DELETE_ANY_POSTS)
  }

  canCreateApplication(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.CREATE_APPLICATIONS)
  }

  canViewApplication(userProfile: UserProfile | null, applicationUserId: string, postOwnerId: string): boolean {
    if (!userProfile) return false
    
    // User can view their own applications
    if (userProfile.id === applicationUserId) {
      return this.hasPermission(userProfile, Permission.VIEW_OWN_APPLICATIONS)
    }
    
    // Post owner can view applications to their posts
    if (userProfile.id === postOwnerId) {
      return this.hasPermission(userProfile, Permission.VIEW_POST_APPLICATIONS)
    }
    
    // Moderators and admins can view all applications
    return this.hasPermission(userProfile, Permission.VIEW_ALL_APPLICATIONS)
  }

  canManageApplication(userProfile: UserProfile | null, postOwnerId: string): boolean {
    if (!userProfile) return false
    
    // Post owner can manage applications to their posts
    if (userProfile.id === postOwnerId) {
      return this.hasPermission(userProfile, Permission.MANAGE_POST_APPLICATIONS)
    }
    
    // Moderators and admins can manage all applications
    return this.hasPermission(userProfile, Permission.VIEW_ALL_APPLICATIONS)
  }

  canUpdateProfile(userProfile: UserProfile | null, targetUserId: string): boolean {
    if (!userProfile) return false
    
    // User can update their own profile
    if (userProfile.id === targetUserId) {
      return this.hasPermission(userProfile, Permission.UPDATE_OWN_PROFILE)
    }
    
    // Admins can manage users
    return this.hasPermission(userProfile, Permission.MANAGE_USERS)
  }

  canFeaturePost(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.FEATURE_POSTS)
  }

  canModerateContent(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MODERATE_CONTENT)
  }

  canManageUsers(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MANAGE_USERS)
  }

  canViewAnalytics(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.VIEW_ANALYTICS)
  }

  isAdmin(userProfile: UserProfile | null): boolean {
    return userProfile?.role === 'admin'
  }

  isModerator(userProfile: UserProfile | null): boolean {
    return userProfile?.role === 'moderator' || this.isAdmin(userProfile)
  }

  isStaff(userProfile: UserProfile | null): boolean {
    return this.isModerator(userProfile) || this.isAdmin(userProfile)
  }

  getRequiredRole(permission: Permission): UserRole | null {
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      if (permissions.includes(permission)) {
        return role as UserRole
      }
    }
    return null
  }

  getRoleHierarchy(): UserRole[] {
    return ['user', 'moderator', 'admin']
  }

  isRoleHigherThan(role1: UserRole, role2: UserRole): boolean {
    const hierarchy = this.getRoleHierarchy()
    const role1Index = hierarchy.indexOf(role1)
    const role2Index = hierarchy.indexOf(role2)
    
    return role1Index > role2Index
  }

  // Category management permissions
  canCreateCategory(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  canUpdateCategory(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  canDeleteCategory(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  // Tag management permissions
  canCreateTag(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MODERATE_CONTENT) ||
           this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  canUpdateTag(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MODERATE_CONTENT) ||
           this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  canDeleteTag(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MODERATE_CONTENT) ||
           this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  // Image upload permissions
  canUploadImage(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.CREATE_POSTS)
  }

  canDeleteUnusedImages(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  // Statistics and analytics permissions
  canViewSystemStatistics(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.VIEW_ANALYTICS)
  }

  canViewPostAnalytics(userProfile: UserProfile | null, postOwnerId: string): boolean {
    if (!userProfile) return false
    
    // Post owner can view their own analytics
    if (userProfile.id === postOwnerId) {
      return true
    }
    
    // Admins and moderators can view analytics
    return this.hasPermission(userProfile, Permission.VIEW_ANALYTICS)
  }

  // Notification permissions
  canViewNotification(userProfile: UserProfile | null, notificationOwnerId: string): boolean {
    if (!userProfile) return false
    
    // Notification owner can view their notifications
    if (userProfile.id === notificationOwnerId) {
      return true
    }
    
    // Admins can view any notifications
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  // Message permissions
  canSendMessage(userProfile: UserProfile | null): boolean {
    if (!userProfile) return false
    
    // 認証済みユーザーは基本的にメッセージを送信可能
    return true
  }

  canViewMessage(userProfile: UserProfile | null, senderId: string, recipientId: string): boolean {
    if (!userProfile) return false
    
    // 送信者または受信者の場合
    if (userProfile.id === senderId || userProfile.id === recipientId) {
      return true
    }
    
    // 管理者の場合
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  canDeleteMessage(userProfile: UserProfile | null, senderId: string): boolean {
    if (!userProfile) return false
    
    // 送信者本人または管理者
    return userProfile.id === senderId || 
           this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  // Rate limiting and security
  canPerformAction(userProfile: UserProfile | null, action: string, timeWindow: number = 60000): boolean {
    if (!userProfile) return false
    
    // 管理者は制限なし
    if (this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)) {
      return true
    }
    
    // 基本的なレート制限チェック（実装は簡略化）
    // 実際の実装ではRedisやメモリキャッシュを使用
    return true
  }

  canManageNotification(userProfile: UserProfile | null, notificationOwnerId: string): boolean {
    if (!userProfile) return false
    
    // Notification owner can manage their notifications
    if (userProfile.id === notificationOwnerId) {
      return true
    }
    
    // Admins can manage any notifications
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  canCreateNotification(userProfile: UserProfile | null): boolean {
    // System can create notifications, users generally cannot
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  canDeleteNotification(userProfile: UserProfile | null, notificationOwnerId: string): boolean {
    if (!userProfile) return false
    
    // Notification owner can delete their notifications
    if (userProfile.id === notificationOwnerId) {
      return true
    }
    
    // Admins can delete any notifications
    return this.hasPermission(userProfile, Permission.MANAGE_SYSTEM)
  }

  // Advanced analytics for premium users
  canViewAdvancedAnalytics(userProfile: UserProfile | null): boolean {
    return this.hasPermission(userProfile, Permission.ADVANCED_ANALYTICS)
  }
}

export const permissionManager = PermissionManager.getInstance()

// Utility functions for Vue components
export const usePermissions = (userProfile: UserProfile | null) => {
  const manager = permissionManager
  
  return {
    hasPermission: (permission: Permission) => manager.hasPermission(userProfile, permission),
    hasAnyPermission: (permissions: Permission[]) => manager.hasAnyPermission(userProfile, permissions),
    hasAllPermissions: (permissions: Permission[]) => manager.hasAllPermissions(userProfile, permissions),
    canReadPost: () => manager.canReadPost(userProfile),
    canCreatePost: () => manager.canCreatePost(userProfile),
    canUpdatePost: (postOwnerId: string) => manager.canUpdatePost(userProfile, postOwnerId),
    canDeletePost: (postOwnerId: string) => manager.canDeletePost(userProfile, postOwnerId),
    canCreateApplication: () => manager.canCreateApplication(userProfile),
    canViewApplication: (applicationUserId: string, postOwnerId: string) => 
      manager.canViewApplication(userProfile, applicationUserId, postOwnerId),
    canManageApplication: (postOwnerId: string) => manager.canManageApplication(userProfile, postOwnerId),
    canUpdateProfile: (targetUserId: string) => manager.canUpdateProfile(userProfile, targetUserId),
    canFeaturePost: () => manager.canFeaturePost(userProfile),
    canModerateContent: () => manager.canModerateContent(userProfile),
    canManageUsers: () => manager.canManageUsers(userProfile),
    canViewAnalytics: () => manager.canViewAnalytics(userProfile),
    isAdmin: () => manager.isAdmin(userProfile),
    isModerator: () => manager.isModerator(userProfile),
    isStaff: () => manager.isStaff(userProfile)
  }
}
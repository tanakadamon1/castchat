import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { applicationApi, type AuthContext as ApplicationAuthContext } from '@/lib/applicationApi'
import { messageApi, type AuthContext as MessageAuthContext } from '@/lib/messageApi'
import { notificationApi, type AuthContext as NotificationAuthContext } from '@/lib/notificationApi'
import { postsApi, type AuthContext as PostsAuthContext } from '@/lib/postsApi'

/**
 * Composable that provides API methods with automatic auth context injection
 * This solves the circular dependency issue by providing the auth context at runtime
 */
export function useApi() {
  const authStore = useAuthStore()
  
  const authContext = computed(() => ({
    user: authStore.user,
    profile: authStore.profile
  }))

  // Application API methods
  const application = {
    submitApplication: (data: Parameters<typeof applicationApi.submitApplication>[0]) => 
      applicationApi.submitApplication(data, authContext.value as ApplicationAuthContext),
    
    getMyApplications: () => 
      applicationApi.getMyApplications(authContext.value as ApplicationAuthContext),
    
    getReceivedApplications: (postId?: string) => 
      applicationApi.getReceivedApplications(postId, authContext.value as ApplicationAuthContext),
    
    updateApplicationStatus: (
      applicationId: string, 
      status: Parameters<typeof applicationApi.updateApplicationStatus>[1],
      responseMessage?: string
    ) => applicationApi.updateApplicationStatus(applicationId, status, responseMessage, authContext.value as ApplicationAuthContext),
    
    withdrawApplication: (applicationId: string) => 
      applicationApi.withdrawApplication(applicationId, authContext.value as ApplicationAuthContext),
    
    getApplicationStats: (postId?: string) => 
      applicationApi.getApplicationStats(postId, authContext.value as ApplicationAuthContext),
    
    canApply: (postId: string) => 
      applicationApi.canApply(postId, authContext.value as ApplicationAuthContext)
  }

  // Message API methods
  const message = {
    sendMessage: (data: Parameters<typeof messageApi.sendMessage>[0]) => 
      messageApi.sendMessage(data, authContext.value as MessageAuthContext),
    
    getConversation: (otherUserId: string, limit?: number, offset?: number) => 
      messageApi.getConversation(otherUserId, limit, offset, authContext.value as MessageAuthContext),
    
    getMyConversations: () => 
      messageApi.getMyConversations(authContext.value as MessageAuthContext),
    
    markAsRead: (messageId: string) => 
      messageApi.markAsRead(messageId, authContext.value as MessageAuthContext),
    
    markConversationAsRead: (otherUserId: string) => 
      messageApi.markConversationAsRead(otherUserId, authContext.value as MessageAuthContext),
    
    subscribeToMessages: (callback: Parameters<typeof messageApi.subscribeToMessages>[0]) => 
      messageApi.subscribeToMessages(callback, authContext.value as MessageAuthContext),
    
    startConversation: (otherUserId: string) => 
      messageApi.startConversation(otherUserId, authContext.value as MessageAuthContext)
  }

  // Notification API methods
  const notification = {
    getNotifications: (limit?: number, offset?: number) => 
      notificationApi.getNotifications(limit, offset, authContext.value as NotificationAuthContext),
    
    markAsRead: (notificationId: string) => 
      notificationApi.markAsRead(notificationId, authContext.value as NotificationAuthContext),
    
    markAllAsRead: () => 
      notificationApi.markAllAsRead(authContext.value as NotificationAuthContext),
    
    deleteNotification: (notificationId: string) => 
      notificationApi.deleteNotification(notificationId, authContext.value as NotificationAuthContext),
    
    getUnreadCount: () => 
      notificationApi.getUnreadCount(authContext.value as NotificationAuthContext),
    
    getNotificationStats: () => 
      notificationApi.getNotificationStats(authContext.value as NotificationAuthContext),
    
    subscribeToNotifications: (callback: Parameters<typeof notificationApi.subscribeToNotifications>[0]) => 
      notificationApi.subscribeToNotifications(callback, authContext.value as NotificationAuthContext),
    
    getNotificationSettings: () => 
      notificationApi.getNotificationSettings(authContext.value as NotificationAuthContext),
    
    updateNotificationSettings: (settings: any) => 
      notificationApi.updateNotificationSettings(settings, authContext.value as NotificationAuthContext)
  }

  // Posts API methods (only the ones that need auth)
  const posts = {
    createPost: (postData: Parameters<typeof postsApi.createPost>[0]) => 
      postsApi.createPost(postData, authContext.value as PostsAuthContext),
    
    testCreatePost: () => 
      postsApi.testCreatePost(authContext.value as PostsAuthContext),
    
    // Methods that don't need auth can be used directly
    getPosts: postsApi.getPosts,
    getPost: postsApi.getPost
  }

  return {
    application,
    message,
    notification,
    posts
  }
}
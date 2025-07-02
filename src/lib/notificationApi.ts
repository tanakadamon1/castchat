// フロントエンド統合用の通知API ラッパー
import { notificationsService } from './notifications'
import { useAuthStore } from '@/stores/auth'
import type { Tables } from '@/lib/database.types'

type Notification = Tables<'notifications'>

export interface NotificationData {
  type: 'application_received' | 'application_status_changed' | 'deadline_reminder' | 'post_updated'
  title: string
  message: string
  related_id?: string | null
  action_url?: string | null
}

export interface NotificationResponse {
  data: Notification | null
  error: string | null
}

export interface NotificationsResponse {
  data: Notification[]
  error?: string
}

export interface NotificationWithDetails extends Notification {
  relatedPost?: {
    id: string
    title: string
  }
  relatedUser?: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
}

class NotificationApi {
  private getAuthStore() {
    return useAuthStore()
  }

  private getCurrentUser() {
    const authStore = this.getAuthStore()
    return {
      id: authStore.user?.id,
      profile: authStore.profile
    }
  }

  /**
   * 通知一覧を取得
   */
  async getNotifications(limit?: number, offset?: number): Promise<NotificationsResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: [],
          error: 'ログインが必要です'
        }
      }

      const result = await notificationsService.getUserNotifications(
        userId,
        limit || 20,
        offset || 0,
        profile || undefined
      )

      if (result.error) {
        return {
          data: [],
          error: result.error.message
        }
      }

      return {
        data: result.data || []
      }

    } catch (error) {
      console.error('Get notifications error:', error)
      return {
        data: [],
        error: '通知の取得に失敗しました'
      }
    }
  }

  /**
   * 通知を既読にする
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です'
        }
      }

      const result = await notificationsService.markAsRead(
        notificationId,
        userId,
        profile || undefined
      )

      if (result.error) {
        return {
          data: null,
          error: result.error.message
        }
      }

      return {
        data: result.data,
        error: null
      }

    } catch (error) {
      console.error('Mark as read error:', error)
      return {
        data: null,
        error: '既読処理に失敗しました'
      }
    }
  }

  /**
   * 全通知を既読にする
   */
  async markAllAsRead(): Promise<{ error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          error: 'ログインが必要です'
        }
      }

      const result = await notificationsService.markAllAsRead(userId, profile || undefined)

      if (result.error) {
        return {
          error: result.error.message
        }
      }

      return {
        error: null
      }

    } catch (error) {
      console.error('Mark all as read error:', error)
      return {
        error: '一括既読処理に失敗しました'
      }
    }
  }

  /**
   * 通知を削除
   */
  async deleteNotification(notificationId: string): Promise<{ error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          error: 'ログインが必要です'
        }
      }

      const result = await notificationsService.deleteNotification(
        notificationId,
        userId,
        profile || undefined
      )

      if (result.error) {
        return {
          error: result.error.message
        }
      }

      return {
        error: null
      }

    } catch (error) {
      console.error('Delete notification error:', error)
      return {
        error: '通知の削除に失敗しました'
      }
    }
  }

  /**
   * 未読通知数を取得
   */
  async getUnreadCount(): Promise<{ count: number; error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          count: 0,
          error: 'ログインが必要です'
        }
      }

      const result = await notificationsService.getUnreadCount(userId, profile || undefined)

      if (result.error) {
        return {
          count: 0,
          error: result.error.message
        }
      }

      return {
        count: result.data || 0,
        error: null
      }

    } catch (error) {
      console.error('Get unread count error:', error)
      return {
        count: 0,
        error: '未読数の取得に失敗しました'
      }
    }
  }

  /**
   * 通知統計を取得
   */
  async getNotificationStats(): Promise<{ data: NotificationStats | null; error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です'
        }
      }

      const result = await notificationsService.getNotificationStatistics(userId, profile || undefined)

      if (result.error) {
        return {
          data: null,
          error: result.error.message
        }
      }

      return {
        data: result.data,
        error: null
      }

    } catch (error) {
      console.error('Get notification stats error:', error)
      return {
        data: null,
        error: '統計データの取得に失敗しました'
      }
    }
  }

  /**
   * リアルタイム通知購読
   */
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    const { id: userId } = this.getCurrentUser()
    
    if (!userId) {
      console.warn('Cannot subscribe to notifications: User not logged in')
      return () => {}
    }

    return notificationsService.subscribeToUserNotifications(userId, callback)
  }

  /**
   * 通知設定を取得
   */
  async getNotificationSettings(): Promise<{ data: any | null; error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です'
        }
      }

      const result = await notificationsService.getNotificationSettings(userId, profile || undefined)

      if (result.error) {
        return {
          data: null,
          error: result.error.message
        }
      }

      return {
        data: result.data,
        error: null
      }

    } catch (error) {
      console.error('Get notification settings error:', error)
      return {
        data: null,
        error: '設定の取得に失敗しました'
      }
    }
  }

  /**
   * 通知設定を更新
   */
  async updateNotificationSettings(settings: any): Promise<{ error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          error: 'ログインが必要です'
        }
      }

      const result = await notificationsService.updateNotificationSettings(
        userId,
        settings,
        profile || undefined
      )

      if (result.error) {
        return {
          error: result.error.message
        }
      }

      return {
        error: null
      }

    } catch (error) {
      console.error('Update notification settings error:', error)
      return {
        error: '設定の更新に失敗しました'
      }
    }
  }
}

export const notificationApi = new NotificationApi()
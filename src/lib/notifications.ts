import { supabase } from './supabase'
import { validator } from './validation'
import { errorHandler, ErrorCode, type AppError } from './errors'
import { permissionManager } from './permissions'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type Notification = Tables<'notifications'>
export type NotificationInsert = TablesInsert<'notifications'>
export type NotificationUpdate = TablesUpdate<'notifications'>

export interface NotificationWithDetails extends Notification {
  relatedPost?: {
    id: string
    title: string
    user_id: string
  }
  relatedUser?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export interface NotificationCreateData {
  user_id: string
  type: string
  title: string
  message: string
  related_id?: string | null
  action_url?: string | null
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
}

export interface NotificationSettings {
  application_received: boolean
  application_status_changed: boolean
  deadline_reminder: boolean
  post_updated: boolean
  email_notifications: boolean
  push_notifications: boolean
}

export interface NotificationsApiResult<T = any> {
  data: T | null
  error: AppError | null
  count?: number
  unreadCount?: number
}

export class NotificationsService {
  private static instance: NotificationsService

  private constructor() {}

  static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService()
    }
    return NotificationsService.instance
  }

  async createNotification(
    notificationData: NotificationCreateData,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<Notification>> {
    try {
      // バリデーション
      if (!notificationData.title || !notificationData.message) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_REQUIRED_FIELD,
            'Title and message are required',
            'Notification title and message cannot be empty'
          )
        }
      }

      // 通知作成
      const insertData: NotificationInsert = {
        user_id: notificationData.user_id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        is_read: false
      }

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'create_notification',
            notificationData
          })
        }
      }

      return { data: notification, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'create_notification',
          notificationData
        })
      }
    }
  }

  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<NotificationWithDetails[]>> {
    try {
      // 権限チェック
      if (!userProfile || !permissionManager.canViewNotification(userProfile, userId)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view notifications',
            `User cannot view notifications for user ${userId}`
          )
        }
      }

      const { data, error, count } = await supabase
        .from('notifications')
        .select(`
          *,
          posts!notifications_related_id_fkey(id, title, user_id),
          users!notifications_user_id_fkey(id, username, display_name, avatar_url)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_user_notifications',
            userId,
            limit,
            offset
          })
        }
      }

      // 未読数も取得
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      return {
        data: data || [],
        error: null,
        count: count || 0,
        unreadCount: unreadCount || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_user_notifications',
          userId,
          limit,
          offset
        })
      }
    }
  }

  async markAsRead(
    notificationId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<Notification>> {
    try {
      // 通知の存在確認
      const { data: existingNotification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single()

      if (fetchError || !existingNotification) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Notification not found',
            `Notification with ID ${notificationId} not found`
          )
        }
      }

      // 権限チェック（通知の所有者または管理者）
      if (existingNotification.user_id !== userId && 
          (!userProfile || !permissionManager.canManageNotification(userProfile, existingNotification.user_id))) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to mark notification as read',
            `User ${userId} cannot mark notification ${notificationId} as read`
          )
        }
      }

      // 既読にする
      const { data: updatedNotification, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'mark_notification_read',
            notificationId,
            userId
          })
        }
      }

      return { data: updatedNotification, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'mark_notification_read',
          notificationId,
          userId
        })
      }
    }
  }

  async markAllAsRead(
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<void>> {
    try {
      // 権限チェック
      if (!userProfile || !permissionManager.canViewNotification(userProfile, userId)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to mark all notifications as read',
            `User cannot mark all notifications as read for user ${userId}`
          )
        }
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'mark_all_notifications_read',
            userId
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'mark_all_notifications_read',
          userId
        })
      }
    }
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<void>> {
    try {
      // 通知の存在確認
      const { data: existingNotification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single()

      if (fetchError || !existingNotification) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Notification not found',
            `Notification with ID ${notificationId} not found`
          )
        }
      }

      // 権限チェック（通知の所有者または管理者）
      if (existingNotification.user_id !== userId && 
          (!userProfile || !permissionManager.canManageNotification(userProfile, existingNotification.user_id))) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to delete notification',
            `User ${userId} cannot delete notification ${notificationId}`
          )
        }
      }

      // 通知削除
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'delete_notification',
            notificationId,
            userId
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'delete_notification',
          notificationId,
          userId
        })
      }
    }
  }

  async getUnreadCount(
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<number>> {
    try {
      // 権限チェック
      if (!userProfile || !permissionManager.canViewNotification(userProfile, userId)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view notification count',
            `User cannot view notification count for user ${userId}`
          )
        }
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_unread_count',
            userId
          })
        }
      }

      return { data: count || 0, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_unread_count',
          userId
        })
      }
    }
  }

  async getNotificationStatistics(
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<NotificationStats>> {
    try {
      // 権限チェック
      if (!userProfile || !permissionManager.canViewNotification(userProfile, userId)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view notification statistics',
            `User cannot view notification statistics for user ${userId}`
          )
        }
      }

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('type, is_read')
        .eq('user_id', userId)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_notification_statistics',
            userId
          })
        }
      }

      const stats: NotificationStats = {
        total: notifications?.length || 0,
        unread: notifications?.filter(n => !n.is_read).length || 0,
        byType: {}
      }

      // タイプ別集計
      notifications?.forEach(notification => {
        if (stats.byType[notification.type]) {
          stats.byType[notification.type]++
        } else {
          stats.byType[notification.type] = 1
        }
      })

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_notification_statistics',
          userId
        })
      }
    }
  }

  async getNotificationSettings(
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<NotificationSettings>> {
    try {
      // 権限チェック
      if (!userProfile || userProfile.id !== userId) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view notification settings',
            `User cannot view notification settings for user ${userId}`
          )
        }
      }

      // ユーザーの通知設定を取得（notification_settingsフィールドまたは別テーブル）
      const { data: user, error } = await supabase
        .from('users')
        .select('notification_settings')
        .eq('id', userId)
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_notification_settings',
            userId
          })
        }
      }

      // デフォルト設定
      const defaultSettings: NotificationSettings = {
        application_received: true,
        application_status_changed: true,
        deadline_reminder: true,
        post_updated: true,
        email_notifications: true,
        push_notifications: true
      }

      const settings = user?.notification_settings 
        ? { ...defaultSettings, ...user.notification_settings }
        : defaultSettings

      return { data: settings, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_notification_settings',
          userId
        })
      }
    }
  }

  async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>,
    userProfile?: Tables<'users'>
  ): Promise<NotificationsApiResult<NotificationSettings>> {
    try {
      // 権限チェック
      if (!userProfile || userProfile.id !== userId) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to update notification settings',
            `User cannot update notification settings for user ${userId}`
          )
        }
      }

      // 現在の設定を取得
      const currentResult = await this.getNotificationSettings(userId, userProfile)
      if (currentResult.error) {
        return currentResult
      }

      const updatedSettings = { ...currentResult.data, ...settings }

      // 設定を更新
      const { data, error } = await supabase
        .from('users')
        .update({ notification_settings: updatedSettings })
        .eq('id', userId)
        .select('notification_settings')
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'update_notification_settings',
            userId,
            settings
          })
        }
      }

      return { data: data.notification_settings, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'update_notification_settings',
          userId,
          settings
        })
      }
    }
  }

  /**
   * リアルタイム通知購読
   */
  subscribeToUserNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const subscription = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()

    // 購読解除用の関数を返す
    return () => {
      subscription.unsubscribe()
    }
  }

  /**
   * 通知トリガー（応募受信時）
   */
  async triggerApplicationReceivedNotification(
    postOwnerId: string,
    applicantId: string,
    postId: string,
    postTitle: string
  ): Promise<NotificationsApiResult<Notification>> {
    const notificationData: NotificationCreateData = {
      user_id: postOwnerId,
      type: 'application_received',
      title: '新しい応募が届きました',
      message: `「${postTitle}」に新しい応募が届きました`,
      related_id: postId,
      action_url: `/posts/${postId}/applications`
    }

    return this.createNotification(notificationData)
  }

  /**
   * 通知トリガー（応募ステータス変更時）
   */
  async triggerApplicationStatusNotification(
    applicantId: string,
    postId: string,
    postTitle: string,
    status: 'accepted' | 'rejected'
  ): Promise<NotificationsApiResult<Notification>> {
    const statusText = status === 'accepted' ? '承認' : '拒否'
    
    const notificationData: NotificationCreateData = {
      user_id: applicantId,
      type: 'application_status_changed',
      title: `応募が${statusText}されました`,
      message: `「${postTitle}」への応募が${statusText}されました`,
      related_id: postId,
      action_url: `/applications`
    }

    return this.createNotification(notificationData)
  }
}

export const notificationsService = NotificationsService.getInstance()
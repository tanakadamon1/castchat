// 未読カウント管理システム
import { supabase } from './supabase'
import { errorHandler, ErrorCode, type AppError } from './errors'
import type { Tables } from './database.types'

export interface UnreadCounts {
  messages: number
  notifications: number
  applications: number
  total: number
}

export interface UnreadCountsApiResult {
  data: UnreadCounts | null
  error: AppError | null
}

export class UnreadCountManager {
  private static instance: UnreadCountManager
  private cache = new Map<string, { data: UnreadCounts; timestamp: number }>()
  private readonly CACHE_TTL = 30000 // 30秒

  private constructor() {}

  static getInstance(): UnreadCountManager {
    if (!UnreadCountManager.instance) {
      UnreadCountManager.instance = new UnreadCountManager()
    }
    return UnreadCountManager.instance
  }

  /**
   * ユーザーの全未読カウントを取得
   */
  async getUnreadCounts(
    userId: string,
    useCache: boolean = true
  ): Promise<UnreadCountsApiResult> {
    try {
      // キャッシュチェック
      if (useCache) {
        const cached = this.getCachedCounts(userId)
        if (cached) {
          return { data: cached, error: null }
        }
      }

      // 並列で各種未読数を取得
      const [messagesResult, notificationsResult, applicationsResult] = await Promise.all([
        this.getUnreadMessagesCount(userId),
        this.getUnreadNotificationsCount(userId),
        this.getUnreadApplicationsCount(userId)
      ])

      // エラーチェック
      if (messagesResult.error || notificationsResult.error || applicationsResult.error) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_CONNECTION_ERROR,
            'Failed to fetch unread counts',
            'One or more unread count queries failed'
          )
        }
      }

      const counts: UnreadCounts = {
        messages: messagesResult.data || 0,
        notifications: notificationsResult.data || 0,
        applications: applicationsResult.data || 0,
        total: (messagesResult.data || 0) + (notificationsResult.data || 0) + (applicationsResult.data || 0)
      }

      // キャッシュに保存
      this.setCachedCounts(userId, counts)

      return { data: counts, error: null }

    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_unread_counts',
          userId
        })
      }
    }
  }

  /**
   * 未読メッセージ数取得
   */
  private async getUnreadMessagesCount(userId: string): Promise<{ data: number | null; error: AppError | null }> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_unread_messages_count',
            userId
          })
        }
      }

      return { data: count || 0, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_unread_messages_count',
          userId
        })
      }
    }
  }

  /**
   * 未読通知数取得
   */
  private async getUnreadNotificationsCount(userId: string): Promise<{ data: number | null; error: AppError | null }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_unread_notifications_count',
            userId
          })
        }
      }

      return { data: count || 0, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_unread_notifications_count',
          userId
        })
      }
    }
  }

  /**
   * 未読応募数取得（自分の投稿への新着応募）
   */
  private async getUnreadApplicationsCount(userId: string): Promise<{ data: number | null; error: AppError | null }> {
    try {
      const { count, error } = await supabase
        .from('applications')
        .select(`
          *,
          posts!applications_post_id_fkey(user_id)
        `, { count: 'exact', head: true })
        .eq('posts.user_id', userId)
        .eq('status', 'pending')

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_unread_applications_count',
            userId
          })
        }
      }

      return { data: count || 0, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_unread_applications_count',
          userId
        })
      }
    }
  }

  /**
   * 会話別未読メッセージ数取得
   */
  async getConversationUnreadCount(
    userId: string,
    otherUserId: string
  ): Promise<{ data: number | null; error: AppError | null }> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_conversation_unread_count',
            userId,
            otherUserId
          })
        }
      }

      return { data: count || 0, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_conversation_unread_count',
          userId,
          otherUserId
        })
      }
    }
  }

  /**
   * 未読カウントリアルタイム購読
   */
  subscribeToUnreadCounts(
    userId: string,
    callback: (counts: UnreadCounts) => void
  ): () => void {
    const subscriptions: Array<{ unsubscribe: () => void }> = []

    // メッセージの未読状態変更を監視
    const messagesSub = supabase
      .channel(`unread-messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        () => {
          this.invalidateCache(userId)
          this.getUnreadCounts(userId, false).then(result => {
            if (result.data) {
              callback(result.data)
            }
          })
        }
      )
      .subscribe()

    subscriptions.push({ unsubscribe: () => messagesSub.unsubscribe() })

    // 通知の未読状態変更を監視
    const notificationsSub = supabase
      .channel(`unread-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          this.invalidateCache(userId)
          this.getUnreadCounts(userId, false).then(result => {
            if (result.data) {
              callback(result.data)
            }
          })
        }
      )
      .subscribe()

    subscriptions.push({ unsubscribe: () => notificationsSub.unsubscribe() })

    // 全ての購読を解除する関数を返す
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }

  /**
   * 未読カウント一括既読処理
   */
  async markAllAsRead(
    userId: string,
    type: 'messages' | 'notifications' | 'applications' | 'all'
  ): Promise<{ error: AppError | null }> {
    try {
      const now = new Date().toISOString()

      switch (type) {
        case 'messages':
          await supabase
            .from('messages')
            .update({ is_read: true, read_at: now })
            .eq('recipient_id', userId)
            .eq('is_read', false)
          break

        case 'notifications':
          await supabase
            .from('notifications')
            .update({ is_read: true, read_at: now })
            .eq('user_id', userId)
            .eq('is_read', false)
          break

        case 'all':
          await Promise.all([
            supabase
              .from('messages')
              .update({ is_read: true, read_at: now })
              .eq('recipient_id', userId)
              .eq('is_read', false),
            supabase
              .from('notifications')
              .update({ is_read: true, read_at: now })
              .eq('user_id', userId)
              .eq('is_read', false)
          ])
          break
      }

      // キャッシュを無効化
      this.invalidateCache(userId)

      return { error: null }
    } catch (err) {
      return {
        error: errorHandler.handleError(err, {
          operation: 'mark_all_as_read',
          userId,
          type
        })
      }
    }
  }

  /**
   * キャッシュ管理
   */
  private getCachedCounts(userId: string): UnreadCounts | null {
    const cached = this.cache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private setCachedCounts(userId: string, counts: UnreadCounts): void {
    this.cache.set(userId, {
      data: counts,
      timestamp: Date.now()
    })
  }

  private invalidateCache(userId: string): void {
    this.cache.delete(userId)
  }

  /**
   * 全キャッシュクリア
   */
  clearAllCache(): void {
    this.cache.clear()
  }
}

export const unreadCountManager = UnreadCountManager.getInstance()
// Notification Types
// 通知機能の型定義

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  priority: NotificationPriority
  relatedId?: string
  relatedType?: string
  expiresAt?: string
  actionData?: NotificationActionData
  createdAt: string
}

export type NotificationType = 
  | 'application_received'    // 応募受信
  | 'application_accepted'    // 応募承認
  | 'application_rejected'    // 応募拒否
  | 'post_deadline_reminder'  // 締切リマインダー
  | 'post_status_changed'     // 投稿ステータス変更
  | 'new_message'            // 新着メッセージ
  | 'system_announcement'     // システム通知

export type NotificationPriority = 
  | 'low'     // 低
  | 'normal'  // 通常
  | 'high'    // 高
  | 'urgent'  // 緊急

export interface NotificationActionData {
  buttonText?: string
  actionUrl?: string
  actionType?: 'navigate' | 'modal' | 'external'
}

export interface NotificationResponse {
  success: boolean
  data?: Notification
  error?: string
}

export interface NotificationsResponse {
  success: boolean
  data?: Notification[]
  total?: number
  unreadCount?: number
  error?: string
}

export interface NotificationFilter {
  read?: boolean
  type?: NotificationType
  priority?: NotificationPriority
  sortBy?: 'newest' | 'oldest' | 'priority'
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  applicationNotifications: boolean
  deadlineReminders: boolean
  systemAnnouncements: boolean
}
// 共通の型定義をエクスポート
export type { Message, MessageWithDetails } from '@/lib/messages'
export type { UserResponse as User } from './api'
export type { PostResponse as Post } from './api'
export type { ApplicationResponse as Application } from './api'
export type { NotificationResponse as Notification } from './api'
export type { ChatUser, ChatMessage } from './chat'
export { toChatUser, toChatMessage } from './chat'
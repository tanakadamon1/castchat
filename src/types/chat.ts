// チャット用の拡張型定義
import type { Message } from '@/lib/messages'
import type { UserResponse } from './api'

// チャット画面用のユーザー型
export interface ChatUser extends UserResponse {
  name: string
  isOnline?: boolean
  lastSeen?: string
}

// チャット画面用のメッセージ型
export interface ChatMessage extends Message {
  senderId: string
  timestamp: string
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
  type: 'text' | 'image'
  sender?: {
    id: string
    name: string
    avatar?: string
  }
}

// 型変換ヘルパー
export function toChatUser(user: UserResponse): ChatUser {
  return {
    ...user,
    name: user.displayName || user.email.split('@')[0],
    isOnline: false,
    lastSeen: new Date().toISOString()
  }
}

export function toChatMessage(message: Message): ChatMessage {
  return {
    ...message,
    senderId: message.sender_id,
    timestamp: message.created_at,
    type: message.message_type,
    status: message.is_read ? 'read' : 'sent'
  }
}
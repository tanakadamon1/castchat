// フロントエンド統合用のメッセージAPI ラッパー
import { messagesService } from './messages'
import { useAuthStore } from '@/stores/auth'
import type { Tables } from './database.types'

export type Message = Tables<'messages'>

export interface MessageData {
  recipientId: string
  content: string
  messageType: 'text' | 'image'
  relatedApplicationId?: string
}

export interface MessageResponse {
  data: Message | null
  error: string | null
}

export interface MessagesResponse {
  data: MessageWithDetails[]
  error: string | null
  total: number
}

export interface ConversationsResponse {
  data: ConversationSummary[]
  error: string | null
  total: number
}

export interface MessageWithDetails extends Message {
  sender?: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  recipient?: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  relatedApplication?: {
    id: string
    post_title: string
  }
  senderName?: string
  recipientName?: string
  isOwn?: boolean
}

export interface ConversationSummary {
  participant: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  lastMessage: {
    content: string
    created_at: string
    is_read: boolean
  }
  unreadCount: number
}

class MessageApi {
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
   * メッセージを送信する
   */
  async sendMessage(data: MessageData): Promise<MessageResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です'
        }
      }

      const result = await messagesService.sendMessage(
        userId,
        {
          recipient_id: data.recipientId,
          content: data.content,
          message_type: data.messageType,
          related_application_id: data.relatedApplicationId || null
        },
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
      console.error('Send message error:', error)
      return {
        data: null,
        error: 'メッセージの送信に失敗しました'
      }
    }
  }

  /**
   * 会話履歴を取得
   */
  async getConversation(otherUserId: string, limit?: number, offset?: number): Promise<MessagesResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: [],
          error: 'ログインが必要です',
          total: 0
        }
      }

      const result = await messagesService.getConversation(
        userId,
        otherUserId,
        limit || 50,
        offset || 0,
        profile || undefined
      )

      if (result.error) {
        return {
          data: [],
          error: result.error.message,
          total: 0
        }
      }

      // データ変換
      const messages: MessageWithDetails[] = (result.data || []).map(message => ({
        ...message,
        senderName: message.sender?.display_name || message.sender?.username || '匿名',
        recipientName: message.recipient?.display_name || message.recipient?.username || '匿名',
        isOwn: message.sender?.id === userId
      }))

      return {
        data: messages,
        error: null,
        total: result.count || 0
      }

    } catch (error) {
      console.error('Get conversation error:', error)
      return {
        data: [],
        error: '会話履歴の取得に失敗しました',
        total: 0
      }
    }
  }

  /**
   * 自分の会話一覧を取得
   */
  async getMyConversations(): Promise<ConversationsResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: [],
          error: 'ログインが必要です',
          total: 0
        }
      }

      const result = await messagesService.getMyConversations(userId, profile || undefined)

      if (result.error) {
        return {
          data: [],
          error: result.error.message,
          total: 0
        }
      }

      return {
        data: result.data || [],
        error: null,
        total: result.count || 0
      }

    } catch (error) {
      console.error('Get conversations error:', error)
      return {
        data: [],
        error: '会話一覧の取得に失敗しました',
        total: 0
      }
    }
  }


  /**
   * メッセージを既読にする
   */
  async markAsRead(messageId: string): Promise<{ error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          error: 'ログインが必要です'
        }
      }

      const result = await messagesService.markAsRead(
        messageId,
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
      console.error('Mark as read error:', error)
      return {
        error: '既読処理に失敗しました'
      }
    }
  }

  /**
   * 会話を既読にする
   */
  async markConversationAsRead(otherUserId: string): Promise<{ error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          error: 'ログインが必要です'
        }
      }

      const result = await messagesService.markConversationAsRead(
        userId,
        otherUserId,
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
      console.error('Mark conversation as read error:', error)
      return {
        error: '会話の既読処理に失敗しました'
      }
    }
  }

  /**
   * リアルタイムメッセージ購読
   */
  subscribeToMessages(callback: (message: Message) => void): () => void {
    const { id: userId } = this.getCurrentUser()
    
    if (!userId) {
      console.warn('Cannot subscribe to messages: User not logged in')
      return () => {}
    }

    return messagesService.subscribeToUserMessages(userId, callback)
  }

  /**
   * 特定のユーザーとの会話開始
   */
  async startConversation(otherUserId: string): Promise<{ canStartConversation: boolean; reason?: string }> {
    try {
      const { id: userId } = this.getCurrentUser()
      
      if (!userId) {
        return {
          canStartConversation: false,
          reason: 'ログインが必要です'
        }
      }

      if (userId === otherUserId) {
        return {
          canStartConversation: false,
          reason: '自分自身との会話は開始できません'
        }
      }

      // 相手ユーザーの存在確認は sendMessage で行われる
      return {
        canStartConversation: true
      }

    } catch (error) {
      console.error('Check conversation start error:', error)
      return {
        canStartConversation: false,
        reason: '会話開始の確認に失敗しました'
      }
    }
  }
}

export const messageApi = new MessageApi()
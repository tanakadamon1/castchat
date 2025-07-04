import { supabase } from './supabase'
import { validator } from './validation'
import { errorHandler, ErrorCode, type AppError } from './errors'
import { permissionManager } from './permissions'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type Message = Tables<'messages'>
export type MessageInsert = TablesInsert<'messages'>
export type MessageUpdate = TablesUpdate<'messages'>

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
}

export interface MessageCreateData {
  recipient_id: string
  content: string
  message_type: 'text' | 'image'
  related_application_id?: string | null
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

export interface MessagesApiResult<T = any> {
  data: T | null
  error: AppError | null
  count?: number
}

export class MessagesService {
  private static instance: MessagesService

  private constructor() {}

  static getInstance(): MessagesService {
    if (!MessagesService.instance) {
      MessagesService.instance = new MessagesService()
    }
    return MessagesService.instance
  }

  async sendMessage(
    senderId: string,
    messageData: MessageCreateData,
    userProfile?: Tables<'users'>
  ): Promise<MessagesApiResult<Message>> {
    try {
      // 権限チェック
      if (!userProfile || !permissionManager.canSendMessage(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to send message',
            `User ${senderId} cannot send messages`
          )
        }
      }

      // バリデーション
      const contentValidation = validator.messageContent(messageData.content)
      if (!contentValidation.isValid) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'Invalid message content',
            contentValidation.errors.join(', ')
          )
        }
      }

      // 自分自身にメッセージ送信チェック
      if (senderId === messageData.recipient_id) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'Cannot send message to yourself',
            'Sender and recipient cannot be the same'
          )
        }
      }

      // 受信者の存在確認
      const { data: recipient, error: recipientError } = await supabase
        .from('users')
        .select('id, is_verified')
        .eq('id', messageData.recipient_id)
        .single()

      if (recipientError || !recipient) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Recipient not found',
            `User with ID ${messageData.recipient_id} not found`
          )
        }
      }

      // メッセージ作成
      const insertData: MessageInsert = {
        sender_id: senderId,
        recipient_id: messageData.recipient_id,
        content: messageData.content,
        message_type: messageData.message_type,
        related_application_id: messageData.related_application_id,
        is_read: false
      }

      const { data: message, error } = await supabase
        .from('messages')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'send_message',
            senderId,
            messageData
          })
        }
      }

      return { data: message, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'send_message',
          senderId,
          messageData
        })
      }
    }
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    limit: number = 50,
    offset: number = 0,
    userProfile?: Tables<'users'>
  ): Promise<MessagesApiResult<MessageWithDetails[]>> {
    try {
      // 権限チェック（自分が関わる会話のみ）
      if (!userProfile || (userProfile.id !== userId)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view conversation',
            `User cannot view conversation between ${userId} and ${otherUserId}`
          )
        }
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url),
          recipient:users!messages_recipient_id_fkey(id, username, display_name, avatar_url),
          applications!messages_related_application_id_fkey(id, posts!applications_post_id_fkey(title))
        `)
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_conversation',
            userId,
            otherUserId,
            limit,
            offset
          })
        }
      }

      return {
        data: data || [],
        error: null,
        count: data?.length || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_conversation',
          userId,
          otherUserId,
          limit,
          offset
        })
      }
    }
  }

  async getMyConversations(
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<MessagesApiResult<ConversationSummary[]>> {
    try {
      // 権限チェック
      if (!userProfile || userProfile.id !== userId) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view conversations',
            `User cannot view conversations for user ${userId}`
          )
        }
      }

      // 最新のメッセージと会話相手を取得
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id,
          recipient_id,
          sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url),
          recipient:users!messages_recipient_id_fkey(id, username, display_name, avatar_url)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_my_conversations',
            userId
          })
        }
      }

      // 会話をグループ化
      const conversationMap = new Map<string, ConversationSummary>()
      
      data?.forEach(message => {
        const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id
        const otherUser = message.sender_id === userId ? message.recipient : message.sender
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            participant: otherUser as any,
            lastMessage: {
              content: message.content,
              created_at: message.created_at,
              is_read: message.is_read
            },
            unreadCount: 0
          })
        }
        
        // 未読数カウント（自分宛のメッセージで未読のもの）
        if (message.recipient_id === userId && !message.is_read) {
          const conversation = conversationMap.get(otherUserId)!
          conversation.unreadCount++
        }
      })

      const conversations = Array.from(conversationMap.values())

      return {
        data: conversations,
        error: null,
        count: conversations.length
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_my_conversations',
          userId
        })
      }
    }
  }

  async markAsRead(
    messageId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<MessagesApiResult<Message>> {
    try {
      // メッセージの存在確認
      const { data: existingMessage, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (fetchError || !existingMessage) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Message not found',
            `Message with ID ${messageId} not found`
          )
        }
      }

      // 権限チェック（受信者のみが既読にできる）
      if (existingMessage.recipient_id !== userId) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to mark message as read',
            `User ${userId} cannot mark message ${messageId} as read`
          )
        }
      }

      // 既読に更新
      const { data: updatedMessage, error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'mark_message_read',
            messageId,
            userId
          })
        }
      }

      return { data: updatedMessage, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'mark_message_read',
          messageId,
          userId
        })
      }
    }
  }

  async markConversationAsRead(
    userId: string,
    otherUserId: string,
    userProfile?: Tables<'users'>
  ): Promise<MessagesApiResult<void>> {
    try {
      // 権限チェック
      if (!userProfile || userProfile.id !== userId) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to mark conversation as read',
            `User cannot mark conversation as read for user ${userId}`
          )
        }
      }

      // 会話の未読メッセージを全て既読に
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'mark_conversation_read',
            userId,
            otherUserId
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'mark_conversation_read',
          userId,
          otherUserId
        })
      }
    }
  }

  /**
   * リアルタイムメッセージ購読
   */
  subscribeToUserMessages(
    userId: string,
    callback: (message: Message) => void
  ): () => void {
    const subscription = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()

    // 購読解除用の関数を返す
    return () => {
      subscription.unsubscribe()
    }
  }
}

export const messagesService = MessagesService.getInstance()
<template>
  <BaseModal :show="show" @close="$emit('close')" size="lg">
    <template #header>
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          <img
            v-if="recipient?.avatar_url"
            :src="recipient.avatar_url"
            :alt="recipient?.display_name || '匿名ユーザー'"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <User class="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ recipient?.display_name || '匿名ユーザー' }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ relatedApplication?.postTitle ? `応募について: ${relatedApplication.postTitle}` : 'メッセージ' }}
          </p>
        </div>
      </div>
    </template>

    <div class="h-96 flex flex-col">
      <!-- メッセージリスト -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="loading" class="flex justify-center">
          <LoadingSpinner size="sm" />
        </div>
        
        <div v-else-if="messages.length === 0" class="text-center text-gray-500 py-8">
          <MessageCircle class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>まだメッセージがありません</p>
          <p class="text-sm">最初のメッセージを送信してみましょう</p>
        </div>

        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :is-own="message.sender_id === currentUserId"
        />
      </div>

      <!-- メッセージ入力 -->
      <div class="border-t p-4">
        <MessageInput
          v-model="newMessage"
          :loading="sending"
          @send="handleSendMessage"
          @file-select="handleFileSelect"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { User, MessageCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { messageApi } from '@/lib/messageApi'
import { supabase } from '@/lib/supabase'
import { uploadMessageImage } from '@/lib/imageUpload'
import BaseModal from '@/components/ui/BaseModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js'

interface Recipient {
  id: string
  display_name: string
  avatar_url?: string
}

interface RelatedApplication {
  id: string
  postTitle: string
}

interface Message {
  id: string
  content: string
  sender_id: string
  recipient_id: string
  message_type: 'text' | 'image'
  created_at: string
  read_at?: string
}

interface Props {
  show: boolean
  recipient?: Recipient
  relatedApplication?: RelatedApplication
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const toast = useToast()

// 状態
const messages = ref<Message[]>([])
const newMessage = ref('')
const loading = ref(false)
const sending = ref(false)
const realtimeSubscription = ref<RealtimeChannel | null>(null)
const messagesContainer = ref<HTMLElement>()

const currentUserId = computed(() => authStore.user?.id || '')

// メッセージ読み込み
const loadMessages = async () => {
  if (!props.recipient || !currentUserId.value) return

  loading.value = true
  try {
    const result = await messageApi.getConversation(props.recipient.id)
    if (result.error) {
      throw new Error(result.error)
    }
    messages.value = (result.data || []) as Message[]
    
    // 未読メッセージを既読にする
    await markMessagesAsRead()
    
    // メッセージリストの一番下にスクロール
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load messages:', error)
    toast.error('メッセージの読み込みに失敗しました')
  } finally {
    loading.value = false
  }
}

// 未読メッセージを既読にする
const markMessagesAsRead = async () => {
  if (!props.recipient || !currentUserId.value) return
  
  try {
    await messageApi.markConversationAsRead(props.recipient.id)
  } catch (error) {
    console.error('Failed to mark messages as read:', error)
  }
}

// メッセージリストの一番下にスクロール
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// メッセージ送信
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !props.recipient || !currentUserId.value) return

  sending.value = true
  try {
    const result = await messageApi.sendMessage({
      recipientId: props.recipient.id,
      content: newMessage.value,
      messageType: 'text',
      relatedApplicationId: props.relatedApplication?.id
    })

    if (result.error) {
      throw new Error(result.error)
    }

    // メッセージをローカルリストに追加（リアルタイムで受信される場合は重複回避）
    if (result.data) {
      const existingMessage = messages.value.find(msg => msg.id === result.data!.id)
      if (!existingMessage) {
        messages.value.push(result.data)
      }
    }
    
    newMessage.value = ''
    
    // 送信後にスクロール
    await nextTick()
    scrollToBottom()
    
    toast.success('メッセージを送信しました')
  } catch (error) {
    console.error('Failed to send message:', error)
    toast.error('メッセージの送信に失敗しました')
  } finally {
    sending.value = false
  }
}

// ファイル選択
const handleFileSelect = async (file: File) => {
  if (!props.recipient || !currentUserId.value) return

  sending.value = true
  try {
    // 画像をアップロード
    const uploadResult = await uploadMessageImage(file, currentUserId.value)
    if (uploadResult.error) {
      throw new Error(uploadResult.error)
    }

    if (uploadResult.data) {
      // 画像メッセージを送信
      const result = await messageApi.sendMessage({
        recipientId: props.recipient.id,
        content: uploadResult.data.url,
        messageType: 'image',
        relatedApplicationId: props.relatedApplication?.id
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // メッセージをローカルリストに追加
      if (result.data) {
        const existingMessage = messages.value.find(msg => msg.id === result.data!.id)
        if (!existingMessage) {
          messages.value.push(result.data)
        }
      }

      // 送信後にスクロール
      await nextTick()
      scrollToBottom()

      toast.success('画像を送信しました')
    }
  } catch (error) {
    console.error('Failed to send image:', error)
    toast.error('画像の送信に失敗しました')
  } finally {
    sending.value = false
  }
}

// リアルタイムメッセージ購読設定
const setupRealtimeSubscription = () => {
  if (!props.recipient || !currentUserId.value) return

  const channelName = `messages:${[currentUserId.value, props.recipient.id].sort().join('-')}`
  
  realtimeSubscription.value = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${currentUserId.value},recipient_id.eq.${props.recipient.id}),and(sender_id.eq.${props.recipient.id},recipient_id.eq.${currentUserId.value}))`
      },
      (payload: RealtimePostgresChangesPayload<Message>) => {
        if (payload.new) {
          const newMessage = payload.new as Message
          
          // 重複チェック
          const existingMessage = messages.value.find(msg => msg.id === newMessage.id)
          if (!existingMessage) {
            messages.value.push(newMessage)
            
            // 新しいメッセージにスクロール
            nextTick(() => {
              scrollToBottom()
            })
            
            // 受信したメッセージを既読にする（自分が送信者でない場合）
            if (newMessage.sender_id !== currentUserId.value) {
              markMessagesAsRead()
              
              // 通知表示
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`${props.recipient?.display_name}からメッセージ`, {
                  body: newMessage.message_type === 'image' ? '画像が送信されました' : newMessage.content.substring(0, 50),
                  icon: props.recipient?.avatar_url
                })
              }
            }
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${currentUserId.value},recipient_id.eq.${props.recipient.id}),and(sender_id.eq.${props.recipient.id},recipient_id.eq.${currentUserId.value}))`
      },
      (payload: RealtimePostgresChangesPayload<Message>) => {
        if (payload.new) {
          const updatedMessage = payload.new as Message
          const index = messages.value.findIndex(msg => msg.id === updatedMessage.id)
          if (index !== -1) {
            messages.value[index] = updatedMessage
          }
        }
      }
    )
    .subscribe()
}

// リアルタイム購読解除
const unsubscribeRealtime = () => {
  if (realtimeSubscription.value) {
    supabase.removeChannel(realtimeSubscription.value)
    realtimeSubscription.value = null
  }
}

// 通知権限をリクエスト
const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// モーダル表示時にメッセージ読み込みとリアルタイム開始
watch(() => props.show, (show) => {
  if (show) {
    loadMessages()
    setupRealtimeSubscription()
    requestNotificationPermission()
  } else {
    unsubscribeRealtime()
  }
})

onMounted(() => {
  if (props.show) {
    loadMessages()
    setupRealtimeSubscription()
    requestNotificationPermission()
  }
})

onUnmounted(() => {
  unsubscribeRealtime()
})
</script>
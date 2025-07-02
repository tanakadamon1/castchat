<template>
  <BaseModal :show="show" @close="$emit('close')" size="lg">
    <template #header>
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          <img
            v-if="recipient?.avatar_url"
            :src="recipient.avatar_url"
            :alt="recipient.display_name"
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
            {{ relatedApplication ? `応募について: ${relatedApplication.postTitle}` : 'メッセージ' }}
          </p>
        </div>
      </div>
    </template>

    <div class="h-96 flex flex-col">
      <!-- メッセージリスト -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
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
import { ref, onMounted, watch } from 'vue'
import { User, MessageCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseModal from '@/components/ui/BaseModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'

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

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const toast = useToast()

// 状態
const messages = ref<Message[]>([])
const newMessage = ref('')
const loading = ref(false)
const sending = ref(false)

const currentUserId = authStore.user?.id

// メッセージ読み込み
const loadMessages = async () => {
  if (!props.recipient) return

  loading.value = true
  try {
    // TODO: 実際のAPI呼び出しに置き換え
    // const result = await messageApi.getConversation(props.recipient.id)
    // messages.value = result.data || []
    
    // 暫定的にダミーデータ
    messages.value = []
  } catch (error) {
    console.error('Failed to load messages:', error)
    toast.error('メッセージの読み込みに失敗しました')
  } finally {
    loading.value = false
  }
}

// メッセージ送信
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !props.recipient) return

  sending.value = true
  try {
    // TODO: 実際のAPI呼び出しに置き換え
    // const result = await messageApi.sendMessage({
    //   recipient_id: props.recipient.id,
    //   content: newMessage.value,
    //   message_type: 'text',
    //   related_application_id: props.relatedApplication?.id
    // })

    // 暫定的にローカルに追加
    const mockMessage: Message = {
      id: Date.now().toString(),
      content: newMessage.value,
      sender_id: currentUserId!,
      recipient_id: props.recipient.id,
      message_type: 'text',
      created_at: new Date().toISOString()
    }
    
    messages.value.push(mockMessage)
    newMessage.value = ''
    
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
  if (!props.recipient) return

  try {
    // TODO: 画像アップロード実装
    toast.info('画像送信機能は準備中です')
  } catch (error) {
    console.error('Failed to send image:', error)
    toast.error('画像の送信に失敗しました')
  }
}

// モーダル表示時にメッセージ読み込み
watch(() => props.show, (show) => {
  if (show) {
    loadMessages()
  }
})

onMounted(() => {
  if (props.show) {
    loadMessages()
  }
})
</script>
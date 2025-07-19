<template>
  <div class="message-chat" :class="{ 'chat-mobile': isMobile }">
    <!-- チャットヘッダー -->
    <header class="chat-header">
      <div class="header-left">
        <button
          v-if="isMobile"
          class="back-button"
          @click="$emit('close')"
          aria-label="チャットを閉じる"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        
        <div v-if="recipient" class="user-info">
          <div class="user-avatar-container">
            <img
              :src="recipient.avatar || '/default-avatar.png'"
              :alt="`${recipient.displayName}のアバター`"
              class="user-avatar"
            />
            <div
              v-if="recipient.isOnline"
              class="online-indicator"
              aria-label="オンライン"
            />
          </div>
          
          <div class="user-details">
            <h3 class="user-name">{{ recipient?.displayName || 'ユーザー' }}</h3>
            <span class="user-status">
              {{ recipient?.isOnline ? 'オンライン' : `最終ログイン: ${formatLastSeen(recipient?.lastSeen)}` }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="header-actions">
        <button
          v-if="!isMobile"
          class="header-action-btn"
          @click="$emit('close')"
          aria-label="チャットを閉じる"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- メッセージエリア -->
    <div
      ref="messagesContainer"
      class="messages-container"
      @scroll="handleScroll"
    >
      <!-- 日付区切り -->
      <div
        v-for="(group, date) in groupedMessages"
        :key="date"
        class="message-date-group"
      >
        <div class="date-divider">
          <span class="date-text">{{ formatDate(date) }}</span>
        </div>
        
        <!-- その日のメッセージ -->
        <div
          v-for="(message, index) in group"
          :key="message.id"
          class="message-wrapper"
          :class="{
            'message-own': message.sender_id === currentUserId,
            'message-consecutive': isConsecutiveMessage(message, group, index)
          }"
        >
          <!-- アバター（他者メッセージ・非連続時のみ） -->
          <div
            v-if="message.sender_id !== currentUserId && !isConsecutiveMessage(message, group, index)"
            class="message-avatar"
          >
            <img
              :src="message.sender?.avatar || '/default-avatar.png'"
              :alt="`${message.sender?.name || 'ユーザー'}のアバター`"
              class="avatar-img"
            />
          </div>
          
          <!-- メッセージバブル -->
          <div class="message-bubble-container">
            <div
              class="message-bubble"
              :class="{
                'bubble-own': message.sender_id === currentUserId,
                'bubble-other': message.sender_id !== currentUserId,
                'bubble-sending': message.is_read === false,
                'bubble-error': false
              }"
            >
              <!-- テキストメッセージ -->
              <div v-if="message.message_type === 'text'" class="message-content">
                <p class="message-text">{{ message.content }}</p>
              </div>
              
              <!-- 画像メッセージ -->
              <div v-else-if="message.message_type === 'image'" class="message-image">
                <img
                  :src="message.content"
                  alt="送信された画像"
                  class="image-content"
                  @click="openImageModal(message.content)"
                  @load="scrollToBottom"
                />
              </div>
              
              <!-- システムメッセージ -->
              <div v-else class="message-system">
                <p class="system-text">{{ message.content }}</p>
              </div>
            </div>
            
            <!-- メッセージメタ情報 -->
            <div
              v-if="!isConsecutiveMessage(message, group, index)"
              class="message-meta"
              :class="{ 'meta-own': message.sender_id === currentUserId }"
            >
              <span class="message-time">{{ formatTime(message.created_at) }}</span>
              
              <!-- 送信状況（自分のメッセージのみ） -->
              <span
                v-if="message.sender_id === currentUserId && message.is_read !== undefined"
                class="message-status"
                :class="message.is_read ? 'status-read' : 'status-sent'"
              >
                {{ message.is_read ? '既読' : '送信済み' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- タイピングインジケーター -->
      <div v-if="isRecipientTyping && recipient" class="typing-container">
        <div class="typing-message">
          <div class="typing-avatar">
            <img
              :src="recipient?.avatar || '/default-avatar.png'"
              :alt="`${recipient?.displayName || 'ユーザー'}のアバター`"
              class="avatar-img"
            />
          </div>
          <div class="typing-bubble">
            <div class="typing-dots">
              <div class="dot" />
              <div class="dot" />
              <div class="dot" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- メッセージ入力エリア -->
    <footer class="chat-input-container">
      <MessageInput
        v-model="messageText"
        :disabled="sending"
        :placeholder="recipient ? `${recipient.displayName}さんにメッセージを送信` : 'メッセージを送信'"
        @send="handleSendMessage"
        @typing="handleTyping"
        @file-select="handleFileSelect"
      />
    </footer>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MessageChat'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import MessageInput from './MessageInput.vue'
import type { ChatUser, ChatMessage } from '@/types/index'

interface Props {
  recipient: ChatUser
  currentUserId: string
  messages: ChatMessage[]
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
})

const emit = defineEmits<{
  close: []
  sendMessage: [content: string, type: 'text' | 'image']
  loadMore: []
  typing: [isTyping: boolean]
}>()

// State
const messageText = ref('')
const messagesContainer = ref<HTMLElement>()
const sending = ref(false)
const isRecipientTyping = ref(false)
const typingTimeout = ref<number>()

// Computed
const groupedMessages = computed(() => {
  const groups: Record<string, ChatMessage[]> = {}
  
  if (!props.messages || !Array.isArray(props.messages)) {
    return groups
  }
  
  props.messages.forEach(message => {
    if (!message || !message.created_at) return
    
    try {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    } catch {
      // Error grouping message
    }
  })
  
  return groups
})

// Methods
const handleSendMessage = async () => {
  if (sending.value || !messageText.value.trim()) return
  
  sending.value = true
  const content = messageText.value
  messageText.value = ''
  
  try {
    emit('sendMessage', content, 'text')
    await nextTick()
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

const handleTyping = (isTyping: boolean) => {
  emit('typing', isTyping)
}

const handleFileSelect = async (file: File) => {
  // ファイルアップロード処理
  // 実際の実装では画像をアップロードしてURLを取得
  const imageUrl = URL.createObjectURL(file)
  
  if (sending.value) return
  
  sending.value = true
  
  try {
    emit('sendMessage', imageUrl, 'image')
    await nextTick()
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop } = messagesContainer.value
  if (scrollTop === 0) {
    emit('loadMore')
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const isConsecutiveMessage = (message: ChatMessage, group: ChatMessage[], index: number): boolean => {
  if (index === 0) return false
  
  const prevMessage = group[index - 1]
  const timeDiff = new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()
  
  return (
    prevMessage.sender_id === message.sender_id &&
    timeDiff < 60000 // 1分以内
  )
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  
  if (date.toDateString() === today.toDateString()) {
    return '今日'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨日'
  } else {
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }
}

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatLastSeen = (lastSeen?: string): string => {
  if (!lastSeen) return '不明'
  
  try {
    const date = new Date(lastSeen)
    if (isNaN(date.getTime())) return '不明'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    
    if (diffMinutes < 1) return 'たった今'
    if (diffMinutes < 60) return `${diffMinutes}分前`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}時間前`
    
    return date.toLocaleDateString('ja-JP')
  } catch {
    return '不明'
  }
}


const openImageModal = (imageUrl: string) => {
  // 画像モーダル表示（実装は別途）
  window.open(imageUrl, '_blank')
}

// Lifecycle
onMounted(() => {
  scrollToBottom()
})

// Watch for new messages
watch(() => props.messages.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// Cleanup
onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>

<style scoped>
.message-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
  transition: background-color 0.2s ease;
}

.dark .message-chat {
  background: #111827;
}

.chat-mobile {
  height: 100vh;
}

/* ヘッダー */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  min-height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #f1f5f9;
  color: #334155;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-container {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.user-status {
  font-size: 12px;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-action-btn {
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.header-action-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

/* メッセージエリア */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.message-date-group {
  margin-bottom: 24px;
}

.date-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.date-text {
  background: #e2e8f0;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.message-wrapper {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-end;
}

.message-wrapper.message-own {
  justify-content: flex-end;
}

.message-wrapper.message-consecutive {
  margin-bottom: 2px;
}

.message-avatar {
  width: 32px;
  margin-right: 8px;
  flex-shrink: 0;
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.message-bubble-container {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-own .message-bubble-container {
  align-items: flex-end;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
}

.bubble-own {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

.bubble-other {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

.bubble-sending {
  opacity: 0.7;
}

.bubble-error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.message-text {
  margin: 0;
  line-height: 1.4;
  font-size: 15px;
}

.message-image .image-content {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image .image-content:hover {
  transform: scale(1.02);
}

.message-system {
  background: #f1f5f9;
  color: #64748b;
  border-radius: 12px;
  text-align: center;
  font-style: italic;
}

.system-text {
  margin: 0;
  font-size: 13px;
}

.message-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
  color: #94a3b8;
}

.meta-own {
  justify-content: flex-end;
}

.message-status {
  font-weight: 500;
}

.status-sending { color: #f59e0b; }
.status-sent { color: #6b7280; }
.status-delivered { color: #6b7280; }
.status-read { color: #10b981; }
.status-error { color: #ef4444; }

/* タイピングインジケーター */
.typing-container {
  padding: 8px 0;
}

.typing-message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.typing-avatar {
  width: 32px;
  flex-shrink: 0;
}

.typing-bubble {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 12px 16px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: 0ms; }
.dot:nth-child(2) { animation-delay: 200ms; }
.dot:nth-child(3) { animation-delay: 400ms; }

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

/* 入力エリア */
.chat-input-container {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 12px 16px;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .message-bubble-container {
    max-width: 85%;
  }
  
  .message-bubble {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .message-image .image-content {
    max-width: 150px;
    max-height: 150px;
  }
  
  .chat-header {
    padding: 8px 12px;
  }
  
  .messages-container {
    padding: 12px;
  }
}

/* スクロールバー */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
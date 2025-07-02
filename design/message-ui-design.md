# メッセージUI設計仕様書

## メッセージシステム概要

VRChatキャスト募集掲示板のメッセージ機能は、応募者と投稿者間のプライベートなコミュニケーションを促進するリアルタイムチャット機能です。

## コンポーネント構成

### 1. MessageModal.vue（メインコンポーネント）

#### 概要
応募詳細画面や通知から起動されるメッセージモーダル

#### レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│                    Message Modal (600x500px)                │
├─────────────────────────────────────────────────────────────┤
│                       Header (60px)                         │
│  ← [戻る]  👤 ユーザー名 [オンライン]           [✕ 閉じる] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                  Message List (380px)                      │
│                   [スクロール可能]                          │
│                                                             │
│  [相手メッセージ]    [自分メッセージ]                       │
│      ↓                   ↓                                │
│   ┌─────────────┐      ┌─────────────┐                     │
│   │ メッセージ  │      │ メッセージ  │                     │
│   │ 内容...     │      │ 内容...     │                     │
│   │ 12:34       │      │ 12:35       │                     │
│   └─────────────┘      └─────────────┘                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    Message Input (60px)                     │
│  📎 [メッセージを入力...                    ] [送信]       │
└─────────────────────────────────────────────────────────────┘
```

#### Vue.js実装仕様
```vue
<template>
  <div class="message-modal-overlay" @click="$emit('close')">
    <div class="message-modal" @click.stop>
      <!-- ヘッダー -->
      <header class="message-header">
        <div class="header-left">
          <button class="back-button" @click="$emit('close')">
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div class="user-info">
            <img :src="recipient.avatar" :alt="recipient.name" class="user-avatar" />
            <div class="user-details">
              <h3 class="user-name">{{ recipient.name }}</h3>
              <span class="user-status" :class="statusClasses">
                <div class="status-dot"></div>
                {{ recipient.isOnline ? 'オンライン' : '最終ログイン: ' + formatLastSeen(recipient.lastSeen) }}
              </span>
            </div>
          </div>
        </div>
        <button class="close-button" @click="$emit('close')">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </header>

      <!-- メッセージリスト -->
      <MessageList
        ref="messageListRef"
        :messages="messages"
        :current-user-id="currentUserId"
        :loading="loading"
        @scroll-to-top="loadMoreMessages"
      />

      <!-- メッセージ入力 -->
      <MessageInput
        :disabled="sending"
        :placeholder="inputPlaceholder"
        @send="handleSendMessage"
        @typing="handleTyping"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import type { User, Message } from '@/types'

interface Props {
  recipient: User
  currentUserId: string
  initialMessages?: Message[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  messagesSent: [message: Message]
}>()

// State
const messages = ref<Message[]>(props.initialMessages || [])
const loading = ref(false)
const sending = ref(false)
const messageListRef = ref()

// Computed
const statusClasses = computed(() => ({
  'status-online': props.recipient.isOnline,
  'status-offline': !props.recipient.isOnline
}))

const inputPlaceholder = computed(() => 
  props.recipient.isOnline 
    ? `${props.recipient.name}さんにメッセージを送信`
    : 'メッセージを送信（相手がオフラインです）'
)

// Methods
const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text') => {
  if (sending.value) return
  
  sending.value = true
  try {
    const newMessage = {
      id: Date.now().toString(), // 仮ID
      content,
      type,
      senderId: props.currentUserId,
      recipientId: props.recipient.id,
      timestamp: new Date().toISOString(),
      status: 'sending' as const
    }
    
    // 楽観的UI更新
    messages.value.push(newMessage)
    scrollToBottom()
    
    // API送信
    const { messagesApi } = await import('@/lib/messagesApi')
    const result = await messagesApi.sendMessage({
      recipient_id: props.recipient.id,
      content,
      message_type: type
    })
    
    if (result.error) {
      // エラー時は仮メッセージを削除
      messages.value = messages.value.filter(m => m.id !== newMessage.id)
      throw new Error(result.error)
    }
    
    // 成功時は仮メッセージを本物と置換
    const index = messages.value.findIndex(m => m.id === newMessage.id)
    if (index !== -1) {
      messages.value[index] = result.data
    }
    
    emit('messagesSent', result.data)
  } catch (error) {
    console.error('メッセージ送信エラー:', error)
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  messageListRef.value?.scrollToBottom()
}

// Lifecycle
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.message-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.message-modal {
  width: 600px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-header {
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F9FAFB;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button, .close-button {
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover, .close-button:hover {
  background: #E5E7EB;
  color: #374151;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6B7280;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9CA3AF;
}

.status-online .status-dot {
  background: #10B981;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .message-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  .message-header {
    padding: 0 12px;
  }
  
  .user-name {
    font-size: 14px;
  }
}
</style>
```

### 2. MessageList.vue（メッセージ一覧）

#### 概要
メッセージの一覧表示とスクロール管理

#### 実装仕様
```vue
<template>
  <div ref="scrollContainer" class="message-list" @scroll="handleScroll">
    <!-- ローディング（上部） -->
    <div v-if="loading" class="loading-more">
      <div class="spinner"></div>
      <span>メッセージを読み込んでいます...</span>
    </div>
    
    <!-- メッセージ群 -->
    <div class="messages-container">
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :is-own="message.senderId === currentUserId"
        :show-avatar="shouldShowAvatar(message, messages)"
        :show-timestamp="shouldShowTimestamp(message, messages)"
      />
    </div>
    
    <!-- タイピング表示 -->
    <div v-if="isTyping" class="typing-indicator">
      <div class="typing-bubble">
        <div class="typing-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import MessageBubble from './MessageBubble.vue'
import type { Message } from '@/types'

interface Props {
  messages: Message[]
  currentUserId: string
  loading?: boolean
  isTyping?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  scrollToTop: []
}>()

const scrollContainer = ref<HTMLElement>()

// メッセージグルーピング用の判定
const shouldShowAvatar = (message: Message, messages: Message[]) => {
  const index = messages.findIndex(m => m.id === message.id)
  const nextMessage = messages[index + 1]
  
  return !nextMessage || 
         nextMessage.senderId !== message.senderId ||
         isNewTimeGroup(message, nextMessage)
}

const shouldShowTimestamp = (message: Message, messages: Message[]) => {
  const index = messages.findIndex(m => m.id === message.id)
  const prevMessage = messages[index - 1]
  
  return !prevMessage || 
         prevMessage.senderId !== message.senderId ||
         isNewTimeGroup(prevMessage, message)
}

const isNewTimeGroup = (message1: Message, message2: Message) => {
  const time1 = new Date(message1.timestamp)
  const time2 = new Date(message2.timestamp)
  return time2.getTime() - time1.getTime() > 300000 // 5分
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

const handleScroll = () => {
  if (scrollContainer.value?.scrollTop === 0) {
    emit('scrollToTop')
  }
}

defineExpose({ scrollToBottom })
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #F9FAFB;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #6B7280;
  font-size: 14px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.typing-indicator {
  display: flex;
  justify-content: flex-start;
  margin-top: 12px;
}

.typing-bubble {
  background: white;
  border-radius: 18px;
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #9CA3AF;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: 0ms; }
.dot:nth-child(2) { animation-delay: 200ms; }
.dot:nth-child(3) { animation-delay: 400ms; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}
</style>
```

### 3. MessageBubble.vue（個別メッセージ）

#### 実装仕様
```vue
<template>
  <div class="message-wrapper" :class="{ 'own-message': isOwn }">
    <!-- アバター（他者のメッセージのみ） -->
    <img 
      v-if="!isOwn && showAvatar" 
      :src="message.sender?.avatar || '/default-avatar.png'"
      :alt="message.sender?.name"
      class="message-avatar"
    />
    
    <!-- メッセージバブル -->
    <div class="message-bubble" :class="bubbleClasses">
      <!-- テキストメッセージ -->
      <div v-if="message.type === 'text'" class="message-text">
        {{ message.content }}
      </div>
      
      <!-- 画像メッセージ -->
      <div v-else-if="message.type === 'image'" class="message-image">
        <img :src="message.content" alt="送信された画像" @click="showImageModal" />
      </div>
      
      <!-- ステータス・タイムスタンプ -->
      <div v-if="showTimestamp" class="message-meta">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <span v-if="isOwn && message.status" class="message-status" :class="statusClasses">
          {{ statusLabels[message.status] }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'

interface Props {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
}

const props = defineProps<Props>()

const bubbleClasses = computed(() => ({
  'bubble-own': props.isOwn,
  'bubble-other': !props.isOwn,
  'bubble-sending': props.message.status === 'sending',
  'bubble-error': props.message.status === 'error'
}))

const statusClasses = computed(() => ({
  'status-sending': props.message.status === 'sending',
  'status-sent': props.message.status === 'sent',
  'status-read': props.message.status === 'read',
  'status-error': props.message.status === 'error'
}))

const statusLabels = {
  sending: '送信中...',
  sent: '送信済み',
  read: '既読',
  error: '送信失敗'
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const showImageModal = () => {
  // 画像モーダル表示の実装
}
</script>

<style scoped>
.message-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 4px;
}

.message-wrapper.own-message {
  justify-content: flex-end;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
}

.bubble-other {
  background: white;
  border: 1px solid #E5E7EB;
  border-bottom-left-radius: 4px;
}

.bubble-own {
  background: #3B82F6;
  color: white;
  border-bottom-right-radius: 4px;
}

.bubble-sending {
  opacity: 0.7;
}

.bubble-error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.message-text {
  line-height: 1.4;
  font-size: 15px;
}

.message-image img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image img:hover {
  transform: scale(1.02);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.7;
}

.message-time {
  font-weight: 500;
}

.message-status {
  font-size: 10px;
}

.status-sending { color: #F59E0B; }
.status-sent { color: #6B7280; }
.status-read { color: #10B981; }
.status-error { color: #EF4444; }

/* モバイル対応 */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
    padding: 10px 14px;
  }
  
  .message-text {
    font-size: 14px;
  }
  
  .message-image img {
    max-width: 150px;
    max-height: 150px;
  }
}
</style>
```

### 4. MessageInput.vue（メッセージ入力）

#### 実装仕様
```vue
<template>
  <div class="message-input-container">
    <!-- ファイル選択（非表示） -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="handleFileSelect"
    />
    
    <div class="input-wrapper">
      <!-- 添付ボタン -->
      <button 
        class="attach-button" 
        @click="fileInput?.click()"
        :disabled="disabled"
      >
        <PaperClipIcon class="w-5 h-5" />
      </button>
      
      <!-- テキスト入力 -->
      <textarea
        ref="textInput"
        v-model="message"
        :placeholder="placeholder"
        :disabled="disabled"
        class="message-textarea"
        rows="1"
        @keydown="handleKeydown"
        @input="handleInput"
      />
      
      <!-- 送信ボタン -->
      <button 
        class="send-button" 
        :disabled="!canSend || disabled"
        @click="sendMessage"
      >
        <PaperAirplaneIcon class="w-5 h-5" />
      </button>
    </div>
    
    <!-- 画像プレビュー -->
    <div v-if="selectedImage" class="image-preview">
      <img :src="selectedImage.preview" alt="プレビュー" />
      <button class="remove-image" @click="removeImage">
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { PaperClipIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'メッセージを入力...',
  maxLength: 1000
})

const emit = defineEmits<{
  send: [content: string, type: 'text' | 'image']
  typing: [isTyping: boolean]
}>()

// State
const message = ref('')
const selectedImage = ref<{ file: File; preview: string } | null>(null)
const textInput = ref<HTMLTextAreaElement>()
const fileInput = ref<HTMLInputElement>()
const typingTimeout = ref<number>()

// Computed
const canSend = computed(() => 
  (message.value.trim().length > 0 || selectedImage.value) && 
  message.value.length <= props.maxLength
)

// Methods
const sendMessage = async () => {
  if (!canSend.value) return
  
  if (selectedImage.value) {
    // 画像送信
    const imageUrl = await uploadImage(selectedImage.value.file)
    emit('send', imageUrl, 'image')
    removeImage()
  } else {
    // テキスト送信
    emit('send', message.value.trim(), 'text')
  }
  
  message.value = ''
  emit('typing', false)
  adjustTextareaHeight()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  adjustTextareaHeight()
  
  // タイピング通知
  emit('typing', true)
  clearTimeout(typingTimeout.value)
  typingTimeout.value = setTimeout(() => {
    emit('typing', false)
  }, 1000)
}

const adjustTextareaHeight = () => {
  nextTick(() => {
    if (textInput.value) {
      textInput.value.style.height = 'auto'
      textInput.value.style.height = `${Math.min(textInput.value.scrollHeight, 120)}px`
    }
  })
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  // ファイルサイズチェック（5MB制限）
  if (file.size > 5 * 1024 * 1024) {
    alert('ファイルサイズは5MB以下にしてください')
    return
  }
  
  const preview = URL.createObjectURL(file)
  selectedImage.value = { file, preview }
}

const removeImage = () => {
  if (selectedImage.value) {
    URL.revokeObjectURL(selectedImage.value.preview)
    selectedImage.value = null
  }
}

const uploadImage = async (file: File): Promise<string> => {
  // 画像アップロード処理の実装
  const formData = new FormData()
  formData.append('image', file)
  
  // TODO: 実際のアップロードAPI呼び出し
  return 'https://example.com/uploaded-image.jpg'
}
</script>

<style scoped>
.message-input-container {
  border-top: 1px solid #E5E7EB;
  background: white;
  padding: 16px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.attach-button, .send-button {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.attach-button {
  background: #F3F4F6;
  color: #6B7280;
}

.attach-button:hover:not(:disabled) {
  background: #E5E7EB;
  color: #374151;
}

.send-button {
  background: #3B82F6;
  color: white;
}

.send-button:hover:not(:disabled) {
  background: #1D4ED8;
}

.send-button:disabled {
  background: #D1D5DB;
  cursor: not-allowed;
}

.message-textarea {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 20px;
  resize: none;
  font-size: 15px;
  line-height: 1.4;
  outline: none;
  transition: border-color 0.2s;
}

.message-textarea:focus {
  border-color: #3B82F6;
}

.message-textarea:disabled {
  background: #F9FAFB;
  color: #9CA3AF;
}

.image-preview {
  position: relative;
  margin-top: 12px;
  display: inline-block;
}

.image-preview img {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .message-input-container {
    padding: 12px;
  }
  
  .attach-button, .send-button {
    width: 36px;
    height: 36px;
  }
  
  .message-textarea {
    font-size: 16px; /* iOS zoom防止 */
  }
}
</style>
```

## 使用例・統合方法

### ApplicationsView.vueでの使用
```vue
<template>
  <div>
    <!-- 既存の応募一覧 -->
    <div v-for="application in applications" :key="application.id">
      <!-- 既存の応募カード -->
      <button @click="openMessage(application.applicant)">
        💬 メッセージ
      </button>
    </div>
    
    <!-- メッセージモーダル -->
    <MessageModal
      v-if="showMessageModal && selectedUser"
      :recipient="selectedUser"
      :current-user-id="authStore.user.id"
      @close="closeMessage"
      @messages-sent="handleMessageSent"
    />
  </div>
</template>

<script setup>
import MessageModal from '@/components/message/MessageModal.vue'

const showMessageModal = ref(false)
const selectedUser = ref(null)

const openMessage = (user) => {
  selectedUser.value = user
  showMessageModal.value = true
}

const closeMessage = () => {
  showMessageModal.value = false
  selectedUser.value = null
}
</script>
```

## リアルタイム機能

### WebSocket/Supabase Realtime統合
```typescript
// composables/useMessages.ts
import { ref, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'

export const useMessages = (userId: string) => {
  const messages = ref<Message[]>([])
  const isTyping = ref(false)
  
  // リアルタイム購読
  const subscription = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `recipient_id=eq.${userId}`
    }, (payload) => {
      messages.value.push(payload.new as Message)
    })
    .on('presence', { event: 'sync' }, () => {
      // オンライン状態の更新
    })
    .subscribe()
  
  onUnmounted(() => {
    subscription.unsubscribe()
  })
  
  return {
    messages,
    isTyping
  }
}
```

このメッセージUI設計により、ユーザー間のスムーズなコミュニケーションが実現され、応募・採用プロセスが大幅に改善されます。
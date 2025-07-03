<template>
  <div class="flex" :class="isOwnMessage ? 'justify-end' : 'justify-start'">
    <div class="max-w-xs lg:max-w-md">
      <!-- 送信者アバター（自分以外） -->
      <div v-if="!isOwnMessage" class="flex items-end space-x-2">
        <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          <img
            v-if="message.sender?.avatar_url"
            :src="message.sender.avatar_url"
            :alt="message.sender?.display_name || 'ユーザー'"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <User class="w-4 h-4" />
          </div>
        </div>
        
        <div class="flex flex-col">
          <!-- メッセージバブル -->
          <div
            class="rounded-lg px-4 py-2"
            :class="bubbleClasses"
          >
            <div v-if="message.message_type === 'text'">
              <p class="text-sm" :class="textClasses">{{ message.content }}</p>
            </div>
            
            <div v-else-if="message.message_type === 'image'">
              <img
                :src="message.content"
                :alt="'画像メッセージ'"
                class="max-w-full rounded cursor-pointer"
                @click="showImageModal = true"
              />
            </div>
          </div>
          
          <!-- タイムスタンプ -->
          <div class="mt-1" :class="timestampClasses">
            <span class="text-xs text-gray-500">
              {{ formatTime(message.created_at) }}
              <span v-if="isOwnMessage && message.read_at" class="ml-1">
                <Check class="w-3 h-3 inline text-blue-500" />
              </span>
              <span v-else-if="isOwnMessage" class="ml-1">
                <Check class="w-3 h-3 inline text-gray-400" />
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 自分のメッセージ -->
      <div v-else class="flex flex-col items-end">
        <!-- メッセージバブル -->
        <div
          class="rounded-lg px-4 py-2"
          :class="bubbleClasses"
        >
          <div v-if="message.message_type === 'text'">
            <p class="text-sm" :class="textClasses">{{ message.content }}</p>
          </div>
          
          <div v-else-if="message.message_type === 'image'">
            <img
              :src="message.content"
              :alt="'画像メッセージ'"
              class="max-w-full rounded cursor-pointer"
              @click="showImageModal = true"
            />
          </div>
        </div>
        
        <!-- タイムスタンプ -->
        <div class="mt-1" :class="timestampClasses">
          <span class="text-xs text-gray-500">
            {{ formatTime(message.created_at) }}
            <span v-if="message.read_at" class="ml-1">
              <Check class="w-3 h-3 inline text-blue-500" />
            </span>
            <span v-else class="ml-1">
              <Check class="w-3 h-3 inline text-gray-400" />
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- 画像拡大モーダル -->
  <BaseModal v-if="message.message_type === 'image'" :show="showImageModal" @close="showImageModal = false" size="lg">
    <template #header>
      <h3 class="text-lg font-semibold">画像</h3>
    </template>
    <div class="text-center">
      <img
        :src="message.content"
        :alt="'画像メッセージ'"
        class="max-w-full max-h-96 mx-auto"
      />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { User, Check } from 'lucide-vue-next'
import BaseModal from '@/components/ui/BaseModal.vue'

interface Message {
  id: string
  content: string
  sender_id: string
  recipient_id: string
  message_type: 'text' | 'image'
  created_at: string
  read_at?: string
  sender?: {
    display_name: string
    avatar_url?: string
  }
}

interface Props {
  message: Message
  isOwn: boolean
}

const props = defineProps<Props>()

const showImageModal = ref(false)

const isOwnMessage = computed(() => props.isOwn)

const bubbleClasses = computed(() => {
  return isOwnMessage.value
    ? 'bg-indigo-600 text-white'
    : 'bg-gray-100 text-gray-900'
})

const textClasses = computed(() => {
  return isOwnMessage.value ? 'text-white' : 'text-gray-900'
})

const timestampClasses = computed(() => {
  return isOwnMessage.value ? 'text-right' : 'text-left'
})

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // 今日
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffDays === 1) {
    // 昨日
    return '昨日 ' + date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffDays < 7) {
    // 1週間以内
    return `${diffDays}日前`
  } else {
    // それ以上前
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric'
    })
  }
}
</script>
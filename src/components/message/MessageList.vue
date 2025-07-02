<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <!-- ヘッダー -->
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900">メッセージ</h2>
    </div>

    <!-- 会話リスト -->
    <div class="divide-y divide-gray-200">
      <div v-if="loading" class="p-6 text-center">
        <LoadingSpinner size="md" />
        <p class="text-gray-500 mt-2">読み込み中...</p>
      </div>

      <div v-else-if="conversations.length === 0" class="p-6 text-center">
        <MessageCircle class="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p class="text-gray-500">まだメッセージがありません</p>
      </div>

      <div
        v-for="conversation in conversations"
        :key="conversation.id"
        @click="$emit('select-conversation', conversation)"
        class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <div class="flex items-center space-x-3">
          <!-- アバター -->
          <div class="relative flex-shrink-0">
            <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img
                v-if="conversation.otherUser.avatar_url"
                :src="conversation.otherUser.avatar_url"
                :alt="conversation.otherUser.display_name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <User class="w-5 h-5" />
              </div>
            </div>
            
            <!-- 未読バッジ -->
            <div
              v-if="conversation.unreadCount > 0"
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
            >
              {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
            </div>
          </div>

          <!-- 会話情報 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ conversation.otherUser.display_name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatTime(conversation.lastMessage.created_at) }}
              </p>
            </div>
            
            <div class="flex items-center justify-between mt-1">
              <p class="text-sm text-gray-600 truncate">
                <span v-if="conversation.lastMessage.sender_id === currentUserId" class="text-gray-500">
                  あなた: 
                </span>
                {{ conversation.lastMessage.content }}
              </p>
              
              <!-- 関連する応募があれば表示 -->
              <div v-if="conversation.relatedApplication" class="flex-shrink-0 ml-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  応募
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- フッター -->
    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <button
        @click="$emit('refresh')"
        :disabled="loading"
        class="text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
      >
        更新
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, MessageCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

interface LastMessage {
  id: string
  content: string
  sender_id: string
  created_at: string
}

interface Conversation {
  id: string
  otherUser: {
    id: string
    display_name: string
    avatar_url?: string
  }
  lastMessage: LastMessage
  unreadCount: number
  relatedApplication?: {
    id: string
    postTitle: string
  }
}

interface Props {
  conversations: Conversation[]
  loading?: boolean
}

interface Emits {
  (e: 'select-conversation', conversation: Conversation): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<Emits>()

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id)

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
    return '昨日'
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
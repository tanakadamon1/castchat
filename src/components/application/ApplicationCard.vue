<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6"
  >
    <div class="flex flex-col lg:flex-row lg:items-start gap-4">
      <!-- 左側：ユーザー情報またはポスト情報 -->
      <div class="flex items-start gap-3 lg:min-w-0 lg:flex-1">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {{ displayName }}
            </h3>
            <ApplicationStatusBadge :status="application.status" />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ displayTitle }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {{ formatDate(application.appliedAt) }}に応募
            <span v-if="application.respondedAt" class="ml-2">
              • {{ formatDate(application.respondedAt) }}に回答
            </span>
          </p>
        </div>
      </div>

      <!-- 右側：アクションボタン -->
      <div class="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
        <!-- 受信した応募の場合 -->
        <template v-if="type === 'received'">
          <BaseButton
            v-if="application.status === 'pending'"
            size="sm"
            @click="() => handleUpdateStatus('accepted')"
          >
            承認
          </BaseButton>
          <BaseButton
            v-if="application.status === 'pending'"
            size="sm"
            variant="outline"
            @click="() => handleUpdateStatus('rejected')"
          >
            却下
          </BaseButton>
        </template>

        <!-- 送信した応募の場合 -->
        <template v-if="type === 'sent'">
          <BaseButton size="sm" variant="outline" @click="handleViewPost"> 投稿を見る </BaseButton>
          <BaseButton
            v-if="application.status === 'pending'"
            size="sm"
            variant="outline"
            @click="handleWithdraw"
          >
            取り下げ
          </BaseButton>
        </template>
      </div>
    </div>

    <!-- 送信した応募のメッセージプレビュー -->
    <div
      v-if="type === 'sent' && application.message"
      class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <p class="text-sm font-bold text-gray-700 mb-2 dark:text-gray-200">送信したメッセージ</p>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <p class="text-sm text-gray-800 dark:text-gray-100 line-clamp-2">
          {{ application.message }}
        </p>
      </div>
    </div>

    <!-- 応募内容プレビュー（受信した応募のみ詳細表示） -->
    <div
      v-if="type === 'received'"
      class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3"
    >
      <div v-if="application.message">
        <p class="text-sm font-bold text-gray-700 mb-2 dark:text-gray-200">応募メッセージ</p>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p class="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
            {{ application.message }}
          </p>
        </div>
      </div>
      <div v-if="application.experience">
        <p class="text-sm font-bold text-gray-700 mb-2 dark:text-gray-200">
          関連する経験・スキル（任意）
        </p>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p class="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
            {{ application.experience }}
          </p>
        </div>
      </div>
      <div v-if="application.availability">
        <p class="text-sm font-bold text-gray-700 mb-2 dark:text-gray-200">
          参加可能な時間帯（任意）
        </p>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p class="text-sm text-gray-800 dark:text-gray-100">{{ application.availability }}</p>
        </div>
      </div>
      <div v-if="application.twitterId">
        <p class="text-sm font-bold text-gray-700 mb-2 dark:text-gray-200">Twitter ID</p>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p class="text-sm text-gray-800 dark:text-gray-100">
            <a
              :href="`https://twitter.com/${application.twitterId}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              @{{ application.twitterId }}
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- 展開されたメッセージ -->
    <div
      v-if="showFullMessage && application.message"
      class="mt-2 p-3 bg-gray-50 rounded-md dark:bg-gray-800"
    >
      <p class="text-sm text-gray-800 whitespace-pre-wrap dark:text-gray-100">
        {{ application.message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { User } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import ApplicationStatusBadge from './ApplicationStatusBadge.vue'

interface Application {
  id: string
  postId?: string
  postTitle?: string
  postAuthor?: string
  applicantId?: string
  applicantName?: string
  applicantAvatar?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  message?: string
  appliedAt: string
  respondedAt?: string | null
  experience?: string
  availability?: string
  portfolio_url?: string
  twitterId?: string
}

interface Props {
  application: Application
  type: 'received' | 'sent'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateStatus: [applicationId: string, status: string]
  viewProfile: [userId: string]
  sendMessage: [userId: string]
  viewPost: [postId: string]
  withdraw: [applicationId: string]
}>()

const showFullMessage = ref(false)

// 表示する名前とタイトル
const displayName = computed(() => {
  return props.type === 'received'
    ? props.application.applicantName || '匿名ユーザー'
    : props.application.postAuthor || '投稿者'
})

const displayTitle = computed(() => {
  return props.type === 'received'
    ? props.application.postTitle || '募集タイトル'
    : props.application.postTitle || '募集タイトル'
})

const displayAvatar = computed(() => {
  return props.type === 'received' ? props.application.applicantAvatar : null // 送信した応募では投稿者のアバターは表示しない
})

// イベントハンドラー
const handleUpdateStatus = (status: string) => {
  alert(`🔵 ApplicationCard handleUpdateStatus called: ${status}`)
  console.log('🔵 ApplicationCard handleUpdateStatus called:', status)
  
  // 必ず英語の enum 値を送信
  const validStatuses = ['accepted', 'rejected', 'pending', 'withdrawn']
  let finalStatus = status
  
  if (!validStatuses.includes(status)) {
    if (status.includes('承認') || status === '承認') {
      finalStatus = 'accepted'
    } else if (status.includes('却下') || status === '却下') {
      finalStatus = 'rejected'
    } else {
      finalStatus = 'pending' // fallback
    }
  }
  
  alert(`🔵 ApplicationCard emitting: ${props.application.id}, ${finalStatus}`)
  console.log('🔵 ApplicationCard emitting:', props.application.id, finalStatus)
  emit('updateStatus', props.application.id, finalStatus)
}

const handleViewPost = () => {
  if (props.application.postId) {
    emit('viewPost', props.application.postId)
  }
}

const handleWithdraw = () => {
  emit('withdraw', props.application.id)
}

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今日'
  } else if (diffDays === 1) {
    return '昨日'
  } else if (diffDays < 7) {
    return `${diffDays}日前`
  } else {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

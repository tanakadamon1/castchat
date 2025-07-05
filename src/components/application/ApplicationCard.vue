<template>
  <div class="bg-white rounded-lg border shadow-sm p-6">
    <div class="flex flex-col lg:flex-row lg:items-start gap-4">
      <!-- 左側：ユーザー情報またはポスト情報 -->
      <div class="flex items-center gap-3 lg:min-w-0 lg:flex-1">
        <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          <img
            v-if="displayAvatar"
            :src="displayAvatar"
            :alt="displayName"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <User class="w-6 h-6" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold text-gray-900 truncate">{{ displayName }}</h3>
            <ApplicationStatusBadge :status="application.status" />
          </div>
          <p class="text-sm text-gray-600 truncate">{{ displayTitle }}</p>
          <p class="text-xs text-gray-500 mt-1">
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
            @click="handleUpdateStatus('accepted')"
          >
            承認
          </BaseButton>
          <BaseButton
            v-if="application.status === 'pending'"
            size="sm"
            variant="outline"
            @click="handleUpdateStatus('rejected')"
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

    <!-- メッセージプレビュー -->
    <div v-if="application.message" class="mt-4 pt-4 border-t">
      <p class="text-sm text-gray-600 font-medium mb-2 dark:text-gray-300">応募メッセージ:</p>
      <p
        class="text-sm text-gray-800 line-clamp-3 dark:text-gray-100 dark:bg-gray-800 dark:rounded-md dark:p-2"
      >
        {{ application.message }}
      </p>
      <button
        v-if="application.message.length > 100"
        @click="showFullMessage = !showFullMessage"
        class="text-sm text-indigo-600 hover:text-indigo-700 mt-1 dark:text-indigo-300 dark:hover:text-indigo-400"
      >
        {{ showFullMessage ? '折りたたむ' : 'もっと見る' }}
      </button>
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
  status: 'pending' | 'accepted' | 'rejected'
  message?: string
  appliedAt: string
  respondedAt?: string | null
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
  console.log('ApplicationCard: handleUpdateStatus called', {
    applicationId: props.application.id,
    status,
    application: props.application,
  })
  emit('updateStatus', props.application.id, status)
}

const handleViewPost = () => {
  console.log('ApplicationCard: handleViewPost called', {
    postId: props.application.postId,
    application: props.application,
  })
  if (props.application.postId) {
    emit('viewPost', props.application.postId)
  } else {
    console.error('ApplicationCard: No postId found')
  }
}

const handleWithdraw = () => {
  console.log('ApplicationCard: handleWithdraw called', {
    applicationId: props.application.id,
    application: props.application,
  })
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
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

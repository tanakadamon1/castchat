<template>
  <BaseModal :show="true" @close="emit('close')" size="lg">
    <div class="p-6">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
          {{ type === 'received' ? '応募詳細' : '応募履歴詳細' }}
        </h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- 基本情報 -->
      <div class="space-y-4">
        <!-- ユーザー情報 -->
        <div class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
            <img
              v-if="userAvatar"
              :src="userAvatar"
              :alt="userName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <User class="w-8 h-8" />
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ userName }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ userRole }}</p>
            <div class="mt-2">
              <ApplicationStatusBadge :status="application.status" />
            </div>
          </div>
        </div>

        <!-- 投稿情報 -->
        <div class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-1">募集投稿</h4>
          <p class="text-sm text-gray-800 dark:text-gray-200 font-medium">{{ postTitle }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">投稿者: {{ postAuthor }}</p>
        </div>

        <!-- 応募メッセージ -->
        <div v-if="application.message" class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-1">応募メッセージ</h4>
          <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ application.message }}</p>
        </div>

        <!-- 日時情報 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-1">応募日時</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDateTime(application.appliedAt) }}</p>
          </div>

          <div v-if="application.respondedAt" class="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-1">回答日時</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDateTime(application.respondedAt) }}</p>
          </div>
        </div>

        <!-- アクション（受信した応募の場合） -->
        <div
          v-if="type === 'received' && application.status === 'pending'"
          class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-600"
        >
          <BaseButton @click="handleUpdateStatus('accepted')" class="flex-1" data-test="modal-accept">
            <CheckCircle class="w-4 h-4 mr-2" />
承認する
          </BaseButton>

          <BaseButton variant="outline" @click="handleUpdateStatus('rejected')" class="flex-1" data-test="modal-reject">
            <XCircle class="w-4 h-4 mr-2" />
却下する
          </BaseButton>
        </div>

        <!-- 承認済み/却下済みの場合のメッセージ -->
        <div v-if="application.status !== 'pending'" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex items-center gap-2">
            <Info class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p class="text-sm text-blue-800 dark:text-blue-200">
              <span v-if="application.status === 'accepted'"> この応募は承認済みです。 </span>
              <span v-else> この応募は却下されました。 </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script lang="ts">
export default {
  name: 'ApplicationDetailModal'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { X, User, CheckCircle, XCircle, Info } from 'lucide-vue-next'
import BaseModal from '@/components/ui/BaseModal.vue'
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
}

interface Props {
  application: Application
  type: 'received' | 'sent'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'update-status': [applicationId: string, status: string]
}>()

// 表示用データ
const userName = computed(() => {
  return props.type === 'received'
    ? props.application.applicantName || '匿名ユーザー'
    : props.application.postAuthor || '投稿者'
})

const userRole = computed(() => {
  return props.type === 'received' ? '応募者' : '投稿者'
})

const userAvatar = computed(() => {
  return props.type === 'received' ? props.application.applicantAvatar : null
})

const postTitle = computed(() => {
  return props.application.postTitle || '募集タイトル'
})

const postAuthor = computed(() => {
  return props.application.postAuthor || '投稿者'
})

// 日時フォーマット
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ステータス更新
const handleUpdateStatus = (status: string) => {
  if (confirm(`この応募を${status === 'accepted' ? '承認' : '却下'}しますか？`)) {
    emit('update-status', props.application.id, status)
    emit('close')
  }
}
</script>

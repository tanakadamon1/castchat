<template>
  <div :class="containerClasses">
    <div class="text-center max-w-md mx-auto">
      <!-- エラーアイコン -->
      <div :class="iconContainerClasses">
        <svg
          :class="iconClasses"
          :aria-label="title"
          role="img"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <!-- General/Alert Circle -->
          <path
            v-if="props.type === 'general'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <!-- Network/Wifi -->
          <path
            v-else-if="props.type === 'network'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
          <!-- Not Found/Search -->
          <path
            v-else-if="props.type === 'not-found'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
          <!-- Forbidden/Shield Alert -->
          <path
            v-else-if="props.type === 'forbidden'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
          />
          <!-- Server/Cloud -->
          <path
            v-else-if="props.type === 'server'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
          <!-- Timeout/Validation/Alert Triangle -->
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- エラータイトル -->
      <h3 :class="titleClasses">
        {{ title }}
      </h3>

      <!-- エラーメッセージ -->
      <p :class="messageClasses">
        {{ message }}
      </p>

      <!-- 詳細情報（デバッグ用） -->
      <details v-if="showDetails && (errorCode || timestamp)" class="mt-4">
        <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">詳細情報</summary>
        <div class="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-3 text-left">
          <div v-if="errorCode" class="mb-1"><strong>エラーコード:</strong> {{ errorCode }}</div>
          <div v-if="timestamp" class="mb-1">
            <strong>発生時刻:</strong> {{ formatTimestamp(timestamp) }}
          </div>
          <div v-if="userAgent"><strong>ユーザーエージェント:</strong> {{ userAgent }}</div>
        </div>
      </details>

      <!-- アクションボタン -->
      <div
        v-if="showRetry || showReport || $slots.actions"
        class="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
      >
        <slot name="actions">
          <button
            v-if="showRetry"
            @click="handleRetry"
            :disabled="retrying"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="retrying"
              class="w-4 h-4 mr-2 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ retrying ? '再試行中...' : '再試行' }}
          </button>

          <button
            v-if="showHome"
            @click="goHome"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            ホームに戻る
          </button>

          <button
            v-if="showReport"
            @click="reportError"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            問題を報告
          </button>
        </slot>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ErrorState'
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
// SVGアイコンを直接定義

interface Props {
  type?: 'general' | 'network' | 'not-found' | 'forbidden' | 'server' | 'timeout' | 'validation'
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
  showReport?: boolean
  showDetails?: boolean
  fullHeight?: boolean
  errorCode?: string
  timestamp?: string | Date
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

interface ErrorData {
  type: string
  title: string
  message: string
  errorCode?: string
  timestamp: string
  userAgent: string
  url: string
  severity: string
}

interface Emits {
  (e: 'retry'): void
  (e: 'report', errorData: ErrorData): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'general',
  showRetry: true,
  showHome: false,
  showReport: false,
  showDetails: false,
  fullHeight: false,
  severity: 'medium',
})

const emit = defineEmits<Emits>()
const router = useRouter()
const retrying = ref(false)

// Computed
const containerClasses = computed(() => {
  const baseClasses = 'flex items-center justify-center px-4'

  if (props.fullHeight) {
    return `${baseClasses} min-h-[500px]`
  }

  return `${baseClasses} py-12`
})

const iconContainerClasses = computed(() => {
  const severityClasses = {
    low: 'bg-indigo-100 dark:bg-indigo-900',
    medium: 'bg-yellow-100 dark:bg-yellow-900',
    high: 'bg-orange-100 dark:bg-orange-900',
    critical: 'bg-red-100 dark:bg-red-900',
  }

  return `mx-auto flex items-center justify-center w-16 h-16 rounded-full ${severityClasses[props.severity]}`
})

const iconClasses = computed(() => {
  const severityClasses = {
    low: 'text-indigo-500 dark:text-indigo-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400',
  }

  return `w-8 h-8 ${severityClasses[props.severity]}`
})

const titleClasses = computed(() => {
  const severityClasses = {
    low: 'text-gray-900 dark:text-gray-100',
    medium: 'text-gray-900 dark:text-gray-100',
    high: 'text-orange-900 dark:text-orange-200',
    critical: 'text-red-900 dark:text-red-200',
  }

  return `mt-6 text-xl font-semibold ${severityClasses[props.severity]}`
})

const messageClasses = computed(() => {
  return 'mt-3 text-gray-600 dark:text-gray-400 leading-relaxed'
})

const title = computed(() => {
  if (props.title) return props.title

  const titles = {
    general: 'エラーが発生しました',
    network: 'ネットワークエラー',
    'not-found': 'ページが見つかりません',
    forbidden: 'アクセスが拒否されました',
    server: 'サーバーエラー',
    timeout: 'タイムアウトエラー',
    validation: '入力エラー',
  }

  return titles[props.type]
})

const message = computed(() => {
  if (props.message) return props.message

  const messages = {
    general: 'しばらく時間をおいてから再度お試しください。',
    network:
      'インターネット接続を確認してから再度お試しください。Wi-Fiやモバイル通信の状態をご確認ください。',
    'not-found': 'お探しのページまたはデータが見つかりませんでした。URLが正しいかご確認ください。',
    forbidden: 'このコンテンツにアクセスする権限がありません。ログインが必要な場合があります。',
    server:
      'サーバーで問題が発生しています。システム管理者に連絡されました。しばらくお待ちください。',
    timeout: 'リクエストがタイムアウトしました。ネットワーク環境をご確認の上、再度お試しください。',
    validation: '入力された情報に問題があります。フォームの内容をご確認ください。',
  }

  return messages[props.type]
})

const userAgent = computed(() => {
  return navigator.userAgent
})

// Methods
const handleRetry = async () => {
  retrying.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500)) // UX改善のための短い遅延
    emit('retry')
  } finally {
    retrying.value = false
  }
}

const goHome = () => {
  router.push('/')
}

const reportError = () => {
  const errorData: ErrorData = {
    type: props.type,
    title: title.value,
    message: message.value,
    errorCode: props.errorCode,
    timestamp:
      (props.timestamp instanceof Date ? props.timestamp.toISOString() : props.timestamp) ||
      new Date().toISOString(),
    userAgent: userAgent.value,
    url: window.location.href,
    severity: props.severity,
  }

  emit('report', errorData)

  // フォールバック: メール送信
  const subject = encodeURIComponent(`エラー報告: ${title.value}`)
  const body = encodeURIComponent(`
エラー詳細:
- タイプ: ${props.type}
- エラーコード: ${props.errorCode || 'N/A'}
- 発生時刻: ${errorData.timestamp}
- URL: ${errorData.url}
- ブラウザ: ${navigator.userAgent}

説明: (何をしていた時にエラーが発生したかご記入ください)
`)

  // お問い合わせ機能は現在無効化されています
  console.error('Error report:', { subject, body: errorData })
}

const formatTimestamp = (timestamp: string | Date) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

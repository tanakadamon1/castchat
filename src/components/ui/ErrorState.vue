<template>
  <div :class="containerClasses">
    <div class="text-center max-w-md mx-auto">
      <!-- エラーアイコン -->
      <div :class="iconContainerClasses">
        <component
          :is="iconComponent"
          :class="iconClasses"
          :aria-label="title"
          role="img"
        />
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
        <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          詳細情報
        </summary>
        <div class="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-3 text-left">
          <div v-if="errorCode" class="mb-1">
            <strong>エラーコード:</strong> {{ errorCode }}
          </div>
          <div v-if="timestamp" class="mb-1">
            <strong>発生時刻:</strong> {{ formatTimestamp(timestamp) }}
          </div>
          <div v-if="userAgent">
            <strong>ユーザーエージェント:</strong> {{ userAgent }}
          </div>
        </div>
      </details>
      
      <!-- アクションボタン -->
      <div
        v-if="showRetry || showReport || $slots.actions"
        class="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
      >
        <slot name="actions">
          <BaseButton
            v-if="showRetry"
            @click="handleRetry"
            :disabled="retrying"
            variant="primary"
          >
            <RotateCcw v-if="retrying" class="w-4 h-4 mr-2 animate-spin" />
            {{ retrying ? '再試行中...' : '再試行' }}
          </BaseButton>
          
          <BaseButton
            v-if="showHome"
            @click="goHome"
            variant="outline"
          >
            <Home class="w-4 h-4 mr-2" />
            ホームに戻る
          </BaseButton>
          
          <BaseButton
            v-if="showReport"
            @click="reportError"
            variant="ghost"
            size="sm"
          >
            <AlertTriangle class="w-4 h-4 mr-2" />
            問題を報告
          </BaseButton>
        </slot>
      </div>
      
      <!-- ヘルプリンク -->
      <div v-if="showHelp" class="mt-4">
        <router-link
          to="/help"
          class="text-sm text-indigo-500 hover:text-indigo-600 underline"
        >
          ヘルプ・FAQ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/components/ui'
import {
  AlertTriangle,
  Wifi,
  Search,
  ShieldAlert,
  AlertCircle,
  Cloud,
  RotateCcw,
  Home
} from 'lucide-vue-next'

interface Props {
  type?: 'general' | 'network' | 'not-found' | 'forbidden' | 'server' | 'timeout' | 'validation'
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
  showReport?: boolean
  showHelp?: boolean
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
  showHelp: true,
  showDetails: false,
  fullHeight: false,
  severity: 'medium'
})

const emit = defineEmits<Emits>()
const router = useRouter()
const retrying = ref(false)

// アイコンマッピング
const iconComponents = {
  general: AlertCircle,
  network: Wifi,
  'not-found': Search,
  forbidden: ShieldAlert,
  server: Cloud,
  timeout: AlertTriangle,
  validation: AlertTriangle
}

// Computed
const containerClasses = computed(() => {
  const baseClasses = 'flex items-center justify-center px-4'
  
  if (props.fullHeight) {
    return `${baseClasses} min-h-[500px]`
  }
  
  return `${baseClasses} py-12`
})

const iconComponent = computed(() => iconComponents[props.type])

const iconContainerClasses = computed(() => {
  const severityClasses = {
    low: 'bg-indigo-100',
    medium: 'bg-yellow-100', 
    high: 'bg-orange-100',
    critical: 'bg-red-100'
  }
  
  return `mx-auto flex items-center justify-center w-16 h-16 rounded-full ${severityClasses[props.severity]}`
})

const iconClasses = computed(() => {
  const severityClasses = {
    low: 'text-indigo-500',
    medium: 'text-yellow-600',
    high: 'text-orange-600', 
    critical: 'text-red-600'
  }
  
  return `w-8 h-8 ${severityClasses[props.severity]}`
})

const titleClasses = computed(() => {
  const severityClasses = {
    low: 'text-gray-900',
    medium: 'text-gray-900',
    high: 'text-orange-900',
    critical: 'text-red-900'
  }
  
  return `mt-6 text-xl font-semibold ${severityClasses[props.severity]}`
})

const messageClasses = computed(() => {
  return 'mt-3 text-gray-600 leading-relaxed'
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
    validation: '入力エラー'
  }
  
  return titles[props.type]
})

const message = computed(() => {
  if (props.message) return props.message
  
  const messages = {
    general: 'しばらく時間をおいてから再度お試しください。問題が続く場合は、お問い合わせください。',
    network: 'インターネット接続を確認してから再度お試しください。Wi-Fiやモバイル通信の状態をご確認ください。',
    'not-found': 'お探しのページまたはデータが見つかりませんでした。URLが正しいかご確認ください。',
    forbidden: 'このコンテンツにアクセスする権限がありません。ログインが必要な場合があります。',
    server: 'サーバーで問題が発生しています。システム管理者に連絡されました。しばらくお待ちください。',
    timeout: 'リクエストがタイムアウトしました。ネットワーク環境をご確認の上、再度お試しください。',
    validation: '入力された情報に問題があります。フォームの内容をご確認ください。'
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
    await new Promise(resolve => setTimeout(resolve, 500)) // UX改善のための短い遅延
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
    timestamp: (props.timestamp instanceof Date ? props.timestamp.toISOString() : props.timestamp) || new Date().toISOString(),
    userAgent: userAgent.value,
    url: window.location.href,
    severity: props.severity
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
  
  window.open(`mailto:support@castchat.jp?subject=${subject}&body=${body}`)
}

const formatTimestamp = (timestamp: string | Date) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>
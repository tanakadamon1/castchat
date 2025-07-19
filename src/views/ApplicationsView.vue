<template>
  <div class="min-h-screen relative z-10">
    <!-- ヘッダー -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">応募管理</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">あなたの投稿への応募と、応募した募集を管理できます</p>
          </div>

          <!-- タブ切り替え -->
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              @click="activeTab = 'received'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'received'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
              ]"
            >
              受信した応募 ({{ receivedApplications.length }})
            </button>
            <button
              @click="activeTab = 'sent'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'sent'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
              ]"
            >
              送信した応募 ({{ sentApplications.length }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6">
      <!-- Twitter連絡に関する案内 -->
      <div class="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              今後のやり取りについて
            </h3>
            <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p class="mb-2">応募が承認された場合、今後の詳細なやり取りはTwitterで行います。</p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li>応募時にTwitter IDを必ず正確に入力してください</li>
                <li>承認後は投稿者からTwitterでDMまたはリプライでご連絡します</li>
                <li>Twitterアカウントのプライバシー設定でDMを受信できるようにしておいてください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 受信した応募 -->
      <div v-if="activeTab === 'received'">
        <!-- フィルター -->
        <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <BaseSelect
                v-model="receivedFilters.status"
                label="ステータス"
                :options="statusFilterOptions"
                @change="applyReceivedFilters"
              />
            </div>
            <div class="flex-1">
              <BaseSelect
                v-model="receivedFilters.postId"
                label="募集投稿"
                :options="postFilterOptions"
                @change="applyReceivedFilters"
              />
            </div>
            <div class="flex items-end">
              <BaseButton type="button" variant="outline" @click="clearReceivedFilters">
                クリア
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- 応募リスト -->
        <div v-if="loading" class="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else-if="filteredReceivedApplications.length === 0">
          <EmptyState
            icon="Users"
            title="応募がありません"
            description="まだ応募が届いていません。募集を投稿して応募を待ちましょう。"
          >
            <BaseButton @click="$router.push('/posts/create')"> 募集を投稿する </BaseButton>
          </EmptyState>
        </div>

        <div v-else class="space-y-3">
          <ApplicationCard
            v-for="application in filteredReceivedApplications"
            :key="application.id"
            :application="application as ApplicationViewModel"
            type="received"
            @update-status="handleUpdateStatus"
            @view-profile="handleViewProfile"
            @send-message="handleSendMessage"
          />
        </div>
      </div>

      <!-- 送信した応募 -->
      <div v-if="activeTab === 'sent'">
        <!-- フィルター -->
        <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <BaseSelect
                v-model="sentFilters.status"
                label="ステータス"
                :options="statusFilterOptions"
                @change="applySentFilters"
              />
            </div>
            <div class="flex-1">
              <BaseInput
                v-model="sentFilters.search"
                label="募集タイトル検索"
                placeholder="キーワードを入力..."
                @input="applySentFilters"
              />
            </div>
            <div class="flex items-end">
              <BaseButton type="button" variant="outline" @click="clearSentFilters">
                クリア
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- 応募リスト -->
        <div v-if="loading" class="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else-if="filteredSentApplications.length === 0">
          <EmptyState
            icon="Send"
            title="応募履歴がありません"
            description="まだ応募していません。気になる募集に応募してみましょう。"
          >
            <BaseButton @click="$router.push('/posts')"> 募集を探す </BaseButton>
          </EmptyState>
        </div>

        <div v-else class="space-y-3">
          <ApplicationCard
            v-for="application in filteredSentApplications"
            :key="application.id"
            :application="application as ApplicationViewModel"
            type="sent"
            @view-post="handleViewPost"
            @withdraw="handleWithdraw"
          />
        </div>
      </div>
    </div>

    <!-- 応募詳細モーダル -->
    <ApplicationDetailModal
      v-if="selectedApplication"
      :application="selectedApplication as ApplicationViewModel"
      :type="activeTab === 'received' ? 'received' : 'sent'"
      @close="selectedApplication = null"
      @update-status="handleUpdateStatus"
    />

    <!-- メッセージモーダル -->
    <!-- 一時的に無効化
    <MessageModal
      v-if="selectedRecipient"
      :show="showMessageModal"
      :recipient="selectedRecipient"
      @close="showMessageModal = false"
    />
    -->
  </div>
</template>

<script lang="ts">
export default {
  name: 'ApplicationsView'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { applicationApi } from '@/lib/applicationApi'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ApplicationCard from '@/components/application/ApplicationCard.vue'
import ApplicationDetailModal from '@/components/application/ApplicationDetailModal.vue'
// import MessageModal from '@/components/message/MessageModal.vue'
import type { Application as DBApplication } from '@/types/application'
import type { ApplicationStatus } from '@/types/application'

// UI用の拡張型
interface ApplicationViewModel extends DBApplication {
  postTitle: string
  postAuthor: string
  applicantName: string
  applicantAvatar?: string
  respondedAt: string | null
  experience?: string
  portfolio_url?: string
  appliedAt: string
}

// 型安全なプロパティ取得ヘルパー
function getStringProp(obj: unknown, key: string): string | undefined {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    key in obj &&
    typeof (obj as Record<string, unknown>)[key] === 'string'
  ) {
    return (obj as Record<string, unknown>)[key] as string
  }
  return undefined
}
function getObjectProp(obj: unknown, key: string): object | undefined {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    key in obj &&
    typeof (obj as Record<string, unknown>)[key] === 'object' &&
    (obj as Record<string, unknown>)[key] !== null
  ) {
    return (obj as Record<string, unknown>)[key] as object
  }
  return undefined
}

// ApplicationStatus型の値かどうかを判定するガード
const validStatuses: ApplicationStatus[] = ['pending', 'accepted', 'rejected', 'withdrawn']
function toApplicationStatus(val: unknown): ApplicationStatus {
  return typeof val === 'string' && validStatuses.includes(val as ApplicationStatus)
    ? (val as ApplicationStatus)
    : 'pending'
}

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// タブ状態
const activeTab = ref<'received' | 'sent'>('received')

// ローディング状態
const loading = ref(true)

// 選択された応募
const selectedApplication = ref(null)

// メッセージモーダル関連
const showMessageModal = ref(false)
// You can define a more specific type for selectedRecipient if you know its structure
const selectedRecipient = ref<{ id: string; display_name: string; avatar_url?: string } | null>(
  null,
)

// 応募データ
const receivedApplications = ref<ApplicationViewModel[]>([])
const sentApplications = ref<ApplicationViewModel[]>([])
const errorMessage = ref<string | null>(null)

// フィルター状態
const receivedFilters = ref({
  status: '',
  postId: '',
})

const sentFilters = ref({
  status: '',
  search: '',
})

// フィルターオプション
const statusFilterOptions = [
  { value: '', label: 'すべて' },
  { value: 'pending', label: '審査中' },
  { value: 'accepted', label: '承認済み' },
  { value: 'rejected', label: '却下' },
]

const postFilterOptions = computed(() => {
  const applications = receivedApplications.value
  const postIdSet = new Set<string>()
  
  // Setに追加
  for (let i = 0; i < applications.length; i++) {
    if (applications[i].postId) {
      postIdSet.add(applications[i].postId)
    }
  }
  
  // 配列に変換
  const uniquePostIds: string[] = []
  for (const id of postIdSet) {
    uniquePostIds.push(id)
  }
  
  const options = [{ value: '', label: 'すべての投稿' }]
  
  for (let i = 0; i < uniquePostIds.length; i++) {
    const postId = uniquePostIds[i]
    const app = applications.find((a) => a.postId === postId)
    options.push({
      value: postId,
      label: app?.postTitle || `投稿 ${postId}`,
    })
  }
  
  return options
})

// フィルター適用
const filteredReceivedApplications = computed(() => {
  const applications = [...receivedApplications.value]
  return applications.filter((app) => {
    if (receivedFilters.value.status && app.status !== receivedFilters.value.status) {
      return false
    }
    if (receivedFilters.value.postId && app.postId !== receivedFilters.value.postId) {
      return false
    }
    return true
  })
})

const filteredSentApplications = computed(() => {
  const applications = [...sentApplications.value]
  return applications.filter((app) => {
    if (sentFilters.value.status && app.status !== sentFilters.value.status) {
      return false
    }
    if (
      sentFilters.value.search &&
      !app.postTitle.toLowerCase().includes(sentFilters.value.search.toLowerCase())
    ) {
      return false
    }
    return true
  })
})

// フィルター関数
const applyReceivedFilters = () => {
  // フィルターは computed で自動適用される
}

const applySentFilters = () => {
  // フィルターは computed で自動適用される
}

const clearReceivedFilters = () => {
  receivedFilters.value = {
    status: '',
    postId: '',
  }
}

const clearSentFilters = () => {
  sentFilters.value = {
    status: '',
    search: '',
  }
}

// イベントハンドラー
const handleUpdateStatus = async (applicationId: string, status: string) => {
  // 日本語→ENUM値変換マップ
  const statusMap: Record<string, string> = {
    '承認': 'accepted',
    '却下': 'rejected',
    '保留': 'pending',
    '辞退': 'withdrawn',
    '承認する': 'accepted',
    '却下する': 'rejected',
    'accepted': 'accepted',
    'rejected': 'rejected',
    'pending': 'pending',
    'withdrawn': 'withdrawn',
  }
  
  // 変換処理
  let apiStatus = statusMap[status]
  if (!apiStatus) {
    if (status.includes('承認')) {
      apiStatus = 'accepted'
    } else if (status.includes('却下')) {
      apiStatus = 'rejected'
    } else {
      apiStatus = status
    }
  }
  try {
    // セッション状態の再確認
    if (!authStore.isAuthenticated) {
      console.error('認証されていません。再ログインが必要です。')
      toast.error('認証が無効です。再ログインしてください。')
      router.push('/login')
      return
    }

    // 型キャストを追加してENUM型に合わせる
    const result = await applicationApi.updateApplicationStatus(
      applicationId,
      apiStatus as 'pending' | 'accepted' | 'rejected' | 'withdrawn',
)

    if (result.error) {
      
      // 権限エラーの場合はより具体的なメッセージ
      if (result.error.includes('permission') || result.error.includes('denied') || result.error.includes('policy')) {
        toast.error('この操作を実行する権限がありません。投稿者としてログインしているか確認してください。')
      } else {
        toast.error(result.error)
      }
      return
    }

    // ローカルデータを更新
    const application = receivedApplications.value.find((app) => app.id === applicationId)
    if (application && result.data) {
      application.status = result.data.status
      application.respondedAt = result.data.responded_at
    }

    const statusText = apiStatus === 'accepted' ? '承認' : '却下'
    toast.success(`応募を${statusText}しました`)
  } catch (err) {
    console.error('ステータス更新エラー:', err)
    toast.error('ステータス更新に失敗しました')
  }
}

const handleViewProfile = (userId: string) => {
  router.push(`/users/${userId}`)
}

const handleSendMessage = (userId: string) => {
  // メッセージモーダルを開く
  const user = receivedApplications.value.find((app) => app.applicantId === userId)

  if (user) {
    selectedRecipient.value = {
      id: userId,
      display_name: user.applicantName || '匿名ユーザー',
      avatar_url: user.applicantAvatar,
    }
    showMessageModal.value = true
  } else {
    toast.error('ユーザー情報が見つかりません')
  }
}

const handleViewPost = (postId: string) => {
  router.push(`/posts/${postId}`)
}

const handleWithdraw = async (applicationId: string) => {
  if (!confirm('応募を取り下げますか？この操作は取り消せません。')) {
    return
  }

  try {
    const result = await applicationApi.withdrawApplication(applicationId)

    if (result.error) {
      toast.error(result.error)
      return
    }

    // ローカルデータから削除
    const index = sentApplications.value.findIndex((app) => app.id === applicationId)
    if (index !== -1) {
      sentApplications.value.splice(index, 1)
    }

    toast.success('応募を取り下げました')
  } catch (err) {
    console.error('応募取り下げエラー:', err)
    toast.error('応募取り下げに失敗しました')
  }
}

// データ読み込み関数
const loadApplications = async () => {
  try {
    // 受信した応募を取得
    const receivedResult = await applicationApi.getReceivedApplications()

    if (receivedResult.error) {
      errorMessage.value = receivedResult.error
    } else {
      // データを ApplicationCard で使用する形式に変換
      receivedApplications.value = (receivedResult.data || []).map((app: unknown) => {
        if (typeof app !== 'object' || app === null)
          return {
            id: '',
            postId: '',
            postTitle: '募集タイトル',
            postAuthor: '投稿者',
            applicantId: '',
            applicantName: '匿名ユーザー',
            status: 'pending',
            message: '',
            appliedAt: '',
            respondedAt: null,
            createdAt: '',
            updatedAt: '',
          }
        const a = app as Record<string, unknown>
        // posts.title
        let postTitle = '募集タイトル'
        if (typeof a.posts === 'object' && a.posts !== null) {
          const t = getStringProp(a.posts, 'title')
          if (t) postTitle = t
        }
        let postAuthor = '投稿者'
        if (typeof a.posts === 'object' && a.posts !== null) {
          const usersObj = getObjectProp(a.posts, 'users')
          if (usersObj) {
            const d = getStringProp(usersObj, 'display_name')
            if (d) postAuthor = d
          }
        }
        let applicantName = '匿名ユーザー'
        if (typeof a.users === 'object' && a.users !== null) {
          const d = getStringProp(a.users, 'display_name')
          if (d) applicantName = d
        }
        let applicantAvatar: string | undefined = undefined
        if (typeof a.users === 'object' && a.users !== null) {
          const av = getStringProp(a.users, 'avatar_url')
          if (av) applicantAvatar = av
        }
        // respondedAt
        let respondedAt: string | null = null
        if (typeof a.responded_at === 'string') {
          respondedAt = a.responded_at
        }
        return {
          id: typeof a.id === 'string' ? a.id : '',
          postId: typeof a.post_id === 'string' ? a.post_id : '',
          postTitle,
          postAuthor,
          applicantId: typeof a.user_id === 'string' ? a.user_id : '',
          applicantName,
          applicantAvatar,
          status: toApplicationStatus(a.status),
          message: typeof a.message === 'string' ? a.message : '',
          appliedAt: typeof a.created_at === 'string' ? a.created_at : '',
          respondedAt,
          portfolio_url: typeof a.portfolio_url === 'string' ? a.portfolio_url : undefined,
          experience:
            typeof a.experience === 'string'
              ? a.experience
              : typeof a.portfolio_url === 'string'
                ? a.portfolio_url
                : undefined,
          availability: typeof a.availability === 'string' ? a.availability : undefined,
          twitterId: typeof a.twitter_id === 'string' ? a.twitter_id : undefined,
          createdAt: typeof a.created_at === 'string' ? a.created_at : '',
          updatedAt: typeof a.updated_at === 'string' ? a.updated_at : '',
        }
      })
    }

    // 送信した応募を取得
    const sentResult = await applicationApi.getMyApplications()

    if (sentResult.error) {
      errorMessage.value = sentResult.error
    } else {
      // データを ApplicationCard で使用する形式に変換
      sentApplications.value = (sentResult.data || []).map((app: unknown) => {
        if (typeof app !== 'object' || app === null)
          return {
            id: '',
            postId: '',
            postTitle: '募集タイトル',
            postAuthor: '投稿者',
            applicantId: '',
            applicantName: '匿名ユーザー',
            status: 'pending',
            message: '',
            appliedAt: '',
            respondedAt: null,
            createdAt: '',
            updatedAt: '',
          }
        const a = app as Record<string, unknown>
        // posts.title
        let postTitle = '募集タイトル'
        if (typeof a.posts === 'object' && a.posts !== null) {
          const t = getStringProp(a.posts, 'title')
          if (t) postTitle = t
        }
        let postAuthor = '投稿者'
        if (typeof a.posts === 'object' && a.posts !== null) {
          const usersObj = getObjectProp(a.posts, 'users')
          if (usersObj) {
            const d = getStringProp(usersObj, 'display_name')
            if (d) postAuthor = d
          }
        }
        let applicantName = '匿名ユーザー'
        if (typeof a.users === 'object' && a.users !== null) {
          const d = getStringProp(a.users, 'display_name')
          if (d) applicantName = d
        }
        let applicantAvatar: string | undefined = undefined
        if (typeof a.users === 'object' && a.users !== null) {
          const av = getStringProp(a.users, 'avatar_url')
          if (av) applicantAvatar = av
        }
        // respondedAt
        let respondedAt: string | null = null
        if (typeof a.responded_at === 'string') {
          respondedAt = a.responded_at
        }
        return {
          id: typeof a.id === 'string' ? a.id : '',
          postId: typeof a.post_id === 'string' ? a.post_id : '',
          postTitle,
          postAuthor,
          applicantId: typeof a.user_id === 'string' ? a.user_id : '',
          applicantName,
          applicantAvatar,
          status: toApplicationStatus(a.status),
          message: typeof a.message === 'string' ? a.message : '',
          appliedAt: typeof a.created_at === 'string' ? a.created_at : '',
          respondedAt,
          portfolio_url: typeof a.portfolio_url === 'string' ? a.portfolio_url : undefined,
          experience:
            typeof a.experience === 'string'
              ? a.experience
              : typeof a.portfolio_url === 'string'
                ? a.portfolio_url
                : undefined,
          availability: typeof a.availability === 'string' ? a.availability : undefined,
          twitterId: typeof a.twitter_id === 'string' ? a.twitter_id : undefined,
          createdAt: typeof a.created_at === 'string' ? a.created_at : '',
          updatedAt: typeof a.updated_at === 'string' ? a.updated_at : '',
        }
      })
    }
  } catch (err) {
    errorMessage.value = 'データの読み込みに失敗しました'
  }
}

// 初期化
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    await loadApplications()
  } catch (err) {
    toast.error('データの取得に失敗しました')
  } finally {
    loading.value = false
  }
})
</script>

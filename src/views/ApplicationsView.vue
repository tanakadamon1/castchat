<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">応募管理</h1>
            <p class="text-gray-600 mt-1">あなたの投稿への応募と、応募した募集を管理できます</p>
          </div>
          
          <!-- タブ切り替え -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="activeTab = 'received'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'received'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              受信した応募 ({{ receivedApplications.length }})
            </button>
            <button
              @click="activeTab = 'sent'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'sent'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              送信した応募 ({{ sentApplications.length }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- 受信した応募 -->
      <div v-if="activeTab === 'received'">
        <!-- フィルター -->
        <div class="mb-6 bg-white rounded-lg border p-4">
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
              <BaseButton
                type="button"
                variant="outline"
                @click="clearReceivedFilters"
              >
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
            <BaseButton @click="$router.push('/posts/create')">
              募集を投稿する
            </BaseButton>
          </EmptyState>
        </div>

        <div v-else class="space-y-4">
          <ApplicationCard
            v-for="application in filteredReceivedApplications"
            :key="application.id"
            :application="application"
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
        <div class="mb-6 bg-white rounded-lg border p-4">
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
              <BaseButton
                type="button"
                variant="outline"
                @click="clearSentFilters"
              >
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
            <BaseButton @click="$router.push('/posts')">
              募集を探す
            </BaseButton>
          </EmptyState>
        </div>

        <div v-else class="space-y-4">
          <ApplicationCard
            v-for="application in filteredSentApplications"
            :key="application.id"
            :application="application"
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
      :application="selectedApplication"
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
const selectedRecipient = ref<any>(null)

// 応募データ
const receivedApplications = ref<any[]>([])
const sentApplications = ref<any[]>([])
const errorMessage = ref<string | null>(null)


// フィルター状態
const receivedFilters = ref({
  status: '',
  postId: ''
})

const sentFilters = ref({
  status: '',
  search: ''
})

// フィルターオプション
const statusFilterOptions = [
  { value: '', label: 'すべて' },
  { value: 'pending', label: '審査中' },
  { value: 'accepted', label: '承認済み' },
  { value: 'rejected', label: '却下' }
]

const postFilterOptions = computed(() => [
  { value: '', label: 'すべての投稿' },
  ...Array.from(new Set(receivedApplications.value.map(app => app.postId)))
    .map(postId => {
      const app = receivedApplications.value.find(a => a.postId === postId)
      return {
        value: postId,
        label: app?.postTitle || `投稿 ${postId}`
      }
    })
])

// フィルター適用
const filteredReceivedApplications = computed(() => {
  return receivedApplications.value.filter(app => {
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
  return sentApplications.value.filter(app => {
    if (sentFilters.value.status && app.status !== sentFilters.value.status) {
      return false
    }
    if (sentFilters.value.search && 
        !app.postTitle.toLowerCase().includes(sentFilters.value.search.toLowerCase())) {
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
    postId: ''
  }
}

const clearSentFilters = () => {
  sentFilters.value = {
    status: '',
    search: ''
  }
}

// イベントハンドラー
const handleUpdateStatus = async (applicationId: string, status: string) => {
  console.log('ApplicationsView: handleUpdateStatus called', { applicationId, status })
  try {
    const result = await applicationApi.updateApplicationStatus(applicationId, status as 'pending' | 'accepted' | 'rejected' | 'withdrawn')
    console.log('ApplicationsView: updateApplicationStatus result', result)
    
    if (result.error) {
      toast.error(result.error)
      return
    }
    
    // ローカルデータを更新
    const application = receivedApplications.value.find(app => app.id === applicationId)
    if (application && result.data) {
      application.status = result.data.status
      application.respondedAt = result.data.responded_at
    }
    
    const statusText = status === 'accepted' ? '承認' : '却下'
    toast.success(`応募を${statusText}しました`)
  } catch (err) {
    console.error('ステータス更新エラー:', err)
    toast.error('ステータス更新に失敗しました')
  }
}

const handleViewProfile = (userId: string) => {
  console.log('ApplicationsView: handleViewProfile called', { userId })
  router.push(`/users/${userId}`)
}

const handleSendMessage = (userId: string) => {
  console.log('ApplicationsView: handleSendMessage called', { userId })
  // メッセージモーダルを開く
  const user = receivedApplications.value
    .find(app => app.applicantId === userId || app.user_id === userId)
  
  console.log('ApplicationsView: Found user for message:', user)
  
  if (user) {
    selectedRecipient.value = {
      id: userId,
      display_name: user.applicantName || user.user?.display_name || '匿名ユーザー',
      avatar_url: user.applicantAvatar || user.user?.avatar_url
    }
    showMessageModal.value = true
  } else {
    console.error('ApplicationsView: User not found for message')
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
    const index = sentApplications.value.findIndex(app => app.id === applicationId)
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
    console.log('Loading applications...')
    
    // 受信した応募を取得
    console.log('Fetching received applications...')
    const receivedResult = await applicationApi.getReceivedApplications()
    console.log('Received applications result:', receivedResult)
    
    if (receivedResult.error) {
      errorMessage.value = receivedResult.error
      console.error('Received applications error:', receivedResult.error)
    } else {
      console.log('Raw received applications data:', receivedResult.data)
      // データを ApplicationCard で使用する形式に変換
      receivedApplications.value = (receivedResult.data || []).map((app: any) => {
        console.log('Processing application:', app)
        console.log('app.posts:', app.posts)
        console.log('app.users:', app.users)
        
        const mappedApp = {
          id: app.id,
          postId: app.post_id,
          postTitle: app.posts?.title || '募集タイトル',
          postAuthor: app.posts?.users?.display_name || '投稿者',
          applicantId: app.user_id,
          applicantName: app.users?.display_name || '匿名ユーザー',
          applicantAvatar: app.users?.avatar_url,
          status: app.status,
          message: app.message,
          appliedAt: app.created_at,
          respondedAt: app.responded_at,
          portfolio_url: app.portfolio_url,
          // portfolio_urlを経験として表示
          experience: app.portfolio_url
        }
        
        console.log('Mapped application:', mappedApp)
        return mappedApp
      })
      console.log('Final received applications data:', receivedApplications.value)
    }

    // 送信した応募を取得
    console.log('Fetching sent applications...')
    const sentResult = await applicationApi.getMyApplications()
    console.log('Sent applications result:', sentResult)
    
    if (sentResult.error) {
      errorMessage.value = sentResult.error
      console.error('Sent applications error:', sentResult.error)
    } else {
      // データを ApplicationCard で使用する形式に変換
      sentApplications.value = (sentResult.data || []).map((app: any) => ({
        id: app.id,
        postId: app.post_id,
        postTitle: app.posts?.title || '募集タイトル',
        postAuthor: app.posts?.users?.display_name || '投稿者',
        applicantId: app.user_id,
        applicantName: app.users?.display_name || '匿名ユーザー',
        applicantAvatar: app.users?.avatar_url,
        status: app.status,
        message: app.message,
        appliedAt: app.created_at,
        respondedAt: app.responded_at,
        portfolio_url: app.portfolio_url,
        // portfolio_urlを経験として表示
        experience: app.portfolio_url
      }))
      console.log('Sent applications data:', sentApplications.value)
    }
  } catch (err) {
    errorMessage.value = 'データの読み込みに失敗しました'
    console.error('Failed to load applications:', err)
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
    console.error('データ取得エラー:', err)
    toast.error('データの取得に失敗しました')
  } finally {
    loading.value = false
  }
})
</script>
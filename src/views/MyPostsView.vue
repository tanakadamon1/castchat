<template>
  <div class="min-h-screen relative z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">マイ投稿</h1>
            <p class="text-gray-600 dark:text-gray-300">あなたが投稿した募集一覧</p>
          </div>

          <BaseButton @click="goToCreatePost" class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            新規投稿
          </BaseButton>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">総投稿数</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalPosts }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">募集中</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ activePosts }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg
                class="w-6 h-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">総応募数</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ totalApplications }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">総閲覧数</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalViews }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              @click="() => { statusFilter = tab.value; loadPosts() }"
              :class="[
                statusFilter === tab.value
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
              ]"
              :aria-current="statusFilter === tab.value ? 'page' : undefined"
            >
              {{ tab.label }}
              <span
                v-if="tab.count !== undefined"
                :class="[
                  statusFilter === tab.value
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300',
                  'hidden ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block',
                ]"
              >
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Sort Filter -->
        <div class="mt-4 flex justify-end">
          <BaseSelect v-model="sortBy" :options="sortOptions" @change="handleSortChange" class="w-48" />
        </div>
      </div>

      <!-- Loading State -->
      <LoadingSpinner
        v-if="loading && posts.length === 0"
        message="投稿を読み込んでいます..."
        size="lg"
      />

      <!-- Error State -->
      <ErrorState
        v-else-if="error && posts.length === 0"
        type="network"
        :message="error"
        @retry="loadPosts"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="!loading && posts.length === 0"
        type="posts"
        title="投稿がありません"
        message="まだ投稿がありません。最初の募集を投稿してみましょう。"
        action-text="新規投稿"
        @action="goToCreatePost"
      />

      <!-- Posts Grid -->
      <div v-else class="space-y-6">
        <!-- Posts List -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            @view-details="goToPostDetail"
            @view-image="handleViewImage"
            @edit-post="handleEditPost"
            @delete-post="handleDeletePost"
            @promote-post="handlePromotePost"
            @toggle-status="handleToggleStatus"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8">
          <BasePagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total="total"
            :per-page="perPage"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 画像ビューア -->
    <ImageViewer
      :show="showImageViewer"
      :images="selectedImages"
      :initial-index="selectedImageIndex"
      @close="closeImageViewer"
    />

    <!-- 優先表示モーダル -->
    <PriorityPromotionModal
      :show="showPriorityModal"
      :post-id="selectedPostId"
      @close="showPriorityModal = false"
      @success="handlePrioritySuccess"
      @purchase-coins="handlePurchaseCoins"
    />

    <!-- コイン購入モーダル -->
    <CoinPurchaseModal
      :show="showCoinPurchaseModal"
      @close="showCoinPurchaseModal = false"
      @success="handleCoinPurchaseSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Post } from '@/types/post'
import PostCard from '@/components/post/PostCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ImageViewer from '@/components/ui/ImageViewer.vue'
import PriorityPromotionModal from '@/components/payment/PriorityPromotionModal.vue'
import CoinPurchaseModal from '@/components/payment/CoinPurchaseModal.vue'
import { useToast } from '@/composables/useToast'
import { postsApi } from '@/lib/postsApi'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State
const posts = ref<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const currentPage = ref(1)
const perPage = ref(10)
const statusFilter = ref('all')
const sortBy = ref('newest')

// 画像ビューア関連
const showImageViewer = ref(false)
const selectedImages = ref<string[]>([])
const selectedImageIndex = ref(0)

// 優先表示・コイン購入関連
const showPriorityModal = ref(false)
const showCoinPurchaseModal = ref(false)
const selectedPostId = ref('')

// Select options
const sortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '応募数順', value: 'applications' },
  { label: '閲覧数順', value: 'views' },
]

// 全投稿を保持（タブ用の集計に使用）
const allPosts = ref<Post[]>([])

// Computed
const totalPages = computed(() => Math.ceil(total.value / perPage.value))

// 各ステータスの件数を計算
const statusCounts = computed(() => {
  const counts = {
    all: allPosts.value.length,
    active: 0,
    draft: 0,
    closed: 0,
  }

  const postsList = allPosts.value
  for (let i = 0; i < postsList.length; i++) {
    const post = postsList[i]
    if (post.status === 'active') counts.active++
    else if (post.status === 'draft') counts.draft++
    else if (post.status === 'closed') counts.closed++
  }

  return counts
})

// タブ設定
const statusTabs = computed(() => [
  { label: 'すべて', value: 'all', count: statusCounts.value.all },
  { label: '公開中', value: 'active', count: statusCounts.value.active },
  { label: '下書き', value: 'draft', count: statusCounts.value.draft },
  { label: '募集終了', value: 'closed', count: statusCounts.value.closed },
])

const totalPosts = computed(() => total.value)
const activePosts = computed(() => {
  const postsList = posts.value
  let count = 0
  for (let i = 0; i < postsList.length; i++) {
    if (postsList[i].status === 'active') {
      count++
    }
  }
  return count
})
const totalApplications = computed(() => {
  const postsList = posts.value
  let sum = 0
  for (let i = 0; i < postsList.length; i++) {
    sum += postsList[i].applicationsCount || 0
  }
  return sum
})
const totalViews = computed(() => {
  const postsList = posts.value
  let sum = 0
  for (let i = 0; i < postsList.length; i++) {
    sum += postsList[i].viewsCount || 0
  }
  return sum
})

// Methods
const handleSortChange = () => {
  loadPosts(true)
}

const loadPosts = async (showLoading = true) => {
  if (!authStore.user?.id) {
    router.push('/login')
    return
  }

  if (showLoading) {
    loading.value = true
  }
  error.value = null

  try {
    // 全投稿を取得（タブの件数計算用）
    const allResult = await postsApi.getPosts({
      user_id: authStore.user.id,
      limit: 1000, // 大きめの値で全件取得
    })

    if (allResult.error) {
      error.value = allResult.error
      posts.value = []
      allPosts.value = []
      total.value = 0
      return
    }

    // 自分の投稿のみフィルタリング
    const allPostsData = allResult.data || []
    const filteredPosts = []
    for (let i = 0; i < allPostsData.length; i++) {
      if (allPostsData[i].authorId === authStore.user?.id) {
        filteredPosts.push(allPostsData[i])
      }
    }
    allPosts.value = filteredPosts

    // 現在のタブに応じてフィルタリング
    let displayPosts = []
    const allPostsList = allPosts.value
    
    for (let i = 0; i < allPostsList.length; i++) {
      const post = allPostsList[i]
      if (statusFilter.value === 'all' || post.status === statusFilter.value) {
        displayPosts.push(post)
      }
    }

    // ソート適用
    if (sortBy.value === 'newest') {
      displayPosts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    } else if (sortBy.value === 'oldest') {
      displayPosts.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    }

    // ページネーション適用
    const startIndex = (currentPage.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value
    posts.value = displayPosts.slice(startIndex, endIndex)
    total.value = displayPosts.length
  } catch (err) {
    error.value = 'データの読み込みに失敗しました'
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPostDetail = (postId: string) => {
  router.push(`/posts/${postId}`)
}

const goToCreatePost = () => {
  router.push('/posts/create')
}

const handleEditPost = (postId: string) => {
  router.push(`/posts/${postId}/edit`)
}

const handleDeletePost = async (postId: string) => {
  if (!confirm('この投稿を削除しますか？この操作は取り消せません。')) {
    return
  }

  try {
    const result = await postsApi.deletePost(postId)

    if (result.success) {
      toast.success('投稿を削除しました')
      loadPosts()
    } else {
      toast.error(result.error || '投稿の削除に失敗しました')
    }
  } catch (error) {
    console.error('Delete post error:', error)
    toast.error('投稿の削除に失敗しました')
  }
}

// 画像ビューア関連のハンドラー
const handleViewImage = (imageUrl: string, index: number) => {
  let post = null
  const postsList = posts.value
  for (let i = 0; i < postsList.length; i++) {
    if (postsList[i].images?.includes(imageUrl)) {
      post = postsList[i]
      break
    }
  }
  if (post?.images) {
    selectedImages.value = post.images
    selectedImageIndex.value = index
    showImageViewer.value = true
  }
}

const closeImageViewer = () => {
  showImageViewer.value = false
  selectedImages.value = []
  selectedImageIndex.value = 0
}

// 優先表示関連のハンドラー
const handlePromotePost = (postId: string) => {
  selectedPostId.value = postId
  showPriorityModal.value = true
}

const handlePrioritySuccess = () => {
  toast.success('投稿を優先表示に設定しました')
  loadPosts(false) // データを再読み込み
}

const handlePurchaseCoins = () => {
  showPriorityModal.value = false
  showCoinPurchaseModal.value = true
}

// ステータス変更処理
const handleToggleStatus = async (postId: string, newStatus: 'active' | 'closed') => {
  try {
    const result = await postsApi.updatePostStatus(postId, newStatus)

    if (result.success) {
      // ローカルの投稿データを更新
      const postsList = posts.value
      let postIndex = -1
      for (let i = 0; i < postsList.length; i++) {
        if (postsList[i].id === postId) {
          postIndex = i
          break
        }
      }
      if (postIndex !== -1) {
        posts.value[postIndex].status = newStatus
      }

      toast.success(newStatus === 'active' ? '募集を再開しました' : '募集を終了しました')

      // ステータス数の更新のためにloadPostsを呼び出し
      loadPosts(false)
    } else {
      toast.error(result.error || 'ステータスの変更に失敗しました')
    }
  } catch (error) {
    console.error('Status toggle error:', error)
    toast.error('ステータスの変更に失敗しました')
  }
}

const handleCoinPurchaseSuccess = () => {
  toast.success('コインを購入しました')
  // 優先表示モーダルを再度表示
  showCoinPurchaseModal.value = false
  showPriorityModal.value = true
}

// Lifecycle
onMounted(async () => {
  // 認証ストアが初期化されていない場合は待機
  if (!authStore.user && authStore.initializing) {
    let waitTime = 0
    const maxWaitTime = 3000 // 3秒
    while (authStore.initializing && waitTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      waitTime += 100
    }
  }

  loadPosts()
})
</script>

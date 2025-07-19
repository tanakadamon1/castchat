<template>
  <div class="min-h-screen relative z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">募集一覧</h1>
        <p class="text-gray-600 dark:text-gray-400">VRChatでのキャスト募集・応募情報</p>
      </div>

      <!-- Search and Filters -->
      <div class="mb-8">
        <PostSearch v-model="filters" @search="handleSearch" />
      </div>

      <!-- Results Summary -->
      <div class="mb-6 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span v-if="!loading"> {{ total }} 件の募集が見つかりました </span>
        </div>

        <div class="flex items-center space-x-2">
          <BaseButton size="sm" variant="outline" @click="refreshPosts" :loading="loading">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            更新
          </BaseButton>
        </div>
      </div>

      <!-- Loading State -->
      <LoadingSpinner
        v-if="loading && posts.length === 0"
        message="募集情報を読み込んでいます..."
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
        action-text="新しい募集を投稿"
        @action="goToCreatePost"
      />

      <!-- Posts Grid -->
      <div v-else class="space-y-6">
        <!-- Refresh Loading Overlay -->
        <div
          v-if="loading && posts.length > 0"
          class="fixed top-4 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2"
          >
            <LoadingSpinner size="sm" />
            <span class="text-sm text-gray-600 dark:text-gray-400">更新中...</span>
          </div>
        </div>

        <!-- Posts List -->
        <div
          ref="postsContainerRef"
          class="grid grid-cols-1 lg:grid-cols-2 gap-6"
          role="region"
          aria-label="募集投稿一覧"
          aria-live="polite"
        >
          <div v-if="posts.length === 0" class="col-span-full text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">投稿がありません</p>
          </div>
          <TransitionGroup name="post-list" tag="div" class="contents">
            <PostCard
              v-for="(post, index) in posts"
              :key="post.id"
              :post="post"
              :style="{ '--delay': index * 50 + 'ms' }"
              class="post-list-item"
              @view-details="goToPostDetail"
              @view-image="handleViewImage"
              @edit-post="handleEditPost"
              @delete-post="handleDeletePost"
              @promote-post="handlePromotePost"
              @toggle-status="handleToggleStatus"
            />
          </TransitionGroup>
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

<script lang="ts">
export default {
  name: 'PostsView',
}
</script>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Post, PostFilter } from '@/types/post'
import PostCard from '@/components/post/PostCard.vue'
import PostSearch from '@/components/post/PostSearch.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useSEO } from '@/composables/useSEO'
import BasePagination from '@/components/ui/BasePagination.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ImageViewer from '@/components/ui/ImageViewer.vue'
import PriorityPromotionModal from '@/components/payment/PriorityPromotionModal.vue'
import CoinPurchaseModal from '@/components/payment/CoinPurchaseModal.vue'
import { useToast } from '@/composables/useToast'
import { postsApi } from '@/lib/postsApi'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import { useScreenReader } from '@/composables/useScreenReader'

const router = useRouter()
const toast = useToast()

// SEO設定
useSEO({
  title: '募集一覧 - castChat',
  description:
    'VRChatでのキャスト募集・参加者募集の一覧。写真撮影、動画制作、イベント開催などの企画に最適なキャストを見つけよう。',
  keywords: ['VRChat', 'キャスト募集', '募集一覧', '写真撮影', '動画制作', 'イベント'],
  ogTitle: '募集一覧 - castChat',
  ogDescription: 'VRChatでのキャスト募集・参加者募集の一覧',
  canonicalUrl: 'https://castchat.jp/posts',
})

// アクセシビリティ
const postsContainerRef = ref<HTMLElement | null>(null)
const { announcePageLoad, announceListInfo, announceLoading, announceLoadComplete } =
  useScreenReader()
useKeyboardNavigation(postsContainerRef, {
  loop: true,
  autoFocus: false,
  focusableSelector: '[data-post-card], button, [href]',
})

// State - 通常のrefに変更して無限ループを防ぐ
const posts = ref<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const currentPage = ref(1)
const perPage = ref(10)

const filters = ref<PostFilter>({
  sortBy: 'newest',
  status: 'active', // デフォルトで募集中のみ表示
})


// 画像ビューア関連
const showImageViewer = ref(false)
const selectedImages = ref<string[]>([])
const selectedImageIndex = ref(0)

// 優先表示・コイン購入関連
const showPriorityModal = ref(false)
const showCoinPurchaseModal = ref(false)
const selectedPostId = ref('')

// Computed - シンプルなcomputed
const totalPages = computed(() => Math.ceil(total.value / perPage.value))

// Methods
const loadPosts = async (showLoading = true) => {
  if (showLoading) {
    loading.value = true
    announceLoading('募集情報')
  }
  error.value = null

  try {
    // APIコール
    const result = await postsApi.getPosts({
      category: filters.value.category,
      search: filters.value.search,
      status: filters.value.status || 'active',
      sortBy: filters.value.sortBy || 'newest',
      limit: perPage.value,
      offset: (currentPage.value - 1) * perPage.value,
    })

    if (result.error) {
      console.error('Posts API Error:', result.error)
      error.value = result.error
      posts.value = []
      total.value = 0
      return
    }

    console.log('Posts loaded:', result.data?.length, 'total:', result.total)
    posts.value = result.data || []
    total.value = result.total

    // スクリーンリーダーに結果を通知
    announceLoadComplete('募集情報の読み込み', result.total)
    announceListInfo(result.total, '募集投稿')
  } catch (err) {
    error.value = 'データの読み込みに失敗しました'
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadPosts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadPosts()

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const refreshPosts = () => {
  loadPosts(true)
  toast.success('募集情報を更新しました')
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
  const post = posts.value.find((p) => p.images?.includes(imageUrl))
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
  refreshPosts()
}

const handlePurchaseCoins = () => {
  showPriorityModal.value = false
  showCoinPurchaseModal.value = true
}

const handleCoinPurchaseSuccess = () => {
  toast.success('コインを購入しました')
  // 優先表示モーダルを再度表示
  showCoinPurchaseModal.value = false
  showPriorityModal.value = true
}

// ステータス変更処理
const handleToggleStatus = async (postId: string, newStatus: 'active' | 'closed') => {
  try {
    const result = await postsApi.updatePostStatus(postId, newStatus)

    if (result.success) {
      // ローカルの投稿データを更新
      const postIndex = posts.value.findIndex((p) => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].status = newStatus
      }

      toast.success(newStatus === 'active' ? '募集を再開しました' : '募集を終了しました')
    } else {
      toast.error(result.error || 'ステータスの変更に失敗しました')
    }
  } catch (error) {
    console.error('Status toggle error:', error)
    toast.error('ステータスの変更に失敗しました')
  }
}

// Watch for filter changes - immediate: false を追加してマウント時の実行を防ぐ
watch(
  filters,
  () => {
    currentPage.value = 1
    loadPosts()
  },
  { deep: true, immediate: false },
)

// Lifecycle
onMounted(() => {
  loadPosts()
  announcePageLoad('募集一覧', 'VRChatでのキャスト募集・応募情報を閲覧できます')
})
</script>

<style scoped>
/* Post list animations */
.post-list-item {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* TransitionGroup animations for dynamic content updates */
.post-list-enter-active {
  transition: all 0.4s ease-out;
}

.post-list-leave-active {
  transition: all 0.3s ease-in;
}

.post-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.post-list-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.post-list-move {
  transition: transform 0.3s ease;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .post-list-item {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .post-list-enter-active,
  .post-list-leave-active,
  .post-list-move {
    transition: none;
  }
}
</style>

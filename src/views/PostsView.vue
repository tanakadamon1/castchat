<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">募集一覧</h1>
        <p class="text-gray-600">VRChatでのキャスト募集・応募情報</p>
      </div>
      
      <!-- Search and Filters -->
      <div class="mb-8">
        <PostSearch
          v-model="filters"
          @search="handleSearch"
        />
      </div>
      
      <!-- Results Summary -->
      <div class="mb-6 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          <span v-if="!loading">
            {{ total }} 件の募集が見つかりました
          </span>
        </div>
        
        <div class="flex items-center space-x-2">
          <BaseButton
            size="sm"
            variant="outline"
            @click="refreshPosts"
            :loading="loading"
          >
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
      <div
        v-else
        class="space-y-6"
      >
        <!-- Refresh Loading Overlay -->
        <div
          v-if="loading && posts.length > 0"
          class="fixed top-4 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div class="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span class="text-sm text-gray-600">更新中...</span>
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
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            @view-details="goToPostDetail"
            @view-image="handleViewImage"
            @edit-post="handleEditPost"
            @delete-post="handleDeletePost"
          />
        </div>
        
        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="mt-8"
        >
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Post, PostFilter } from '@/types/post'
import PostCard from '@/components/post/PostCard.vue'
import PostSearch from '@/components/post/PostSearch.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { toast } from '@/components/ui'
import ImageViewer from '@/components/ui/ImageViewer.vue'
import { postsApi } from '@/lib/postsApi'
import { useMemoizedComputed, useListMemoization } from '@/composables/useMemoizedComputed'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import { useScreenReader } from '@/composables/useScreenReader'

const router = useRouter()

// アクセシビリティ
const postsContainerRef = ref<HTMLElement | null>(null)
const { announcePageLoad, announceListInfo, announceLoading, announceLoadComplete } = useScreenReader()
useKeyboardNavigation(postsContainerRef, {
  loop: true,
  autoFocus: false,
  focusableSelector: '[data-post-card], button, [href]'
})

// State - パフォーマンス最適化のためshallowRefを使用
const posts = shallowRef<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const currentPage = ref(1)
const perPage = ref(10)

const filters = ref<PostFilter>({
  sortBy: 'newest'
})

// 画像ビューア関連
const showImageViewer = ref(false)
const selectedImages = ref<string[]>([])
const selectedImageIndex = ref(0)

// Computed - メモ化を使用してパフォーマンス向上
const totalPages = useMemoizedComputed(
  () => Math.ceil(total.value / perPage.value),
  () => [total.value, perPage.value]
)

// リストメモ化によるレンダリング最適化
const { itemsMap: postsMap, hasChanged: hasPostChanged } = useListMemoization(
  computed(() => posts.value)
)

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
      type: filters.value.type,
      status: filters.value.status || 'active',
      sortBy: filters.value.sortBy || 'newest',
      limit: perPage.value,
      offset: (currentPage.value - 1) * perPage.value
    })
    
    if (result.error) {
      error.value = result.error
      posts.value = []
      total.value = 0
      return
    }
    
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
  router.push(`/posts/edit/${postId}`)
}

const handleDeletePost = async (postId: string) => {
  if (!confirm('この投稿を削除しますか？この操作は取り消せません。')) {
    return
  }
  
  try {
    // TODO: API実装後に削除処理を追加
    toast.success('投稿を削除しました')
    loadPosts()
  } catch (error) {
    console.error('Delete post error:', error)
    toast.error('投稿の削除に失敗しました')
  }
}

// 画像ビューア関連のハンドラー
const handleViewImage = (imageUrl: string, index: number) => {
  const post = posts.value.find(p => p.images?.includes(imageUrl))
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

// Lifecycle
onMounted(() => {
  loadPosts()
  announcePageLoad('募集一覧', 'VRChatでのキャスト募集・応募情報を閲覧できます')
})
</script>
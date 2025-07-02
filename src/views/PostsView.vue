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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            @view-details="goToPostDetail"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Post, PostFilter } from '@/types/post'
import PostCard from '@/components/post/PostCard.vue'
import PostSearch from '@/components/post/PostSearch.vue'
import {
  BaseButton,
  BasePagination,
  LoadingSpinner,
  ErrorState,
  EmptyState,
  toast
} from '@/components/ui'
import { postsApi } from '@/lib/postsApi'

const router = useRouter()

// State
const posts = ref<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const currentPage = ref(1)
const perPage = ref(10)

const filters = ref<PostFilter>({
  sortBy: 'newest'
})

// Computed
const totalPages = computed(() => Math.ceil(total.value / perPage.value))

// Methods
const loadPosts = async (showLoading = true) => {
  if (showLoading) {
    loading.value = true
  }
  error.value = null
  
  try {
    // 実際のAPIコール
    const result = await postsApi.getPosts({
      category: filters.value.category,
      search: filters.value.search,
      type: filters.value.type,
      status: filters.value.status || 'active',
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

// Lifecycle
onMounted(() => {
  loadPosts()
})
</script>
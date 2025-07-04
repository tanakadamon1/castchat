<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">マイ投稿</h1>
            <p class="text-gray-600">あなたが投稿した募集一覧</p>
          </div>
          
          <BaseButton
            @click="goToCreatePost"
            class="flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            新規投稿
          </BaseButton>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">総投稿数</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalPosts }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">募集中</p>
              <p class="text-2xl font-semibold text-gray-900">{{ activePosts }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">総応募数</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalApplications }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">総閲覧数</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalViews }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="mb-6 flex items-center space-x-4">
        <BaseSelect
          v-model="statusFilter"
          :options="statusOptions"
          @change="loadPosts"
          class="w-48"
        />
        
        <BaseSelect
          v-model="sortBy"
          :options="sortOptions"
          @change="loadPosts"
          class="w-48"
        />
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
      <div
        v-else
        class="space-y-6"
      >
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

// Select options
const statusOptions = [
  { label: 'すべて', value: 'all' },
  { label: '募集中', value: 'active' },
  { label: '募集終了', value: 'closed' },
  { label: '下書き', value: 'draft' }
]

const sortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '応募数順', value: 'applications' },
  { label: '閲覧数順', value: 'views' }
]

// Computed
const totalPages = computed(() => Math.ceil(total.value / perPage.value))

const totalPosts = computed(() => total.value)
const activePosts = computed(() => posts.value.filter(p => p.status === 'active').length)
const totalApplications = computed(() => posts.value.reduce((sum, p) => sum + (p.applicationsCount || 0), 0))
const totalViews = computed(() => posts.value.reduce((sum, p) => sum + (p.viewsCount || 0), 0))

// Methods
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
    const result = await postsApi.getPosts({
      status: statusFilter.value === 'all' ? undefined : statusFilter.value,
      sortBy: sortBy.value,
      limit: perPage.value,
      offset: (currentPage.value - 1) * perPage.value,
      // TODO: ユーザーフィルターを追加
      // user_id: authStore.user.id
    })
    
    if (result.error) {
      error.value = result.error
      posts.value = []
      total.value = 0
      return
    }
    
    // 一時的に自分の投稿のみフィルタリング（API実装後は削除）
    const filteredPosts = (result.data || []).filter(post => post.authorId === authStore.user?.id)
    posts.value = filteredPosts
    total.value = filteredPosts.length
    
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
})
</script>
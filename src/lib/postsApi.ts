import { postsService } from './posts'
import type { PostCreateData } from './posts'
import type { Post } from '@/types/post'
import { useAuthStore } from '@/stores/auth'

export interface PostsResponse {
  data: Post[]
  total: number
  error?: string
}

export interface PostResponse {
  data: Post | null
  error?: string
}

// フロントエンド用のポストAPIラッパー
export const postsApi = {
  // 投稿一覧取得
  async getPosts(filters: {
    category?: string
    search?: string
    type?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<PostsResponse> {
    try {
      const page = filters.offset ? Math.floor(filters.offset / (filters.limit || 10)) + 1 : 1
      
      const result = await postsService.getPosts({
        category_id: filters.category,
        search: filters.search,
        status: (filters.status as any) || 'published',
        limit: filters.limit || 10,
        page
      })

      if (result.error) {
        return { data: [], total: 0, error: result.error.message }
      }

      // データ変換 (PostWithDetails -> Post)
      const posts: Post[] = (result.data || []).map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: (post.category?.slug as any) || 'other',
        type: 'volunteer' as any, // デフォルト値
        status: (post.status === 'published' ? 'active' : 'closed') as any,
        deadline: post.deadline || undefined,
        maxParticipants: post.recruitment_count || 1,
        minParticipants: 1,
        contactMethod: 'form' as any,
        contactValue: '',
        requirements: post.requirements ? [post.requirements] : [],
        tags: post.tags?.map(tag => tag.name) || [],
        payment: '相談',
        authorId: post.user_id,
        authorName: post.user?.display_name || post.user?.username || '匿名',
        authorAvatar: post.user?.avatar_url || undefined,
        createdAt: post.created_at,
        updatedAt: post.updated_at || post.created_at,
        viewsCount: post.view_count || 0,
        applicationsCount: post.application_count || 0
      }))

      return { data: posts, total: result.count || 0 }
    } catch (error) {
      console.error('Unexpected posts fetch error:', error)
      return { data: [], total: 0, error: 'データの取得に失敗しました' }
    }
  },

  // 単一投稿取得
  async getPost(id: string): Promise<PostResponse> {
    try {
      const result = await postsService.getPost(id)

      if (result.error) {
        return { data: null, error: result.error.message }
      }

      if (!result.data) {
        return { data: null, error: '投稿が見つかりませんでした' }
      }

      const post = result.data
      
      // データ変換 (PostWithDetails -> Post)
      const transformedPost: Post = {
        id: post.id,
        title: post.title,
        description: post.description,
        category: (post.category?.slug as any) || 'other',
        type: 'volunteer' as any, // デフォルト値
        status: (post.status === 'published' ? 'active' : 'closed') as any,
        deadline: post.deadline || undefined,
        maxParticipants: post.recruitment_count || 1,
        minParticipants: 1,
        contactMethod: 'form' as any,
        contactValue: '',
        requirements: post.requirements ? [post.requirements] : [],
        tags: post.tags?.map(tag => tag.name) || [],
        payment: '相談',
        authorId: post.user_id,
        authorName: post.user?.display_name || post.user?.username || '匿名',
        authorAvatar: post.user?.avatar_url || undefined,
        createdAt: post.created_at,
        updatedAt: post.updated_at || post.created_at,
        viewsCount: post.view_count || 0,
        applicationsCount: post.application_count || 0
      }

      return { data: transformedPost }
    } catch (error) {
      console.error('Unexpected post fetch error:', error)
      return { data: null, error: 'データの取得に失敗しました' }
    }
  },

  // 投稿作成
  async createPost(postData: any): Promise<PostResponse> {
    try {
      const authStore = useAuthStore()
      
      if (!authStore.user?.id) {
        return { data: null, error: 'ログインが必要です' }
      }

      // フロントエンドのデータをバックエンド形式に変換
      const createData: PostCreateData = {
        title: postData.title,
        description: postData.description,
        category_id: postData.category, // カテゴリはIDに変換が必要かもしれません
        requirements: postData.requirements?.join ? postData.requirements.join(', ') : postData.requirements,
        recruitment_count: postData.maxParticipants,
        deadline: postData.endDate || postData.startDate
      }

      const result = await postsService.createPost(authStore.user.id, createData)
      
      if (result.error) {
        return { data: null, error: result.error.message }
      }

      if (!result.data) {
        return { data: null, error: '投稿の作成に失敗しました' }
      }

      // レスポンスデータをフロントエンド形式に変換
      const post = result.data
      const transformedPost: Post = {
        id: post.id,
        title: post.title,
        description: post.description,
        category: postData.category, // 元のカテゴリ値を使用
        type: postData.type,
        status: 'active' as any,
        deadline: post.deadline || undefined,
        maxParticipants: post.recruitment_count || 1,
        minParticipants: postData.minParticipants || 1,
        contactMethod: postData.contactMethod,
        contactValue: postData.contactValue,
        requirements: postData.requirements || [],
        tags: [],
        payment: postData.payment,
        authorId: post.user_id,
        authorName: authStore.user.user_metadata?.display_name || '匿名',
        authorAvatar: authStore.user.user_metadata?.avatar_url,
        createdAt: post.created_at,
        updatedAt: post.updated_at || post.created_at,
        viewsCount: 0,
        applicationsCount: 0
      }

      return { data: transformedPost }
    } catch (error) {
      console.error('Unexpected post creation error:', error)
      return { data: null, error: '投稿の作成に失敗しました' }
    }
  }
}
import { postsService } from './posts'
import type { PostCreateData } from './posts'
import type { Post } from '@/types/post'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

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
      
      console.log('=== POST CREATION DEBUG START ===')
      console.log('Auth store:', authStore)
      console.log('Auth store user:', authStore.user)
      console.log('Auth store isAuthenticated:', authStore.isAuthenticated)
      
      if (!authStore.user?.id) {
        console.error('No user ID found in auth store')
        return { data: null, error: 'ログインが必要です' }
      }

      console.log('postsApi.createPost: Input data:', JSON.stringify(postData, null, 2))
      console.log('postsApi.createPost: User ID:', authStore.user.id)
      console.log('postsApi.createPost: User object:', JSON.stringify(authStore.user, null, 2))

      // カテゴリslugをIDに変換（実際のデータベースのカテゴリに合わせる）
      const categoryMap: Record<string, string> = {
        'streaming': '7c104ccc-ae25-44c8-b8b6-d8392d8b44e0', // 配信・動画
        'event': '7de2f5db-0a00-4b55-adf0-10f9ecf755a1',     // イベント
        'photo': 'b6928c39-9e2b-48f6-b4a1-8291543f4374',     // アバター制作（写真に近い）
        'roleplay': '86701fea-6a75-4abe-bdf6-d04534043093',  // ワールド制作（ロールプレイに近い）
        'game': '86701fea-6a75-4abe-bdf6-d04534043093',      // ワールド制作（ゲームに近い）
        'music': '7c104ccc-ae25-44c8-b8b6-d8392d8b44e0',     // 配信・動画（音楽も配信に含む）
        'other': '8878469d-a3b7-40f5-ad32-7be0846f2498'      // その他
      }

      const categoryId = categoryMap[postData.category] || categoryMap['other']
      console.log('postsApi.createPost: Category mapping:', postData.category, '->', categoryId)

      // フロントエンドのデータをバックエンド形式に変換
      const createData = {
        user_id: authStore.user.id,
        category_id: categoryId,
        title: postData.title,
        description: postData.description,
        requirements: postData.requirements?.join ? postData.requirements.join(', ') : (typeof postData.requirements === 'string' ? postData.requirements : ''),
        recruitment_count: postData.maxParticipants || 1,
        deadline: postData.endDate ? new Date(postData.endDate).toISOString().split('T')[0] : (postData.startDate ? new Date(postData.startDate).toISOString().split('T')[0] : null)
      }
      
      console.log('postsApi.createPost: Prepared data for database:', createData)

      // Supabaseに直接挿入
      const { data: insertedPost, error: insertError } = await supabase
        .from('posts')
        .insert([createData])
        .select()
        .single()

      console.log('postsApi.createPost: Supabase insert result:', { insertedPost, insertError })
      console.log('=== DETAILED ERROR ANALYSIS ===')
      
      if (insertError) {
        console.error('postsApi.createPost: Insert error:', insertError)
        console.error('Error code:', insertError.code)
        console.error('Error message:', insertError.message)
        console.error('Error details:', insertError.details)
        console.error('Error hint:', insertError.hint)
        console.error('=== ERROR END ===')
        return { data: null, error: `データベースエラー: ${insertError.message}` }
      }

      if (!insertedPost) {
        return { data: null, error: '投稿の作成に失敗しました' }
      }

      // レスポンスデータをフロントエンド形式に変換
      const transformedPost: Post = {
        id: insertedPost.id,
        title: insertedPost.title,
        description: insertedPost.description,
        category: postData.category, // 元のカテゴリ値を使用
        type: postData.type,
        status: 'active' as any,
        deadline: insertedPost.deadline || undefined,
        maxParticipants: insertedPost.recruitment_count || 1,
        minParticipants: postData.minParticipants || 1,
        contactMethod: postData.contactMethod,
        contactValue: postData.contactValue,
        requirements: postData.requirements || [],
        tags: [],
        payment: postData.payment,
        authorId: insertedPost.user_id,
        authorName: authStore.user.user_metadata?.display_name || '匿名',
        authorAvatar: authStore.user.user_metadata?.avatar_url,
        createdAt: insertedPost.created_at,
        updatedAt: insertedPost.updated_at || insertedPost.created_at,
        viewsCount: 0,
        applicationsCount: 0
      }
      
      console.log('postsApi.createPost: Transformed post:', transformedPost)
      console.log('=== POST CREATION DEBUG END ===')

      return { data: transformedPost }
    } catch (error) {
      console.error('=== UNEXPECTED ERROR ===')
      console.error('Unexpected post creation error:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error stack:', error?.stack)
      console.error('=== ERROR END ===')
      return { data: null, error: `予期しないエラー: ${error?.message || 'Unknown error'}` }
    }
  },

  // デバッグ用: 最小限のテスト投稿
  async testCreatePost(): Promise<PostResponse> {
    try {
      const authStore = useAuthStore()
      
      console.log('=== TEST POST CREATION ===')
      console.log('Auth user ID:', authStore.user?.id)
      
      if (!authStore.user?.id) {
        return { data: null, error: 'ログインが必要です' }
      }

      const testData = {
        user_id: authStore.user.id,
        category_id: '7c104ccc-ae25-44c8-b8b6-d8392d8b44e0',
        title: 'テスト投稿フロントエンド',
        description: 'フロントエンドからのテスト投稿です。',
        requirements: null,
        recruitment_count: 1,
        deadline: null
      }
      
      console.log('Test data:', testData)

      const { data, error } = await supabase
        .from('posts')
        .insert([testData])
        .select()
        .single()

      console.log('Test result:', { data, error })
      
      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as any }
    } catch (error) {
      console.error('Test creation error:', error)
      return { data: null, error: error?.message || 'Test failed' }
    }
  }
}
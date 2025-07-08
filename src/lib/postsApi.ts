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
    sortBy?: string
    limit?: number
    offset?: number
    user_id?: string
  }): Promise<PostsResponse> {
    try {
      const page = filters.offset ? Math.floor(filters.offset / (filters.limit || 10)) + 1 : 1
      
      // ソート設定をマッピング
      let sortBy: 'created_at' | 'updated_at' | 'deadline' | 'view_count' = 'created_at'
      let sortOrder: 'asc' | 'desc' = 'desc'
      
      switch (filters.sortBy) {
        case 'newest':
          sortBy = 'created_at'
          sortOrder = 'desc'
          break
        case 'oldest':
          sortBy = 'created_at'
          sortOrder = 'asc'
          break
        case 'deadline':
          sortBy = 'deadline'
          sortOrder = 'asc'
          break
        case 'popular':
          sortBy = 'view_count'
          sortOrder = 'desc'
          break
        default:
          sortBy = 'created_at'
          sortOrder = 'desc'
      }

      const queryParams = {
        category_slug: filters.category,
        search: filters.search,
        status: filters.status === 'active' ? 'published' : (filters.status as any),
        user_id: filters.user_id,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: filters.limit || 10,
        page
      }
      
      // console.log('postsApi.getPosts: Query parameters:', queryParams)
      const result = await postsService.getPosts(queryParams)

      if (result.error) {
        return { data: [], total: 0, error: result.error.message }
      }

      // データ変換 (PostWithDetails -> Post)
      const posts: Post[] = (result.data || []).map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: (post.post_categories?.slug as any) || 'other',
        status: (post.status === 'published' ? 'active' : post.status === 'draft' ? 'draft' : 'closed') as any,
        deadline: post.deadline || undefined,
        maxParticipants: post.recruitment_count || 1,
        contactMethod: (post.contact_method as any) || 'form',
        contactValue: post.contact_value || '',
        requirements: post.requirements ? post.requirements.split(',').map(r => r.trim()) : [],
        tags: post.post_tags?.map(pt => pt.tags?.name).filter(Boolean) || [],
        worldName: post.world_name || undefined,
        authorId: post.user_id,
        authorName: post.users?.display_name || post.users?.username || '匿名',
        createdAt: post.created_at,
        updatedAt: post.updated_at || post.created_at,
        applicationsCount: post.application_count || 0,
        eventFrequency: post.event_frequency || undefined,
        eventSpecificDate: post.event_specific_date || undefined,
        eventWeekday: post.event_weekday !== null ? post.event_weekday : undefined,
        eventTime: post.event_time || undefined,
        eventWeekOfMonth: post.event_week_of_month !== null ? post.event_week_of_month : undefined,
        images: post.post_images?.map(img => img.url) || []
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
        category: (post.post_categories?.slug as any) || 'other',
        status: (post.status === 'published' ? 'active' : post.status === 'draft' ? 'draft' : 'closed') as any,
        deadline: post.deadline || undefined,
        maxParticipants: post.recruitment_count || 1,
        contactMethod: (post.contact_method as any) || 'form',
        contactValue: post.contact_value || '',
        requirements: post.requirements ? post.requirements.split(',').map(r => r.trim()) : [],
        tags: post.post_tags?.map(pt => pt.tags?.name).filter(Boolean) || [],
        worldName: post.world_name || undefined,
        authorId: post.user_id,
        authorName: post.users?.display_name || post.users?.username || '匿名',
        createdAt: post.created_at,
        updatedAt: post.updated_at || post.created_at,
        applicationsCount: post.application_count || 0,
        eventFrequency: post.event_frequency || undefined,
        eventSpecificDate: post.event_specific_date || undefined,
        eventWeekday: post.event_weekday !== null ? post.event_weekday : undefined,
        eventTime: post.event_time || undefined,
        eventWeekOfMonth: post.event_week_of_month !== null ? post.event_week_of_month : undefined,
        images: post.post_images?.map(img => img.url) || []
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
        console.error('No user ID found in auth store')
        return { data: null, error: 'ログインが必要です' }
      }

      // カテゴリslugをIDに変換（新しいカテゴリに合わせる）
      const categoryMap: Record<string, string> = {
        'customer-service': '86701fea-6a75-4abe-bdf6-d04534043093', // 接客
        'meetings': 'b6928c39-9e2b-48f6-b4a1-8291543f4374',        // 集会
        'music-dance': '7de2f5db-0a00-4b55-adf0-10f9ecf755a1',     // 音楽・ダンス
        'social': '7c104ccc-ae25-44c8-b8b6-d8392d8b44e0',           // 出会い
        'beginners': 'd93d482c-402a-469f-ba9a-92da08ff05e8',       // 初心者
        'roleplay': '50a97664-cd88-45a3-baf7-8e2c2776df03',        // ロールプレイ
        'games': '23e2cbf3-3a80-4249-afaa-491b696bf94b',           // ゲーム
        'other': '8878469d-a3b7-40f5-ad32-7be0846f2498'             // その他
      }

      const categoryId = categoryMap[postData.category] || categoryMap['other']

      // フロントエンドのデータをバックエンド形式に変換
      const createData = {
        user_id: authStore.user.id,
        category_id: categoryId,
        title: postData.title,
        description: postData.description,
        requirements: postData.requirements?.join ? postData.requirements.join(', ') : (typeof postData.requirements === 'string' ? postData.requirements : ''),
        recruitment_count: postData.maxParticipants || 1,
        deadline: postData.deadline ? new Date(postData.deadline).toISOString().split('T')[0] : null,
        contact_method: postData.contactMethod || null,
        contact_value: postData.contactValue || null,
        event_frequency: postData.eventFrequency || null,
        event_specific_date: postData.eventSpecificDate ? new Date(postData.eventSpecificDate).toISOString() : null,
        event_weekday: postData.eventWeekday !== undefined ? postData.eventWeekday : null,
        event_time: postData.eventTime || null,
        event_week_of_month: postData.eventWeekOfMonth !== undefined ? postData.eventWeekOfMonth : null
      }

      // Supabaseに直接挿入
      const { data: insertedPost, error: insertError } = await supabase
        .from('posts')
        .insert([createData])
        .select()
        .single()
      
      if (insertError) {
        console.error('postsApi.createPost: Insert error:', insertError.message)
        return { data: null, error: `データベースエラー: ${insertError.message}` }
      }

      if (!insertedPost) {
        return { data: null, error: '投稿の作成に失敗しました' }
      }

      // 画像がある場合、post_imagesテーブルに保存
      if (postData.images && postData.images.length > 0) {
        const imageData = postData.images.map((url, index) => ({
          post_id: insertedPost.id,
          url,
          display_order: index
        }))

        const { error: imageError } = await supabase
          .from('post_images')
          .insert(imageData)

        if (imageError) {
          console.error('Failed to insert images:', imageError.message)
          // 画像の保存に失敗してもポスト自体は成功とする
        }
      }

      // レスポンスデータをフロントエンド形式に変換
      const transformedPost: Post = {
        id: insertedPost.id,
        title: insertedPost.title,
        description: insertedPost.description,
        category: postData.category, // 元のカテゴリ値を使用
        status: 'active' as any,
        deadline: insertedPost.deadline || undefined,
        maxParticipants: insertedPost.recruitment_count || 1,
        contactMethod: postData.contactMethod,
        contactValue: postData.contactValue,
        requirements: postData.requirements || [],
        tags: [],
        authorId: insertedPost.user_id,
        authorName: authStore.user.user_metadata?.display_name || '匿名',
        createdAt: insertedPost.created_at,
        updatedAt: insertedPost.updated_at || insertedPost.created_at,
        applicationsCount: 0,
        eventFrequency: postData.eventFrequency,
        eventSpecificDate: postData.eventSpecificDate,
        eventWeekday: postData.eventWeekday,
        eventTime: postData.eventTime,
        eventWeekOfMonth: postData.eventWeekOfMonth,
        images: []
      }

      return { data: transformedPost }
    } catch (error) {
      console.error('Unexpected post creation error:', error)
      return { data: null, error: `予期しないエラー: ${error?.message || 'Unknown error'}` }
    }
  },

  // 投稿更新
  async updatePost(postId: string, postData: any): Promise<PostResponse> {
    try {
      const authStore = useAuthStore()
      
      if (!authStore.user?.id) {
        console.error('No user ID found in auth store')
        return { data: null, error: 'ログインが必要です' }
      }

      // カテゴリslugをIDに変換
      const categoryMap: Record<string, string> = {
        'customer-service': '86701fea-6a75-4abe-bdf6-d04534043093',
        'meetings': 'b6928c39-9e2b-48f6-b4a1-8291543f4374',
        'music-dance': '7de2f5db-0a00-4b55-adf0-10f9ecf755a1',
        'social': '7c104ccc-ae25-44c8-b8b6-d8392d8b44e0',
        'beginners': 'd93d482c-402a-469f-ba9a-92da08ff05e8',
        'roleplay': '50a97664-cd88-45a3-baf7-8e2c2776df03',
        'games': '23e2cbf3-3a80-4249-afaa-491b696bf94b',
        'other': '8878469d-a3b7-40f5-ad32-7be0846f2498'
      }

      const categoryId = categoryMap[postData.category] || categoryMap['other']

      // 更新データを準備
      const updateData = {
        category_id: categoryId,
        title: postData.title,
        description: postData.description,
        requirements: postData.requirements?.join ? postData.requirements.join(', ') : (typeof postData.requirements === 'string' ? postData.requirements : ''),
        recruitment_count: postData.maxParticipants || 1,
        deadline: postData.deadline ? new Date(postData.deadline).toISOString().split('T')[0] : null,
        contact_method: postData.contactMethod || null,
        contact_value: postData.contactValue || null,
        event_frequency: postData.eventFrequency || null,
        event_specific_date: postData.eventSpecificDate ? new Date(postData.eventSpecificDate).toISOString() : null,
        event_weekday: postData.eventWeekday !== undefined ? postData.eventWeekday : null,
        event_time: postData.eventTime || null,
        event_week_of_month: postData.eventWeekOfMonth !== undefined ? postData.eventWeekOfMonth : null,
        updated_at: new Date().toISOString()
      }

      // 権限チェック：自分の投稿のみ更新可能
      const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (fetchError) {
        console.error('Failed to fetch existing post:', fetchError.message)
        return { data: null, error: '投稿の取得に失敗しました' }
      }

      if (existingPost.user_id !== authStore.user.id) {
        return { data: null, error: '他のユーザーの投稿は編集できません' }
      }

      // Supabaseで更新
      const { data: updatedPost, error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single()
      
      if (updateError) {
        console.error('postsApi.updatePost: Update error:', updateError.message)
        return { data: null, error: `データベースエラー: ${updateError.message}` }
      }

      if (!updatedPost) {
        return { data: null, error: '投稿の更新に失敗しました' }
      }

      // 既存の画像を削除
      const { error: deleteImageError } = await supabase
        .from('post_images')
        .delete()
        .eq('post_id', postId)

      if (deleteImageError) {
        console.error('Failed to delete existing images:', deleteImageError.message)
      }

      // 新しい画像を追加
      if (postData.images && postData.images.length > 0) {
        const imageData = postData.images.map((url, index) => ({
          post_id: postId,
          url,
          display_order: index
        }))

        const { error: imageError } = await supabase
          .from('post_images')
          .insert(imageData)

        if (imageError) {
          console.error('Failed to insert images:', imageError.message)
        }
      }

      // レスポンスデータをフロントエンド形式に変換
      const transformedPost: Post = {
        id: updatedPost.id,
        title: updatedPost.title,
        description: updatedPost.description,
        category: postData.category,
        status: 'active' as any,
        deadline: updatedPost.deadline || undefined,
        maxParticipants: updatedPost.recruitment_count || 1,
        contactMethod: postData.contactMethod,
        contactValue: postData.contactValue,
        requirements: postData.requirements || [],
        tags: [],
        worldName: undefined,
        authorId: updatedPost.user_id,
        authorName: authStore.user.user_metadata?.display_name || '匿名',
        createdAt: updatedPost.created_at,
        updatedAt: updatedPost.updated_at || updatedPost.created_at,
        applicationsCount: 0,
        eventFrequency: postData.eventFrequency,
        eventSpecificDate: postData.eventSpecificDate,
        eventWeekday: postData.eventWeekday,
        eventTime: postData.eventTime,
        eventWeekOfMonth: postData.eventWeekOfMonth,
        images: postData.images || []
      }

      return { data: transformedPost }
    } catch (error) {
      console.error('Unexpected post update error:', error)
      return { data: null, error: `予期しないエラー: ${error?.message || 'Unknown error'}` }
    }
  },

  // 下書き保存
  async saveDraft(postData: any, draftId?: string): Promise<PostResponse> {
    try {
      const authStore = useAuthStore()
      
      if (!authStore.user?.id) {
        console.error('No user ID found in auth store')
        return { data: null, error: 'ログインが必要です' }
      }

      // カテゴリslugをIDに変換
      const categoryMap: Record<string, string> = {
        'customer-service': '86701fea-6a75-4abe-bdf6-d04534043093',
        'meetings': 'b6928c39-9e2b-48f6-b4a1-8291543f4374',
        'music-dance': '7de2f5db-0a00-4b55-adf0-10f9ecf755a1',
        'social': '7c104ccc-ae25-44c8-b8b6-d8392d8b44e0',
        'beginners': 'd93d482c-402a-469f-ba9a-92da08ff05e8',
        'roleplay': '50a97664-cd88-45a3-baf7-8e2c2776df03',
        'games': '23e2cbf3-3a80-4249-afaa-491b696bf94b',
        'other': '8878469d-a3b7-40f5-ad32-7be0846f2498'
      }

      const categoryId = categoryMap[postData.category] || categoryMap['other']

      // 下書きデータを準備（最小限のバリデーション）
      const draftData = {
        user_id: authStore.user.id,
        category_id: categoryId,
        title: postData.title || '無題の下書き',
        description: postData.description || '',
        requirements: postData.requirements?.join ? postData.requirements.join(', ') : (typeof postData.requirements === 'string' ? postData.requirements : ''),
        recruitment_count: postData.maxParticipants || 1,
        deadline: postData.deadline ? new Date(postData.deadline).toISOString().split('T')[0] : null,
        contact_method: postData.contactMethod || null,
        contact_value: postData.contactValue || null,
        event_frequency: postData.eventFrequency || null,
        event_specific_date: postData.eventSpecificDate ? new Date(postData.eventSpecificDate).toISOString() : null,
        event_weekday: postData.eventWeekday !== undefined ? postData.eventWeekday : null,
        event_time: postData.eventTime || null,
        event_week_of_month: postData.eventWeekOfMonth !== undefined ? postData.eventWeekOfMonth : null,
        status: 'draft', // 下書きステータス
        updated_at: new Date().toISOString()
      }

      let result
      if (draftId) {
        // 既存の下書きを更新
        const { data: updatedDraft, error: updateError } = await supabase
          .from('posts')
          .update(draftData)
          .eq('id', draftId)
          .eq('user_id', authStore.user.id) // セキュリティチェック
          .select()
          .single()
        
        if (updateError) {
          console.error('postsApi.saveDraft: Update error:', updateError.message)
          return { data: null, error: `下書きの更新に失敗しました: ${updateError.message}` }
        }
        result = { data: updatedDraft, error: null }
      } else {
        // 新規下書きを作成
        const { data: newDraft, error: insertError } = await supabase
          .from('posts')
          .insert([draftData])
          .select()
          .single()
        
        if (insertError) {
          console.error('postsApi.saveDraft: Insert error:', insertError.message)
          return { data: null, error: `下書きの保存に失敗しました: ${insertError.message}` }
        }
        result = { data: newDraft, error: null }
      }

      if (!result.data) {
        return { data: null, error: '下書きの保存に失敗しました' }
      }

      // 画像がある場合の処理
      if (postData.images && postData.images.length > 0) {
        // 既存の画像を削除（更新の場合）
        if (draftId) {
          await supabase
            .from('post_images')
            .delete()
            .eq('post_id', draftId)
        }

        // 新しい画像を追加
        const imageData = postData.images.map((url, index) => ({
          post_id: result.data.id,
          url,
          display_order: index
        }))

        const { error: imageError } = await supabase
          .from('post_images')
          .insert(imageData)

        if (imageError) {
          console.error('Failed to save draft images:', imageError.message)
        }
      }

      // レスポンスデータをフロントエンド形式に変換
      const transformedPost: Post = {
        id: result.data.id,
        title: result.data.title,
        description: result.data.description,
        category: postData.category,
        status: 'draft' as any,
        deadline: result.data.deadline || undefined,
        maxParticipants: result.data.recruitment_count || 1,
        contactMethod: postData.contactMethod,
        contactValue: postData.contactValue,
        requirements: postData.requirements || [],
        tags: [],
        worldName: undefined,
        authorId: result.data.user_id,
        authorName: authStore.user.user_metadata?.display_name || '匿名',
        createdAt: result.data.created_at,
        updatedAt: result.data.updated_at || result.data.created_at,
        applicationsCount: 0,
        eventFrequency: postData.eventFrequency,
        eventSpecificDate: postData.eventSpecificDate,
        eventWeekday: postData.eventWeekday,
        eventTime: postData.eventTime,
        eventWeekOfMonth: postData.eventWeekOfMonth,
        images: postData.images || []
      }

      return { data: transformedPost }
    } catch (error) {
      console.error('Unexpected draft save error:', error)
      return { data: null, error: `予期しないエラー: ${error?.message || 'Unknown error'}` }
    }
  },

  // デバッグ用: 最小限のテスト投稿
  async testCreatePost(): Promise<PostResponse> {
    try {
      const authStore = useAuthStore()
      
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

      const { data, error } = await supabase
        .from('posts')
        .insert([testData])
        .select()
        .single()
      
      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as any }
    } catch (error) {
      console.error('Test creation error:', error)
      return { data: null, error: error?.message || 'Test failed' }
    }
  },

  // 投稿削除
  async deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const authStore = useAuthStore()
      
      if (!authStore.user?.id) {
        return { success: false, error: 'ログインが必要です' }
      }

      // 投稿の所有者確認のため、投稿情報を取得
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (fetchError || !post) {
        return { success: false, error: '投稿が見つかりません' }
      }

      // 投稿者本人かチェック
      if (post.user_id !== authStore.user.id) {
        return { success: false, error: '削除権限がありません' }
      }

      // 投稿を削除（CASCADE設定により関連データも削除される）
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (deleteError) {
        console.error('Delete post error:', deleteError.message)
        return { success: false, error: `削除に失敗しました: ${deleteError.message}` }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected delete error:', error)
      return { success: false, error: `予期しないエラー: ${error?.message || 'Unknown error'}` }
    }
  }
}
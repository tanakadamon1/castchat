import { supabase } from './supabase'
import { validator } from './validation'
import { errorHandler, ErrorCode, type AppError } from './errors'
import { permissionManager } from './permissions'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'
import type { User } from '@supabase/supabase-js'

export type Post = Tables<'posts'>
export type PostInsert = TablesInsert<'posts'>
export type PostUpdate = TablesUpdate<'posts'>
export type PostCategory = Tables<'post_categories'>
export type Tag = Tables<'tags'>
export type PostTag = Tables<'post_tags'>
export type PostImage = Tables<'post_images'>

export interface PostWithDetails extends Post {
  user?: Tables<'users'>
  category?: PostCategory
  tags?: Tag[]
  images?: PostImage[]
  application_count?: number
  is_favorited?: boolean
}

export interface PostCreateData {
  title: string
  description: string
  category_id: string
  requirements?: string
  world_name?: string
  recruitment_count?: number
  deadline?: string
  post_type?: string
  contact_method?: string
  contact_value?: string
  payment_info?: string
  start_date?: string
  end_date?: string
  min_participants?: number
  tag_ids?: string[]
  image_urls?: string[]
}

export interface PostUpdateData {
  title?: string
  description?: string
  category_id?: string
  requirements?: string
  world_name?: string
  recruitment_count?: number
  deadline?: string
  post_type?: string
  contact_method?: string
  contact_value?: string
  payment_info?: string
  start_date?: string
  end_date?: string
  min_participants?: number
  status?: Post['status']
  tag_ids?: string[]
  image_urls?: string[]
}

export interface PostsApiResult<T = any> {
  data: T | null
  error: AppError | null
  count?: number
}

export interface PostFilters {
  category_id?: string
  category_slug?: string
  tags?: string[]
  status?: Post['status']
  user_id?: string
  search?: string
  deadline_before?: string
  deadline_after?: string
  is_featured?: boolean
}

export interface PostsQuery extends PostFilters {
  page?: number
  limit?: number
  sort_by?: 'created_at' | 'updated_at' | 'deadline' | 'view_count'
  sort_order?: 'asc' | 'desc'
}

export class PostsService {
  private static instance: PostsService

  private constructor() {}

  static getInstance(): PostsService {
    if (!PostsService.instance) {
      PostsService.instance = new PostsService()
    }
    return PostsService.instance
  }

  async createPost(userId: string, postData: PostCreateData): Promise<PostsApiResult<Post>> {
    try {
      // バリデーション
      const titleValidation = validator.postTitle(postData.title)
      if (!titleValidation.isValid) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'Invalid post title',
            titleValidation.errors.join(', ')
          )
        }
      }

      const descriptionValidation = validator.postDescription(postData.description)
      if (!descriptionValidation.isValid) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'Invalid post description',
            descriptionValidation.errors.join(', ')
          )
        }
      }

      if (postData.recruitment_count) {
        const countValidation = validator.recruitmentCount(postData.recruitment_count)
        if (!countValidation.isValid) {
          return {
            data: null,
            error: errorHandler.createError(
              ErrorCode.VALIDATION_INVALID_FORMAT,
              'Invalid recruitment count',
              countValidation.errors.join(', ')
            )
          }
        }
      }

      if (postData.deadline) {
        const deadlineValidation = validator.deadline(postData.deadline)
        if (!deadlineValidation.isValid) {
          return {
            data: null,
            error: errorHandler.createError(
              ErrorCode.VALIDATION_INVALID_FORMAT,
              'Invalid deadline',
              deadlineValidation.errors.join(', ')
            )
          }
        }
      }

      // 投稿データ準備
      const insertData: PostInsert = {
        user_id: userId,
        title: postData.title,
        description: postData.description,
        category_id: postData.category_id,
        requirements: postData.requirements || null,
        world_name: postData.world_name || null,
        recruitment_count: postData.recruitment_count || 1,
        deadline: postData.deadline || null,
        post_type: postData.post_type || 'volunteer',
        contact_method: postData.contact_method || null,
        contact_value: postData.contact_value || null,
        payment_info: postData.payment_info || null,
        start_date: postData.start_date || null,
        end_date: postData.end_date || null,
        min_participants: postData.min_participants || 1,
        status: 'published',
        published_at: new Date().toISOString()
      }

      // 投稿作成
      const { data: post, error } = await supabase
        .from('posts')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'create_post',
            userId,
            postData
          })
        }
      }

      // タグの関連付け
      if (postData.tag_ids && postData.tag_ids.length > 0) {
        await this.updatePostTags(post.id, postData.tag_ids)
      }

      // 画像の関連付け
      if (postData.image_urls && postData.image_urls.length > 0) {
        await this.updatePostImages(post.id, postData.image_urls)
      }

      return { data: post, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'create_post',
          userId,
          postData
        })
      }
    }
  }

  async updatePost(
    postId: string, 
    userId: string, 
    updateData: PostUpdateData,
    userProfile?: Tables<'users'>
  ): Promise<PostsApiResult<Post>> {
    try {
      // 期限切れ優先表示の自動更新を実行
      await this.updateExpiredPriorities()
      
      // 投稿の取得と権限チェック
      const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (fetchError || !existingPost) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Post not found',
            `Post with ID ${postId} not found`
          )
        }
      }

      // 権限チェック
      if (userProfile && !permissionManager.canUpdatePost(userProfile, existingPost.user_id)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to update post',
            `User ${userId} cannot update post ${postId}`
          )
        }
      }

      // バリデーション
      if (updateData.title) {
        const titleValidation = validator.postTitle(updateData.title)
        if (!titleValidation.isValid) {
          return {
            data: null,
            error: errorHandler.createError(
              ErrorCode.VALIDATION_INVALID_FORMAT,
              'Invalid post title',
              titleValidation.errors.join(', ')
            )
          }
        }
      }

      if (updateData.description) {
        const descriptionValidation = validator.postDescription(updateData.description)
        if (!descriptionValidation.isValid) {
          return {
            data: null,
            error: errorHandler.createError(
              ErrorCode.VALIDATION_INVALID_FORMAT,
              'Invalid post description',
              descriptionValidation.errors.join(', ')
            )
          }
        }
      }

      // 更新データ準備
      const updatePayload: PostUpdate = {}
      
      if (updateData.title !== undefined) updatePayload.title = updateData.title
      if (updateData.description !== undefined) updatePayload.description = updateData.description
      if (updateData.category_id !== undefined) updatePayload.category_id = updateData.category_id
      if (updateData.requirements !== undefined) updatePayload.requirements = updateData.requirements
      if (updateData.world_name !== undefined) updatePayload.world_name = updateData.world_name
      if (updateData.recruitment_count !== undefined) updatePayload.recruitment_count = updateData.recruitment_count
      if (updateData.deadline !== undefined) updatePayload.deadline = updateData.deadline
      if (updateData.post_type !== undefined) updatePayload.post_type = updateData.post_type
      if (updateData.contact_method !== undefined) updatePayload.contact_method = updateData.contact_method
      if (updateData.contact_value !== undefined) updatePayload.contact_value = updateData.contact_value
      if (updateData.payment_info !== undefined) updatePayload.payment_info = updateData.payment_info
      if (updateData.start_date !== undefined) updatePayload.start_date = updateData.start_date
      if (updateData.end_date !== undefined) updatePayload.end_date = updateData.end_date
      if (updateData.min_participants !== undefined) updatePayload.min_participants = updateData.min_participants
      if (updateData.status !== undefined) {
        updatePayload.status = updateData.status
        if (updateData.status === 'closed') {
          updatePayload.closed_at = new Date().toISOString()
        }
      }

      // 投稿更新
      const { data: updatedPost, error } = await supabase
        .from('posts')
        .update(updatePayload)
        .eq('id', postId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'update_post',
            postId,
            userId,
            updateData
          })
        }
      }

      // タグの更新
      if (updateData.tag_ids !== undefined) {
        await this.updatePostTags(postId, updateData.tag_ids)
      }

      // 画像の更新
      if (updateData.image_urls !== undefined) {
        await this.updatePostImages(postId, updateData.image_urls)
      }

      return { data: updatedPost, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'update_post',
          postId,
          userId,
          updateData
        })
      }
    }
  }

  async deletePost(
    postId: string, 
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<PostsApiResult<void>> {
    try {
      // 期限切れ優先表示の自動更新を実行
      await this.updateExpiredPriorities()
      
      // 投稿の取得と権限チェック
      const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (fetchError || !existingPost) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Post not found',
            `Post with ID ${postId} not found`
          )
        }
      }

      // 権限チェック
      if (userProfile && !permissionManager.canDeletePost(userProfile, existingPost.user_id)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to delete post',
            `User ${userId} cannot delete post ${postId}`
          )
        }
      }

      // 投稿削除（CASCADE により関連データも削除される）
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'delete_post',
            postId,
            userId
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'delete_post',
          postId,
          userId
        })
      }
    }
  }

  async getPost(postId: string, userId?: string): Promise<PostsApiResult<PostWithDetails>> {
    try {
      // 期限切れ優先表示の自動更新を実行
      await this.updateExpiredPriorities()
      
      // 投稿の基本情報を取得
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey(id, display_name, is_verified),
          post_categories!posts_category_id_fkey(id, name, slug),
          post_images(url, display_order),
          post_tags(tags(name))
        `)
        .eq('id', postId)
        .single()

      if (postError || !post) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Post not found',
            `Post with ID ${postId} not found`
          )
        }
      }

      // タグ情報を取得
      const { data: postTags } = await supabase
        .from('post_tags')
        .select(`
          tags(id, name, slug)
        `)
        .eq('post_id', postId)

      // 画像情報を取得
      const { data: images } = await supabase
        .from('post_images')
        .select('*')
        .eq('post_id', postId)
        .order('display_order', { ascending: true })

      // 応募数を取得
      const { count: applicationCount } = await supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .eq('post_id', postId)

      // お気に入り状態をチェック（ログインユーザーの場合）
      let isFavorited = false
      if (userId) {
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('user_id')
          .eq('user_id', userId)
          .eq('post_id', postId)
          .single()

        isFavorited = !!favoriteData
      }

      // ビューカウント増加（投稿者以外の場合）
      if (userId && userId !== post.user_id) {
        await this.incrementViewCount(postId)
      }

      const postWithDetails: PostWithDetails = {
        ...post,
        user: post.users,
        category: post.post_categories,
        tags: postTags?.map(pt => pt.tags).filter(Boolean) || [],
        images: images || [],
        application_count: applicationCount || 0,
        is_favorited: isFavorited
      }

      return { data: postWithDetails, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_post',
          postId
        })
      }
    }
  }

  // 期限切れ優先表示を更新する関数
  async updateExpiredPriorities(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('check_and_expire_priorities')
      if (error) {
        console.error('期限切れ更新エラー:', error)
        return 0
      }
      return data || 0
    } catch (error) {
      console.error('期限切れ更新エラー:', error)
      return 0
    }
  }

  async getPosts(query: PostsQuery = {}): Promise<PostsApiResult<PostWithDetails[]>> {
    try {
      const {
        page = 1,
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc',
        ...filters
      } = query

      const offset = (page - 1) * limit

      let supabaseQuery = supabase
        .from('posts')
        .select(`
          *,
          users:users!posts_user_id_fkey(id, display_name, is_verified),
          post_categories:post_categories!posts_category_id_fkey(id, name, slug),
          post_images(url, display_order),
          post_tags(tags(name)),
          applications(id)
        `, { count: 'exact' })

      // フィルター適用
      if (filters.category_id) {
        supabaseQuery = supabaseQuery.eq('category_id', filters.category_id)
      }
      
      // カテゴリslugによるフィルタリング
      if (filters.category_slug) {
        // カテゴリIDを取得してからフィルタリング
        const { data: category } = await supabase
          .from('post_categories')
          .select('id')
          .eq('slug', filters.category_slug)
          .single()
        
        if (category) {
          supabaseQuery = supabaseQuery.eq('category_id', category.id)
        } else {
          // カテゴリが見つからない場合は空の結果を返す
          return { data: [], error: null, count: 0 }
        }
      }

      if (filters.status) {
        supabaseQuery = supabaseQuery.eq('status', filters.status)
      } else if (!filters.user_id) {
        // user_idが指定されていない場合（公開一覧）のみpublishedに制限
        supabaseQuery = supabaseQuery.eq('status', 'published')
      }

      if (filters.user_id) {
        supabaseQuery = supabaseQuery.eq('user_id', filters.user_id)
      }

      if (filters.is_featured !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_featured', filters.is_featured)
      }

      if (filters.deadline_before) {
        supabaseQuery = supabaseQuery.lte('deadline', filters.deadline_before)
      }

      if (filters.deadline_after) {
        supabaseQuery = supabaseQuery.gte('deadline', filters.deadline_after)
      }

      // テキスト検索
      if (filters.search) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,requirements.ilike.%${filters.search}%`
        )
      }

      // 期限切れ優先表示の自動更新を実行
      const expiredCount = await this.updateExpiredPriorities()
      if (expiredCount > 0) {
        console.log(`期限切れ優先表示投稿 ${expiredCount} 件を更新しました`)
      }

      // ソート - 有効な優先表示を最初に、その後指定されたソート順
      supabaseQuery = supabaseQuery
        .order('is_priority', { ascending: false })  // 優先表示を先に
        .order('priority_expires_at', { ascending: false, nullsFirst: false })  // 期限が近い順
        .order(sort_by, { ascending: sort_order === 'asc' })

      // ページネーション
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

      const { data, error, count } = await supabaseQuery

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_posts',
            query
          })
        }
      }

      // 応募件数を含めたデータに変換
      const postsWithDetails = (data || []).map(post => ({
        ...post,
        application_count: post.applications?.length || 0
      }))

      return { 
        data: postsWithDetails, 
        error: null,
        count: count || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_posts',
          query
        })
      }
    }
  }

  private async updatePostTags(postId: string, tagIds: string[]): Promise<void> {
    // 既存のタグ関連付けを削除
    await supabase
      .from('post_tags')
      .delete()
      .eq('post_id', postId)

    // 新しいタグ関連付けを作成
    if (tagIds.length > 0) {
      const postTags = tagIds.map(tagId => ({
        post_id: postId,
        tag_id: tagId
      }))

      await supabase
        .from('post_tags')
        .insert(postTags)
    }
  }

  private async updatePostImages(postId: string, imageUrls: string[]): Promise<void> {
    // 既存の画像を削除
    await supabase
      .from('post_images')
      .delete()
      .eq('post_id', postId)

    // 新しい画像を追加
    if (imageUrls.length > 0) {
      const postImages = imageUrls.map((url, index) => ({
        post_id: postId,
        url,
        display_order: index
      }))

      await supabase
        .from('post_images')
        .insert(postImages)
    }
  }

  private async incrementViewCount(postId: string): Promise<void> {
    // ビューカウントを1増加
    const { data: currentPost } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', postId)
      .single()

    const newCount = (currentPost?.view_count || 0) + 1

    await supabase
      .from('posts')
      .update({ 
        view_count: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
  }

  // ユーティリティメソッド
  async toggleFavorite(userId: string, postId: string): Promise<PostsApiResult<boolean>> {
    try {
      const { data: existing } = await supabase
        .from('favorites')
        .select('user_id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single()

      if (existing) {
        // お気に入り削除
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId)
        
        return { data: false, error: null }
      } else {
        // お気に入り追加
        await supabase
          .from('favorites')
          .insert({ user_id: userId, post_id: postId })
        
        return { data: true, error: null }
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'toggle_favorite',
          userId,
          postId
        })
      }
    }
  }
}

export const postsService = PostsService.getInstance()
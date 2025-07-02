import { supabase } from './supabase'
import { errorHandler, ErrorCode, type AppError } from './errors'
import type { Tables } from './database.types'
import type { PostWithDetails, PostsQuery } from './posts'

export interface SearchApiResult<T = any> {
  data: T | null
  error: AppError | null
  count?: number
  total_count?: number
}

export interface SearchQuery {
  query: string
  categories?: string[]
  tags?: string[]
  status?: 'published' | 'draft' | 'closed'
  user_id?: string
  date_from?: string
  date_to?: string
  deadline_from?: string
  deadline_to?: string
  is_featured?: boolean
  has_images?: boolean
  recruitment_count_min?: number
  recruitment_count_max?: number
  world_name?: string
  page?: number
  limit?: number
  sort_by?: 'relevance' | 'created_at' | 'updated_at' | 'deadline' | 'view_count'
  sort_order?: 'asc' | 'desc'
}

export interface SearchSuggestion {
  type: 'user' | 'category' | 'tag' | 'world'
  value: string
  label: string
  count?: number
}

export interface SearchStats {
  total_posts: number
  total_users: number
  popular_categories: Array<{ name: string; count: number }>
  popular_tags: Array<{ name: string; count: number }>
  recent_searches: string[]
}

export class SearchService {
  private static instance: SearchService

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  async searchPosts(searchQuery: SearchQuery): Promise<SearchApiResult<PostWithDetails[]>> {
    try {
      const {
        query,
        categories,
        tags,
        status = 'published',
        user_id,
        date_from,
        date_to,
        deadline_from,
        deadline_to,
        is_featured,
        has_images,
        recruitment_count_min,
        recruitment_count_max,
        world_name,
        page = 1,
        limit = 20,
        sort_by = 'relevance',
        sort_order = 'desc'
      } = searchQuery

      const offset = (page - 1) * limit

      // 基本クエリの構築
      let supabaseQuery = supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey(id, username, display_name, avatar_url, is_verified),
          post_categories!posts_category_id_fkey(id, name, slug, color),
          post_tags!inner(tags(id, name, slug, color)),
          post_images(id, url, alt_text, display_order),
          applications(id),
          favorites(user_id)
        `, { count: 'exact' })

      // ステータスフィルター
      supabaseQuery = supabaseQuery.eq('status', status)

      // テキスト検索（全文検索）
      if (query && query.trim()) {
        const searchTerms = query.trim().split(/\s+/).map(term => `'${term}'`).join(' | ')
        
        // PostgreSQLの全文検索を使用
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,requirements.ilike.%${query}%,world_name.ilike.%${query}%`
        )
      }

      // カテゴリフィルター
      if (categories && categories.length > 0) {
        supabaseQuery = supabaseQuery.in('category_id', categories)
      }

      // ユーザーフィルター
      if (user_id) {
        supabaseQuery = supabaseQuery.eq('user_id', user_id)
      }

      // 日付フィルター
      if (date_from) {
        supabaseQuery = supabaseQuery.gte('created_at', date_from)
      }

      if (date_to) {
        supabaseQuery = supabaseQuery.lte('created_at', date_to)
      }

      // 募集期限フィルター
      if (deadline_from) {
        supabaseQuery = supabaseQuery.gte('deadline', deadline_from)
      }

      if (deadline_to) {
        supabaseQuery = supabaseQuery.lte('deadline', deadline_to)
      }

      // 注目投稿フィルター
      if (is_featured !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_featured', is_featured)
      }

      // 募集人数フィルター
      if (recruitment_count_min !== undefined) {
        supabaseQuery = supabaseQuery.gte('recruitment_count', recruitment_count_min)
      }

      if (recruitment_count_max !== undefined) {
        supabaseQuery = supabaseQuery.lte('recruitment_count', recruitment_count_max)
      }

      // ワールド名フィルター
      if (world_name) {
        supabaseQuery = supabaseQuery.ilike('world_name', `%${world_name}%`)
      }

      // タグフィルター（少し複雑な処理が必要）
      if (tags && tags.length > 0) {
        // サブクエリでタグフィルタリング
        const { data: taggedPosts } = await supabase
          .from('post_tags')
          .select('post_id')
          .in('tag_id', tags)

        if (taggedPosts && taggedPosts.length > 0) {
          const postIds = taggedPosts.map(pt => pt.post_id)
          supabaseQuery = supabaseQuery.in('id', postIds)
        } else {
          // タグにマッチする投稿がない場合
          return { data: [], error: null, count: 0 }
        }
      }

      // 画像有無フィルター
      if (has_images !== undefined) {
        if (has_images) {
          // 画像がある投稿のみ
          const { data: postsWithImages } = await supabase
            .from('post_images')
            .select('post_id')

          if (postsWithImages && postsWithImages.length > 0) {
            const postIds = [...new Set(postsWithImages.map(pi => pi.post_id))]
            supabaseQuery = supabaseQuery.in('id', postIds)
          } else {
            return { data: [], error: null, count: 0 }
          }
        } else {
          // 画像がない投稿のみ
          const { data: postsWithImages } = await supabase
            .from('post_images')
            .select('post_id')

          if (postsWithImages && postsWithImages.length > 0) {
            const postIds = postsWithImages.map(pi => pi.post_id)
            supabaseQuery = supabaseQuery.not('id', 'in', `(${postIds.join(',')})`)
          }
        }
      }

      // ソート
      if (sort_by === 'relevance' && query && query.trim()) {
        // 関連度ソート（簡易版）
        supabaseQuery = supabaseQuery.order('is_featured', { ascending: false })
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
      } else {
        supabaseQuery = supabaseQuery.order(sort_by, { ascending: sort_order === 'asc' })
      }

      // ページネーション
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

      const { data, error, count } = await supabaseQuery

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'search_posts',
            searchQuery
          })
        }
      }

      // データ変換
      const postsWithDetails: PostWithDetails[] = (data || []).map(post => ({
        ...post,
        user: post.users,
        category: post.post_categories,
        tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [],
        images: post.post_images || [],
        application_count: post.applications?.length || 0,
        is_favorited: false // ログインユーザーの情報が必要
      }))

      return {
        data: postsWithDetails,
        error: null,
        count: postsWithDetails.length,
        total_count: count || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'search_posts',
          searchQuery
        })
      }
    }
  }

  async getSearchSuggestions(query: string, limit = 10): Promise<SearchApiResult<SearchSuggestion[]>> {
    try {
      if (!query || query.trim().length < 2) {
        return { data: [], error: null }
      }

      const suggestions: SearchSuggestion[] = []

      // ユーザー名検索
      const { data: users } = await supabase
        .from('users')
        .select('username, display_name')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(Math.floor(limit / 4))

      if (users) {
        users.forEach(user => {
          suggestions.push({
            type: 'user',
            value: user.username,
            label: user.display_name || user.username
          })
        })
      }

      // カテゴリ検索
      const { data: categories } = await supabase
        .from('post_categories')
        .select('name, slug')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(Math.floor(limit / 4))

      if (categories) {
        categories.forEach(category => {
          suggestions.push({
            type: 'category',
            value: category.slug,
            label: category.name
          })
        })
      }

      // タグ検索
      const { data: tags } = await supabase
        .from('tags')
        .select('name, slug')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(Math.floor(limit / 4))

      if (tags) {
        tags.forEach(tag => {
          suggestions.push({
            type: 'tag',
            value: tag.slug,
            label: tag.name
          })
        })
      }

      // ワールド名検索
      const { data: worlds } = await supabase
        .from('posts')
        .select('world_name')
        .not('world_name', 'is', null)
        .ilike('world_name', `%${query}%`)
        .limit(Math.floor(limit / 4))

      if (worlds) {
        const uniqueWorlds = [...new Set(worlds.map(w => w.world_name).filter(Boolean))]
        uniqueWorlds.forEach(worldName => {
          suggestions.push({
            type: 'world',
            value: worldName,
            label: worldName
          })
        })
      }

      return { data: suggestions.slice(0, limit), error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_search_suggestions',
          query
        })
      }
    }
  }

  async getSearchStats(): Promise<SearchApiResult<SearchStats>> {
    try {
      // 投稿総数
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('status', 'published')

      // ユーザー総数
      const { count: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact' })

      // 人気カテゴリ
      const { data: popularCategories } = await supabase
        .from('post_categories')
        .select(`
          name,
          posts!posts_category_id_fkey(id)
        `)
        .eq('is_active', true)

      const categoryStats = (popularCategories || [])
        .map(cat => ({
          name: cat.name,
          count: (cat.posts as any[])?.length || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // 人気タグ
      const { data: popularTags } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          post_tags!post_tags_tag_id_fkey(post_id)
        `)
        .eq('is_active', true)
        .limit(5)

      const tagStats = (popularTags || []).map(tag => ({
        name: tag.name,
        count: tag.post_tags ? tag.post_tags.length : 0
      })).sort((a, b) => b.count - a.count)

      const stats: SearchStats = {
        total_posts: totalPosts || 0,
        total_users: totalUsers || 0,
        popular_categories: categoryStats,
        popular_tags: tagStats,
        recent_searches: [] // 実装が必要な場合
      }

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_search_stats'
        })
      }
    }
  }

  async saveSearchQuery(userId: string, query: string): Promise<SearchApiResult<void>> {
    try {
      // 検索履歴の保存（オプション機能）
      // ユーザーが許可した場合のみ保存
      
      // 実装例：search_historyテーブルに保存
      // await supabase
      //   .from('search_history')
      //   .insert({
      //     user_id: userId,
      //     query: query.trim(),
      //     searched_at: new Date().toISOString()
      //   })

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'save_search_query',
          userId,
          query
        })
      }
    }
  }

  async getRecentSearches(userId: string, limit = 10): Promise<SearchApiResult<string[]>> {
    try {
      // ユーザーの最近の検索履歴を取得
      // 実装例：search_historyテーブルから取得
      
      // const { data } = await supabase
      //   .from('search_history')
      //   .select('query')
      //   .eq('user_id', userId)
      //   .order('searched_at', { ascending: false })
      //   .limit(limit)

      // const queries = [...new Set((data || []).map(item => item.query))]

      return { data: [], error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_recent_searches',
          userId
        })
      }
    }
  }

  // 高度な検索機能
  async searchWithFilters(filters: PostsQuery, userId?: string): Promise<SearchApiResult<PostWithDetails[]>> {
    try {
      // posts.tsのgetPosts関数を活用
      const { postsService } = await import('./posts')
      const result = await postsService.getPosts(filters)
      
      if (result.error) {
        return {
          data: null,
          error: result.error
        }
      }

      return {
        data: result.data || [],
        error: null,
        count: result.data?.length || 0,
        total_count: result.count || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'search_with_filters',
          filters,
          userId
        })
      }
    }
  }
}

export const searchService = SearchService.getInstance()
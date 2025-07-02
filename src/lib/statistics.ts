import { supabase } from './supabase'
import { errorHandler, ErrorCode, type AppError } from './errors'
import { permissionManager } from './permissions'
import type { Tables } from './database.types'

export interface StatisticsApiResult<T = any> {
  data: T | null
  error: AppError | null
}

export interface PostStatistics {
  total_posts: number
  published_posts: number
  draft_posts: number
  closed_posts: number
  posts_this_week: number
  posts_this_month: number
  average_posts_per_day: number
}

export interface UserStatistics {
  total_users: number
  active_users: number
  new_users_this_week: number
  new_users_this_month: number
  verified_users: number
}

export interface CategoryStatistics {
  id: string
  name: string
  post_count: number
  percentage: number
  recent_posts: number
}

export interface TagStatistics {
  id: string
  name: string
  post_count: number
  percentage: number
  recent_posts: number
}

export interface ApplicationStatistics {
  total_applications: number
  pending_applications: number
  accepted_applications: number
  rejected_applications: number
  applications_this_week: number
  applications_this_month: number
  average_applications_per_post: number
}

export interface ViewStatistics {
  total_views: number
  unique_views: number
  views_this_week: number
  views_this_month: number
  most_viewed_posts: Array<{
    id: string
    title: string
    view_count: number
    user: {
      username: string
      display_name: string
    }
  }>
}

export interface DashboardStatistics {
  posts: PostStatistics
  users: UserStatistics
  applications: ApplicationStatistics
  views: ViewStatistics
  popular_categories: CategoryStatistics[]
  popular_tags: TagStatistics[]
}

export interface UserDashboardStats {
  user_id: string
  posts_created: number
  applications_received: number
  applications_sent: number
  total_views: number
  total_favorites: number
  recent_activity: Array<{
    type: 'post_created' | 'application_received' | 'application_sent'
    date: string
    data: any
  }>
}

export interface PostAnalytics {
  post_id: string
  view_count: number
  unique_views: number
  application_count: number
  favorite_count: number
  daily_views: Array<{
    date: string
    views: number
  }>
  referrer_stats: Array<{
    source: string
    count: number
  }>
  user_demographics: {
    verified_users: number
    unverified_users: number
  }
}

export class StatisticsService {
  private static instance: StatisticsService

  private constructor() {}

  static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService()
    }
    return StatisticsService.instance
  }

  async getDashboardStatistics(
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<StatisticsApiResult<DashboardStatistics>> {
    try {
      // 管理者権限が必要
      if (!userProfile || !permissionManager.canViewSystemStatistics(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view dashboard statistics',
            `User ${userId} cannot view system statistics`
          )
        }
      }

      const [
        postStats,
        userStats,
        applicationStats,
        viewStats,
        categoryStats,
        tagStats
      ] = await Promise.all([
        this.getPostStatistics(),
        this.getUserStatistics(),
        this.getApplicationStatistics(),
        this.getViewStatistics(),
        this.getCategoryStatistics(),
        this.getTagStatistics()
      ])

      const dashboard: DashboardStatistics = {
        posts: postStats.data || {
          total_posts: 0,
          published_posts: 0,
          draft_posts: 0,
          closed_posts: 0,
          posts_this_week: 0,
          posts_this_month: 0,
          average_posts_per_day: 0
        },
        users: userStats.data || {
          total_users: 0,
          active_users: 0,
          new_users_this_week: 0,
          new_users_this_month: 0,
          verified_users: 0
        },
        applications: applicationStats.data || {
          total_applications: 0,
          pending_applications: 0,
          accepted_applications: 0,
          rejected_applications: 0,
          applications_this_week: 0,
          applications_this_month: 0,
          average_applications_per_post: 0
        },
        views: viewStats.data || {
          total_views: 0,
          unique_views: 0,
          views_this_week: 0,
          views_this_month: 0,
          most_viewed_posts: []
        },
        popular_categories: categoryStats.data || [],
        popular_tags: tagStats.data || []
      }

      return { data: dashboard, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_dashboard_statistics',
          userId
        })
      }
    }
  }

  async getPostStatistics(): Promise<StatisticsApiResult<PostStatistics>> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [
        totalResult,
        publishedResult,
        draftResult,
        closedResult,
        weekResult,
        monthResult
      ] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact' }),
        supabase.from('posts').select('id', { count: 'exact' }).eq('status', 'published'),
        supabase.from('posts').select('id', { count: 'exact' }).eq('status', 'draft'),
        supabase.from('posts').select('id', { count: 'exact' }).eq('status', 'closed'),
        supabase.from('posts').select('id', { count: 'exact' }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('posts').select('id', { count: 'exact' }).gte('created_at', oneMonthAgo.toISOString())
      ])

      const stats: PostStatistics = {
        total_posts: totalResult.count || 0,
        published_posts: publishedResult.count || 0,
        draft_posts: draftResult.count || 0,
        closed_posts: closedResult.count || 0,
        posts_this_week: weekResult.count || 0,
        posts_this_month: monthResult.count || 0,
        average_posts_per_day: (monthResult.count || 0) / 30
      }

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_post_statistics'
        })
      }
    }
  }

  async getUserStatistics(): Promise<StatisticsApiResult<UserStatistics>> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [
        totalResult,
        activeResult,
        weekResult,
        monthResult,
        verifiedResult
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }).gte('last_login_at', oneWeekAgo.toISOString()),
        supabase.from('users').select('id', { count: 'exact' }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('users').select('id', { count: 'exact' }).gte('created_at', oneMonthAgo.toISOString()),
        supabase.from('users').select('id', { count: 'exact' }).eq('is_verified', true)
      ])

      const stats: UserStatistics = {
        total_users: totalResult.count || 0,
        active_users: activeResult.count || 0,
        new_users_this_week: weekResult.count || 0,
        new_users_this_month: monthResult.count || 0,
        verified_users: verifiedResult.count || 0
      }

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_user_statistics'
        })
      }
    }
  }

  async getApplicationStatistics(): Promise<StatisticsApiResult<ApplicationStatistics>> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [
        totalResult,
        pendingResult,
        acceptedResult,
        rejectedResult,
        weekResult,
        monthResult,
        postsResult
      ] = await Promise.all([
        supabase.from('applications').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('applications').select('id', { count: 'exact' }).eq('status', 'accepted'),
        supabase.from('applications').select('id', { count: 'exact' }).eq('status', 'rejected'),
        supabase.from('applications').select('id', { count: 'exact' }).gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('applications').select('id', { count: 'exact' }).gte('created_at', oneMonthAgo.toISOString()),
        supabase.from('posts').select('id', { count: 'exact' }).eq('status', 'published')
      ])

      const totalApps = totalResult.count || 0
      const totalPosts = postsResult.count || 1

      const stats: ApplicationStatistics = {
        total_applications: totalApps,
        pending_applications: pendingResult.count || 0,
        accepted_applications: acceptedResult.count || 0,
        rejected_applications: rejectedResult.count || 0,
        applications_this_week: weekResult.count || 0,
        applications_this_month: monthResult.count || 0,
        average_applications_per_post: totalApps / totalPosts
      }

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_application_statistics'
        })
      }
    }
  }

  async getViewStatistics(): Promise<StatisticsApiResult<ViewStatistics>> {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // 総ビュー数の計算
      const { data: viewsData } = await supabase
        .from('posts')
        .select('view_count')
        .eq('status', 'published')
      
      const totalViews = viewsData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

      // 最も閲覧された投稿
      const { data: mostViewedPosts } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          view_count,
          users!posts_user_id_fkey(username, display_name)
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(5)

      const stats: ViewStatistics = {
        total_views: totalViews,
        unique_views: Math.floor(totalViews * 0.7), // 推定値
        views_this_week: Math.floor(totalViews * 0.1), // 推定値
        views_this_month: Math.floor(totalViews * 0.3), // 推定値
        most_viewed_posts: (mostViewedPosts || []).map(post => ({
          id: post.id,
          title: post.title,
          view_count: post.view_count || 0,
          user: {
            username: (post.users as any).username,
            display_name: (post.users as any).display_name || (post.users as any).username
          }
        }))
      }

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_view_statistics'
        })
      }
    }
  }

  async getCategoryStatistics(): Promise<StatisticsApiResult<CategoryStatistics[]>> {
    try {
      const { data: categories } = await supabase
        .from('post_categories')
        .select(`
          id,
          name,
          posts!posts_category_id_fkey(id, created_at)
        `)
        .eq('is_active', true)

      if (!categories) {
        return { data: [], error: null }
      }

      const totalPosts = categories.reduce((sum, cat) => sum + (cat.posts?.length || 0), 0)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const stats: CategoryStatistics[] = categories
        .map(category => {
          const postCount = category.posts?.length || 0
          const recentPosts = category.posts?.filter(
            (post: any) => new Date(post.created_at) >= oneWeekAgo
          ).length || 0

          return {
            id: category.id,
            name: category.name,
            post_count: postCount,
            percentage: totalPosts > 0 ? (postCount / totalPosts) * 100 : 0,
            recent_posts: recentPosts
          }
        })
        .sort((a, b) => b.post_count - a.post_count)

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_category_statistics'
        })
      }
    }
  }

  async getTagStatistics(): Promise<StatisticsApiResult<TagStatistics[]>> {
    try {
      const { data: tags } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          post_tags!post_tags_tag_id_fkey(
            post_id,
            posts!post_tags_post_id_fkey(created_at)
          )
        `)
        .eq('is_active', true)

      if (!tags) {
        return { data: [], error: null }
      }

      const totalTags = tags.reduce((sum, tag) => sum + (tag.post_tags?.length || 0), 0)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const stats: TagStatistics[] = tags
        .map(tag => {
          const postCount = tag.post_tags?.length || 0
          const recentPosts = tag.post_tags?.filter(
            (pt: any) => pt.posts && new Date(pt.posts.created_at) >= oneWeekAgo
          ).length || 0

          return {
            id: tag.id,
            name: tag.name,
            post_count: postCount,
            percentage: totalTags > 0 ? (postCount / totalTags) * 100 : 0,
            recent_posts: recentPosts
          }
        })
        .sort((a, b) => b.post_count - a.post_count)
        .slice(0, 10)

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_tag_statistics'
        })
      }
    }
  }

  async getUserDashboardStats(userId: string): Promise<StatisticsApiResult<UserDashboardStats>> {
    try {
      const [
        postsResult,
        appsReceivedResult,
        appsSentResult,
        userPostsForViews,
        favoritesResult
      ] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('applications').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('posts').select('view_count').eq('user_id', userId).eq('status', 'published'),
        supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', userId)
      ])

      const totalViews = userPostsForViews.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

      const stats: UserDashboardStats = {
        user_id: userId,
        posts_created: postsResult.count || 0,
        applications_received: appsReceivedResult.count || 0,
        applications_sent: appsSentResult.count || 0,
        total_views: totalViews,
        total_favorites: favoritesResult.count || 0,
        recent_activity: [] // 実装が必要な場合
      }

      return { data: stats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_user_dashboard_stats',
          userId
        })
      }
    }
  }

  async getPostAnalytics(
    postId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<StatisticsApiResult<PostAnalytics>> {
    try {
      // 投稿の存在確認と権限チェック
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('user_id')
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

      // 権限チェック（投稿者または管理者）
      if (userProfile && !permissionManager.canViewPostAnalytics(userProfile, post.user_id)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view post analytics',
            `User ${userId} cannot view analytics for post ${postId}`
          )
        }
      }

      const [
        postData,
        applicationsCount,
        favoritesCount
      ] = await Promise.all([
        supabase.from('posts').select('view_count').eq('id', postId).single(),
        supabase.from('applications').select('id', { count: 'exact' }).eq('post_id', postId),
        supabase.from('favorites').select('id', { count: 'exact' }).eq('post_id', postId)
      ])

      const analytics: PostAnalytics = {
        post_id: postId,
        view_count: postData.data?.view_count || 0,
        unique_views: Math.floor((postData.data?.view_count || 0) * 0.7),
        application_count: applicationsCount.count || 0,
        favorite_count: favoritesCount.count || 0,
        daily_views: [], // 実装が必要な場合
        referrer_stats: [], // 実装が必要な場合
        user_demographics: {
          verified_users: 0, // 実装が必要な場合
          unverified_users: 0 // 実装が必要な場合
        }
      }

      return { data: analytics, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_post_analytics',
          postId,
          userId
        })
      }
    }
  }
}

export const statisticsService = StatisticsService.getInstance()
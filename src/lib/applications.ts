import { supabase } from './supabase'
import { validator } from './validation'
import { errorHandler, ErrorCode, type AppError } from './errors'
import { permissionManager } from './permissions'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type Application = Tables<'applications'>
export type ApplicationInsert = TablesInsert<'applications'>
export type ApplicationUpdate = TablesUpdate<'applications'>

export interface ApplicationWithDetails extends Application {
  post?: {
    id: string
    title: string
    user_id: string
    status: string
    deadline: string | null
  }
  user?: {
    id: string
    display_name: string
    avatar_url: string | null
    is_verified: boolean
  }
}

export interface ApplicationCreateData {
  post_id: string
  message: string
  portfolio_url?: string | null
  // availability?: string | null // TODO: マイグレーション00019適用後に有効化
  twitter_id?: string | null
}

export interface ApplicationUpdateData {
  status?: Application['status']
  response_message?: string | null
  responded_at?: string
}

export interface ApplicationsApiResult<T = any> {
  data: T | null
  error: AppError | null
  count?: number
}

export interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}

export interface ApplicationEligibility {
  canApply: boolean
  reason?: string
}

export class ApplicationsService {
  private static instance: ApplicationsService

  private constructor() {}

  static getInstance(): ApplicationsService {
    if (!ApplicationsService.instance) {
      ApplicationsService.instance = new ApplicationsService()
    }
    return ApplicationsService.instance
  }

  async createApplication(
    userId: string,
    applicationData: ApplicationCreateData,
    userProfile?: Tables<'users'>
  ): Promise<ApplicationsApiResult<Application>> {
    try {
      // 権限チェック - 認証済みユーザーは基本的に応募可能
      if (!userProfile) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to create application',
            `User ${userId} is not authenticated`
          )
        }
      }

      // バリデーション
      const messageValidation = validator.applicationMessage(applicationData.message)
      if (!messageValidation.isValid) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'Invalid application message',
            messageValidation.errors.join(', ')
          )
        }
      }

      // 投稿の存在確認と応募可能性チェック
      const eligibilityResult = await this.checkApplicationEligibility(
        applicationData.post_id,
        userId
      )

      if (eligibilityResult.error || !eligibilityResult.data?.canApply) {
        return {
          data: null,
          error: eligibilityResult.error || errorHandler.createError(
            ErrorCode.VALIDATION_DUPLICATE_DATA,
            'Cannot apply to this post',
            eligibilityResult.data?.reason || 'Application not allowed'
          )
        }
      }

      // 応募作成 - 最小限のフィールドのみ
      const insertData = {
        user_id: userId,
        post_id: applicationData.post_id,
        message: applicationData.message,
        status: 'pending'
      }

      const { data: application, error } = await supabase
        .from('applications')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'create_application',
            userId,
            applicationData
          })
        }
      }

      // 通知トリガー: 応募受信通知
      try {
        // 投稿者情報を取得
        const { data: post } = await supabase
          .from('posts')
          .select('user_id, title')
          .eq('id', applicationData.post_id)
          .single()

        if (post) {
          // Edge Functionを呼び出して通知送信
          await supabase.functions.invoke('send-notification', {
            body: {
              userId: post.user_id,
              type: 'application_received',
              title: '新しい応募が届きました',
              message: `「${post.title}」に新しい応募が届きました`,
              relatedId: applicationData.post_id,
              relatedType: 'post',
              priority: 'normal'
            }
          })
        }
      } catch (notificationError) {
        // 通知送信失敗は応募作成を妨げない
        console.warn('Failed to send application notification:', notificationError)
      }

      return { data: application, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'create_application',
          userId,
          applicationData
        })
      }
    }
  }

  async updateApplication(
    applicationId: string,
    userId: string,
    updateData: ApplicationUpdateData,
    userProfile?: Tables<'users'>
  ): Promise<ApplicationsApiResult<Application>> {
    try {
      console.log('🟡 ApplicationsService.updateApplication START:', { applicationId, userId, updateData })
      // 応募の存在確認
      const { data: existingApplication, error: fetchError } = await supabase
        .from('applications')
        .select(`
          *,
          posts(user_id)
        `)
        .eq('id', applicationId)
        .single()

      if (fetchError || !existingApplication) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Application not found',
            `Application with ID ${applicationId} not found`
          )
        }
      }

      // 権限チェック
      const postOwnerId = (existingApplication.posts as any)?.user_id
      const canUpdate = userProfile && (
        // 応募者本人の場合
        existingApplication.user_id === userId ||
        // 投稿者の場合（ステータス変更のみ）
        (postOwnerId === userId && updateData.status) ||
        // 管理者の場合
        permissionManager.canManageApplication(userProfile, postOwnerId)
      )

      if (!canUpdate) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to update application',
            `User ${userId} cannot update application ${applicationId}`
          )
        }
      }

      // 更新データ準備
      const updatePayload: ApplicationUpdate = {}
      
      if (updateData.status !== undefined) updatePayload.status = updateData.status
      if (updateData.response_message !== undefined) updatePayload.response_message = updateData.response_message
      if (updateData.responded_at !== undefined) updatePayload.responded_at = updateData.responded_at

      console.log('🟡 ApplicationsService about to call supabase.update with:', { applicationId, updatePayload })
      
      // 応募更新
      const { data: updatedApplication, error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('id', applicationId)
        .select()
        .single()
      
      console.log('🟡 ApplicationsService supabase.update result:', { updatedApplication, error })

      if (error) {
        console.error('🟡 ApplicationsService supabase update ERROR:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          updatePayload,
          applicationId,
          errorFull: JSON.stringify(error, null, 2)
        })
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'update_application',
            applicationId,
            userId,
            updateData
          })
        }
      }

      // 通知トリガー: ステータス変更通知
      if (updateData.status === 'accepted' || updateData.status === 'rejected') {
        try {
          // 応募者と投稿情報を取得
          const { data: applicationDetail } = await supabase
            .from('applications')
            .select(`
              user_id,
              posts(title)
            `)
            .eq('id', applicationId)
            .single()

          if (applicationDetail) {
            const statusText = updateData.status === 'accepted' ? '承認' : '拒否'
            
            // Edge Functionを呼び出して通知送信
            await supabase.functions.invoke('send-notification', {
              body: {
                userId: applicationDetail.user_id,
                type: updateData.status === 'accepted' ? 'application_accepted' : 'application_rejected',
                title: `応募が${statusText}されました`,
                message: `「${(applicationDetail.posts as any)?.title || '投稿'}」への応募が${statusText}されました`,
                relatedId: applicationId,
                relatedType: 'application',
                priority: 'high'
              }
            })
          }
        } catch (notificationError) {
          // 通知送信失敗はステータス更新を妨げない
          console.warn('Failed to send status change notification:', notificationError)
        }
      }

      return { data: updatedApplication, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'update_application',
          applicationId,
          userId,
          updateData
        })
      }
    }
  }

  async deleteApplication(
    applicationId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<ApplicationsApiResult<void>> {
    try {
      // 応募の存在確認
      const { data: existingApplication, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single()

      if (fetchError || !existingApplication) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Application not found',
            `Application with ID ${applicationId} not found`
          )
        }
      }

      // 権限チェック（応募者本人または管理者のみ）
      const canDelete = userProfile && (
        existingApplication.user_id === userId ||
        permissionManager.canManageApplication(userProfile, existingApplication.user_id)
      )

      if (!canDelete) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to delete application',
            `User ${userId} cannot delete application ${applicationId}`
          )
        }
      }

      // 応募削除
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'delete_application',
            applicationId,
            userId
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'delete_application',
          applicationId,
          userId
        })
      }
    }
  }

  async getUserApplications(
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<ApplicationsApiResult<ApplicationWithDetails[]>> {
    try {
      // 権限チェック（本人または管理者）
      if (!userProfile) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view applications',
            `User ${userId} cannot view applications`
          )
        }
      }

      // ユーザーは自分の応募を見ることができる
      if (userProfile.id !== userId && !permissionManager.isAdmin(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view applications',
            `User ${userId} cannot view applications`
          )
        }
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          posts!applications_post_id_fkey(id, title, user_id, status, deadline),
          users!applications_user_id_fkey(id, display_name, avatar_url, is_verified)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_user_applications',
            userId
          })
        }
      }

      return {
        data: data || [],
        error: null,
        count: data?.length || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_user_applications',
          userId
        })
      }
    }
  }

  async getPostApplications(
    postId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<ApplicationsApiResult<ApplicationWithDetails[]>> {
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
      if (!userProfile || !permissionManager.canManageApplication(userProfile, post.user_id)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view post applications',
            `User ${userId} cannot view applications for post ${postId}`
          )
        }
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          posts!applications_post_id_fkey(id, title, user_id, status, deadline),
          users!applications_user_id_fkey(id, display_name, avatar_url, is_verified)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_post_applications',
            postId,
            userId
          })
        }
      }

      return {
        data: data || [],
        error: null,
        count: data?.length || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_post_applications',
          postId,
          userId
        })
      }
    }
  }

  async checkApplicationEligibility(
    postId: string,
    userId: string
  ): Promise<ApplicationsApiResult<ApplicationEligibility>> {
    try {
      // 投稿の存在確認
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('user_id, status, deadline')
        .eq('id', postId)
        .single()

      if (postError || !post) {
        return {
          data: {
            canApply: false,
            reason: '指定された投稿が見つかりません'
          },
          error: null
        }
      }

      // 自分の投稿への応募は不可
      if (post.user_id === userId) {
        return {
          data: {
            canApply: false,
            reason: '自分の投稿には応募できません'
          },
          error: null
        }
      }

      // 投稿のステータス確認
      if (post.status !== 'published' && post.status !== 'active') {
        return {
          data: {
            canApply: false,
            reason: '現在応募を受け付けていません'
          },
          error: null
        }
      }

      // 期限の確認
      if (post.deadline && new Date(post.deadline) < new Date()) {
        return {
          data: {
            canApply: false,
            reason: '応募期限が過ぎています'
          },
          error: null
        }
      }

      // 重複応募の確認
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle()

      if (existingApplication) {
        return {
          data: {
            canApply: false,
            reason: 'すでに応募済みです'
          },
          error: null
        }
      }

      return {
        data: {
          canApply: true
        },
        error: null
      }
    } catch (err) {
      return {
        data: {
          canApply: false,
          reason: '応募可能性の確認に失敗しました'
        },
        error: errorHandler.handleError(err, {
          operation: 'check_application_eligibility',
          postId,
          userId
        })
      }
    }
  }

  async getAllReceivedApplications(
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<ApplicationsApiResult<ApplicationWithDetails[]>> {
    try {
      // 権限チェック
      if (!userProfile) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to view applications',
            `User ${userId} is not authenticated`
          )
        }
      }

      // ユーザーの投稿IDを取得
      const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', userId)

      if (postsError) {
        return {
          data: null,
          error: errorHandler.handleError(postsError, {
            operation: 'get_user_posts_for_applications',
            userId
          })
        }
      }

      if (!userPosts || userPosts.length === 0) {
        return {
          data: [],
          error: null,
          count: 0
        }
      }

      const postIds = userPosts.map(p => p.id)

      // 全ての応募を取得
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          posts!applications_post_id_fkey(id, title, user_id, status, deadline),
          users!applications_user_id_fkey(id, display_name, avatar_url, is_verified)
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_all_received_applications',
            userId,
            postIds
          })
        }
      }

      return {
        data: data || [],
        error: null,
        count: data?.length || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_all_received_applications',
          userId
        })
      }
    }
  }

  async getApplicationStatistics(
    postId: string | undefined,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<ApplicationsApiResult<ApplicationStats>> {
    try {
      let query = supabase
        .from('applications')
        .select('status')

      if (postId) {
        // 特定の投稿の統計
        query = query.eq('post_id', postId)
      } else {
        // ユーザーの全投稿の統計
        const { data: userPosts } = await supabase
          .from('posts')
          .select('id')
          .eq('user_id', userId)

        if (userPosts && userPosts.length > 0) {
          const postIds = userPosts.map(p => p.id)
          query = query.in('post_id', postIds)
        } else {
          return {
            data: {
              total: 0,
              pending: 0,
              accepted: 0,
              rejected: 0
            },
            error: null
          }
        }
      }

      const { data: applications, error } = await query

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_application_statistics',
            postId,
            userId
          })
        }
      }

      const stats = {
        total: applications?.length || 0,
        pending: applications?.filter(app => app.status === 'pending').length || 0,
        accepted: applications?.filter(app => app.status === 'accepted').length || 0,
        rejected: applications?.filter(app => app.status === 'rejected').length || 0
      }

      return {
        data: stats,
        error: null
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_application_statistics',
          postId,
          userId
        })
      }
    }
  }
}

export const applicationsService = ApplicationsService.getInstance()
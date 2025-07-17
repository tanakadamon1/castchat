// フロントエンド統合用の応募API ラッパー
import { applicationsService } from './applications'
import { useAuthStore } from '@/stores/auth'
import { supabase } from './supabase'
import type { Tables } from './database.types'

export type Application = Tables<'applications'>

export interface ApplicationData {
  postId: string
  message: string
  portfolio?: string
  experience?: string
  availability?: string
  portfolio_url?: string
  twitterId?: string
}

export interface ApplicationResponse {
  data: Application | null
  error?: string
}

export interface ApplicationsResponse {
  data: Application[]
  total: number
  error?: string
}

export interface ApplicationWithDetails extends Application {
  post?: {
    id: string
    title: string
    user_id: string
  }
  user?: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
    is_verified: boolean
  }
  postAuthor?: string
  postTitle?: string
  applicantName?: string
  applicantAvatar?: string
}

export interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}

class ApplicationApi {
  private getAuthStore() {
    return useAuthStore()
  }

  private getCurrentUser() {
    const authStore = this.getAuthStore()
    return {
      id: authStore.user?.id,
      profile: authStore.profile,
    }
  }

  /**
   * 応募を送信する
   */
  async submitApplication(data: ApplicationData): Promise<ApplicationResponse> {
    try {
      const { id: userId } = this.getCurrentUser()

      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です',
        }
      }

      // 直接Supabaseにアクセスして応募を作成または更新
      try {
        // まず既存の応募をチェック
        const { data: existingApplication, error: checkError } = await supabase
          .from('applications')
          .select('*')
          .eq('post_id', data.postId)
          .eq('user_id', userId)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = レコードが見つからない場合のエラー
          console.error('Check existing application error:', checkError)
          return {
            data: null,
            error: '応募状態の確認に失敗しました',
          }
        }

        // 既存の応募がある場合
        if (existingApplication) {
          // 却下された応募の場合は再応募を許可
          if (existingApplication.status === 'rejected') {
            const updatePayload = {
              message: data.message,
              status: 'pending',
              availability: data.availability || null,
              twitter_id: data.twitterId || null,
              updated_at: new Date().toISOString(),
              responded_at: null,
              response_message: null,
            }

            const { data: updatedApplication, error: updateError } = await supabase
              .from('applications')
              .update(updatePayload)
              .eq('id', existingApplication.id)
              .select()
              .single()

            if (updateError) {
              console.error('Update application error:', updateError)
              return {
                data: null,
                error: '応募の更新に失敗しました',
              }
            }

            return {
              data: updatedApplication,
              error: undefined,
            }
          } else {
            // pending, accepted, withdrawn の場合は重複エラー
            const statusMessages = {
              pending: '既にこの募集に応募済みです',
              accepted: 'この募集への応募は既に承認されています',
              withdrawn: '取り下げた応募への再応募はできません',
            }
            return {
              data: null,
              error: statusMessages[existingApplication.status as keyof typeof statusMessages] || '既に応募済みです',
            }
          }
        }

        // 新規応募の場合
        const insertPayload = {
          post_id: data.postId,
          user_id: userId,
          message: data.message,
          status: 'pending',
          availability: data.availability || null,
          twitter_id: data.twitterId || null,
        }

        const { data: applicationData, error: insertError } = await supabase
          .from('applications')
          .insert(insertPayload)
          .select()
          .single()

        if (insertError) {
          console.error('Direct insert error details:', {
            error: insertError,
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          })
          return {
            data: null,
            error: `${insertError.message} (${insertError.code})`,
          }
        }
        return {
          data: applicationData,
          error: undefined,
        }
      } catch (directError) {
        console.error('Direct insert exception:', directError)
        return {
          data: null,
          error: '応募の送信に失敗しました',
        }
      }
    } catch (error) {
      console.error('Submit application error:', error)
      return {
        data: null,
        error: '応募の送信に失敗しました',
      }
    }
  }

  /**
   * 自分の応募一覧を取得（応募者視点）
   */
  async getMyApplications(): Promise<ApplicationsResponse> {
    try {
      const { id: userId } = this.getCurrentUser()

      if (!userId) {
        return {
          data: [],
          total: 0,
          error: 'ログインが必要です',
        }
      }

      const result = await applicationsService.getUserApplications(userId, this.getCurrentUser().profile)

      if (result.error) {
        return {
          data: [],
          total: 0,
          error: result.error.message,
        }
      }

      return {
        data: result.data || [],
        total: result.count || 0,
      }
    } catch (error) {
      console.error('Get my applications error:', error)
      return {
        data: [],
        total: 0,
        error: '応募履歴の取得に失敗しました',
      }
    }
  }

  /**
   * 受信応募一覧を取得（主催者視点）
   */
  async getReceivedApplications(postId?: string): Promise<ApplicationsResponse> {
    try {
      const { id: userId } = this.getCurrentUser()

      if (!userId) {
        return {
          data: [],
          total: 0,
          error: 'ログインが必要です',
        }
      }

      let result
      if (postId) {
        // 特定の投稿の応募を取得
        result = await applicationsService.getPostApplications(postId, userId, this.getCurrentUser().profile)
      } else {
        // 全ての受信応募を取得
        result = await applicationsService.getAllReceivedApplications(userId, this.getCurrentUser().profile)
      }

      if (result.error) {
        return {
          data: [],
          total: 0,
          error: result.error.message,
        }
      }

      return {
        data: result.data || [],
        total: result.count || 0,
      }
    } catch (error) {
      console.error('Get received applications error:', error)
      return {
        data: [],
        total: 0,
        error: '応募管理の取得に失敗しました',
      }
    }
  }

  /**
   * 応募ステータスを更新（承認/拒否）
   */
  async updateApplicationStatus(
    applicationId: string,
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
    responseMessage?: string,
  ): Promise<ApplicationResponse> {
    try {
      // ステータス値のバリデーションと正規化
      const validStatuses = ['pending', 'accepted', 'rejected', 'withdrawn']
      const statusMap: Record<string, string> = {
        '承認': 'accepted',
        '却下': 'rejected',
        '保留': 'pending',
        '辞退': 'withdrawn',
        '承認する': 'accepted',
        '却下する': 'rejected'
      }
      
      let normalizedStatus = status
      if (!validStatuses.includes(status)) {
        normalizedStatus = statusMap[status] || status
      }
      
      if (!validStatuses.includes(normalizedStatus)) {
        return {
          data: null,
          error: `無効なステータス値: ${status} -> ${normalizedStatus}`,
        }
      }
      
      const { id: userId } = this.getCurrentUser()

      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です',
        }
      }

      const updateData = {
        status: normalizedStatus,
        response_message: responseMessage || null,
        responded_at: new Date().toISOString(),
      }

      const result = await applicationsService.updateApplication(
        applicationId,
        userId,
        updateData,
        this.getCurrentUser().profile,
      )

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        }
      }

      return {
        data: result.data,
        error: undefined,
      }
    } catch (error) {
      console.error('Update application status error:', error)
      return {
        data: null,
        error: 'ステータスの更新に失敗しました',
      }
    }
  }

  /**
   * 応募を取り下げる
   */
  async withdrawApplication(applicationId: string): Promise<ApplicationResponse> {
    try {
      const { id: userId } = this.getCurrentUser()

      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です',
        }
      }

      const result = await applicationsService.deleteApplication(applicationId, userId, this.getCurrentUser().profile)

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        }
      }

      return {
        data: null,
        error: undefined,
      }
    } catch (error) {
      console.error('Withdraw application error:', error)
      return {
        data: null,
        error: '応募の取り下げに失敗しました',
      }
    }
  }

  /**
   * 応募統計を取得
   */
  async getApplicationStats(
    postId?: string,
  ): Promise<{ data: ApplicationStats | null; error: string | null }> {
    try {
      const { id: userId } = this.getCurrentUser()

      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です',
        }
      }

      // 投稿IDが指定されている場合は、その投稿の応募統計
      // 指定されていない場合は、ユーザーの全投稿の統計
      const result = await applicationsService.getApplicationStatistics(postId, userId, this.getCurrentUser().profile)

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        }
      }

      return {
        data: result.data,
        error: null,
      }
    } catch (error) {
      console.error('Get application stats error:', error)
      return {
        data: null,
        error: '統計データの取得に失敗しました',
      }
    }
  }

  /**
   * 応募が可能かチェック
   */
  async canApply(postId: string): Promise<{ canApply: boolean; reason?: string }> {
    try {
      const { id: userId } = this.getCurrentUser()

      if (!userId) {
        return {
          canApply: false,
          reason: 'ログインが必要です',
        }
      }

      const result = await applicationsService.checkApplicationEligibility(postId, userId)

      if (result.error) {
        return {
          canApply: false,
          reason: result.error.message,
        }
      }

      return {
        canApply: result.data?.canApply || false,
        reason: result.data?.reason,
      }
    } catch (error) {
      console.error('Check can apply error:', error)
      return {
        canApply: false,
        reason: '応募可能性の確認に失敗しました',
      }
    }
  }
}

export const applicationApi = new ApplicationApi()

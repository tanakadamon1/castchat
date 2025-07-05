// フロントエンド統合用の応募API ラッパー
import { applicationsService } from './applications'
import { useAuthStore } from '@/stores/auth'
import type { Tables } from './database.types'

export type Application = Tables<'applications'>

export interface ApplicationData {
  postId: string
  message: string
  portfolio?: string
  experience?: string
  availability?: string
  portfolio_url?: string
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
      profile: authStore.profile
    }
  }

  /**
   * 応募を送信する
   */
  async submitApplication(data: ApplicationData): Promise<ApplicationResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です'
        }
      }

      const result = await applicationsService.createApplication(
        userId,
        {
          post_id: data.postId,
          message: data.message,
          portfolio_url: data.portfolio_url || null
        },
        profile || undefined
      )

      if (result.error) {
        return {
          data: null,
          error: result.error.message
        }
      }

      return {
        data: result.data,
        error: undefined
      }

    } catch (error) {
      console.error('Submit application error:', error)
      return {
        data: null,
        error: '応募の送信に失敗しました'
      }
    }
  }

  /**
   * 自分の応募一覧を取得（応募者視点）
   */
  async getMyApplications(): Promise<ApplicationsResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: [],
          total: 0,
          error: 'ログインが必要です'
        }
      }

      const result = await applicationsService.getUserApplications(userId, profile || undefined)

      if (result.error) {
        return {
          data: [],
          total: 0,
          error: result.error.message
        }
      }

      return {
        data: result.data || [],
        total: result.count || 0
      }

    } catch (error) {
      console.error('Get my applications error:', error)
      return {
        data: [],
        total: 0,
        error: '応募履歴の取得に失敗しました'
      }
    }
  }

  /**
   * 受信応募一覧を取得（主催者視点）
   */
  async getReceivedApplications(postId?: string): Promise<ApplicationsResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: [],
          total: 0,
          error: 'ログインが必要です'
        }
      }

      let result
      if (postId) {
        // 特定の投稿の応募を取得
        result = await applicationsService.getPostApplications(
          postId,
          userId,
          profile || undefined
        )
      } else {
        // 全ての受信応募を取得
        result = await applicationsService.getAllReceivedApplications(
          userId,
          profile || undefined
        )
      }

      if (result.error) {
        return {
          data: [],
          total: 0,
          error: result.error.message
        }
      }

      return {
        data: result.data || [],
        total: result.count || 0
      }

    } catch (error) {
      console.error('Get received applications error:', error)
      return {
        data: [],
        total: 0,
        error: '応募管理の取得に失敗しました'
      }
    }
  }

  /**
   * 応募ステータスを更新（承認/拒否）
   */
  async updateApplicationStatus(
    applicationId: string, 
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
    responseMessage?: string
  ): Promise<ApplicationResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です'
        }
      }

      const result = await applicationsService.updateApplication(
        applicationId,
        userId,
        {
          status,
          response_message: responseMessage || null,
          responded_at: new Date().toISOString()
        },
        profile || undefined
      )

      if (result.error) {
        return {
          data: null,
          error: result.error.message
        }
      }

      return {
        data: result.data,
        error: undefined
      }

    } catch (error) {
      console.error('Update application status error:', error)
      return {
        data: null,
        error: 'ステータスの更新に失敗しました'
      }
    }
  }

  /**
   * 応募を取り下げる
   */
  async withdrawApplication(applicationId: string): Promise<ApplicationResponse> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です'
        }
      }

      const result = await applicationsService.deleteApplication(
        applicationId,
        userId,
        profile || undefined
      )

      if (result.error) {
        return {
          data: null,
          error: result.error.message
        }
      }

      return {
        data: null,
        error: undefined
      }

    } catch (error) {
      console.error('Withdraw application error:', error)
      return {
        data: null,
        error: '応募の取り下げに失敗しました'
      }
    }
  }

  /**
   * 応募統計を取得
   */
  async getApplicationStats(postId?: string): Promise<{ data: ApplicationStats | null; error: string | null }> {
    try {
      const { id: userId, profile } = this.getCurrentUser()
      
      if (!userId) {
        return {
          data: null,
          error: 'ログインが必要です'
        }
      }

      // 投稿IDが指定されている場合は、その投稿の応募統計
      // 指定されていない場合は、ユーザーの全投稿の統計
      const result = await applicationsService.getApplicationStatistics(
        postId,
        userId,
        profile || undefined
      )

      if (result.error) {
        return {
          data: null,
          error: result.error.message
        }
      }

      return {
        data: result.data,
        error: null
      }

    } catch (error) {
      console.error('Get application stats error:', error)
      return {
        data: null,
        error: '統計データの取得に失敗しました'
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
          reason: 'ログインが必要です'
        }
      }

      const result = await applicationsService.checkApplicationEligibility(
        postId,
        userId
      )

      if (result.error) {
        return {
          canApply: false,
          reason: result.error.message
        }
      }

      return {
        canApply: result.data?.canApply || false,
        reason: result.data?.reason
      }

    } catch (error) {
      console.error('Check can apply error:', error)
      return {
        canApply: false,
        reason: '応募可能性の確認に失敗しました'
      }
    }
  }
}

export const applicationApi = new ApplicationApi()
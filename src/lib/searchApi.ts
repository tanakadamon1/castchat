import { postsApi } from './postsApi'
import type { Post } from '@/types/post'

export interface SearchResponse {
  data: Post[]
  total: number
  error?: string
}

// 検索API（実際にはpostsApiのラッパー）
export const searchApi = {
  // 投稿検索
  async searchPosts(params: {
    query?: string
    filters?: {
      category?: string
      type?: string
      status?: string
      dateFrom?: string
      dateTo?: string
    }
    limit?: number
    offset?: number
  }): Promise<SearchResponse> {
    try {
      // postsApiを使用して検索を実行
      const result = await postsApi.getPosts({
        search: params.query,
        category: params.filters?.category,
        type: params.filters?.type,
        status: params.filters?.status || 'active',
        limit: params.limit || 10,
        offset: params.offset || 0
      })

      return {
        data: result.data,
        total: result.total,
        error: result.error
      }
    } catch (error) {
      console.error('Search error:', error)
      return {
        data: [],
        total: 0,
        error: '検索に失敗しました'
      }
    }
  },

  // 高度な検索
  async advancedSearch(params: {
    query?: string
    category?: string
    type?: string
    dateFrom?: string
    dateTo?: string
    tags?: string[]
    location?: string
    minParticipants?: number
    maxParticipants?: number
    limit?: number
    offset?: number
  }): Promise<SearchResponse> {
    try {
      // 基本検索を実行（実際のプロジェクトでは高度な検索APIを呼び出す）
      const result = await postsApi.getPosts({
        search: params.query,
        category: params.category,
        type: params.type,
        status: 'active',
        limit: params.limit || 10,
        offset: params.offset || 0
      })

      let filteredData = result.data

      // クライアントサイドでの追加フィルタリング（本来はサーバーサイドで行う）
      if (params.tags && params.tags.length > 0) {
        filteredData = filteredData.filter(post =>
          params.tags!.some(tag => post.tags.includes(tag))
        )
      }

      if (params.minParticipants) {
        filteredData = filteredData.filter(post =>
          (post.maxParticipants || 1) >= params.minParticipants!
        )
      }

      if (params.maxParticipants) {
        filteredData = filteredData.filter(post =>
          (post.maxParticipants || 1) <= params.maxParticipants!
        )
      }

      return {
        data: filteredData,
        total: filteredData.length,
        error: result.error
      }
    } catch (error) {
      console.error('Advanced search error:', error)
      return {
        data: [],
        total: 0,
        error: '検索に失敗しました'
      }
    }
  }
}
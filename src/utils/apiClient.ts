// API クライアントユーティリティ
// 型安全なAPI呼び出しとエラーハンドリング

import type { ApiResponse, ApiError } from '@/types/api'
import { logger } from './logger'

interface RequestOptions extends RequestInit {
  params?: Record<string, any>
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private getAuthToken(): string | null {
    // セッションからトークンを取得
    // 実装は認証システムに依存
    return localStorage.getItem('auth_token')
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return url.toString()
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers, ...fetchOptions } = options
    
    const url = this.buildURL(endpoint, params)
    const token = this.getAuthToken()
    
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders as Record<string, string>,
      ...headers as Record<string, string>,
    }
    
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    const startTime = performance.now()
    
    try {
      logger.debug(`API Request: ${method} ${endpoint}`, {
        action: 'api_request',
        metadata: { method, endpoint, params }
      })

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        ...fetchOptions,
      })

      const responseTime = performance.now() - startTime
      
      logger.debug(`API Response: ${method} ${endpoint} (${responseTime.toFixed(2)}ms)`, {
        action: 'api_response',
        metadata: { 
          method, 
          endpoint, 
          status: response.status,
          responseTime: Math.round(responseTime)
        }
      })

      if (!response.ok) {
        await this.handleErrorResponse(response, method, endpoint)
      }

      const data = await response.json()
      
      // API レスポンス形式の確認
      if (this.isApiResponse(data)) {
        if (!data.success && data.error) {
          throw new ApiClientError(data.error)
        }
        return data.data
      }
      
      // 直接データが返された場合
      return data
      
    } catch (error) {
      const responseTime = performance.now() - startTime
      
      logger.error(`API Error: ${method} ${endpoint}`, error as Error, {
        action: 'api_error',
        metadata: { 
          method, 
          endpoint, 
          responseTime: Math.round(responseTime)
        }
      })
      
      throw error
    }
  }

  private isApiResponse(data: any): data is ApiResponse {
    return typeof data === 'object' && 
           data !== null && 
           'success' in data
  }

  private async handleErrorResponse(
    response: Response,
    method: string,
    endpoint: string
  ): Promise<never> {
    let errorData: ApiError
    
    try {
      const data = await response.json()
      if (this.isApiResponse(data) && data.error) {
        errorData = data.error
      } else {
        errorData = {
          code: `HTTP_${response.status}`,
          message: data.message || response.statusText,
          timestamp: new Date().toISOString()
        }
      }
    } catch {
      errorData = {
        code: `HTTP_${response.status}`,
        message: response.statusText,
        timestamp: new Date().toISOString()
      }
    }

    throw new ApiClientError(errorData, response.status)
  }

  // HTTP メソッド
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, options)
  }

  async post<T>(
    endpoint: string, 
    body?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('POST', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(
    endpoint: string, 
    body?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(
    endpoint: string, 
    body?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('PATCH', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, options)
  }

  // ファイルアップロード専用メソッド
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const token = this.getAuthToken()
    const headers: HeadersInit = {}
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(this.buildURL(endpoint), {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      await this.handleErrorResponse(response, 'POST', endpoint)
    }

    return response.json()
  }
}

// カスタムエラークラス
export class ApiClientError extends Error {
  public readonly code: string
  public readonly details?: Record<string, any>
  public readonly statusCode?: number
  public readonly timestamp: string

  constructor(error: ApiError, statusCode?: number) {
    super(error.message)
    this.name = 'ApiClientError'
    this.code = error.code
    this.details = error.details
    this.statusCode = statusCode
    this.timestamp = error.timestamp
  }

  // ユーザー向けエラーメッセージの生成
  getUserMessage(): string {
    switch (this.code) {
      case 'VALIDATION_ERROR':
        return '入力内容に誤りがあります。確認してください。'
      case 'UNAUTHORIZED':
        return 'ログインが必要です。'
      case 'FORBIDDEN':
        return 'この操作を行う権限がありません。'
      case 'NOT_FOUND':
        return '指定されたデータが見つかりません。'
      case 'RATE_LIMIT_EXCEEDED':
        return 'リクエストが多すぎます。しばらく待ってから再試行してください。'
      case 'SERVER_ERROR':
        return 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'
      default:
        return 'エラーが発生しました。'
    }
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient()

// ヘルパー関数
export const isApiError = (error: any): error is ApiClientError => {
  return error instanceof ApiClientError
}

// リトライ機能付きAPI呼び出し
export const apiWithRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i === maxRetries) {
        break
      }
      
      // リトライ可能なエラーかチェック
      if (isApiError(error) && error.statusCode) {
        // 4xx エラーはリトライしない
        if (error.statusCode >= 400 && error.statusCode < 500) {
          break
        }
      }
      
      // 指数バックオフでリトライ
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError!
}
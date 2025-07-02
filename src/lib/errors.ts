export enum ErrorCode {
  // 認証エラー
  AUTH_INVALID_TOKEN = 'AUTH_001',
  AUTH_SESSION_EXPIRED = 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSION = 'AUTH_003',
  AUTH_USER_NOT_FOUND = 'AUTH_004',
  AUTH_GOOGLE_OAUTH_FAILED = 'AUTH_005',
  AUTH_SESSION_REFRESH_FAILED = 'AUTH_006',
  
  // バリデーションエラー
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_001',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_002',
  VALIDATION_DUPLICATE_DATA = 'VALIDATION_003',
  VALIDATION_INVALID_LENGTH = 'VALIDATION_004',
  VALIDATION_INVALID_CHARACTERS = 'VALIDATION_005',
  
  // データベースエラー
  DATABASE_CONNECTION_ERROR = 'DATABASE_001',
  DATABASE_QUERY_ERROR = 'DATABASE_002',
  DATABASE_CONSTRAINT_VIOLATION = 'DATABASE_003',
  DATABASE_RECORD_NOT_FOUND = 'DATABASE_004',
  DATABASE_DUPLICATE_ENTRY = 'DATABASE_005',
  DATABASE_FOREIGN_KEY_CONSTRAINT = 'DATABASE_006',
  
  // 権限エラー
  PERMISSION_DENIED = 'PERMISSION_001',
  PERMISSION_INSUFFICIENT_ROLE = 'PERMISSION_002',
  PERMISSION_RESOURCE_ACCESS_DENIED = 'PERMISSION_003',
  
  // システムエラー
  SYSTEM_INTERNAL_ERROR = 'SYSTEM_001',
  SYSTEM_SERVICE_UNAVAILABLE = 'SYSTEM_002',
  SYSTEM_TIMEOUT = 'SYSTEM_003',
  SYSTEM_RATE_LIMIT_EXCEEDED = 'SYSTEM_004',
  
  // ネットワークエラー
  NETWORK_CONNECTION_ERROR = 'NETWORK_001',
  NETWORK_TIMEOUT = 'NETWORK_002',
  NETWORK_OFFLINE = 'NETWORK_003',
  
  // ファイルエラー
  FILE_UPLOAD_FAILED = 'FILE_001',
  FILE_SIZE_EXCEEDED = 'FILE_002',
  FILE_TYPE_NOT_SUPPORTED = 'FILE_003',
  FILE_NOT_FOUND = 'FILE_004',
  STORAGE_UPLOAD_FAILED = 'FILE_005'
}

export interface AppError {
  code: ErrorCode
  message: string
  details?: string
  timestamp: number
  context?: Record<string, any>
  userMessage?: string
}

export class AppErrorHandler {
  private static instance: AppErrorHandler
  private errorLog: AppError[] = []

  private constructor() {}

  static getInstance(): AppErrorHandler {
    if (!AppErrorHandler.instance) {
      AppErrorHandler.instance = new AppErrorHandler()
    }
    return AppErrorHandler.instance
  }

  createError(
    code: ErrorCode,
    message: string,
    details?: string,
    context?: Record<string, any>
  ): AppError {
    return {
      code,
      message,
      details,
      timestamp: Date.now(),
      context,
      userMessage: this.getUserMessage(code)
    }
  }

  logError(error: AppError): void {
    this.errorLog.push(error)
    
    // コンソールに出力（開発環境のみ）
    if (import.meta.env.DEV) {
      console.error('AppError:', {
        code: error.code,
        message: error.message,
        details: error.details,
        context: error.context,
        timestamp: new Date(error.timestamp).toISOString()
      })
    }
    
    // ログの制限（最新100件のみ保持）
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
  }

  handleError(error: any, context?: Record<string, any>): AppError {
    let appError: AppError
    
    if (this.isAppError(error)) {
      appError = error
    } else if (this.isSupabaseError(error)) {
      appError = this.handleSupabaseError(error, context)
    } else if (this.isNetworkError(error)) {
      appError = this.handleNetworkError(error, context)
    } else if (error instanceof Error) {
      appError = this.createError(
        ErrorCode.SYSTEM_INTERNAL_ERROR,
        error.message,
        error.stack,
        context
      )
    } else {
      appError = this.createError(
        ErrorCode.SYSTEM_INTERNAL_ERROR,
        'Unknown error occurred',
        String(error),
        context
      )
    }
    
    this.logError(appError)
    return appError
  }

  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'code' in error && 'message' in error
  }

  private isSupabaseError(error: any): boolean {
    return error && typeof error === 'object' && (
      'code' in error || 
      'status' in error ||
      error.message?.includes('supabase')
    )
  }

  private isNetworkError(error: any): boolean {
    return error && (
      error.name === 'NetworkError' ||
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.code === 'NETWORK_ERROR'
    )
  }

  private handleSupabaseError(error: any, context?: Record<string, any>): AppError {
    // Supabase認証エラー
    if (error.message?.includes('Invalid login credentials')) {
      return this.createError(
        ErrorCode.AUTH_INVALID_TOKEN,
        'Invalid authentication credentials',
        error.message,
        context
      )
    }

    if (error.message?.includes('JWT expired')) {
      return this.createError(
        ErrorCode.AUTH_SESSION_EXPIRED,
        'Session has expired',
        error.message,
        context
      )
    }

    if (error.message?.includes('insufficient_privilege')) {
      return this.createError(
        ErrorCode.PERMISSION_DENIED,
        'Insufficient permissions',
        error.message,
        context
      )
    }

    // Supabaseデータベースエラー
    if (error.code === '23505') { // unique_violation
      return this.createError(
        ErrorCode.VALIDATION_DUPLICATE_DATA,
        'Duplicate data constraint violation',
        error.message,
        context
      )
    }

    if (error.code === '23502') { // not_null_violation
      return this.createError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Required field missing',
        error.message,
        context
      )
    }

    // その他のSupabaseエラー
    return this.createError(
      ErrorCode.DATABASE_QUERY_ERROR,
      'Database operation failed',
      error.message,
      context
    )
  }

  private handleNetworkError(error: any, context?: Record<string, any>): AppError {
    if (error.message?.includes('timeout')) {
      return this.createError(
        ErrorCode.NETWORK_TIMEOUT,
        'Network request timeout',
        error.message,
        context
      )
    }

    if (!navigator.onLine) {
      return this.createError(
        ErrorCode.NETWORK_OFFLINE,
        'Network offline',
        'Device appears to be offline',
        context
      )
    }

    return this.createError(
      ErrorCode.NETWORK_CONNECTION_ERROR,
      'Network connection error',
      error.message,
      context
    )
  }

  private getUserMessage(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      // 認証エラー
      [ErrorCode.AUTH_INVALID_TOKEN]: 'ログイン情報が無効です。再度ログインしてください。',
      [ErrorCode.AUTH_SESSION_EXPIRED]: 'セッションが期限切れです。再度ログインしてください。',
      [ErrorCode.AUTH_INSUFFICIENT_PERMISSION]: '操作を実行する権限がありません。',
      [ErrorCode.AUTH_USER_NOT_FOUND]: 'ユーザーが見つかりません。',
      [ErrorCode.AUTH_GOOGLE_OAUTH_FAILED]: 'Googleログインに失敗しました。再度お試しください。',
      [ErrorCode.AUTH_SESSION_REFRESH_FAILED]: 'セッションの更新に失敗しました。再度ログインしてください。',
      
      // バリデーションエラー
      [ErrorCode.VALIDATION_REQUIRED_FIELD]: '必須項目が入力されていません。',
      [ErrorCode.VALIDATION_INVALID_FORMAT]: '入力形式が正しくありません。',
      [ErrorCode.VALIDATION_DUPLICATE_DATA]: 'すでに使用されているデータです。',
      [ErrorCode.VALIDATION_INVALID_LENGTH]: '文字数が制限を超えています。',
      [ErrorCode.VALIDATION_INVALID_CHARACTERS]: '使用できない文字が含まれています。',
      
      // データベースエラー
      [ErrorCode.DATABASE_CONNECTION_ERROR]: 'データベースへの接続に失敗しました。',
      [ErrorCode.DATABASE_QUERY_ERROR]: 'データの処理中にエラーが発生しました。',
      [ErrorCode.DATABASE_CONSTRAINT_VIOLATION]: 'データの整合性エラーが発生しました。',
      [ErrorCode.DATABASE_RECORD_NOT_FOUND]: '指定されたデータが見つかりません。',
      [ErrorCode.DATABASE_DUPLICATE_ENTRY]: 'データが重複しています。',
      [ErrorCode.DATABASE_FOREIGN_KEY_CONSTRAINT]: '関連するデータが存在するため削除できません。',
      
      // 権限エラー
      [ErrorCode.PERMISSION_DENIED]: 'この操作を実行する権限がありません。',
      [ErrorCode.PERMISSION_INSUFFICIENT_ROLE]: 'ユーザーレベルが不足しています。',
      [ErrorCode.PERMISSION_RESOURCE_ACCESS_DENIED]: 'このリソースにアクセスする権限がありません。',
      
      // システムエラー
      [ErrorCode.SYSTEM_INTERNAL_ERROR]: 'システム内部エラーが発生しました。しばらくしてからお試しください。',
      [ErrorCode.SYSTEM_SERVICE_UNAVAILABLE]: 'サービスが一時的に利用できません。',
      [ErrorCode.SYSTEM_TIMEOUT]: '処理がタイムアウトしました。',
      [ErrorCode.SYSTEM_RATE_LIMIT_EXCEEDED]: '利用制限に達しました。しばらくしてからお試しください。',
      
      // ネットワークエラー
      [ErrorCode.NETWORK_CONNECTION_ERROR]: 'ネットワーク接続エラーが発生しました。',
      [ErrorCode.NETWORK_TIMEOUT]: 'ネットワークがタイムアウトしました。',
      [ErrorCode.NETWORK_OFFLINE]: 'インターネット接続を確認してください。',
      
      // ファイルエラー
      [ErrorCode.FILE_UPLOAD_FAILED]: 'ファイルのアップロードに失敗しました。',
      [ErrorCode.FILE_SIZE_EXCEEDED]: 'ファイルサイズが上限を超えています。',
      [ErrorCode.FILE_TYPE_NOT_SUPPORTED]: 'サポートされていないファイル形式です。',
      [ErrorCode.FILE_NOT_FOUND]: 'ファイルが見つかりません。',
      [ErrorCode.STORAGE_UPLOAD_FAILED]: 'ストレージへのアップロードに失敗しました。'
    }

    return messages[code] || 'エラーが発生しました。'
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  clearErrorLog(): void {
    this.errorLog = []
  }

  // エラー統計
  getErrorStatistics(): Record<ErrorCode, number> {
    const stats: Record<string, number> = {}
    
    this.errorLog.forEach(error => {
      stats[error.code] = (stats[error.code] || 0) + 1
    })
    
    return stats as Record<ErrorCode, number>
  }

  // 特定期間のエラー取得
  getErrorsInTimeRange(startTime: number, endTime: number): AppError[] {
    return this.errorLog.filter(error => 
      error.timestamp >= startTime && error.timestamp <= endTime
    )
  }
}

export const errorHandler = AppErrorHandler.getInstance()

// Utility functions
export const handleError = (error: any, context?: Record<string, any>): AppError => {
  return errorHandler.handleError(error, context)
}

export const createError = (
  code: ErrorCode,
  message: string,
  details?: string,
  context?: Record<string, any>
): AppError => {
  return errorHandler.createError(code, message, details, context)
}

export const logError = (error: AppError): void => {
  errorHandler.logError(error)
}

// Error boundary for Vue components
export const useErrorHandler = () => {
  const handleAsyncError = async <T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<{ data: T | null; error: AppError | null }> => {
    try {
      const data = await operation()
      return { data, error: null }
    } catch (err) {
      const error = handleError(err, context)
      return { data: null, error }
    }
  }

  return {
    handleError: (error: any, context?: Record<string, any>) => handleError(error, context),
    handleAsyncError,
    createError,
    logError
  }
}
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface ValidationRule<T = any> {
  name: string
  validate: (value: T) => boolean
  message: string
}

export class Validator {
  private static instance: Validator

  private constructor() {}

  static getInstance(): Validator {
    if (!Validator.instance) {
      Validator.instance = new Validator()
    }
    return Validator.instance
  }

  email(email: string): ValidationResult {
    const errors: string[] = []
    
    if (!email) {
      errors.push('メールアドレスは必須です')
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        errors.push('有効なメールアドレスを入力してください')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  username(username: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!username) {
      errors.push('ユーザー名は必須です')
    } else {
      if (username.length < 3) {
        errors.push('ユーザー名は3文字以上で入力してください')
      }
      if (username.length > 20) {
        errors.push('ユーザー名は20文字以下で入力してください')
      }
      
      const usernameRegex = /^[a-zA-Z0-9_]+$/
      if (!usernameRegex.test(username)) {
        errors.push('ユーザー名は英数字とアンダースコアのみ使用できます')
      }
      
      // 予約語チェック
      const reservedWords = ['admin', 'root', 'system', 'api', 'www', 'mail', 'support']
      if (reservedWords.includes(username.toLowerCase())) {
        errors.push('このユーザー名は使用できません')
      }
      
      // 連続するアンダースコアの警告
      if (/__/.test(username)) {
        warnings.push('連続するアンダースコアは推奨されません')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  displayName(displayName: string): ValidationResult {
    const errors: string[] = []
    
    if (!displayName) {
      errors.push('表示名は必須です')
    } else {
      if (displayName.length < 1) {
        errors.push('表示名は1文字以上で入力してください')
      }
      if (displayName.length > 50) {
        errors.push('表示名は50文字以下で入力してください')
      }
      
      // 不適切な文字列のチェック
      const prohibitedChars = /[<>\"\'&]/
      if (prohibitedChars.test(displayName)) {
        errors.push('表示名に使用できない文字が含まれています')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  bio(bio: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (bio && bio.length > 500) {
      errors.push('自己紹介は500文字以下で入力してください')
    }
    
    if (bio && bio.length > 400) {
      warnings.push('自己紹介が長すぎます。簡潔にまとめることをお勧めします')
    }
    
    // HTMLタグのチェック
    const htmlTagRegex = /<[^>]*>/
    if (bio && htmlTagRegex.test(bio)) {
      errors.push('自己紹介にHTMLタグは使用できません')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  url(url: string, fieldName: string = 'URL'): ValidationResult {
    const errors: string[] = []
    
    if (url) {
      try {
        const urlObj = new URL(url)
        
        // HTTPSの推奨
        if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
          errors.push(`${fieldName}はhttp://またはhttps://で始まる必要があります`)
        }
        
        // 危険なドメインのチェック（基本的なブラックリスト）
        const dangerousDomains = ['localhost', '127.0.0.1', '0.0.0.0']
        if (dangerousDomains.includes(urlObj.hostname)) {
          errors.push(`${fieldName}に無効なドメインが含まれています`)
        }
        
      } catch {
        errors.push(`${fieldName}の形式が正しくありません`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  password(password: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!password) {
      errors.push('パスワードは必須です')
    } else {
      if (password.length < 8) {
        errors.push('パスワードは8文字以上で入力してください')
      }
      if (password.length > 128) {
        errors.push('パスワードは128文字以下で入力してください')
      }
      
      // 強度チェック
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      
      const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
      
      if (strengthCount < 2) {
        errors.push('パスワードは英大文字、英小文字、数字、記号のうち少なくとも2種類を含む必要があります')
      } else if (strengthCount < 3) {
        warnings.push('より安全なパスワードにするため、英大文字、英小文字、数字、記号を組み合わせることをお勧めします')
      }
      
      // 簡単なパスワードのチェック
      const commonPasswords = ['password', '12345678', 'qwerty', 'abc123']
      if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('より複雑なパスワードを設定してください')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  postTitle(title: string): ValidationResult {
    const errors: string[] = []
    
    if (!title) {
      errors.push('タイトルは必須です')
    } else {
      if (title.length < 5) {
        errors.push('タイトルは5文字以上で入力してください')
      }
      if (title.length > 100) {
        errors.push('タイトルは100文字以下で入力してください')
      }
      
      // スパムっぽいタイトルのチェック
      const spamPatterns = [
        /！{3,}/, // 過度な感嘆符
        /[A-Z]{10,}/, // 連続する大文字
        /(.)\1{5,}/ // 同じ文字の連続
      ]
      
      if (spamPatterns.some(pattern => pattern.test(title))) {
        errors.push('適切なタイトルを入力してください')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  postDescription(description: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!description) {
      errors.push('説明文は必須です')
    } else {
      if (description.length < 10) {
        errors.push('説明文は10文字以上で入力してください')
      }
      if (description.length > 2000) {
        errors.push('説明文は2000文字以下で入力してください')
      }
      
      if (description.length > 1500) {
        warnings.push('説明文が長すぎます。読みやすくするため、簡潔にまとめることをお勧めします')
      }
      
      // HTMLタグのチェック
      const htmlTagRegex = /<[^>]*>/
      if (htmlTagRegex.test(description)) {
        errors.push('説明文にHTMLタグは使用できません')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  recruitmentCount(count: number): ValidationResult {
    const errors: string[] = []
    
    if (count === undefined || count === null) {
      errors.push('募集人数は必須です')
    } else {
      if (!Number.isInteger(count) || count < 1) {
        errors.push('募集人数は1以上の整数で入力してください')
      }
      if (count > 100) {
        errors.push('募集人数は100人以下で入力してください')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  deadline(deadline: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (deadline) {
      const deadlineDate = new Date(deadline)
      const now = new Date()
      
      if (isNaN(deadlineDate.getTime())) {
        errors.push('有効な日付を入力してください')
      } else {
        if (deadlineDate <= now) {
          errors.push('締切日は現在より後の日付を設定してください')
        }
        
        const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff < 1) {
          warnings.push('締切まで時間が短すぎます')
        } else if (daysDiff > 365) {
          warnings.push('締切が1年以上先に設定されています')
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateUserProfile(profile: {
    username?: string
    display_name?: string
    bio?: string
    website_url?: string
    twitter_username?: string
    discord_username?: string
  }): ValidationResult {
    const allErrors: string[] = []
    const allWarnings: string[] = []
    
    if (profile.username !== undefined) {
      const usernameResult = this.username(profile.username)
      allErrors.push(...usernameResult.errors)
      if (usernameResult.warnings) allWarnings.push(...usernameResult.warnings)
    }
    
    if (profile.display_name !== undefined) {
      const displayNameResult = this.displayName(profile.display_name)
      allErrors.push(...displayNameResult.errors)
    }
    
    if (profile.bio !== undefined) {
      const bioResult = this.bio(profile.bio)
      allErrors.push(...bioResult.errors)
      if (bioResult.warnings) allWarnings.push(...bioResult.warnings)
    }
    
    if (profile.website_url) {
      const websiteResult = this.url(profile.website_url, 'ウェブサイトURL')
      allErrors.push(...websiteResult.errors)
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined
    }
  }

  // カテゴリ名のバリデーション
  categoryName(name: string): ValidationResult {
    const errors: string[] = []
    
    if (!name || name.trim().length === 0) {
      errors.push('カテゴリ名は必須です')
    } else {
      if (name.length < 2) {
        errors.push('カテゴリ名は2文字以上で入力してください')
      }
      if (name.length > 50) {
        errors.push('カテゴリ名は50文字以下で入力してください')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // タグ名のバリデーション
  tagName(name: string): ValidationResult {
    const errors: string[] = []
    
    if (!name || name.trim().length === 0) {
      errors.push('タグ名は必須です')
    } else {
      if (name.length < 1) {
        errors.push('タグ名は1文字以上で入力してください')
      }
      if (name.length > 30) {
        errors.push('タグ名は30文字以下で入力してください')
      }
      
      // 特殊文字のチェック
      const invalidChars = /[<>\"'&]/
      if (invalidChars.test(name)) {
        errors.push('タグ名に使用できない文字が含まれています')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Application validation methods
  applicationMessage(message: string): ValidationResult {
    const errors: string[] = []
    
    if (!message || message.trim().length === 0) {
      errors.push('応募メッセージは必須です')
    } else {
      if (message.length < 10) {
        errors.push('応募メッセージは10文字以上で入力してください')
      }
      if (message.length > 1000) {
        errors.push('応募メッセージは1000文字以内で入力してください')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Notification validation methods
  notificationTitle(title: string): ValidationResult {
    const errors: string[] = []
    
    if (!title || title.trim().length === 0) {
      errors.push('通知タイトルは必須です')
    } else if (title.length > 100) {
      errors.push('通知タイトルは100文字以内で入力してください')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  notificationMessage(message: string): ValidationResult {
    const errors: string[] = []
    
    if (!message || message.trim().length === 0) {
      errors.push('通知メッセージは必須です')
    } else if (message.length > 500) {
      errors.push('通知メッセージは500文字以内で入力してください')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  notificationType(type: string): ValidationResult {
    const errors: string[] = []
    const validTypes = [
      'application_received',
      'application_status_changed', 
      'deadline_reminder',
      'post_updated',
      'system_announcement'
    ]
    
    if (!type || !validTypes.includes(type)) {
      errors.push('無効な通知タイプです')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Message validation methods
  messageContent(content: string): ValidationResult {
    const errors: string[] = []
    
    if (!content || content.trim().length === 0) {
      errors.push('メッセージ内容は必須です')
    } else {
      if (content.length > 2000) {
        errors.push('メッセージは2000文字以内で入力してください')
      }
      
      // 危険なHTMLタグやスクリプトのチェック
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ]
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          errors.push('メッセージに使用できない文字が含まれています')
          break
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  messageType(type: string): ValidationResult {
    const errors: string[] = []
    const validTypes = ['text', 'image']
    
    if (!type || !validTypes.includes(type)) {
      errors.push('無効なメッセージタイプです')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // セキュリティ関連バリデーション
  sanitizeInput(input: string): string {
    if (!input) return ''
    
    // HTMLエスケープ
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  isValidUserId(userId: string): ValidationResult {
    const errors: string[] = []
    
    if (!userId || typeof userId !== 'string') {
      errors.push('無効なユーザーIDです')
    } else {
      // UUIDv4 format check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        errors.push('ユーザーIDの形式が正しくありません')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export const validator = Validator.getInstance()

// Utility functions for common validations
export const isValidEmail = (email: string): boolean => validator.email(email).isValid
export const isValidUsername = (username: string): boolean => validator.username(username).isValid
export const isValidUrl = (url: string): boolean => validator.url(url).isValid
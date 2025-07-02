import { supabase } from './supabase'
import { validator, type ValidationResult } from './validation'
import { errorHandler, ErrorCode, type AppError } from './errors'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

type UserProfile = Tables<'users'>
type UserProfileInsert = TablesInsert<'users'>
type UserProfileUpdate = TablesUpdate<'users'>

export interface AuthResult<T = any> {
  data: T | null
  error: AppError | null
  validationResult?: ValidationResult
}

export class ValidatedAuthService {
  private static instance: ValidatedAuthService

  private constructor() {}

  static getInstance(): ValidatedAuthService {
    if (!ValidatedAuthService.instance) {
      ValidatedAuthService.instance = new ValidatedAuthService()
    }
    return ValidatedAuthService.instance
  }

  async signInWithGoogle(): Promise<AuthResult<any>> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) {
        const appError = errorHandler.handleError(error, { 
          operation: 'google_oauth_signin',
          provider: 'google' 
        })
        return { data: null, error: appError }
      }

      return { data, error: null }
    } catch (err) {
      const appError = errorHandler.handleError(err, { 
        operation: 'google_oauth_signin',
        provider: 'google' 
      })
      return { data: null, error: appError }
    }
  }

  async createUserProfile(profileData: Omit<UserProfileInsert, 'id'> & { id: string }): Promise<AuthResult<UserProfile>> {
    try {
      // バリデーション
      const validationResult = validator.validateUserProfile({
        username: profileData.username,
        display_name: profileData.display_name,
        bio: profileData.bio || undefined,
        website_url: profileData.website_url || undefined
      })

      if (!validationResult.isValid) {
        const appError = errorHandler.createError(
          ErrorCode.VALIDATION_INVALID_FORMAT,
          'Profile validation failed',
          validationResult.errors.join(', '),
          { validationErrors: validationResult.errors }
        )
        return { data: null, error: appError, validationResult }
      }

      // ユーザー名の重複チェック
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', profileData.username)
        .single()

      if (existingUser) {
        const appError = errorHandler.createError(
          ErrorCode.VALIDATION_DUPLICATE_DATA,
          'Username already exists',
          `Username "${profileData.username}" is already taken`,
          { username: profileData.username }
        )
        return { data: null, error: appError, validationResult }
      }

      // プロフィール作成
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        const appError = errorHandler.handleError(error, {
          operation: 'create_user_profile',
          userId: profileData.id
        })
        return { data: null, error: appError, validationResult }
      }

      return { data, error: null, validationResult }
    } catch (err) {
      const appError = errorHandler.handleError(err, {
        operation: 'create_user_profile',
        userId: profileData.id
      })
      return { data: null, error: appError }
    }
  }

  async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<AuthResult<UserProfile>> {
    try {
      // バリデーション
      const validationResult = validator.validateUserProfile({
        username: updates.username,
        display_name: updates.display_name,
        bio: updates.bio || undefined,
        website_url: updates.website_url || undefined
      })

      if (!validationResult.isValid) {
        const appError = errorHandler.createError(
          ErrorCode.VALIDATION_INVALID_FORMAT,
          'Profile validation failed',
          validationResult.errors.join(', '),
          { validationErrors: validationResult.errors }
        )
        return { data: null, error: appError, validationResult }
      }

      // ユーザー名変更時の重複チェック
      if (updates.username) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', updates.username)
          .neq('id', userId)
          .single()

        if (existingUser) {
          const appError = errorHandler.createError(
            ErrorCode.VALIDATION_DUPLICATE_DATA,
            'Username already exists',
            `Username "${updates.username}" is already taken`,
            { username: updates.username, userId }
          )
          return { data: null, error: appError, validationResult }
        }
      }

      // プロフィール更新
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        const appError = errorHandler.handleError(error, {
          operation: 'update_user_profile',
          userId,
          updates
        })
        return { data: null, error: appError, validationResult }
      }

      return { data, error: null, validationResult }
    } catch (err) {
      const appError = errorHandler.handleError(err, {
        operation: 'update_user_profile',
        userId,
        updates
      })
      return { data: null, error: appError }
    }
  }

  async getUserProfile(userId: string): Promise<AuthResult<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          const appError = errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'User profile not found',
            `User with ID ${userId} not found`,
            { userId }
          )
          return { data: null, error: appError }
        }

        const appError = errorHandler.handleError(error, {
          operation: 'get_user_profile',
          userId
        })
        return { data: null, error: appError }
      }

      return { data, error: null }
    } catch (err) {
      const appError = errorHandler.handleError(err, {
        operation: 'get_user_profile',
        userId
      })
      return { data: null, error: appError }
    }
  }

  async getCurrentSession(): Promise<AuthResult<Session>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        const appError = errorHandler.handleError(error, {
          operation: 'get_current_session'
        })
        return { data: null, error: appError }
      }

      if (!session) {
        const appError = errorHandler.createError(
          ErrorCode.AUTH_SESSION_EXPIRED,
          'No active session found',
          'User session is not available',
          { operation: 'get_current_session' }
        )
        return { data: null, error: appError }
      }

      return { data: session, error: null }
    } catch (err) {
      const appError = errorHandler.handleError(err, {
        operation: 'get_current_session'
      })
      return { data: null, error: appError }
    }
  }

  async refreshSession(): Promise<AuthResult<Session>> {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        const appError = errorHandler.createError(
          ErrorCode.AUTH_SESSION_REFRESH_FAILED,
          'Session refresh failed',
          error.message,
          { operation: 'refresh_session' }
        )
        return { data: null, error: appError }
      }

      if (!data.session) {
        const appError = errorHandler.createError(
          ErrorCode.AUTH_SESSION_REFRESH_FAILED,
          'Session refresh returned null',
          'Refresh session operation did not return a valid session',
          { operation: 'refresh_session' }
        )
        return { data: null, error: appError }
      }

      return { data: data.session, error: null }
    } catch (err) {
      const appError = errorHandler.handleError(err, {
        operation: 'refresh_session'
      })
      return { data: null, error: appError }
    }
  }

  async signOut(): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        const appError = errorHandler.handleError(error, {
          operation: 'sign_out'
        })
        return { data: null, error: appError }
      }

      return { data: null, error: null }
    } catch (err) {
      const appError = errorHandler.handleError(err, {
        operation: 'sign_out'
      })
      return { data: null, error: appError }
    }
  }

  // バリデーションのみを実行するヘルパーメソッド
  validateUsername(username: string): ValidationResult {
    return validator.username(username)
  }

  validateDisplayName(displayName: string): ValidationResult {
    return validator.displayName(displayName)
  }

  validateBio(bio: string): ValidationResult {
    return validator.bio(bio)
  }

  validateUrl(url: string, fieldName?: string): ValidationResult {
    return validator.url(url, fieldName)
  }

  validateUserProfileData(profileData: {
    username?: string
    display_name?: string
    bio?: string | null
    website_url?: string | null
    twitter_username?: string | null
    discord_username?: string | null
  }): ValidationResult {
    return validator.validateUserProfile({
      username: profileData.username,
      display_name: profileData.display_name,
      bio: profileData.bio || undefined,
      website_url: profileData.website_url || undefined,
      twitter_username: profileData.twitter_username || undefined,
      discord_username: profileData.discord_username || undefined
    })
  }
}

export const validatedAuthService = ValidatedAuthService.getInstance()

// エラーハンドリングヘルパー
export const handleAuthError = (error: any, operation: string): AppError => {
  return errorHandler.handleError(error, { operation })
}

// バリデーション結果をユーザーフレンドリーなメッセージに変換
export const formatValidationErrors = (validationResult: ValidationResult): string[] => {
  const messages: string[] = []
  
  if (validationResult.errors) {
    messages.push(...validationResult.errors)
  }
  
  if (validationResult.warnings) {
    messages.push(...validationResult.warnings.map(warning => `注意: ${warning}`))
  }
  
  return messages
}
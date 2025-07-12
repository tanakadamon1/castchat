import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types'
import { sessionManager } from '@/lib/session'
import { usePermissions } from '@/lib/permissions'
import { config } from '@/config/env'

// ユーザーフレンドリーなエラーメッセージに変換
const getUserFriendlyErrorMessage = (error: any): string => {
  if (!error) return '未知のエラーが発生しました'
  
  const message = error.message || String(error)
  
  // 認証関連エラー
  if (message.includes('auth')) {
    if (message.includes('timeout') || message.includes('initialization')) {
      return 'ログイン処理がタイムアウトしました。もう一度お試しください。'
    }
    if (message.includes('popup') || message.includes('blocked')) {
      return 'ポップアップがブロックされています。ブラウザの設定を確認してください。'
    }
    if (message.includes('cancelled') || message.includes('closed')) {
      return 'ログインがキャンセルされました。'
    }
    return 'ログインに失敗しました。しばらく時間をおいてから再度お試しください。'
  }
  
  // ネットワーク関連エラー
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'インターネット接続を確認してください。'
  }
  
  // サーバー関連エラー
  if (message.includes('500') || message.includes('server') || message.includes('internal')) {
    return 'サーバーで一時的な問題が発生しています。しばらく時間をおいてから再度お試しください。'
  }
  
  // デフォルトメッセージ
  return '予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。'
}

type UserProfile = Tables<'users'>
type UserProfileInsert = TablesInsert<'users'>
type UserProfileUpdate = TablesUpdate<'users'>

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initializing = ref(false)

  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isProfileComplete = computed(() => {
    if (!profile.value) return false
    return !!profile.value.display_name
  })

  const userRole = computed(() => profile.value?.role || 'user')
  const isAdmin = computed(() => userRole.value === 'admin')
  const isModerator = computed(() => ['admin', 'moderator'].includes(userRole.value))
  const permissions = computed(() => usePermissions(profile.value))
  const sessionState = computed(() => ({
    isValid: !!session.value && sessionManager.isSessionValid(session.value),
    expiresAt: session.value?.expires_at
      ? new Date(session.value.expires_at * 1000).getTime()
      : null,
    timeUntilExpiry: sessionManager.formatTimeUntilExpiry(session.value),
  }))
  
  // コイン残高のリフレッシュ
  async function refreshCoinBalance() {
    if (!user.value?.id) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('coin_balance')
        .eq('id', user.value.id)
        .single()
      
      if (error) throw error
      
      if (data && profile.value) {
        profile.value.coin_balance = data.coin_balance
      }
    } catch (error) {
      console.error('Failed to refresh coin balance:', error)
    }
  }

  async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()

      if (error) {
        console.error('Get user profile error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  async function createUserProfile(profileData: UserProfileInsert): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from('users').insert(profileData).select().single()

      if (error) {
        console.error('Create user profile error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Create user profile error:', error)
      return null
    }
  }

  async function ensureUserProfile(authUser: User) {
    try {
      // 既にプロフィールが設定されている場合はスキップ
      if (profile.value && profile.value.id === authUser.id) {
        return profile.value
      }


      let userProfile = await getUserProfile(authUser.id)

      if (!userProfile) {
        const { user_metadata } = authUser
        const profileData: UserProfileInsert = {
          id: authUser.id,
          display_name: user_metadata?.full_name || user_metadata?.name || 'Anonymous User',
          avatar_url: user_metadata?.avatar_url || user_metadata?.picture,
          bio: null,
          vrchat_username: null,
          twitter_username: null,
          discord_username: null,
          website_url: null,
          role: 'user',
          is_verified: false,
        }

        userProfile = await createUserProfile(profileData)
      }

      profile.value = userProfile
      return userProfile
    } catch (error) {
      console.error('Ensure user profile error:', error)
      return null
    }
  }

  const signInWithGoogle = async () => {
    loading.value = true
    error.value = null
    try {

      // 既存のセッションをクリア
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.warn('Sign out error (this might be normal):', signOutError)
      }

      // 現在のセッション状態を確認
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.warn('Session check error:', sessionError)
      }

      // OAuth設定を詳細にログ
      const oauthConfig = {
        provider: 'google' as const,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      }

      const { data, error: signInError } = await supabase.auth.signInWithOAuth(oauthConfig)


      if (signInError) {
        console.error('OAuth sign-in error:', signInError)
        console.error('Error details:', {
          name: signInError.name,
          message: signInError.message,
          status: signInError.status,
        })
        throw signInError
      }

      if (!data?.url) {
        console.error('No OAuth URL returned')
        throw new Error('OAuth URLが返されませんでした')
      }



      return data
    } catch (err) {
      // 開発環境でのみ詳細エラーをコンソールに出力
      if (import.meta.env.DEV) {
        console.error('=== Google Sign-In Error ===')
        console.error('Error signing in with Google:', err)
        console.error('Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : 'No stack trace',
        })
      }
      error.value = getUserFriendlyErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    error.value = null
    try {
      const { error: signOutError } = await sessionManager.signOut()
      if (signOutError) throw signOutError

      // データクリア
      await clearUserData()
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error signing out:', err)
      }
      error.value = 'ログアウトに失敗しました。'
      throw err
    } finally {
      loading.value = false
    }
  }

  const initialize = async () => {
    // 既に初期化中または初期化済みの場合はスキップ
    if (initializing.value || (user.value !== null && session.value !== null)) {
      return
    }

    initializing.value = true
    loading.value = true
    error.value = null
    
    // タイムアウトを設定
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth initialization timeout')), 10000) // 10秒
    })
    
    try {

      // 現在のセッションを取得（タイムアウト付き）
      const sessionPromise = supabase.auth.getSession()
      const result = await Promise.race([sessionPromise, timeoutPromise])
      
      const { data: { session: currentSession }, error: sessionError } = result as any

      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }


      session.value = currentSession
      user.value = currentSession?.user ?? null

      if (currentSession?.user) {
        const userProfile = await ensureUserProfile(currentSession.user)
      } else {
        profile.value = null
      }

      // 認証状態変更のリスナーを設定（初回のみ）
      if (!window.__authListenerSet) {
        supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession) => {
          
          // 無限ループを防ぐため、変更があった場合のみ更新
          if (newSession?.user?.id !== user.value?.id) {
            session.value = newSession
            user.value = newSession?.user ?? null

            if (newSession?.user) {
              const userProfile = await ensureUserProfile(newSession.user)
            } else {
              profile.value = null
            }
          }
        })
        window.__authListenerSet = true
      }

    } catch (err) {
      console.error('Error initializing auth:', err)
      error.value = err instanceof Error ? err.message : 'Authentication initialization failed'
      
      // タイムアウトエラーの場合は、状態をリセット
      if (err instanceof Error && err.message === 'Auth initialization timeout') {
        console.warn('Auth initialization timed out, resetting state')
        user.value = null
        session.value = null
        profile.value = null
      }
    } finally {
      loading.value = false
      initializing.value = false
    }
  }

  async function updateProfile(updates: UserProfileUpdate) {
    if (!user.value || !profile.value) {
      throw new Error('User not authenticated')
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      if (data) {
        profile.value = data
      }

      return { data, error: null }
    } catch (err) {
      console.error('Update profile error:', err)
      error.value = err instanceof Error ? err.message : 'Profile update failed'
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  async function refreshSession() {
    try {
      loading.value = true
      error.value = null

      const { session: refreshedSession, error: refreshError } =
        await sessionManager.refreshSession()

      if (refreshError || !refreshedSession) {
        throw refreshError || new Error('Failed to refresh session')
      }

      session.value = refreshedSession
      user.value = refreshedSession.user

      return { data: refreshedSession, error: null }
    } catch (err) {
      console.error('Refresh session error:', err)
      error.value = err instanceof Error ? err.message : 'Session refresh failed'
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  async function validateSession() {
    try {
      const sessionState = await sessionManager.validateAndRefreshSession()

      session.value = sessionState.session
      user.value = sessionState.user

      if (!sessionState.isValid) {
        profile.value = null
        return false
      }

      return true
    } catch (err) {
      console.error('Validate session error:', err)
      error.value = err instanceof Error ? err.message : 'Session validation failed'
      return false
    }
  }

  // パスワードリセット機能
  async function resetPassword(email: string) {
    loading.value = true
    error.value = null
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (resetError) throw resetError

      return { data: true, error: null }
    } catch (err) {
      console.error('Password reset error:', err)
      error.value = err instanceof Error ? err.message : 'Password reset failed'
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // セッション強制更新
  async function forceRefreshSession() {
    try {
      loading.value = true
      error.value = null

      const {
        data: { session: newSession },
        error: refreshError,
      } = await supabase.auth.refreshSession()

      if (refreshError) throw refreshError

      session.value = newSession
      user.value = newSession?.user ?? null

      if (newSession?.user) {
        await ensureUserProfile(newSession.user)
      } else {
        profile.value = null
      }

      return { data: newSession, error: null }
    } catch (err) {
      console.error('Force refresh session error:', err)
      error.value = err instanceof Error ? err.message : 'Session refresh failed'
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // ログアウト時のデータクリア機能
  async function clearUserData() {
    try {
      // セッション監視停止
      sessionManager.stopSessionMonitoring()

      // ローカルストレージクリア（Supabaseの認証トークン）
      const supabaseKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith('sb-') || key.includes('supabase'),
      )
      supabaseKeys.forEach((key) => localStorage.removeItem(key))

      // セッションストレージクリア
      sessionStorage.clear()

      // 状態リセット
      user.value = null
      session.value = null
      profile.value = null
      error.value = null

      return true
    } catch (err) {
      console.error('Clear user data error:', err)
      return false
    }
  }

  // 強制ログアウト機能
  async function forceSignOut() {
    try {
      await supabase.auth.signOut()
      await clearUserData()
    } catch (error) {
      console.error('Force sign out error:', error)
    }
  }

  return {
    user: computed(() => user.value),
    session: computed(() => session.value),
    profile: computed(() => profile.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    initializing: computed(() => initializing.value),
    isAuthenticated,
    isProfileComplete,
    userRole,
    isAdmin,
    isModerator,
    permissions,
    sessionState,
    signInWithGoogle,
    signOut,
    initialize,
    updateProfile,
    refreshSession,
    validateSession,
    resetPassword,
    refreshCoinBalance,
    forceRefreshSession,
    clearUserData,
    forceSignOut,
  }
})

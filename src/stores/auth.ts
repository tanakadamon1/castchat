import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types'
import { sessionManager } from '@/lib/session'
import { usePermissions } from '@/lib/permissions'

type UserProfile = Tables<'users'>
type UserProfileInsert = TablesInsert<'users'>
type UserProfileUpdate = TablesUpdate<'users'>

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isProfileComplete = computed(() => {
    if (!profile.value) return false
    return !!(profile.value.username && profile.value.display_name)
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
      let userProfile = await getUserProfile(authUser.id)

      if (!userProfile) {
        const { user_metadata } = authUser
        const profileData: UserProfileInsert = {
          id: authUser.id,
          username: user_metadata?.preferred_username || authUser.email?.split('@')[0] || 'user',
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
      console.log('Starting Google sign-in process...')
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`)

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      console.log('OAuth response:', { data, error: signInError })

      if (signInError) {
        console.error('OAuth sign-in error:', signInError)
        throw signInError
      }

      console.log('Google sign-in initiated successfully')
      return data
    } catch (err) {
      console.error('Error signing in with Google:', err)
      error.value = err instanceof Error ? err.message : 'Google sign-in failed'
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
      console.error('Error signing out:', err)
      error.value = err instanceof Error ? err.message : 'Sign out failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const initialize = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('Initializing auth store...')

      // 現在のセッションを取得
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      console.log('Current session:', currentSession)

      session.value = currentSession
      user.value = currentSession?.user ?? null

      if (currentSession?.user) {
        console.log('User found, ensuring profile...')
        await ensureUserProfile(currentSession.user)
      }

      // 認証状態変更のリスナーを設定
      supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession) => {
        console.log('Auth state changed:', event, newSession)
        session.value = newSession
        user.value = newSession?.user ?? null

        if (newSession?.user) {
          console.log('New user session, ensuring profile...')
          await ensureUserProfile(newSession.user)
        } else {
          console.log('User signed out, clearing profile...')
          profile.value = null
        }
      })

      console.log('Auth store initialized successfully')
    } catch (err) {
      console.error('Error initializing auth:', err)
      error.value = err instanceof Error ? err.message : 'Authentication initialization failed'
    } finally {
      loading.value = false
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

      // ローカルストレージクリア
      localStorage.removeItem('supabase.auth.token')
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

  return {
    user: readonly(user),
    session: readonly(session),
    profile: readonly(profile),
    loading: readonly(loading),
    error: readonly(error),
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
    forceRefreshSession,
    clearUserData,
  }
})

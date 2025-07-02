import { supabase } from './supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type UserProfile = Tables<'users'>
export type UserProfileInsert = TablesInsert<'users'>
export type UserProfileUpdate = TablesUpdate<'users'>

export interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
}

export class AuthService {
  private static instance: AuthService
  private authStateChangeListeners: ((event: AuthChangeEvent, session: Session | null) => void)[] = []

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signInWithGoogle() {
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
        console.error('Google sign-in error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Google sign-in error:', error)
      return { data: null, error }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }

      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Get current session error:', error)
      return null
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

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

  async createUserProfile(profile: UserProfileInsert): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(profile)
        .select()
        .single()

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

  async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Update user profile error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Update user profile error:', error)
      return null
    }
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    this.authStateChangeListeners.push(callback)
    
    return supabase.auth.onAuthStateChange(callback)
  }

  async handleAuthCallback() {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        throw error
      }

      if (data.session?.user) {
        await this.ensureUserProfile(data.session.user)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Auth callback error:', error)
      return { data: null, error }
    }
  }

  private async ensureUserProfile(user: User) {
    try {
      let profile = await this.getUserProfile(user.id)

      if (!profile) {
        const { user_metadata } = user
        const profileData: UserProfileInsert = {
          id: user.id,
          username: user_metadata?.preferred_username || user.email?.split('@')[0] || 'user',
          display_name: user_metadata?.full_name || user_metadata?.name || 'Anonymous User',
          avatar_url: user_metadata?.avatar_url || user_metadata?.picture,
          bio: null,
          vrchat_username: null,
          twitter_username: null,
          discord_username: null,
          website_url: null,
          role: 'user',
          is_verified: false
        }

        profile = await this.createUserProfile(profileData)
      }

      return profile
    } catch (error) {
      console.error('Ensure user profile error:', error)
      return null
    }
  }

  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Refresh session error:', error)
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Refresh session error:', error)
      return { data: null, error }
    }
  }

  isAuthenticated(): boolean {
    return !!supabase.auth.getUser()
  }
}

export const authService = AuthService.getInstance()
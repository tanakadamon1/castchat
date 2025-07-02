import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface SessionState {
  session: Session | null
  user: User | null
  isValid: boolean
  expiresAt: number | null
}

export class SessionManager {
  private static instance: SessionManager
  private sessionCheckInterval: number | null = null
  private readonly SESSION_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  async getCurrentSession(): Promise<SessionState> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Get session error:', error)
        return this.createEmptySessionState()
      }

      if (!session) {
        return this.createEmptySessionState()
      }

      const isValid = this.isSessionValid(session)
      
      return {
        session,
        user: session.user,
        isValid,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).getTime() : null
      }
    } catch (error) {
      console.error('Get current session error:', error)
      return this.createEmptySessionState()
    }
  }

  isSessionValid(session: Session | null): boolean {
    if (!session) return false
    
    const now = Date.now()
    const expiresAt = session.expires_at ? new Date(session.expires_at * 1000).getTime() : 0
    
    return expiresAt > now
  }

  shouldRefreshSession(session: Session | null): boolean {
    if (!session || !session.expires_at) return false
    
    const now = Date.now()
    const expiresAt = new Date(session.expires_at * 1000).getTime()
    
    return (expiresAt - now) <= this.SESSION_REFRESH_THRESHOLD
  }

  async refreshSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Refresh session error:', error)
        return { session: null, error }
      }

      console.log('Session refreshed successfully')
      return { session: data.session, error: null }
    } catch (error) {
      console.error('Refresh session error:', error)
      return { session: null, error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  async validateAndRefreshSession(): Promise<SessionState> {
    const currentSessionState = await this.getCurrentSession()
    
    if (!currentSessionState.isValid) {
      return currentSessionState
    }

    if (this.shouldRefreshSession(currentSessionState.session)) {
      console.log('Session needs refresh')
      const { session: refreshedSession, error } = await this.refreshSession()
      
      if (error || !refreshedSession) {
        console.error('Failed to refresh session, session may have expired')
        return this.createEmptySessionState()
      }

      return {
        session: refreshedSession,
        user: refreshedSession.user,
        isValid: this.isSessionValid(refreshedSession),
        expiresAt: refreshedSession.expires_at ? new Date(refreshedSession.expires_at * 1000).getTime() : null
      }
    }

    return currentSessionState
  }

  startSessionMonitoring(intervalMs: number = 60000): void {
    if (this.sessionCheckInterval) {
      this.stopSessionMonitoring()
    }

    this.sessionCheckInterval = window.setInterval(async () => {
      const sessionState = await this.getCurrentSession()
      
      if (sessionState.session && this.shouldRefreshSession(sessionState.session)) {
        console.log('Auto-refreshing session')
        await this.refreshSession()
      }
    }, intervalMs)

    console.log('Session monitoring started')
  }

  stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
      console.log('Session monitoring stopped')
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      this.stopSessionMonitoring()
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        return { error }
      }

      console.log('Signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  private createEmptySessionState(): SessionState {
    return {
      session: null,
      user: null,
      isValid: false,
      expiresAt: null
    }
  }

  getTimeUntilExpiry(session: Session | null): number {
    if (!session || !session.expires_at) return 0
    
    const now = Date.now()
    const expiresAt = new Date(session.expires_at * 1000).getTime()
    
    return Math.max(0, expiresAt - now)
  }

  formatTimeUntilExpiry(session: Session | null): string {
    const timeMs = this.getTimeUntilExpiry(session)
    
    if (timeMs === 0) return 'Expired'
    
    const minutes = Math.floor(timeMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  async ensureValidSession(): Promise<SessionState> {
    return await this.validateAndRefreshSession()
  }
}

export const sessionManager = SessionManager.getInstance()
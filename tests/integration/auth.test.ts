// Integration tests for authentication flow
import { describe, it, expect } from 'vitest'
import { testSupabase, TEST_USERS, signUpTestUser, signInTestUser } from './setup'

describe('Authentication Integration Tests', () => {
  describe('User Registration', () => {
    it('should allow user to sign up with email and password', async () => {
      const { data, error } = await testSupabase.auth.signUp({
        email: 'newuser@castchat.test',
        password: 'testpassword123'
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe('newuser@castchat.test')
    })

    it('should prevent duplicate email registration', async () => {
      // First registration
      await testSupabase.auth.signUp({
        email: 'duplicate@castchat.test',
        password: 'testpassword123'
      })

      // Second registration with same email
      const { error } = await testSupabase.auth.signUp({
        email: 'duplicate@castchat.test',
        password: 'testpassword123'
      })

      expect(error).toBeDefined()
      expect(error?.message).toContain('already registered')
    })
  })

  describe('User Login', () => {
    it('should allow user to sign in with correct credentials', async () => {
      // First sign up
      await signUpTestUser('user1')

      // Then sign in
      const { data, error } = await signInTestUser('user1')

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe(TEST_USERS.user1.email)
    })

    it('should reject invalid credentials', async () => {
      const { error } = await testSupabase.auth.signInWithPassword({
        email: 'nonexistent@castchat.test',
        password: 'wrongpassword'
      })

      expect(error).toBeDefined()
      expect(error?.message).toContain('Invalid')
    })
  })

  describe('User Profile Creation', () => {
    it('should create user profile after signup', async () => {
      const authData = await signUpTestUser('user2')
      const userId = authData.user?.id

      expect(userId).toBeDefined()

      // Check if user profile was created
      const { data: profile, error } = await testSupabase
        .from('users')
        .select('*')
        .eq('id', userId!)
        .single()

      expect(error).toBeNull()
      expect(profile).toBeDefined()
      expect(profile?.id).toBe(userId)
    })
  })

  describe('Session Management', () => {
    it('should maintain session after login', async () => {
      await signUpTestUser('user1')
      await signInTestUser('user1')

      const { data: { session } } = await testSupabase.auth.getSession()

      expect(session).toBeDefined()
      expect(session?.user?.email).toBe(TEST_USERS.user1.email)
    })

    it('should clear session after logout', async () => {
      await signUpTestUser('user1')
      await signInTestUser('user1')

      // Sign out
      const { error } = await testSupabase.auth.signOut()
      expect(error).toBeNull()

      // Check session is cleared
      const { data: { session } } = await testSupabase.auth.getSession()
      expect(session).toBeNull()
    })
  })

  describe('Google OAuth', () => {
    it('should provide Google OAuth URL', async () => {
      const { data, error } = await testSupabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173/auth/callback'
        }
      })

      expect(error).toBeNull()
      expect(data.url).toBeDefined()
      expect(data.url).toContain('google')
    })
  })
})
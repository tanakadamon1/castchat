// Integration Test Setup
// This file configures the testing environment for integration tests

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Test database configuration
const TEST_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const TEST_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key'

// Create test Supabase client
export const testSupabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY)

// Test user credentials for integration tests
export const TEST_USERS = {
  admin: {
    email: 'admin@castchat.test',
    password: 'testpassword123',
    role: 'admin'
  },
  user1: {
    email: 'user1@castchat.test',
    password: 'testpassword123',
    role: 'user'
  },
  user2: {
    email: 'user2@castchat.test',
    password: 'testpassword123',
    role: 'user'
  }
}

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up integration tests...')
  
  // Ensure we're running against test database
  if (!TEST_SUPABASE_URL.includes('localhost') && !TEST_SUPABASE_URL.includes('test')) {
    throw new Error('Integration tests must run against local or test database!')
  }
  
  // Clean up any existing test data
  await cleanupTestData()
  
  // Seed test data
  await seedTestData()
  
  console.log('✅ Integration test setup complete')
})

// Global test teardown
afterAll(async () => {
  console.log('🧹 Cleaning up integration tests...')
  await cleanupTestData()
  console.log('✅ Integration test cleanup complete')
})

// Clean up test data before each test
beforeEach(async () => {
  // Reset any modified test data if needed
  await resetTestData()
})

// Clean up after each test
afterEach(async () => {
  // Sign out any authenticated users
  await testSupabase.auth.signOut()
})

// Helper functions
export async function cleanupTestData() {
  try {
    // Delete test posts and related data
    await testSupabase
      .from('applications')
      .delete()
      .like('user_id', '%test%')
    
    await testSupabase
      .from('posts')
      .delete()
      .like('user_id', '%test%')
    
    await testSupabase
      .from('users')
      .delete()
      .like('email', '%@castchat.test')
    
    console.log('🗑️ Test data cleaned up')
  } catch (error) {
    console.error('Error cleaning up test data:', error)
  }
}

export async function seedTestData() {
  try {
    // Create test categories
    const { data: categories } = await testSupabase
      .from('post_categories')
      .upsert([
        {
          name: 'テストカテゴリ1',
          slug: 'test-category-1',
          description: 'テスト用カテゴリ1'
        },
        {
          name: 'テストカテゴリ2',
          slug: 'test-category-2',
          description: 'テスト用カテゴリ2'
        }
      ])
      .select()

    // Create test tags
    await testSupabase
      .from('tags')
      .upsert([
        { name: 'テストタグ1', slug: 'test-tag-1' },
        { name: 'テストタグ2', slug: 'test-tag-2' }
      ])

    console.log('🌱 Test data seeded')
  } catch (error) {
    console.error('Error seeding test data:', error)
  }
}

export async function resetTestData() {
  // Reset any modified data to initial state if needed
}

// Authentication helpers
export async function signUpTestUser(userKey: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userKey]
  
  const { data, error } = await testSupabase.auth.signUp({
    email: user.email,
    password: user.password
  })
  
  if (error) {
    throw new Error(`Failed to sign up test user ${userKey}: ${error.message}`)
  }
  
  return data
}

export async function signInTestUser(userKey: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userKey]
  
  const { data, error } = await testSupabase.auth.signInWithPassword({
    email: user.email,
    password: user.password
  })
  
  if (error) {
    throw new Error(`Failed to sign in test user ${userKey}: ${error.message}`)
  }
  
  return data
}

export async function createTestPost(userId: string, categoryId: string, overrides = {}) {
  const defaultPost = {
    user_id: userId,
    category_id: categoryId,
    title: 'テスト投稿',
    description: 'テスト用の投稿です',
    requirements: 'テスト要件',
    recruitment_count: 1,
    status: 'published' as const,
    ...overrides
  }
  
  const { data, error } = await testSupabase
    .from('posts')
    .insert(defaultPost)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create test post: ${error.message}`)
  }
  
  return data
}

export async function createTestApplication(postId: string, userId: string, overrides = {}) {
  const defaultApplication = {
    post_id: postId,
    user_id: userId,
    message: 'テスト応募メッセージ',
    status: 'pending' as const,
    ...overrides
  }
  
  const { data, error } = await testSupabase
    .from('applications')
    .insert(defaultApplication)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create test application: ${error.message}`)
  }
  
  return data
}

// Assertion helpers
export function expectValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new Error(`Expected valid UUID, got: ${uuid}`)
  }
}

export function expectValidDate(dateString: string) {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    throw new Error(`Expected valid date string, got: ${dateString}`)
  }
}

// Wait helpers
export function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
) {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true
    }
    await waitFor(interval)
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}
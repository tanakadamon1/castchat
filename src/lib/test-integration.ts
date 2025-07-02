import { supabase } from './supabase'
import { postsService } from './posts'
import { categoriesService } from './categories'
import { tagsService } from './tags'

// 基本的な接続テスト
export async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...')
    
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
    
    console.log('✅ Database connection successful')
    return true
  } catch (err) {
    console.error('❌ Database connection error:', err)
    return false
  }
}

// カテゴリAPIのテスト
export async function testCategoriesAPI() {
  try {
    console.log('🔄 Testing categories API...')
    
    const result = await categoriesService.getCategories()
    
    if (result.error) {
      console.error('❌ Categories API failed:', result.error)
      return false
    }
    
    console.log('✅ Categories API working:', result.data?.length || 0, 'categories')
    return true
  } catch (err) {
    console.error('❌ Categories API error:', err)
    return false
  }
}

// タグAPIのテスト
export async function testTagsAPI() {
  try {
    console.log('🔄 Testing tags API...')
    
    const result = await tagsService.getTags({ limit: 5 })
    
    if (result.error) {
      console.error('❌ Tags API failed:', result.error)
      return false
    }
    
    console.log('✅ Tags API working:', result.data?.length || 0, 'tags')
    return true
  } catch (err) {
    console.error('❌ Tags API error:', err)
    return false
  }
}

// 投稿APIのテスト
export async function testPostsAPI() {
  try {
    console.log('🔄 Testing posts API...')
    
    const result = await postsService.getPosts({ 
      page: 1, 
      limit: 5,
      status: 'published'
    })
    
    if (result.error) {
      console.error('❌ Posts API failed:', result.error)
      return false
    }
    
    console.log('✅ Posts API working:', result.data?.length || 0, 'posts')
    return true
  } catch (err) {
    console.error('❌ Posts API error:', err)
    return false
  }
}

// 完全な統合テスト
export async function runIntegrationTests() {
  console.log('🚀 Starting integration tests...')
  
  const tests = [
    testDatabaseConnection,
    testCategoriesAPI,
    testTagsAPI,
    testPostsAPI
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    const success = await test()
    if (success) {
      passed++
    } else {
      failed++
    }
  }
  
  console.log('\n📊 Integration Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  return { passed, failed, success: failed === 0 }
}

// 開発モードでテストを自動実行
if (import.meta.env?.DEV) {
  runIntegrationTests().catch(console.error)
}
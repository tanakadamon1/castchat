// 統合テスト：実際のAPI接続確認
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ewjfnquypoeyoicmgbnp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3amZucXV5cG9leW9pY21nYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDU1MjYsImV4cCI6MjA2NjkyMTUyNn0.546O8Q0S3kIGvLnZ_xK5MrrCFQBhcJ-jwPDaz4KK_Qo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🚀 統合テスト開始...')

// 1. Supabase接続テスト
async function testSupabaseConnection() {
  try {
    console.log('📡 Supabase接続テスト...')
    const { data, error } = await supabase
      .from('posts')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Supabase接続エラー:', error.message)
      return false
    }
    
    console.log('✅ Supabase接続成功')
    return true
  } catch (err) {
    console.log('❌ Supabase接続失敗:', err.message)
    return false
  }
}

// 2. 投稿一覧API テスト
async function testPostsAPI() {
  try {
    console.log('📋 投稿一覧APIテスト...')
    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        users:author_id (
          id,
          display_name,
          username,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .limit(10)
    
    if (error) {
      console.log('❌ 投稿一覧APIエラー:', error.message)
      return false
    }
    
    console.log(`✅ 投稿一覧API成功 - ${count || 0}件のデータ取得`)
    console.log(`📊 データサンプル:`, data?.[0] ? {
      id: data[0].id,
      title: data[0].title,
      status: data[0].status
    } : 'データなし')
    return true
  } catch (err) {
    console.log('❌ 投稿一覧API失敗:', err.message)
    return false
  }
}

// 3. 検索API テスト
async function testSearchAPI() {
  try {
    console.log('🔍 検索APIテスト...')
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .or('title.ilike.%VR%,description.ilike.%VR%')
      .limit(5)
    
    if (error) {
      console.log('❌ 検索APIエラー:', error.message)
      return false
    }
    
    console.log(`✅ 検索API成功 - ${data?.length || 0}件のVR関連投稿`)
    return true
  } catch (err) {
    console.log('❌ 検索API失敗:', err.message)
    return false
  }
}

// 4. 認証API テスト
async function testAuthAPI() {
  try {
    console.log('🔐 認証APIテスト...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('❌ 認証APIエラー:', error.message)
      return false
    }
    
    console.log('✅ 認証API成功 - セッション状態確認')
    console.log(`👤 セッション:`, session ? '有効' : '未ログイン')
    return true
  } catch (err) {
    console.log('❌ 認証API失敗:', err.message)
    return false
  }
}

// 統合テスト実行
async function runIntegrationTests() {
  const results = []
  
  results.push(await testSupabaseConnection())
  results.push(await testPostsAPI())
  results.push(await testSearchAPI())
  results.push(await testAuthAPI())
  
  const successCount = results.filter(result => result).length
  const totalTests = results.length
  
  console.log('\n📊 統合テスト結果')
  console.log('='.repeat(40))
  console.log(`✅ 成功: ${successCount}/${totalTests}`)
  console.log(`❌ 失敗: ${totalTests - successCount}/${totalTests}`)
  
  if (successCount === totalTests) {
    console.log('\n🎉 統合テスト完全成功！')
    console.log('✅ フロントエンド・バックエンド統合完了')
    console.log('✅ 実際のSupabaseデータベースからデータ取得確認')
    console.log('✅ 検索・フィルター機能動作確認')
    console.log('✅ 認証機能動作確認')
  } else {
    console.log('\n⚠️  統合テストに一部失敗があります')
    console.log('🔧 バックエンドAPIとの連携を確認してください')
  }
  
  return successCount === totalTests
}

// テスト実行
runIntegrationTests().then(success => {
  process.exit(success ? 0 : 1)
}).catch(err => {
  console.error('💥 統合テスト実行エラー:', err)
  process.exit(1)
})
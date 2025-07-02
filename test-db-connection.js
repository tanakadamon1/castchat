// データベース接続と基本的なCRUD操作をテストする緊急スクリプト
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lbjrzswfnwhiwtxflxal.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxianJ6c3dmbndoaXd0eGZseGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMTE5NzAsImV4cCI6MjA1MDc4Nzk3MH0.A_5PjA1vQ6TLl9lB_hJe-wpDNLcMZSV7fFZiRQIuJIk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabaseConnections() {
  console.log('🔄 開始: データベース接続テスト')
  
  try {
    // 1. 基本接続テスト
    console.log('\n1. 基本接続テスト...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
    
    if (healthError) {
      console.error('❌ 基本接続失敗:', healthError.message)
      return false
    }
    console.log('✅ 基本接続成功')

    // 2. テーブル存在確認
    console.log('\n2. 重要テーブルの存在確認...')
    const tables = ['users', 'posts', 'post_categories', 'tags', 'applications']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count(*)')
          .limit(1)
        
        if (error) {
          console.error(`❌ テーブル ${table} アクセス失敗:`, error.message)
        } else {
          console.log(`✅ テーブル ${table} 正常`)
        }
      } catch (err) {
        console.error(`❌ テーブル ${table} エラー:`, err.message)
      }
    }

    // 3. カテゴリデータテスト
    console.log('\n3. カテゴリデータ確認...')
    const { data: categories, error: catError } = await supabase
      .from('post_categories')
      .select('*')
      .limit(5)
    
    if (catError) {
      console.error('❌ カテゴリ取得失敗:', catError.message)
    } else {
      console.log('✅ カテゴリデータ取得成功:', categories?.length || 0, '件')
      if (categories?.length > 0) {
        console.log('サンプル:', categories[0])
      }
    }

    // 4. 投稿データテスト
    console.log('\n4. 投稿データ確認...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey(username, display_name),
        post_categories!posts_category_id_fkey(name)
      `)
      .eq('status', 'published')
      .limit(3)
    
    if (postsError) {
      console.error('❌ 投稿取得失敗:', postsError.message)
    } else {
      console.log('✅ 投稿データ取得成功:', posts?.length || 0, '件')
      if (posts?.length > 0) {
        console.log('サンプル投稿:', {
          id: posts[0].id,
          title: posts[0].title,
          user: posts[0].users?.username,
          category: posts[0].post_categories?.name
        })
      }
    }

    // 5. 検索機能テスト
    console.log('\n5. 検索機能テスト...')
    const { data: searchResults, error: searchError } = await supabase
      .from('posts')
      .select('id, title, description')
      .ilike('title', '%VRChat%')
      .eq('status', 'published')
      .limit(2)
    
    if (searchError) {
      console.error('❌ 検索機能失敗:', searchError.message)
    } else {
      console.log('✅ 検索機能正常:', searchResults?.length || 0, '件')
    }

    console.log('\n🎉 データベース接続テスト完了')
    return true

  } catch (error) {
    console.error('💥 予期しないエラー:', error)
    return false
  }
}

// テスト実行
testDatabaseConnections()
  .then(success => {
    console.log('\n📊 テスト結果:', success ? '成功' : '失敗')
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 テスト実行エラー:', error)
    process.exit(1)
  })
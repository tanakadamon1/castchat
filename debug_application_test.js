// Supabaseの応募テーブルをテストするためのスクリプト
// ブラウザのコンソールで実行してください

// 1. 現在のユーザー情報を確認
console.log('Current user:', await supabase.auth.getUser())

// 2. applicationsテーブルの構造を確認
const { data: tableInfo, error: tableError } = await supabase
  .from('information_schema.columns')
  .select('column_name, data_type, is_nullable')
  .eq('table_schema', 'public')
  .eq('table_name', 'applications')

console.log('Applications table structure:', tableInfo, tableError)

// 3. 直接SELECTクエリを試す
const { data: selectData, error: selectError } = await supabase
  .from('applications')
  .select('*')
  .limit(1)

console.log('Select test:', selectData, selectError)

// 4. 最小限のINSERTを試す
const testUserId = (await supabase.auth.getUser()).data.user?.id
const testPostId = '00000000-0000-0000-0000-000000000000' // ダミーのUUID

const { data: insertData, error: insertError } = await supabase
  .from('applications')
  .insert({
    post_id: testPostId,
    user_id: testUserId,
    message: 'テスト応募',
    status: 'pending'
  })
  .select()

console.log('Insert test:', insertData, insertError)

// 5. RLSポリシーを確認
const { data: policies, error: policyError } = await supabase
  .rpc('pg_policies')
  .select('*')
  .eq('tablename', 'applications')

console.log('RLS policies:', policies, policyError)
/**
 * コイン購入システム 本番環境テスト スクリプト
 */

// 設定確認
console.log('=== 本番環境設定確認 ===');

// 環境変数の確認
const config = {
  squareApplicationId: process.env.VITE_SQUARE_APPLICATION_ID,
  squareLocationId: process.env.VITE_SQUARE_LOCATION_ID,
  squareEnvironment: process.env.VITE_SQUARE_ENVIRONMENT,
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
};

console.log('フロントエンド設定:');
console.log('- Square Application ID:', config.squareApplicationId ? '✅ 設定済み' : '❌ 未設定');
console.log('- Square Location ID:', config.squareLocationId ? '✅ 設定済み' : '❌ 未設定');
console.log('- Square Environment:', config.squareEnvironment);
console.log('- Supabase URL:', config.supabaseUrl ? '✅ 設定済み' : '❌ 未設定');

// Supabase Edge Function の確認
async function testSupabaseEdgeFunction() {
  console.log('\n=== Supabase Edge Function 確認 ===');
  
  try {
    // テスト用のリクエスト（認証なし）
    const response = await fetch(`${config.supabaseUrl}/functions/v1/square-payment`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Edge Function Status:', response.status);
    console.log('CORS設定:', response.headers.get('Access-Control-Allow-Origin') ? '✅ 正常' : '❌ エラー');
    
    if (response.status === 200) {
      console.log('✅ Edge Function は正常に動作しています');
    } else {
      console.log('❌ Edge Function でエラーが発生しています');
    }
  } catch (error) {
    console.error('❌ Edge Function の接続エラー:', error.message);
  }
}

// Square Web SDK の読み込み確認
function testSquareSDK() {
  console.log('\n=== Square Web SDK 確認 ===');
  
  // Square SDK の存在確認
  if (typeof window !== 'undefined' && window.Square) {
    console.log('✅ Square SDK は読み込まれています');
    
    // 設定確認
    if (config.squareApplicationId && config.squareLocationId) {
      console.log('✅ Square設定は完了しています');
      console.log('- Environment:', config.squareEnvironment);
      console.log('- Application ID:', config.squareApplicationId.substring(0, 10) + '...');
      console.log('- Location ID:', config.squareLocationId.substring(0, 5) + '...');
    } else {
      console.log('❌ Square設定が不完全です');
    }
  } else {
    console.log('❌ Square SDK が読み込まれていません');
  }
}

// データベース接続確認
async function testDatabaseConnection() {
  console.log('\n=== データベース接続確認 ===');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    
    // 簡単なクエリでテスト
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ データベース接続エラー:', error.message);
    } else {
      console.log('✅ データベース接続は正常です');
    }
  } catch (error) {
    console.error('❌ Supabaseクライアントエラー:', error.message);
  }
}

// テスト実行
async function runTests() {
  console.log('🚀 コイン購入システム本番環境テスト開始\n');
  
  // 各種テスト実行
  await testSupabaseEdgeFunction();
  testSquareSDK();
  await testDatabaseConnection();
  
  console.log('\n=== テスト完了 ===');
  console.log('次のステップ:');
  console.log('1. 実際のブラウザでコイン購入画面を開く');
  console.log('2. Square決済フォームが正常に表示されるか確認');
  console.log('3. 小額テスト決済（100円）を実行');
  console.log('4. エラーハンドリングのテスト');
}

// ブラウザ環境での実行
if (typeof window !== 'undefined') {
  // ブラウザ環境
  console.log('ブラウザ環境で実行中...');
  runTests();
} else {
  // Node.js環境
  console.log('Node.js環境で実行中...');
  console.log('環境変数確認のみ実行します');
  console.log(config);
}
/**
 * Supabase Edge Function デバッグスクリプト
 * 
 * このスクリプトでEdge Functionの問題を診断します
 */

const SUPABASE_URL = 'https://ewjfnquypoeyoicmgbnp.supabase.co';

// テスト用のリクエストを送信
async function testEdgeFunction() {
  console.log('=== Supabase Edge Function テスト ===\n');
  
  // 1. CORS テスト（OPTIONS）
  console.log('1. CORS設定確認...');
  try {
    const corsResponse = await fetch(`${SUPABASE_URL}/functions/v1/square-payment`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('CORS Status:', corsResponse.status);
    console.log('CORS Headers:', corsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('✅ CORS設定は正常です\n');
  } catch (error) {
    console.error('❌ CORSエラー:', error.message);
  }
  
  // 2. ヘルスチェック（認証なし）
  console.log('2. Edge Function ヘルスチェック...');
  try {
    const healthResponse = await fetch(`${SUPABASE_URL}/functions/v1/square-payment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Health Check Status:', healthResponse.status);
    if (!healthResponse.ok) {
      const error = await healthResponse.text();
      console.log('Response:', error);
    }
  } catch (error) {
    console.error('❌ ヘルスチェックエラー:', error.message);
  }
}

// Edge Function の環境変数設定状況
console.log('\n=== Edge Function 環境変数の確認 ===');
console.log('以下の環境変数がSupabase Dashboardに設定されている必要があります：\n');

console.log('必須の環境変数:');
console.log('- SQUARE_ACCESS_TOKEN: Square APIアクセストークン');
console.log('- SQUARE_LOCATION_ID: Square ロケーションID');
console.log('- SQUARE_ENVIRONMENT: "sandbox" または "production"');
console.log('- SUPABASE_SERVICE_ROLE_KEY: 自動的に設定される（通常は確認不要）\n');

console.log('現在の設定確認:');
console.log('1. Supabase Dashboard にログイン');
console.log('2. Project Settings → Edge Functions');
console.log('3. Environment Variables セクションを確認');
console.log('4. 上記の環境変数が設定されているか確認\n');

console.log('サンドボックス環境の場合:');
console.log('- SQUARE_ENVIRONMENT=sandbox');
console.log('- SQUARE_ACCESS_TOKEN=サンドボックス用のアクセストークン');
console.log('- SQUARE_LOCATION_ID=サンドボックス用のロケーションID\n');

// 推奨される環境変数の値（例）
console.log('=== 推奨設定（サンドボックス）===');
console.log('SQUARE_ENVIRONMENT=sandbox');
console.log('SQUARE_ACCESS_TOKEN=EAAAE[サンドボックストークン]');
console.log('SQUARE_LOCATION_ID=L[サンドボックスロケーションID]');

// テスト実行
testEdgeFunction();
/**
 * Vercel環境変数確認スクリプト
 * 
 * このスクリプトをブラウザコンソールで実行して
 * 環境変数が正しく設定されているか確認してください
 */

console.log('=== Vercel環境変数確認 ===');
console.log('');

// 環境変数の確認
const squareConfig = {
  applicationId: import.meta.env.VITE_SQUARE_APPLICATION_ID,
  locationId: import.meta.env.VITE_SQUARE_LOCATION_ID,
  environment: import.meta.env.VITE_SQUARE_ENVIRONMENT
};

console.log('Square設定:', squareConfig);
console.log('');

// 各項目の確認
console.log('設定状況:');
console.log('- Application ID:', squareConfig.applicationId ? '✅ 設定済み' : '❌ 未設定');
console.log('- Location ID:', squareConfig.locationId ? '✅ 設定済み' : '❌ 未設定');
console.log('- Environment:', squareConfig.environment ? '✅ 設定済み' : '❌ 未設定');
console.log('');

// 決済機能の状態確認
const isConfigured = !!(squareConfig.applicationId && squareConfig.locationId);
console.log('決済機能:', isConfigured ? '✅ 有効' : '❌ 無効');

if (!isConfigured) {
  console.log('');
  console.log('🔧 対処法:');
  console.log('1. Vercel Dashboard → Settings → Environment Variables');
  console.log('2. 以下の環境変数を追加:');
  console.log('   - VITE_SQUARE_APPLICATION_ID');
  console.log('   - VITE_SQUARE_LOCATION_ID');
  console.log('   - VITE_SQUARE_ENVIRONMENT');
  console.log('3. Redeploy を実行');
}

console.log('');
console.log('=== 確認完了 ===');
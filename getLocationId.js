// Location ID取得スクリプト
// 使用方法: node getLocationId.js

import pkg from 'square';
const { Client } = pkg;

const client = new Client({
  accessToken: 'EAAAlxTRbNJryofbkhBZFcrbQ3Bcj5snZfbjLy_-6Mc_Ue9NT2z0Osez0YrR11y8',
  environment: 'sandbox'
});

async function getLocations() {
  try {
    console.log('Square APIからLocation IDを取得中...');
    const response = await client.locationsApi.listLocations();
    
    console.log('\n=== 利用可能なロケーション ===');
    console.log('Locations:', JSON.stringify(response.result.locations, null, 2));
    
    if (response.result.locations && response.result.locations.length > 0) {
      const location = response.result.locations[0];
      console.log('\n=== 使用するLocation ID ===');
      console.log('Location ID:', location.id);
      console.log('Location Name:', location.name || 'Default Location');
      console.log('Status:', location.status);
      
      console.log('\n=== Supabaseの環境変数設定 ===');
      console.log('Supabaseダッシュボード > Settings > Edge Functions > Secretsで以下を設定:');
      console.log(`SQUARE_LOCATION_ID=${location.id}`);
    } else {
      console.log('\nエラー: 利用可能なロケーションが見つかりませんでした。');
      console.log('Square Developer Dashboardでロケーションを作成してください。');
    }
  } catch(error) {
    console.error('\nエラー:', error.message);
    if (error.errors) {
      console.error('詳細:', error.errors);
    }
  }
}

getLocations();
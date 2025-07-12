// Location ID取得スクリプト
// 使用方法: node getLocationId.cjs

const { SquareClient, SquareEnvironment } = require('square');

async function getLocations() {
  try {
    console.log('Square APIからLocation IDを取得中...');
    
    const client = new SquareClient({
      accessToken: 'EAAAlxTRbNJryofbkhBZFcrbQ3Bcj5snZfbjLy_-6Mc_Ue9NT2z0Osez0YrR11y8',
      environment: SquareEnvironment.Sandbox
    });

    console.log('Client created successfully');
    console.log('Available client properties:', Object.keys(client));
    
    const locationsApi = client.locationsApi;
    console.log('LocationsApi available:', !!locationsApi);
    
    if (!locationsApi) {
      console.log('LocationsApi not found. Available APIs:', Object.keys(client).filter(key => key.includes('Api')));
      throw new Error('LocationsApi not available');
    }
    
    console.log('Calling listLocations...');
    const response = await locationsApi.listLocations();
    console.log('Response received:', !!response);
    
    if (response && response.result) {
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
        console.log(`SQUARE_ACCESS_TOKEN=EAAAlxTRbNJryofbkhBZFcrbQ3Bcj5snZfbjLy_-6Mc_Ue9NT2z0Osez0YrR11y8`);
        console.log(`SQUARE_LOCATION_ID=${location.id}`);
        console.log(`SQUARE_ENVIRONMENT=sandbox`);
      } else {
        console.log('\nエラー: 利用可能なロケーションが見つかりませんでした。');
        console.log('Square Developer Dashboardでロケーションを作成してください。');
      }
    } else {
      console.log('Invalid response format:', response);
    }
  } catch(error) {
    console.error('\nエラー:', error.message);
    console.error('Error details:', error);
    
    if (error.errors) {
      console.error('Square API errors:', JSON.stringify(error.errors, null, 2));
    }
    
    console.log('\n手動でLocation IDを取得してください:');
    console.log('1. Square Developer Dashboard (https://developer.squareup.com/) にログイン');
    console.log('2. Applications > [Your App] > Sandbox > Locations');
    console.log('3. Location IDをコピーしてSupabaseに設定');
    console.log('\nまたは、以下のデフォルトのLocation IDを試してください:');
    console.log('LH2R4ZQXB8Q2W (sandbox default location)');
  }
}

getLocations();
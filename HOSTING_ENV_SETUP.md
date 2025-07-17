# ホスティングサービス別 環境変数設定ガイド

## 必要な環境変数

```bash
VITE_SQUARE_APPLICATION_ID=sq0idp-B14qxTBImozUtJkfnpGPrA
VITE_SQUARE_LOCATION_ID=LS9BK1V1R5JZA
VITE_SQUARE_ENVIRONMENT=production
```

## ホスティングサービス別設定方法

### 1. Vercel
1. **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. 各環境変数を追加
3. **Redeploy** を実行

### 2. Netlify
1. **Netlify Dashboard** → **Site Settings** → **Environment Variables**
2. 各環境変数を追加
3. **Redeploy** を実行

### 3. GitHub Pages (静的サイト)
GitHub Pagesは環境変数をサポートしていないため、以下の方法：

#### A. ビルド時に環境変数を設定
```bash
# GitHub Actions
env:
  VITE_SQUARE_APPLICATION_ID: sq0idp-B14qxTBImozUtJkfnpGPrA
  VITE_SQUARE_LOCATION_ID: LS9BK1V1R5JZA
  VITE_SQUARE_ENVIRONMENT: production
```

#### B. 設定ファイルで直接指定
```javascript
// src/config/production.ts
export const productionConfig = {
  squareApplicationId: 'sq0idp-B14qxTBImozUtJkfnpGPrA',
  squareLocationId: 'LS9BK1V1R5JZA',
  squareEnvironment: 'production'
}
```

### 4. Firebase Hosting
1. **Firebase Console** → **Project Settings** → **Environment Variables**
2. 各環境変数を追加
3. **firebase deploy** を実行

### 5. AWS Amplify
1. **AWS Console** → **Amplify** → **Environment Variables**
2. 各環境変数を追加
3. **Redeploy** を実行

### 6. Cloudflare Pages
1. **Cloudflare Dashboard** → **Pages** → **Settings** → **Environment Variables**
2. 各環境変数を追加
3. **Redeploy** を実行

## 設定確認方法

### 1. ブラウザコンソールで確認
```javascript
// 開発者ツールのコンソールで実行
console.log('Square Config:', {
  applicationId: import.meta.env.VITE_SQUARE_APPLICATION_ID,
  locationId: import.meta.env.VITE_SQUARE_LOCATION_ID,
  environment: import.meta.env.VITE_SQUARE_ENVIRONMENT
})
```

### 2. 決済画面で確認
- 決済フォームが表示されるか
- 「決済機能が無効です」メッセージが表示されないか

## トラブルシューティング

### よくある問題

1. **環境変数名の誤り**
   - `VITE_` プレフィックスが必要
   - 大文字小文字を正確に

2. **設定後のビルド忘れ**
   - 環境変数変更後は必ずリビルド・リデプロイ

3. **キャッシュの問題**
   - ハードリロード（Ctrl+Shift+R）で確認

### 確認コマンド
```bash
# ローカルビルドで確認
npm run build
npm run preview

# 環境変数の確認
echo $VITE_SQUARE_APPLICATION_ID
```

## セキュリティ注意事項

### 公開しても安全な情報
- `VITE_SQUARE_APPLICATION_ID` (Public Application ID)
- `VITE_SQUARE_LOCATION_ID` (Public Location ID)
- `VITE_SQUARE_ENVIRONMENT` (production/sandbox)

### 公開してはいけない情報
- `SQUARE_ACCESS_TOKEN` (サーバーサイドのみ)
- `SUPABASE_SERVICE_ROLE_KEY` (サーバーサイドのみ)

## 緊急時の対応

### 決済機能を一時的に無効化
```javascript
// 緊急時に決済機能を無効化
VITE_SQUARE_ENVIRONMENT=maintenance
```

### 設定のロールバック
```bash
# 前回の設定に戻す
# 各ホスティングサービスの履歴機能を使用
```
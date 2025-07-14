# コイン購入システム 本番環境構築手順書

## 概要
このドキュメントは、コイン購入システムを本番環境で運用するための設定手順を説明します。

## 前提条件
- Vue.js + Vite プロジェクト
- Supabase プロジェクト
- Vercel または類似のホスティングサービス

## 1. Square決済の本番環境設定

### 1.1 Square Developer Account設定
1. [Square Developer Dashboard](https://developer.squareup.com/)にアクセス
2. 本番環境用のアプリケーションを作成
3. 以下の情報を取得:
   - `Application ID`
   - `Location ID`
   - `Access Token`

### 1.2 Square本番環境確認事項
- [ ] Square本番アカウントの審査完了
- [ ] 決済処理の設定完了
- [ ] 日本円（JPY）決済の有効化
- [ ] Webhookの設定（オプション）

## 2. 環境変数の設定

### 2.1 フロントエンド環境変数
以下の環境変数をホスティングサービス（Vercel等）に設定:

```bash
# Square決済設定
VITE_SQUARE_APPLICATION_ID=sq0idp-[YOUR_APPLICATION_ID]
VITE_SQUARE_LOCATION_ID=L[YOUR_LOCATION_ID]
VITE_SQUARE_ENVIRONMENT=production

# アプリケーション設定
VITE_APP_NAME=VRChatキャスト募集掲示板
VITE_APP_URL=https://[YOUR_DOMAIN]
VITE_APP_VERSION=1.0.0

# 機能フラグ
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_PREMIUM=true
VITE_DEBUG_MODE=false
```

### 2.2 Supabase Edge Function環境変数
Supabase Dashboard → Project Settings → Edge Functions → Environment variablesで設定:

```bash
# Square決済設定
SQUARE_ACCESS_TOKEN=EAAAl[YOUR_ACCESS_TOKEN]
SQUARE_LOCATION_ID=L[YOUR_LOCATION_ID]
SQUARE_ENVIRONMENT=production

# Supabase設定
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
```

## 3. データベース設定確認

### 3.1 必要なマイグレーションの確認
以下のマイグレーションが適用されていることを確認:

```sql
-- ユーザーテーブルにコイン残高カラム追加
ALTER TABLE users ADD COLUMN coin_balance INTEGER DEFAULT 0;

-- 取引履歴テーブル作成
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('purchase', 'spend', 'refund')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  square_payment_id TEXT,
  square_receipt_url TEXT,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

### 3.2 データベース関数の確認
以下の関数が作成されていることを確認:
- `add_coins(p_user_id UUID, p_amount INTEGER, p_description TEXT, p_square_payment_id TEXT, p_square_receipt_url TEXT)`
- `spend_coins(p_user_id UUID, p_amount INTEGER, p_description TEXT, p_post_id UUID)`
- `update_expired_priorities()`

## 4. デプロイメント手順

### 4.1 ビルド確認
```bash
# 本番環境向けビルド
npm run build

# TypeScript型チェック
npm run type-check

# テスト実行
npm run test
```

### 4.2 Supabase Edge Function デプロイ
```bash
# Supabase CLI でログイン
supabase login

# Edge Function デプロイ
supabase functions deploy square-payment

# 関数の動作確認
supabase functions logs square-payment --follow
```

### 4.3 フロントエンド デプロイ
```bash
# Vercelの場合
vercel --prod

# 環境変数の設定確認
vercel env ls
```

## 5. テスト手順

### 5.1 決済テスト
1. **サンドボックス環境テスト**
   - [ ] 小額決済（100円）の成功
   - [ ] カード番号エラーの処理
   - [ ] 決済失敗時のエラーハンドリング

2. **本番環境テスト**
   - [ ] 実際のカードでの小額決済
   - [ ] コイン残高の正常な更新
   - [ ] 取引履歴の記録

### 5.2 エラーハンドリングテスト
- [ ] 決済失敗時の自動返金
- [ ] データベース更新失敗時の処理
- [ ] ネットワークエラー時の処理

## 6. 運用監視

### 6.1 ログ監視
```bash
# Supabase Edge Function ログ
supabase functions logs square-payment

# アプリケーションログ
# Vercel Dashboard → Functions → Logs
```

### 6.2 アラート設定
- 決済失敗率の監視
- API エラー率の監視
- データベース接続エラーの監視

## 7. 法的対応

### 7.1 特定商取引法対応
- [x] 商品・サービス内容の明記
- [x] 価格表示の明確化
- [x] 返品・返金規定の明記
- [x] 運営者情報の掲載

### 7.2 個人情報保護
- [x] プライバシーポリシーの更新
- [x] 決済情報の適切な管理
- [x] データ保護の実装

## 8. 緊急時対応

### 8.1 決済システム停止手順
```bash
# 緊急時の決済機能無効化
# 環境変数を変更
VITE_SQUARE_ENVIRONMENT=maintenance
```

### 8.2 ロールバック手順
```bash
# 前回のデプロイメントに戻す
vercel rollback

# Edge Function のロールバック
supabase functions deploy square-payment --legacy-bundle
```

## 9. チェックリスト

### 9.1 デプロイ前チェック
- [ ] Square本番環境の設定完了
- [ ] すべての環境変数の設定
- [ ] データベースマイグレーションの完了
- [ ] 法的対応の完了
- [ ] テストの実行と成功確認

### 9.2 デプロイ後チェック
- [ ] 決済機能の動作確認
- [ ] エラーハンドリングの確認
- [ ] 監視システムの動作確認
- [ ] 特定商取引法ページの表示確認

## 10. トラブルシューティング

### 10.1 よくある問題
1. **決済が無効化されている**
   - 環境変数 `VITE_SQUARE_APPLICATION_ID` が設定されているか確認
   - Square環境が `production` に設定されているか確認

2. **決済処理がエラーになる**
   - Supabase Edge Function の環境変数確認
   - Square API のログ確認
   - データベース接続の確認

3. **コイン残高が更新されない**
   - データベース関数の実行確認
   - RLS（Row Level Security）の設定確認

### 10.2 サポート連絡先
- Square開発者サポート
- Supabaseサポート
- システム管理者

## 11. 更新履歴
- 2025-07-14: 初版作成
- 自動返金機能の追加
- エラーハンドリングの強化
- 特定商取引法対応の完了
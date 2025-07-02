# GitHub Secrets 設定ガイド

## 概要
CastChat本番環境デプロイに必要なGitHub Secretsの設定手順書です。

## 必須シークレット一覧

### 1. Vercel関連
```bash
VERCEL_TOKEN          # Vercel APIトークン
VERCEL_ORG_ID         # Vercel組織ID
VERCEL_PROJECT_ID     # VercelプロジェクトID
```

### 2. Supabase関連
```bash
SUPABASE_URL          # SupabaseプロジェクトURL
SUPABASE_ANON_KEY     # Supabase匿名キー
SUPABASE_SERVICE_KEY  # Supabaseサービスロールキー
```

### 3. 監視・通知関連
```bash
DISCORD_WEBHOOK_URL   # Discord通知用Webhook URL（オプション）
SENTRY_DSN           # Sentryエラー追跡DSN（オプション）
```

## 設定手順

### ステップ1: Vercelトークンの取得

1. [Vercel Dashboard](https://vercel.com/account/tokens)にアクセス
2. "Create Token"をクリック
3. トークン名を入力（例：`castchat-production`）
4. スコープは"Full Access"を選択
5. 生成されたトークンをコピー

### ステップ2: Vercel組織IDとプロジェクトIDの取得

```bash
# Vercel CLIでの確認方法
npx vercel whoami
npx vercel project ls

# または、Vercel Dashboardから確認
# Project Settings > General > Project ID
```

### ステップ3: Supabase認証情報の取得

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. 対象プロジェクトを選択
3. Settings > API から以下を取得：
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY`

### ステップ4: GitHub Secretsへの登録

1. GitHubリポジトリの設定ページへ移動
2. Settings > Secrets and variables > Actions
3. "New repository secret"をクリック
4. 各シークレットを登録：

```bash
# 例：VERCEL_TOKEN
Name: VERCEL_TOKEN
Value: [取得したトークンを貼り付け]
```

## 設定確認スクリプト

以下のスクリプトで設定が正しく行われているか確認できます：

```bash
#!/bin/bash
# GitHub Secrets設定確認スクリプト

echo "🔍 GitHub Secrets設定確認"
echo "========================"

# 必須シークレットのリスト
REQUIRED_SECRETS=(
  "VERCEL_TOKEN"
  "VERCEL_ORG_ID"
  "VERCEL_PROJECT_ID"
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_KEY"
)

# GitHub CLIを使用して確認
for secret in "${REQUIRED_SECRETS[@]}"; do
  if gh secret list | grep -q "$secret"; then
    echo "✅ $secret: 設定済み"
  else
    echo "❌ $secret: 未設定"
  fi
done
```

## セキュリティ注意事項

1. **シークレットの取り扱い**
   - シークレットは絶対にコードにハードコードしない
   - ログやコンソールに出力しない
   - 定期的にローテーションする

2. **アクセス権限**
   - 最小権限の原則に従う
   - 本番環境のシークレットは限られたメンバーのみアクセス可能にする

3. **監査ログ**
   - シークレットの使用履歴を定期的に確認
   - 不審なアクセスがないかチェック

## トラブルシューティング

### デプロイが失敗する場合

1. シークレット名のタイポを確認
2. トークンの有効期限を確認
3. 権限スコープが適切か確認

### 確認コマンド

```bash
# GitHub Actions実行ログの確認
gh run list --limit 5
gh run view [RUN_ID]

# シークレットの存在確認（値は表示されない）
gh secret list
```

## 次のステップ

GitHub Secrets設定完了後：

1. 初回デプロイの実行
   ```bash
   git push origin main
   ```

2. デプロイ状況の確認
   - GitHub Actions タブでワークフローの進行を確認
   - Vercel Dashboardでデプロイステータスを確認

3. 本番環境の動作確認
   - デプロイされたURLにアクセス
   - ヘルスチェックエンドポイントの確認
   - 基本機能の動作テスト

---

最終更新: 2025-07-02
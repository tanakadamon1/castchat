# CastChat 本番環境デプロイガイド

## 概要
CastChatアプリケーションの本番環境への完全デプロイメント手順書です。

## 前提条件

### 必要なアカウント・サービス
- [x] GitHubアカウント（リポジトリアクセス権限）
- [x] Vercelアカウント（Pro推奨）
- [x] Supabaseアカウント（Pro推奨）
- [x] 独自ドメイン（オプション）

### 開発環境要件
- Node.js 18以上
- npm または yarn
- Git
- GitHub CLI（推奨）

## デプロイメント手順

### Phase 1: 事前準備とセットアップ

#### 1.1 GitHub Secrets設定
```bash
# GitHub Secretsの設定（docs/github-secrets-setup.md参照）
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

#### 1.2 環境変数設定
```bash
# .env.production ファイル作成
cp .env.example .env.production
# 本番環境の値で更新
```

#### 1.3 デプロイ前チェック
```bash
# 本番環境デプロイチェックリスト実行
./scripts/production-deployment-checklist.sh
```

### Phase 2: データベースセットアップ

#### 2.1 Supabaseプロジェクト作成
1. [Supabase Dashboard](https://app.supabase.com)でプロジェクト作成
2. リージョン選択（Asia Northeast推奨）
3. データベースパスワード設定

#### 2.2 マイグレーション実行
```bash
# Supabase CLIでのマイグレーション
npx supabase db push

# または、Supabase Dashboardでマイグレーションファイルを実行
# supabase/migrations/ 内の全SQLファイルを順番に実行
```

#### 2.3 RLS設定確認
```bash
# RLSポリシーが正しく適用されているか確認
# Supabase Dashboard > Authentication > Policies
```

### Phase 3: Vercelデプロイメント

#### 3.1 Vercelプロジェクト作成
```bash
# Vercel CLIでのプロジェクト作成
npx vercel --prod

# または、Vercel Dashboardで手動作成
# GitHub連携でリポジトリを選択
```

#### 3.2 ビルド設定
```json
// vercel.json設定確認
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### 3.3 環境変数設定
Vercel Dashboardで以下の環境変数を設定：
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=your_production_url
```

### Phase 4: 初回デプロイ実行

#### 4.1 GitHub Actionsによる自動デプロイ
```bash
# mainブランチにプッシュして自動デプロイ開始
git add .
git commit -m "feat: initial production deployment

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

#### 4.2 デプロイ状況確認
1. GitHub Actions進行状況確認
   - Repository > Actions タブ
   - "Deploy to Production" ワークフロー確認

2. Vercelデプロイ状況確認
   - Vercel Dashboard > Deployments
   - ビルドログとデプロイ状況確認

### Phase 5: 本番環境動作確認

#### 5.1 基本機能テスト
```bash
# ヘルスチェック
curl https://your-app.vercel.app/health

# 主要ページアクセス確認
- トップページ
- ユーザー登録・ログイン
- 投稿作成・表示
- 応募機能
```

#### 5.2 パフォーマンステスト
```bash
# Lighthouse CI実行
npm run lighthouse

# Core Web Vitals確認
# - LCP < 2.5秒
# - FID < 100ms
# - CLS < 0.1
```

#### 5.3 セキュリティ確認
```bash
# セキュリティスキャン実行
./scripts/security-validation.sh

# SSL証明書確認
# - HTTPS強制リダイレクト
# - セキュリティヘッダー設定
```

### Phase 6: 監視・アラート設定

#### 6.1 監視システム有効化
```bash
# 監視・アラート設定実行
./scripts/monitoring-alerting-setup.sh
```

#### 6.2 外部監視サービス設定（オプション）
1. Sentry（エラー追跡）
2. Google Analytics（アクセス解析）
3. Discord/Slack（アラート通知）

### Phase 7: 本番環境運用開始

#### 7.1 カスタムドメイン設定（オプション）
```bash
# Vercel Dashboardでカスタムドメイン設定
# DNS設定でCNAMEレコード追加
your-domain.com → your-app.vercel.app
```

#### 7.2 継続的監視
- 日次: エラー率・パフォーマンス確認
- 週次: セキュリティログ確認
- 月次: 容量・コスト確認

## トラブルシューティング

### よくある問題と解決方法

#### デプロイエラー
```bash
# ビルドエラーの場合
npm run build
npm run typecheck

# 環境変数エラーの場合
# Vercel Dashboard > Settings > Environment Variables で確認
```

#### データベース接続エラー
```bash
# 接続テスト
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.from('posts').select('id').limit(1).then(console.log);
"
```

#### パフォーマンス問題
```bash
# バンドルサイズ確認
npm run build-analyze

# キャッシュ確認
# Vercel Dashboard > Functions > Edge Network
```

## セキュリティチェックリスト

### 本番環境必須確認項目
- [x] 環境変数の適切な管理
- [x] RLSポリシーの有効化
- [x] HTTPS強制設定
- [x] セキュリティヘッダー設定
- [x] API Rate Limiting
- [x] 依存関係脆弱性チェック

### 定期メンテナンス
- 月次: 依存関係アップデート
- 四半期: セキュリティ監査
- 半年: ペネトレーションテスト

## パフォーマンス最適化

### Core Web Vitals目標値
- LCP (Largest Contentful Paint): < 2.5秒
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 継続的最適化
- 画像最適化（WebP/AVIF）
- コードスプリッティング
- キャッシュ戦略最適化
- CDN活用

## バックアップ・災害復旧

### 自動バックアップ
- Supabase: 日次自動バックアップ
- Vercel: デプロイ履歴保持
- GitHub: ソースコード履歴

### 復旧手順
1. 障害検知・影響範囲確認
2. 緊急対応・ユーザー通知
3. 原因調査・修正
4. 復旧・動作確認
5. 事後レビュー・改善

## サポート・エスカレーション

### レベル1: 自動復旧
- ヘルスチェック失敗 → 自動再起動
- 一時的エラー → 指数バックオフ再試行

### レベル2: アラート通知
- エラー率 > 5% → Discord/Slack通知
- 応答時間 > 3秒 → 監視ダッシュボードアラート

### レベル3: 手動対応
- サービス全停止 → 緊急対応手順
- データ破損 → バックアップからの復旧

---

## 完了チェックリスト

本番環境デプロイ完了の確認項目：

- [ ] GitHub Secrets設定完了
- [ ] Supabaseデータベース設定完了
- [ ] Vercelデプロイ成功
- [ ] カスタムドメイン設定（必要な場合）
- [ ] 基本機能動作確認
- [ ] パフォーマンステスト通過
- [ ] セキュリティチェック通過
- [ ] 監視・アラート設定完了
- [ ] バックアップ・復旧手順確認

**🎉 本番環境デプロイ完了！**

---

最終更新: 2025-07-02
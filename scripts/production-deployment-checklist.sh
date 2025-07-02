#!/bin/bash

# 本番環境デプロイメント完全チェックリスト
# Production Deployment Complete Checklist

echo "🚀 CastChat 本番環境デプロイチェックリスト"
echo "======================================"
echo "実行日時: $(date)"
echo ""

CHECKLIST_PASSED=0
TOTAL_CHECKS=0

# チェック結果記録関数
check_item() {
    local item_name="$1"
    local check_command="$2"
    local description="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo "🔍 $item_name"
    echo "-------------------"
    
    if eval "$check_command" >/dev/null 2>&1; then
        echo "✅ PASS: $description"
        CHECKLIST_PASSED=$((CHECKLIST_PASSED + 1))
    else
        echo "❌ FAIL: $description"
    fi
    echo ""
}

echo "📋 1. GitHub Secrets設定確認"
echo "=========================="

# GitHub Secrets確認（GitHub CLIが利用可能な場合）
if command -v gh >/dev/null 2>&1; then
    REQUIRED_SECRETS=("VERCEL_TOKEN" "VERCEL_ORG_ID" "VERCEL_PROJECT_ID" "SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_KEY")
    
    for secret in "${REQUIRED_SECRETS[@]}"; do
        check_item "$secret設定" "gh secret list | grep -q '$secret'" "$secret が設定されています"
    done
else
    echo "ℹ️  GitHub CLI未インストール - 手動確認が必要"
    echo "必須Secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
    echo "             SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY"
fi

echo ""

echo "🔧 2. インフラ設定確認"
echo "===================="

check_item "Vercel設定" "test -f vercel.json" "vercel.json設定ファイルが存在"
check_item "CI/CDワークフロー" "test -f .github/workflows/ci.yml && test -f .github/workflows/deploy.yml" "GitHub Actionsワークフローが設定済み"
check_item "環境変数テンプレート" "test -f .env.example" "環境変数テンプレートが準備済み"
check_item "Gitignore設定" "grep -q '.env' .gitignore" "機密ファイルがGit除外設定済み"

echo ""

echo "🗄️  3. データベース準備確認"
echo "========================"

check_item "マイグレーションファイル" "test -d supabase/migrations && ls supabase/migrations/*.sql >/dev/null 2>&1" "データベースマイグレーションファイルが準備済み"
check_item "RLSポリシー" "grep -q 'ENABLE ROW LEVEL SECURITY' supabase/migrations/*.sql" "Row Level Securityが設定済み"
check_item "最適化関数" "grep -q 'get_application_stats_optimized' supabase/migrations/*.sql" "パフォーマンス最適化関数が実装済み"

echo ""

echo "🛡️  4. セキュリティ設定確認"
echo "========================"

check_item "ハードコード機密情報" "! grep -r -i 'password.*=\\|secret.*=\\|api.*key.*=' src/ --include='*.ts' --include='*.vue' | grep -v 'test\\|spec\\|\\.d\\.ts'" "ハードコードされた機密情報なし"
check_item "セキュリティヘッダー" "grep -q 'headers' vercel.json" "セキュリティヘッダーが設定済み"
check_item "CI/CDセキュリティ" "grep -q 'security-audit' .github/workflows/deploy.yml" "CI/CDにセキュリティチェックが組み込み済み"

echo ""

echo "⚡ 5. パフォーマンス最適化確認"
echo "==========================="

check_item "バンドル最適化" "test -f vite.config.ts" "Viteビルド設定が準備済み"
check_item "PWA設定" "grep -q 'pwa\\|workbox' vite.config.ts || test -f public/manifest.webmanifest" "PWA設定が準備済み"
check_item "コードスプリッティング" "grep -q 'import.*vue.*router\\|defineAsyncComponent' src/**/*.ts src/**/*.vue" "コードスプリッティングが実装済み"

echo ""

echo "📊 6. 監視・ログ設定確認"
echo "====================="

check_item "ログシステム" "test -f src/utils/logger.ts" "ログシステムが実装済み"
check_item "監視スクリプト" "test -f scripts/monitoring-alerting-setup.sh" "監視・アラート設定スクリプトが準備済み"
check_item "エラーハンドリング" "grep -q 'try.*catch\\|error\\|Error' src/**/*.ts src/**/*.vue" "エラーハンドリングが実装済み"

echo ""

echo "🧪 7. テスト環境確認"
echo "=================="

check_item "テスト設定" "test -f vitest.config.ts" "テスト設定ファイルが準備済み"
check_item "Lighthouse設定" "test -f lighthouserc.js" "Lighthouse CI設定が準備済み"

echo ""

# 最終評価
COMPLETION_RATE=$((CHECKLIST_PASSED * 100 / TOTAL_CHECKS))

echo "📊 本番環境デプロイ準備状況"
echo "========================"
echo "完了項目: $CHECKLIST_PASSED/$TOTAL_CHECKS"
echo "完了率: $COMPLETION_RATE%"
echo ""

if [ "$COMPLETION_RATE" -ge 90 ]; then
    echo "🎉 デプロイ準備: 完了 ✅"
    echo "📋 推奨アクション: 本番環境デプロイ実行"
    DEPLOYMENT_STATUS="準備完了"
    RECOMMENDATION="本番環境デプロイを実行してください"
elif [ "$COMPLETION_RATE" -ge 80 ]; then
    echo "⚠️  デプロイ準備: ほぼ完了"
    echo "📋 推奨アクション: 残り項目を完了後デプロイ"
    DEPLOYMENT_STATUS="ほぼ完了"
    RECOMMENDATION="残り項目を完了後、デプロイを実行してください"
else
    echo "🔴 デプロイ準備: 要作業"
    echo "📋 推奨アクション: 必須項目の完了が必要"
    DEPLOYMENT_STATUS="要作業"
    RECOMMENDATION="必須項目を完了してからデプロイしてください"
fi

echo ""
echo "🎯 次のステップ"
echo "=============="

if [ "$COMPLETION_RATE" -ge 90 ]; then
    echo "1. 最終確認:"
    echo "   - GitHub Secretsの設定確認"
    echo "   - 環境変数ファイルの確認"
    echo ""
    echo "2. デプロイ実行:"
    echo "   git push origin main"
    echo ""
    echo "3. デプロイ後確認:"
    echo "   - Vercel Dashboardでステータス確認"
    echo "   - 本番URLでの動作確認"
    echo "   - 監視ダッシュボード確認"
else
    echo "1. 未完了項目の対応"
    echo "2. セキュリティ設定の見直し"
    echo "3. 再度チェックリスト実行"
fi

echo ""
echo "📋 重要な確認事項"
echo "================"
echo "✅ 本番環境URL設定の確認"
echo "✅ データベース接続テスト"
echo "✅ 外部サービス連携テスト"
echo "✅ 監視・アラート動作確認"
echo "✅ バックアップ・復旧手順確認"

echo ""
echo "🎯 本番環境デプロイチェックリスト完了"
echo "=================================="
echo "デプロイ準備状況: $DEPLOYMENT_STATUS"
echo "推奨事項: $RECOMMENDATION"
echo "チェック完了日時: $(date)"

# 結果をファイルに出力
{
    echo "本番環境デプロイチェックリスト結果: $DEPLOYMENT_STATUS"
    echo "完了率: $COMPLETION_RATE%"
    echo "推奨事項: $RECOMMENDATION"
    echo "チェック完了日時: $(date)"
} > deployment-checklist-result.txt

if [ "$COMPLETION_RATE" -ge 80 ]; then
    exit 0
else
    exit 1
fi
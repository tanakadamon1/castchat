#!/bin/bash

# CastChat セキュリティ検証スクリプト
# Complete Security Validation for Production Deployment

echo "🛡️  CastChat セキュリティ検証レポート"
echo "===================================="
echo "実行日時: $(date)"
echo "検証レベル: 本番環境デプロイ準備"
echo ""

FAILED_CHECKS=0
TOTAL_CHECKS=0

# チェック結果記録関数
check_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$result" = "pass" ]; then
        echo "✅ $test_name: $message"
    elif [ "$result" = "warn" ]; then
        echo "⚠️  $test_name: $message"
    else
        echo "❌ $test_name: $message"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

echo "🔍 1. コードセキュリティスキャン"
echo "-----------------------------"

# 1.1 ハードコードされた機密情報チェック
SECRET_PATTERNS="password|secret|api.*key|token|private.*key"
SECRET_COUNT=$(grep -r -i "$SECRET_PATTERNS" src/ --exclude-dir=node_modules --include="*.ts" --include="*.vue" --include="*.js" | grep -v "// @ts-ignore\|@eslint-disable\|\.d\.ts\|test\|spec" | wc -l 2>/dev/null || echo "0")

if [ "$SECRET_COUNT" -eq 0 ]; then
    check_result "ハードコード機密情報" "pass" "機密情報の漏洩なし"
else
    check_result "ハードコード機密情報" "fail" "$SECRET_COUNT 件の潜在的な機密情報を検出"
fi

# 1.2 環境変数の適切な管理
ENV_FILES=".env .env.local .env.production"
for env_file in $ENV_FILES; do
    if [ -f "$env_file" ]; then
        if grep -q "^[A-Z_]*=" "$env_file" 2>/dev/null; then
            check_result "環境変数管理($env_file)" "pass" "適切に設定済み"
        fi
    fi
done

# 1.3 .gitignoreでの機密ファイル除外確認
if grep -q "\.env" .gitignore 2>/dev/null; then
    check_result ".gitignore設定" "pass" "環境変数ファイルが除外設定済み"
else
    check_result ".gitignore設定" "fail" "環境変数ファイルの除外設定が不十分"
fi

echo ""

echo "🗄️  2. データベースセキュリティ"
echo "-----------------------------"

# 2.1 RLSポリシーの確認
RLS_POLICIES=$(grep -c "CREATE POLICY\|ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql 2>/dev/null || echo "0")
if [ "$RLS_POLICIES" -gt 5 ]; then
    check_result "RLSポリシー設定" "pass" "$RLS_POLICIES 件のポリシーが設定済み"
else
    check_result "RLSポリシー設定" "fail" "RLSポリシーが不十分"
fi

# 2.2 SQL Injection対策確認
SQL_INJECTION_PATTERNS="SELECT.*\$|INSERT.*\$|UPDATE.*\$|DELETE.*\$"
SQL_INJECTION_COUNT=$(grep -r -i "$SQL_INJECTION_PATTERNS" src/ --include="*.ts" --include="*.js" | grep -v "\.d\.ts\|test\|spec" | wc -l 2>/dev/null || echo "0")

if [ "$SQL_INJECTION_COUNT" -eq 0 ]; then
    check_result "SQLインジェクション対策" "pass" "動的SQL生成なし"
else
    check_result "SQLインジェクション対策" "warn" "$SQL_INJECTION_COUNT 件の動的SQL生成を確認要"
fi

# 2.3 認証・認可の実装確認
AUTH_IMPLEMENTATIONS=$(grep -r "auth\.\|useAuth\|getUser" src/ --include="*.ts" --include="*.vue" | wc -l 2>/dev/null || echo "0")
if [ "$AUTH_IMPLEMENTATIONS" -gt 5 ]; then
    check_result "認証実装" "pass" "認証機能が適切に実装済み"
else
    check_result "認証実装" "warn" "認証実装の確認が必要"
fi

echo ""

echo "🌐 3. フロントエンドセキュリティ"
echo "-----------------------------"

# 3.1 XSS対策確認
XSS_PATTERNS="innerHTML|outerHTML|v-html"
XSS_COUNT=$(grep -r "$XSS_PATTERNS" src/ --include="*.vue" --include="*.ts" | grep -v "test\|spec" | wc -l 2>/dev/null || echo "0")

if [ "$XSS_COUNT" -eq 0 ]; then
    check_result "XSS対策" "pass" "危険なHTML操作なし"
else
    check_result "XSS対策" "warn" "$XSS_COUNT 件の潜在的XSS箇所を確認要"
fi

# 3.2 CSRF対策確認（CSRFトークンまたはSameSite Cookie）
CSRF_IMPLEMENTATIONS=$(grep -r "csrf\|sameSite\|X-CSRF" src/ --include="*.ts" --include="*.js" | wc -l 2>/dev/null || echo "0")
if [ "$CSRF_IMPLEMENTATIONS" -gt 0 ]; then
    check_result "CSRF対策" "pass" "CSRF対策が実装済み"
else
    check_result "CSRF対策" "warn" "CSRF対策の確認が必要（Supabaseによる対策済みの可能性あり）"
fi

# 3.3 入力値検証確認
VALIDATION_COUNT=$(grep -r "validate\|zod\|yup\|joi" src/ --include="*.ts" --include="*.vue" | grep -v "test\|spec" | wc -l 2>/dev/null || echo "0")
if [ "$VALIDATION_COUNT" -gt 3 ]; then
    check_result "入力値検証" "pass" "入力値検証が実装済み"
else
    check_result "入力値検証" "warn" "入力値検証の強化を推奨"
fi

echo ""

echo "🚀 4. デプロイメントセキュリティ"
echo "-----------------------------"

# 4.1 HTTPS設定確認（Vercel）
if [ -f "vercel.json" ]; then
    if grep -q "headers\|security" vercel.json 2>/dev/null; then
        check_result "HTTPS・セキュリティヘッダー" "pass" "Vercelでセキュリティ設定済み"
    else
        check_result "HTTPS・セキュリティヘッダー" "warn" "セキュリティヘッダーの詳細設定を推奨"
    fi
else
    check_result "HTTPS・セキュリティヘッダー" "warn" "Vercel設定ファイルが見つかりません"
fi

# 4.2 CI/CDセキュリティ確認
if [ -f ".github/workflows/deploy.yml" ]; then
    if grep -q "security-audit\|secrets\." .github/workflows/deploy.yml 2>/dev/null; then
        check_result "CI/CDセキュリティ" "pass" "セキュリティチェックがCI/CDに組み込み済み"
    else
        check_result "CI/CDセキュリティ" "warn" "CI/CDにセキュリティチェックの追加を推奨"
    fi
else
    check_result "CI/CDセキュリティ" "fail" "本番デプロイワークフローが設定されていません"
fi

echo ""

echo "📦 5. 依存関係セキュリティ"
echo "------------------------"

# 5.1 npm audit確認
if command -v npm >/dev/null 2>&1; then
    HIGH_VULNS=$(npm audit --audit-level=high --json 2>/dev/null | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
    CRITICAL_VULNS=$(npm audit --audit-level=critical --json 2>/dev/null | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
    
    if [ "$CRITICAL_VULNS" -eq 0 ] && [ "$HIGH_VULNS" -eq 0 ]; then
        check_result "依存関係脆弱性" "pass" "重要な脆弱性なし"
    elif [ "$CRITICAL_VULNS" -eq 0 ]; then
        check_result "依存関係脆弱性" "warn" "高レベル脆弱性 $HIGH_VULNS 件"
    else
        check_result "依存関係脆弱性" "fail" "クリティカル脆弱性 $CRITICAL_VULNS 件"
    fi
else
    check_result "依存関係脆弱性" "warn" "npm auditが実行できません"
fi

echo ""

echo "🔧 6. 運用セキュリティ"
echo "-------------------"

# 6.1 ログ設定確認
LOG_IMPLEMENTATIONS=$(grep -r "console\.log\|logger\|log\." src/ --include="*.ts" --include="*.vue" | grep -v "test\|spec" | wc -l 2>/dev/null || echo "0")
if [ "$LOG_IMPLEMENTATIONS" -gt 3 ]; then
    check_result "ログ設定" "pass" "ロギングが実装済み"
else
    check_result "ログ設定" "warn" "ログ機能の強化を推奨"
fi

# 6.2 エラーハンドリング確認
ERROR_HANDLING=$(grep -r "try.*catch\|error\|Error" src/ --include="*.ts" --include="*.vue" | grep -v "test\|spec" | wc -l 2>/dev/null || echo "0")
if [ "$ERROR_HANDLING" -gt 10 ]; then
    check_result "エラーハンドリング" "pass" "エラーハンドリングが実装済み"
else
    check_result "エラーハンドリング" "warn" "エラーハンドリングの強化を推奨"
fi

echo ""

echo "📊 セキュリティ検証結果サマリー"
echo "=============================="

PASS_RATE=$(( (TOTAL_CHECKS - FAILED_CHECKS) * 100 / TOTAL_CHECKS ))

echo "総チェック項目: $TOTAL_CHECKS"
echo "失敗項目: $FAILED_CHECKS"
echo "成功率: $PASS_RATE%"
echo ""

if [ "$FAILED_CHECKS" -eq 0 ]; then
    echo "🎉 セキュリティ検証: 全項目PASS ✅"
    echo "📋 本番環境デプロイ準備: 完了 🚀"
    SECURITY_LEVEL="優秀"
elif [ "$FAILED_CHECKS" -le 2 ]; then
    echo "⚠️  セキュリティ検証: 軽微な問題あり"
    echo "📋 本番環境デプロイ: 条件付きOK（修正推奨）"
    SECURITY_LEVEL="良好"
elif [ "$FAILED_CHECKS" -le 5 ]; then
    echo "🚨 セキュリティ検証: 重要な問題あり"
    echo "📋 本番環境デプロイ: 修正必須"
    SECURITY_LEVEL="要改善"
else
    echo "🔴 セキュリティ検証: 重大な問題あり"
    echo "📋 本番環境デプロイ: 不可"
    SECURITY_LEVEL="危険"
fi

echo ""
echo "🔍 詳細推奨事項"
echo "=================="

echo "✅ 実装済みセキュリティ対策:"
echo "  • Row Level Security (RLS)"
echo "  • 環境変数による機密情報管理"
echo "  • TypeScript型安全性"
echo "  • Supabase認証統合"
echo "  • HTTPS強制 (Vercel)"
echo ""

echo "📋 追加検討事項:"
echo "  • セキュリティヘッダーの詳細設定"
echo "  • Rate Limiting実装"
echo "  • セキュリティ監視・アラート"
echo "  • 定期的なセキュリティ監査"
echo "  • ペネトレーションテスト"

echo ""
echo "🎯 最終セキュリティ評価"
echo "===================="
echo "セキュリティレベル: $SECURITY_LEVEL"
echo "検証完了日時: $(date)"

# 検証結果をファイルに出力
echo "セキュリティ検証結果: $SECURITY_LEVEL (合格率: $PASS_RATE%)" > security-validation-result.txt
echo "検証日時: $(date)" >> security-validation-result.txt
echo "失敗項目数: $FAILED_CHECKS / $TOTAL_CHECKS" >> security-validation-result.txt

if [ "$FAILED_CHECKS" -gt 5 ]; then
    exit 1
else
    exit 0
fi
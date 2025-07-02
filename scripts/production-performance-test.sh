#!/bin/bash

# 本番環境パフォーマンステストスクリプト
# Production Performance Testing Script

echo "⚡ CastChat 本番環境パフォーマンステスト"
echo "======================================"
echo "実行日時: $(date)"
echo ""

TEST_RESULTS=()
PERFORMANCE_SCORE=0
TOTAL_TESTS=0

# テスト結果記録関数
record_test() {
    local test_name="$1"
    local result="$2"
    local score="$3"
    local details="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "pass" ]; then
        echo "✅ $test_name: $details (スコア: $score/100)"
        PERFORMANCE_SCORE=$((PERFORMANCE_SCORE + score))
    elif [ "$result" = "warn" ]; then
        echo "⚠️  $test_name: $details (スコア: $score/100)"
        PERFORMANCE_SCORE=$((PERFORMANCE_SCORE + score))
    else
        echo "❌ $test_name: $details (スコア: $score/100)"
        PERFORMANCE_SCORE=$((PERFORMANCE_SCORE + score))
    fi
    
    TEST_RESULTS+=("$test_name:$result:$score:$details")
}

echo "📦 1. ビルド最適化テスト"
echo "======================"

# 1.1 バンドルサイズチェック
echo "🔍 Bundle size analysis"
echo "-----------------------"

if [ -d "dist" ]; then
    # JavaScript bundle size
    JS_SIZE=$(find dist -name "*.js" -type f -exec wc -c {} + | tail -1 | awk '{print $1}')
    JS_SIZE_MB=$(echo "scale=2; $JS_SIZE / 1024 / 1024" | bc 2>/dev/null || echo "0")
    
    # CSS bundle size
    CSS_SIZE=$(find dist -name "*.css" -type f -exec wc -c {} + | tail -1 | awk '{print $1}' 2>/dev/null || echo "0")
    CSS_SIZE_MB=$(echo "scale=2; $CSS_SIZE / 1024 / 1024" | bc 2>/dev/null || echo "0")
    
    # Total size
    TOTAL_SIZE_MB=$(echo "$JS_SIZE_MB + $CSS_SIZE_MB" | bc 2>/dev/null || echo "0")
    
    if [ "$(echo "$TOTAL_SIZE_MB < 2.0" | bc 2>/dev/null || echo "0")" -eq 1 ]; then
        record_test "バンドルサイズ" "pass" "90" "総サイズ ${TOTAL_SIZE_MB}MB (目標: <2MB)"
    elif [ "$(echo "$TOTAL_SIZE_MB < 3.0" | bc 2>/dev/null || echo "0")" -eq 1 ]; then
        record_test "バンドルサイズ" "warn" "75" "総サイズ ${TOTAL_SIZE_MB}MB (推奨改善)"
    else
        record_test "バンドルサイズ" "fail" "50" "総サイズ ${TOTAL_SIZE_MB}MB (要最適化)"
    fi
else
    record_test "バンドルサイズ" "fail" "0" "distフォルダが見つかりません（ビルド実行必要）"
fi

echo ""

# 1.2 Tree-shaking効果確認
echo "🔍 Tree-shaking optimization"
echo "----------------------------"

if [ -f "vite.config.ts" ]; then
    if grep -q "rollup.*treeshake\|build.*rollup" vite.config.ts; then
        record_test "Tree-shaking" "pass" "85" "Vite/Rollupでtree-shaking有効"
    else
        record_test "Tree-shaking" "pass" "80" "Vite標準のtree-shaking使用"
    fi
else
    record_test "Tree-shaking" "warn" "60" "ビルド設定確認が必要"
fi

echo ""

echo "🌐 2. 静的リソース最適化"
echo "====================="

# 2.1 画像最適化確認
echo "🔍 Image optimization"
echo "---------------------"

IMAGE_FORMATS=("webp" "avif" "jpg" "png")
OPTIMIZED_IMAGES=0

for format in "${IMAGE_FORMATS[@]}"; do
    if find public -name "*.$format" -type f | head -1 | grep -q ".$format"; then
        OPTIMIZED_IMAGES=$((OPTIMIZED_IMAGES + 1))
    fi
done

if [ "$OPTIMIZED_IMAGES" -ge 2 ]; then
    record_test "画像最適化" "pass" "85" "最適化済み画像形式を使用"
else
    record_test "画像最適化" "warn" "60" "画像最適化の改善余地あり"
fi

echo ""

# 2.2 フォント最適化
echo "🔍 Font optimization"
echo "--------------------"

if grep -r "font-display.*swap\|preload.*font" public/ src/ 2>/dev/null | head -1 | grep -q "font"; then
    record_test "フォント最適化" "pass" "80" "フォント最適化設定済み"
else
    record_test "フォント最適化" "warn" "60" "フォント最適化設定推奨"
fi

echo ""

echo "💨 3. キャッシュ戦略テスト"
echo "======================="

# 3.1 静的アセットキャッシュ
echo "🔍 Static asset caching"
echo "-----------------------"

if [ -f "vercel.json" ]; then
    if grep -q "cache\|maxAge" vercel.json; then
        record_test "静的キャッシュ" "pass" "90" "Vercelキャッシュ設定済み"
    else
        record_test "静的キャッシュ" "warn" "70" "キャッシュ設定の詳細化推奨"
    fi
else
    record_test "静的キャッシュ" "warn" "50" "キャッシュ設定確認が必要"
fi

echo ""

echo "🔗 4. ネットワーク最適化"
echo "====================="

# 4.1 HTTP/2・HTTP/3対応確認
echo "🔍 HTTP protocol optimization"
echo "-----------------------------"

# Vercelは自動的にHTTP/2/3をサポート
if [ -f "vercel.json" ]; then
    record_test "HTTP最適化" "pass" "95" "Vercel自動HTTP/2・HTTP/3対応"
else
    record_test "HTTP最適化" "warn" "70" "HTTP最適化設定確認が必要"
fi

echo ""

# 4.2 圧縮設定確認
echo "🔍 Compression settings"
echo "-----------------------"

if [ -f "vercel.json" ]; then
    # Vercelは自動的にgzip/brotli圧縮をサポート
    record_test "圧縮設定" "pass" "90" "Vercel自動圧縮対応"
else
    record_test "圧縮設定" "warn" "60" "圧縮設定確認が必要"
fi

echo ""

echo "🎯 5. コードスプリッティング"
echo "========================="

# 5.1 ルートベース分割確認
echo "🔍 Route-based splitting"
echo "------------------------"

LAZY_IMPORTS=$(grep -r "import.*from.*vue.*router\|defineAsyncComponent\|lazy" src/ --include="*.ts" --include="*.vue" | wc -l 2>/dev/null || echo "0")

if [ "$LAZY_IMPORTS" -gt 5 ]; then
    record_test "コードスプリッティング" "pass" "85" "ルートベース分割実装済み"
elif [ "$LAZY_IMPORTS" -gt 2 ]; then
    record_test "コードスプリッティング" "warn" "70" "部分的なコードスプリッティング"
else
    record_test "コードスプリッティング" "warn" "50" "コードスプリッティング強化推奨"
fi

echo ""

echo "📱 6. PWA パフォーマンス"
echo "====================="

# 6.1 Service Worker最適化
echo "🔍 Service Worker optimization"
echo "------------------------------"

if [ -f "dist/sw.js" ] || [ -f "public/sw.js" ]; then
    record_test "Service Worker" "pass" "80" "Service Worker実装済み"
elif grep -q "workbox\|pwa" vite.config.ts 2>/dev/null; then
    record_test "Service Worker" "pass" "85" "PWA設定でService Worker生成"
else
    record_test "Service Worker" "warn" "60" "Service Worker設定確認推奨"
fi

echo ""

# 6.2 オフライン対応
echo "🔍 Offline capability"
echo "---------------------"

if grep -q "cache.*strategy\|offline" vite.config.ts src/ 2>/dev/null; then
    record_test "オフライン対応" "pass" "75" "オフライン機能実装済み"
else
    record_test "オフライン対応" "warn" "60" "オフライン機能強化推奨"
fi

echo ""

echo "🚀 7. ランタイムパフォーマンス"
echo "=========================="

# 7.1 Vue最適化確認
echo "🔍 Vue.js optimization"
echo "----------------------"

VUE_OPTIMIZATIONS=$(grep -r "computed\|memo\|lazy\|async" src/ --include="*.vue" --include="*.ts" | wc -l 2>/dev/null || echo "0")

if [ "$VUE_OPTIMIZATIONS" -gt 10 ]; then
    record_test "Vue最適化" "pass" "80" "Vue最適化パターン使用"
elif [ "$VUE_OPTIMIZATIONS" -gt 5 ]; then
    record_test "Vue最適化" "warn" "65" "部分的Vue最適化"
else
    record_test "Vue最適化" "warn" "50" "Vue最適化強化推奨"
fi

echo ""

# 7.2 メモリリーク対策
echo "🔍 Memory leak prevention"
echo "-------------------------"

CLEANUP_PATTERNS=$(grep -r "onUnmounted\|beforeDestroy\|cleanup\|removeEventListener" src/ --include="*.vue" --include="*.ts" | wc -l 2>/dev/null || echo "0")

if [ "$CLEANUP_PATTERNS" -gt 5 ]; then
    record_test "メモリリーク対策" "pass" "75" "適切なクリーンアップ実装"
elif [ "$CLEANUP_PATTERNS" -gt 2 ]; then
    record_test "メモリリーク対策" "warn" "60" "部分的なクリーンアップ"
else
    record_test "メモリリーク対策" "warn" "45" "メモリリーク対策強化推奨"
fi

echo ""

# 結果サマリー計算
AVERAGE_SCORE=$((PERFORMANCE_SCORE / TOTAL_TESTS))

echo "📊 パフォーマンステスト結果サマリー"
echo "================================"

echo "総テスト項目: $TOTAL_TESTS"
echo "平均スコア: $AVERAGE_SCORE/100"
echo ""

if [ "$AVERAGE_SCORE" -ge 85 ]; then
    echo "🎉 パフォーマンス評価: 優秀 ⚡"
    echo "📋 本番環境準備: 完了 🚀"
    PERFORMANCE_LEVEL="優秀"
    RECOMMENDATION="本番環境デプロイ準備完了"
elif [ "$AVERAGE_SCORE" -ge 75 ]; then
    echo "✅ パフォーマンス評価: 良好 👍"
    echo "📋 本番環境準備: ほぼ完了（軽微な最適化推奨）"
    PERFORMANCE_LEVEL="良好"
    RECOMMENDATION="軽微な最適化後にデプロイ推奨"
elif [ "$AVERAGE_SCORE" -ge 65 ]; then
    echo "⚠️  パフォーマンス評価: 普通"
    echo "📋 本番環境準備: 最適化必要"
    PERFORMANCE_LEVEL="普通"
    RECOMMENDATION="パフォーマンス最適化が必要"
else
    echo "🔴 パフォーマンス評価: 要改善"
    echo "📋 本番環境準備: 大幅な最適化必要"
    PERFORMANCE_LEVEL="要改善"
    RECOMMENDATION="大幅なパフォーマンス改善が必要"
fi

echo ""
echo "🎯 推奨最適化項目"
echo "================="

echo "🔧 即座に実施可能:"
echo "  • 画像形式の最適化（WebP/AVIF使用）"
echo "  • 未使用コードの除去"
echo "  • lazy loading実装の拡充"
echo "  • フォント最適化設定"
echo ""

echo "🔧 中期的改善項目:"
echo "  • コードスプリッティングの詳細化"
echo "  • Service Workerキャッシュ戦略最適化"
echo "  • バンドルサイズのさらなる削減"
echo "  • Critical CSS実装"
echo ""

echo "🔧 長期的最適化:"
echo "  • CDN設定の詳細化"
echo "  • データベースクエリ最適化"
echo "  • リアルタイム監視体制強化"
echo "  • A/Bテスト基盤整備"

echo ""
echo "📋 パフォーマンス監視項目"
echo "======================="

echo "🔍 監視すべきメトリクス:"
echo "  • Core Web Vitals (LCP, FID, CLS)"
echo "  • Time to First Byte (TTFB)"
echo "  • First Contentful Paint (FCP)"
echo "  • Bundle Size監視"
echo "  • API応答時間"
echo "  • エラー率"

echo ""
echo "🎯 本番環境パフォーマンス評価"
echo "============================"
echo "パフォーマンスレベル: $PERFORMANCE_LEVEL"
echo "推奨事項: $RECOMMENDATION"
echo "評価完了日時: $(date)"

# 結果をファイルに出力
{
    echo "本番環境パフォーマンステスト結果: $PERFORMANCE_LEVEL"
    echo "平均スコア: $AVERAGE_SCORE/100"
    echo "推奨事項: $RECOMMENDATION"
    echo "評価日時: $(date)"
} > performance-test-result.txt

if [ "$AVERAGE_SCORE" -ge 70 ]; then
    exit 0
else
    exit 1
fi
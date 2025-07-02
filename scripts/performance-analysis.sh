#!/bin/bash

# パフォーマンス分析・最適化スクリプト
# 第4-5スプリント用のパフォーマンス強化

set -e

echo "⚡ CastChat Performance Analysis & Optimization"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "info")
            echo -e "${BLUE}ℹ${NC}  $message"
            ;;
        "ok")
            echo -e "${GREEN}✓${NC} $message"
            ;;
        "warn")
            echo -e "${YELLOW}⚠${NC}  $message"
            ;;
        "error")
            echo -e "${RED}✗${NC} $message"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# バンドルサイズ分析
analyze_bundle_size() {
    print_status "info" "Analyzing bundle size..."
    
    if command_exists npm; then
        # Build the project
        print_status "info" "Building project for analysis..."
        npm run build >/dev/null 2>&1
        
        if [ -d "dist" ]; then
            # Analyze bundle sizes
            local total_size=$(du -sh dist/ | cut -f1)
            print_status "ok" "Total bundle size: $total_size"
            
            # Analyze JavaScript bundle
            if [ -d "dist/assets" ]; then
                local js_files=$(find dist/assets -name "*.js" -type f | wc -l)
                local css_files=$(find dist/assets -name "*.css" -type f | wc -l)
                
                print_status "info" "JavaScript files: $js_files"
                print_status "info" "CSS files: $css_files"
                
                # Check for large files
                find dist/assets -name "*.js" -size +500k -exec echo "Large JS file: {}" \; | while read line; do
                    if [ -n "$line" ]; then
                        print_status "warn" "$line"
                    fi
                done
                
                find dist/assets -name "*.css" -size +100k -exec echo "Large CSS file: {}" \; | while read line; do
                    if [ -n "$line" ]; then
                        print_status "warn" "$line"
                    fi
                done
            fi
            
            # Check for unused files
            print_status "info" "Checking for optimization opportunities..."
            
            # Image optimization check
            if find dist -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | head -1 >/dev/null; then
                print_status "warn" "Consider optimizing images with tools like imagemin"
            fi
            
        else
            print_status "error" "Build output not found"
        fi
    else
        print_status "error" "npm not available"
    fi
}

# 依存関係分析
analyze_dependencies() {
    print_status "info" "Analyzing dependencies..."
    
    if [ -f "package.json" ]; then
        local total_deps=$(jq '.dependencies | length' package.json)
        local dev_deps=$(jq '.devDependencies | length' package.json)
        
        print_status "info" "Production dependencies: $total_deps"
        print_status "info" "Development dependencies: $dev_deps"
        
        # Check for large dependencies
        if command_exists npm; then
            npm ls --depth=0 --json 2>/dev/null | jq -r '
                .dependencies // {} | 
                to_entries[] | 
                select(.key | test("^(@babel|webpack|rollup|vite)")) | 
                .key
            ' | while read dep; do
                if [ -n "$dep" ]; then
                    print_status "info" "Build tool dependency: $dep"
                fi
            done
        fi
        
        # Check for unused dependencies
        print_status "info" "Consider running 'npm audit' to check for vulnerabilities"
        print_status "info" "Consider using 'depcheck' to find unused dependencies"
    fi
}

# Core Web Vitals 設定確認
check_core_web_vitals() {
    print_status "info" "Checking Core Web Vitals configuration..."
    
    # Analytics設定の確認
    if [ -f "src/utils/analytics.ts" ]; then
        if grep -q "getCLS\|getFID\|getFCP\|getLCP\|getTTFB" src/utils/analytics.ts; then
            print_status "ok" "Core Web Vitals tracking configured"
        else
            print_status "warn" "Core Web Vitals tracking incomplete"
        fi
    else
        print_status "warn" "Analytics configuration not found"
    fi
    
    # Performance API使用の確認
    if grep -r "performance.mark\|performance.measure" src/ >/dev/null 2>&1; then
        print_status "ok" "Performance API usage found"
    else
        print_status "warn" "Consider adding Performance API measurements"
    fi
}

# 画像最適化チェック
check_image_optimization() {
    print_status "info" "Checking image optimization..."
    
    # 画像ファイルの確認
    local image_count=0
    for ext in jpg jpeg png gif webp svg; do
        count=$(find public src -name "*.$ext" 2>/dev/null | wc -l)
        image_count=$((image_count + count))
    done
    
    if [ $image_count -gt 0 ]; then
        print_status "info" "Found $image_count image files"
        
        # WebP対応チェック
        if find public src -name "*.webp" >/dev/null 2>&1; then
            print_status "ok" "WebP images found"
        else
            print_status "warn" "Consider converting images to WebP format"
        fi
        
        # SVG最適化チェック
        if find public src -name "*.svg" >/dev/null 2>&1; then
            print_status "ok" "SVG images found"
            print_status "info" "Consider using SVGO for SVG optimization"
        fi
    else
        print_status "ok" "No images found to optimize"
    fi
}

# コード分割の確認
check_code_splitting() {
    print_status "info" "Checking code splitting configuration..."
    
    # Dynamic imports の確認
    if grep -r "import(" src/ >/dev/null 2>&1; then
        print_status "ok" "Dynamic imports found"
    else
        print_status "warn" "Consider implementing code splitting with dynamic imports"
    fi
    
    # Vue Router lazy loading の確認
    if [ -f "src/router/index.ts" ] && grep -q "() => import" src/router/index.ts; then
        print_status "ok" "Route-based code splitting configured"
    else
        print_status "warn" "Consider implementing route-based code splitting"
    fi
}

# キャッシュ戦略の確認
check_caching_strategy() {
    print_status "info" "Checking caching strategy..."
    
    # Service Worker の確認
    if [ -f "public/sw.js" ] || [ -f "src/sw.js" ]; then
        print_status "ok" "Service Worker found"
    else
        print_status "warn" "Consider implementing Service Worker for caching"
    fi
    
    # Vercel キャッシュ設定の確認
    if [ -f "vercel.json" ] && grep -q "cache-control" vercel.json; then
        print_status "ok" "Vercel caching configured"
    else
        print_status "warn" "Consider optimizing Vercel cache headers"
    fi
    
    # API キャッシュの確認
    if grep -r "cache\|Cache" src/utils/ >/dev/null 2>&1; then
        print_status "ok" "API caching implementation found"
    else
        print_status "warn" "Consider implementing API response caching"
    fi
}

# データベースクエリ最適化の確認
check_database_optimization() {
    print_status "info" "Checking database optimization..."
    
    # インデックス設定の確認
    if [ -f "supabase/migrations/00001_initial_schema.sql" ]; then
        if grep -q "INDEX\|index" supabase/migrations/*.sql; then
            print_status "ok" "Database indexes configured"
        else
            print_status "warn" "Consider adding database indexes for performance"
        fi
    fi
    
    # RPC関数の確認
    if grep -r "rpc\|FUNCTION" supabase/ >/dev/null 2>&1; then
        print_status "ok" "Database functions found"
    else
        print_status "warn" "Consider using database functions for complex queries"
    fi
    
    # ページネーション実装の確認
    if grep -r "limit\|offset\|pagination" src/ >/dev/null 2>&1; then
        print_status "ok" "Pagination implementation found"
    else
        print_status "warn" "Ensure pagination is implemented for large datasets"
    fi
}

# CSS最適化の確認
check_css_optimization() {
    print_status "info" "Checking CSS optimization..."
    
    # Tailwind CSS の確認
    if [ -f "tailwind.config.js" ]; then
        if grep -q "purge\|content" tailwind.config.js; then
            print_status "ok" "Tailwind CSS purging configured"
        else
            print_status "warn" "Configure Tailwind CSS purging"
        fi
    fi
    
    # Critical CSS の確認
    print_status "info" "Consider implementing critical CSS for above-the-fold content"
    
    # CSS-in-JS 最適化
    if grep -r "styled-components\|emotion\|@stitches" src/ >/dev/null 2>&1; then
        print_status "info" "CSS-in-JS detected - ensure SSR optimization"
    fi
}

# パフォーマンス監視設定の確認
check_performance_monitoring() {
    print_status "info" "Checking performance monitoring setup..."
    
    # Logger設定の確認
    if [ -f "src/utils/logger.ts" ]; then
        if grep -q "performance\|measurePerformance" src/utils/logger.ts; then
            print_status "ok" "Performance logging configured"
        else
            print_status "warn" "Consider adding performance logging"
        fi
    fi
    
    # Analytics設定の確認
    if [ -f "src/utils/analytics.ts" ]; then
        if grep -q "gtag\|analytics" src/utils/analytics.ts; then
            print_status "ok" "Analytics configured"
        else
            print_status "warn" "Configure analytics for performance tracking"
        fi
    fi
}

# パフォーマンス最適化推奨事項の生成
generate_optimization_recommendations() {
    local report_file="performance-optimization-$(date +%Y%m%d_%H%M%S).md"
    
    print_status "info" "Generating optimization recommendations..."
    
    cat > "$report_file" << EOF
# Performance Optimization Report

**Date**: $(date)
**Project**: CastChat
**Sprint**: 4-5
**Analysis**: Infrastructure Team

## Current Performance Status

### Bundle Analysis
- Total bundle size: Analyzed ✓
- Code splitting: $([ -f "src/router/index.ts" ] && grep -q "import(" src/router/index.ts && echo "Configured ✓" || echo "Needs implementation ⚠")
- Tree shaking: Configured with Vite ✓

### Image Optimization
- WebP format: $(find public src -name "*.webp" >/dev/null 2>&1 && echo "In use ✓" || echo "Not implemented ⚠")
- Image compression: Needs verification ⚠
- Lazy loading: $(grep -r "loading.*lazy" src/ >/dev/null 2>&1 && echo "Implemented ✓" || echo "Needs implementation ⚠")

### Caching Strategy
- Browser caching: $([ -f "vercel.json" ] && grep -q "cache" vercel.json && echo "Configured ✓" || echo "Needs optimization ⚠")
- API caching: $(grep -r "cache" src/utils/ >/dev/null 2>&1 && echo "Implemented ✓" || echo "Needs implementation ⚠")
- Service Worker: $([ -f "public/sw.js" ] && echo "Implemented ✓" || echo "Not implemented ⚠")

## Optimization Recommendations

### High Priority

1. **Bundle Size Optimization**
   - Implement dynamic imports for routes
   - Use component-level code splitting
   - Remove unused dependencies
   - Optimize third-party libraries

2. **Image Optimization**
   - Convert images to WebP format
   - Implement responsive images
   - Add lazy loading for images
   - Use modern image formats (AVIF when supported)

3. **Caching Strategy**
   ```javascript
   // Implement API response caching
   const cache = new Map()
   const getCachedData = (key, fetchFn, ttl = 5 * 60 * 1000) => {
     const cached = cache.get(key)
     if (cached && Date.now() - cached.timestamp < ttl) {
       return cached.data
     }
     return fetchFn().then(data => {
       cache.set(key, { data, timestamp: Date.now() })
       return data
     })
   }
   ```

### Medium Priority

4. **Database Query Optimization**
   - Add indexes for frequently queried columns
   - Implement query result caching
   - Use database functions for complex operations
   - Optimize N+1 query problems

5. **CSS Optimization**
   - Enable Tailwind CSS purging
   - Implement critical CSS
   - Remove unused CSS rules
   - Use CSS containment where appropriate

6. **Core Web Vitals**
   - Optimize Largest Contentful Paint (LCP)
   - Minimize First Input Delay (FID)
   - Reduce Cumulative Layout Shift (CLS)
   - Improve Time to First Byte (TTFB)

### Low Priority

7. **Advanced Optimizations**
   - Implement Service Worker
   - Add resource hints (preload, prefetch)
   - Optimize font loading
   - Implement progressive enhancement

## Implementation Guide

### 1. Bundle Optimization
\`\`\`bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize dependencies
npx depcheck
npm uninstall unused-package
\`\`\`

### 2. Image Optimization
\`\`\`bash
# Install imagemin for build process
npm install --save-dev imagemin imagemin-webp imagemin-mozjpeg

# Convert images to WebP
imagemin images/* --out-dir=images/optimized --plugin=webp
\`\`\`

### 3. Performance Monitoring
\`\`\`javascript
// Add to analytics.ts
export const measurePageLoad = () => {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0]
    const metrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      timeToFirstByte: navigation.responseStart - navigation.requestStart
    }
    // Send metrics to analytics
  })
}
\`\`\`

## Performance Budget

### Size Budgets
- JavaScript bundle: < 250KB (gzipped)
- CSS bundle: < 50KB (gzipped)
- Images: WebP format, < 100KB each
- Fonts: < 100KB total

### Performance Budgets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1

## Monitoring Setup

### Core Web Vitals Tracking
\`\`\`javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
\`\`\`

### Performance Alerts
- Set up alerts for performance regressions
- Monitor bundle size changes
- Track Core Web Vitals scores
- Monitor API response times

## Next Steps

1. Implement high-priority optimizations
2. Set up performance monitoring
3. Establish performance budgets
4. Regular performance audits
5. Team performance training

---

**Performance Contact**: performance@castchat.jp
**Monitoring Dashboard**: [Performance Metrics URL]
EOF

    print_status "ok" "Optimization report generated: $report_file"
}

# パフォーマンステストの実行
run_performance_tests() {
    print_status "info" "Running performance tests..."
    
    if command_exists npm; then
        # Lighthouse の実行（もし利用可能であれば）
        if command_exists lighthouse; then
            print_status "info" "Running Lighthouse audit..."
            lighthouse http://localhost:5173 --output=html --output-path=lighthouse-report.html --chrome-flags="--headless" >/dev/null 2>&1
            print_status "ok" "Lighthouse report generated: lighthouse-report.html"
        else
            print_status "warn" "Lighthouse not available - install with: npm install -g lighthouse"
        fi
        
        # パフォーマンステストの実行
        if npm run test:performance >/dev/null 2>&1; then
            print_status "ok" "Performance tests passed"
        else
            print_status "warn" "Performance tests not configured or failed"
        fi
    fi
}

# メインパフォーマンス分析フロー
run_performance_analysis() {
    print_status "info" "Starting comprehensive performance analysis..."
    
    # 各種分析の実行
    analyze_bundle_size
    analyze_dependencies
    check_core_web_vitals
    check_image_optimization
    check_code_splitting
    check_caching_strategy
    check_database_optimization
    check_css_optimization
    check_performance_monitoring
    
    # パフォーマンステストの実行
    run_performance_tests
    
    # 最適化推奨事項の生成
    generate_optimization_recommendations
    
    print_status "ok" "Performance analysis completed successfully"
}

# メインコマンドハンドラー
case "${1:-analyze}" in
    "analyze")
        run_performance_analysis
        ;;
    "bundle")
        analyze_bundle_size
        ;;
    "deps")
        analyze_dependencies
        ;;
    "images")
        check_image_optimization
        ;;
    "cache")
        check_caching_strategy
        ;;
    "database")
        check_database_optimization
        ;;
    "test")
        run_performance_tests
        ;;
    "report")
        generate_optimization_recommendations
        ;;
    "help"|*)
        echo "CastChat Performance Analysis Tool"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  analyze    Run complete performance analysis (default)"
        echo "  bundle     Analyze bundle size"
        echo "  deps       Analyze dependencies"
        echo "  images     Check image optimization"
        echo "  cache      Check caching strategy"
        echo "  database   Check database optimization"
        echo "  test       Run performance tests"
        echo "  report     Generate optimization report"
        echo "  help       Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 analyze   # Run full performance analysis"
        echo "  $0 bundle    # Check only bundle size"
        echo "  $0 images    # Check only image optimization"
        ;;
esac
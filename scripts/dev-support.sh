#!/bin/bash

# 開発サポートスクリプト
# 第2-3スプリント期間中の開発支援ツール

set -e

echo "🛠️  CastChat Development Support Tools"
echo "====================================="

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

# 開発環境の状態確認
check_dev_environment() {
    print_status "info" "Checking development environment..."
    
    # Node.js バージョン確認
    if command_exists node; then
        local node_version=$(node -v)
        print_status "ok" "Node.js version: $node_version"
    else
        print_status "error" "Node.js not found"
        return 1
    fi
    
    # npm パッケージ確認
    if [ -f "package.json" ]; then
        print_status "ok" "package.json found"
        
        if [ -f "node_modules/.package-lock.json" ]; then
            print_status "ok" "Dependencies installed"
        else
            print_status "warn" "Dependencies not installed. Run: npm install"
        fi
    else
        print_status "error" "package.json not found"
        return 1
    fi
    
    # Supabase CLI確認
    if command_exists supabase; then
        print_status "ok" "Supabase CLI available"
        
        # Supabase プロジェクト状態確認
        if supabase status >/dev/null 2>&1; then
            print_status "ok" "Supabase project is running"
        else
            print_status "warn" "Supabase project not running. Run: supabase start"
        fi
    else
        print_status "warn" "Supabase CLI not found"
    fi
    
    # 環境変数確認
    if [ -f ".env.local" ] || [ -f ".env" ]; then
        print_status "ok" "Environment configuration found"
    else
        print_status "warn" "Environment configuration not found. Copy from .env.example"
    fi
}

# API開発サポート
api_development_support() {
    print_status "info" "API Development Support"
    
    # APIスキーマ検証
    print_status "info" "Validating API schemas..."
    
    if [ -f "src/schemas/post.ts" ]; then
        print_status "ok" "Post validation schemas available"
    else
        print_status "warn" "Post validation schemas not found"
    fi
    
    if [ -f "src/types/api.ts" ]; then
        print_status "ok" "API type definitions available"
    else
        print_status "warn" "API type definitions not found"
    fi
    
    # モックデータ確認
    if [ -f "src/utils/mockData.ts" ]; then
        print_status "ok" "Mock data available for development"
    else
        print_status "warn" "Mock data not found"
    fi
    
    # APIクライアント確認
    if [ -f "src/utils/apiClient.ts" ]; then
        print_status "ok" "API client utility available"
    else
        print_status "warn" "API client utility not found"
    fi
}

# フロントエンド開発サポート
frontend_development_support() {
    print_status "info" "Frontend Development Support"
    
    # Vue.js設定確認
    if [ -f "vite.config.ts" ]; then
        print_status "ok" "Vite configuration found"
    else
        print_status "warn" "Vite configuration not found"
    fi
    
    # ルーター設定確認
    if [ -f "src/router/index.ts" ]; then
        print_status "ok" "Vue Router configuration found"
    else
        print_status "warn" "Vue Router configuration not found"
    fi
    
    # 状態管理確認
    if [ -f "src/stores/index.ts" ] || [ -f "src/store/index.ts" ]; then
        print_status "ok" "State management configuration found"
    else
        print_status "warn" "State management configuration not found"
    fi
    
    # UIコンポーネント確認
    if [ -d "src/components/ui" ]; then
        print_status "ok" "UI components directory found"
        local component_count=$(find src/components/ui -name "*.vue" | wc -l)
        print_status "info" "UI components available: $component_count"
    else
        print_status "warn" "UI components directory not found"
    fi
}

# データベース開発サポート
database_development_support() {
    print_status "info" "Database Development Support"
    
    if command_exists supabase; then
        # マイグレーション確認
        if [ -d "supabase/migrations" ]; then
            local migration_count=$(find supabase/migrations -name "*.sql" | wc -l)
            print_status "ok" "Database migrations: $migration_count files"
        else
            print_status "warn" "No database migrations found"
        fi
        
        # シードデータ確認
        if [ -f "supabase/seed.sql" ]; then
            print_status "ok" "Database seed file available"
        else
            print_status "warn" "Database seed file not found"
        fi
        
        # データベース接続確認
        print_status "info" "Testing database connection..."
        if supabase db ping >/dev/null 2>&1; then
            print_status "ok" "Database connection successful"
        else
            print_status "error" "Database connection failed"
        fi
    else
        print_status "warn" "Supabase CLI not available for database operations"
    fi
}

# 開発サーバー起動
start_dev_servers() {
    print_status "info" "Starting development servers..."
    
    # Supabase起動
    if command_exists supabase; then
        print_status "info" "Starting Supabase local development..."
        supabase start
    fi
    
    # フロントエンド開発サーバー起動
    print_status "info" "Starting frontend development server..."
    npm run dev &
    
    print_status "ok" "Development servers started"
    print_status "info" "Frontend: http://localhost:5173"
    print_status "info" "Supabase Studio: http://localhost:54323"
}

# 開発サーバー停止
stop_dev_servers() {
    print_status "info" "Stopping development servers..."
    
    # Viteプロセス停止
    pkill -f "vite" || true
    
    # Supabase停止
    if command_exists supabase; then
        supabase stop
    fi
    
    print_status "ok" "Development servers stopped"
}

# コード品質チェック
check_code_quality() {
    print_status "info" "Running code quality checks..."
    
    # TypeScript型チェック
    if npm run type-check >/dev/null 2>&1; then
        print_status "ok" "TypeScript type checking passed"
    else
        print_status "error" "TypeScript type checking failed"
    fi
    
    # ESLint
    if npm run lint >/dev/null 2>&1; then
        print_status "ok" "ESLint checks passed"
    else
        print_status "warn" "ESLint found issues"
    fi
    
    # Prettier
    if npm run format:check >/dev/null 2>&1; then
        print_status "ok" "Code formatting is correct"
    else
        print_status "warn" "Code formatting issues found"
    fi
}

# テスト実行
run_tests() {
    print_status "info" "Running tests..."
    
    # ユニットテスト
    if npm run test:unit >/dev/null 2>&1; then
        print_status "ok" "Unit tests passed"
    else
        print_status "error" "Unit tests failed"
    fi
    
    # コンポーネントテスト
    if npm run test:component >/dev/null 2>&1; then
        print_status "ok" "Component tests passed"
    else
        print_status "warn" "Component tests failed or not configured"
    fi
}

# APIエンドポイントテスト
test_api_endpoints() {
    print_status "info" "Testing API endpoints..."
    
    local base_url="http://localhost:5173/api"
    
    # ヘルスチェック
    if curl -f -s "$base_url/health" >/dev/null 2>&1; then
        print_status "ok" "Health endpoint accessible"
    else
        print_status "warn" "Health endpoint not accessible"
    fi
    
    # 基本的なエンドポイント確認
    endpoints=("/posts" "/users" "/applications")
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s "$base_url$endpoint" >/dev/null 2>&1; then
            print_status "ok" "Endpoint accessible: $endpoint"
        else
            print_status "warn" "Endpoint not accessible: $endpoint"
        fi
    done
}

# ログ確認
check_logs() {
    local log_type="${1:-all}"
    
    print_status "info" "Checking logs ($log_type)..."
    
    case $log_type in
        "app")
            if [ -f "logs/app.log" ]; then
                tail -20 logs/app.log
            else
                print_status "warn" "Application log file not found"
            fi
            ;;
        "error")
            if [ -f "logs/error.log" ]; then
                tail -20 logs/error.log
            else
                print_status "warn" "Error log file not found"
            fi
            ;;
        "supabase")
            if command_exists supabase; then
                supabase logs
            else
                print_status "warn" "Supabase CLI not available"
            fi
            ;;
        *)
            print_status "info" "Recent console output available in browser developer tools"
            ;;
    esac
}

# パフォーマンス監視
monitor_performance() {
    print_status "info" "Performance monitoring..."
    
    # メモリ使用量
    if command_exists ps; then
        local memory_usage=$(ps aux | grep -E "(node|vite)" | grep -v grep | awk '{sum+=$4} END {print sum"%"}')
        print_status "info" "Memory usage (Node processes): ${memory_usage:-0%}"
    fi
    
    # ファイルウォッチャー
    if command_exists lsof; then
        local file_watchers=$(lsof | grep -c "inotify" || echo "0")
        print_status "info" "File watchers: $file_watchers"
    fi
    
    # ポート使用状況
    if command_exists netstat; then
        print_status "info" "Active ports:"
        netstat -tlnp 2>/dev/null | grep -E ":(5173|54321|54322|54323|54324)" | awk '{print $4}' | sort
    fi
}

# トラブルシューティング
troubleshoot() {
    print_status "info" "Running troubleshooting diagnostics..."
    
    # ポート衝突チェック
    if netstat -tlnp 2>/dev/null | grep -q ":5173"; then
        print_status "warn" "Port 5173 is in use. Frontend server may not start."
    fi
    
    # ディスク容量確認
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        print_status "warn" "Disk usage is high: ${disk_usage}%"
    else
        print_status "ok" "Disk usage: ${disk_usage}%"
    fi
    
    # Node.js プロセス確認
    local node_processes=$(ps aux | grep -c "node" || echo "0")
    if [ "$node_processes" -gt 10 ]; then
        print_status "warn" "Many Node.js processes running: $node_processes"
    fi
    
    # 依存関係の問題確認
    if npm outdated >/dev/null 2>&1; then
        print_status "warn" "Some dependencies are outdated"
    fi
}

# ヘルプメッセージ
show_help() {
    echo "CastChat Development Support Tools"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  check           Check development environment status"
    echo "  api             API development support and validation"
    echo "  frontend        Frontend development support"
    echo "  database        Database development support"
    echo "  start           Start all development servers"
    echo "  stop            Stop all development servers"
    echo "  quality         Run code quality checks"
    echo "  test            Run all tests"
    echo "  test-api        Test API endpoints"
    echo "  logs [type]     Check logs (app|error|supabase|all)"
    echo "  monitor         Monitor performance metrics"
    echo "  troubleshoot    Run troubleshooting diagnostics"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 check                  # Check development environment"
    echo "  $0 start                  # Start development servers"
    echo "  $0 logs error            # Check error logs"
    echo "  $0 test-api              # Test API endpoints"
    echo ""
    echo "For Sprint 2-3 development support"
}

# メインコマンドハンドラー
case "${1:-help}" in
    "check")
        check_dev_environment
        ;;
    "api")
        api_development_support
        ;;
    "frontend")
        frontend_development_support
        ;;
    "database")
        database_development_support
        ;;
    "start")
        start_dev_servers
        ;;
    "stop")
        stop_dev_servers
        ;;
    "quality")
        check_code_quality
        ;;
    "test")
        run_tests
        ;;
    "test-api")
        test_api_endpoints
        ;;
    "logs")
        check_logs "$2"
        ;;
    "monitor")
        monitor_performance
        ;;
    "troubleshoot")
        troubleshoot
        ;;
    "help"|*)
        show_help
        ;;
esac
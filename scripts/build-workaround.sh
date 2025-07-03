#!/bin/bash

# WSL環境でのビルド実行回避策スクリプト
# Build Workaround Script for WSL Environment

echo "🚀 CastChat ビルド回避策実行"
echo "=========================="
echo "実行日時: $(date)"
echo ""

# 作業ディレクトリの確認
WORK_DIR="/mnt/e/dev/castchat"
cd "$WORK_DIR" || exit 1

echo "📦 依存関係の状態確認"
echo "==================="

# package.jsonの存在確認
if [ -f "package.json" ]; then
    echo "✅ package.json: 存在"
else
    echo "❌ package.json: 見つかりません"
    exit 1
fi

# vite.config.tsの存在確認
if [ -f "vite.config.ts" ]; then
    echo "✅ vite.config.ts: 存在"
else
    echo "❌ vite.config.ts: 見つかりません"
    exit 1
fi

echo ""
echo "🔧 ビルド回避策の実行"
echo "==================="

# 方法1: npx --no-install を使用
echo "方法1: npx --no-install での実行を試行..."
if npx --no-install vite --version 2>/dev/null; then
    echo "✅ viteが利用可能です"
    
    echo ""
    echo "ビルドを実行中..."
    npx --no-install vite build
    BUILD_RESULT=$?
    
    if [ $BUILD_RESULT -eq 0 ]; then
        echo "✅ ビルド成功！"
    else
        echo "❌ ビルド失敗 (エラーコード: $BUILD_RESULT)"
    fi
else
    echo "❌ npx経由でもviteが見つかりません"
    
    # 方法2: node_modules/.bin から直接実行
    echo ""
    echo "方法2: 直接実行を試行..."
    
    if [ -f "node_modules/.bin/vite" ]; then
        echo "viteバイナリが見つかりました"
        node node_modules/.bin/vite build
    else
        echo "❌ viteバイナリが見つかりません"
        
        # 方法3: package.jsonから直接nodeで実行
        echo ""
        echo "方法3: グローバルインストールを推奨"
        echo "以下のコマンドを実行してください:"
        echo ""
        echo "  npm install -g vite"
        echo "  npm install -g vue-tsc"
        echo ""
        echo "その後、以下で直接実行:"
        echo "  vite build"
    fi
fi

echo ""
echo "📋 代替ビルド方法"
echo "================"

cat << 'EOF'
### オプション1: ローカルnode_modulesを使用しない方法
1. プロジェクトを別の場所にコピー:
   cp -r /mnt/e/dev/castchat ~/castchat-temp
   cd ~/castchat-temp

2. クリーンインストール:
   npm ci

3. ビルド実行:
   npm run build

4. ビルド成果物をコピー:
   cp -r dist /mnt/e/dev/castchat/

### オプション2: Dockerを使用したビルド
1. Dockerfileを作成:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

2. ビルド実行:
   docker build -t castchat-build .
   docker run --rm -v $(pwd)/dist:/app/dist castchat-build

### オプション3: GitHub Actionsでのビルド
1. .github/workflows/build.yml でビルド
2. アーティファクトとしてダウンロード
EOF

echo ""
echo "🎯 推奨される次のステップ"
echo "======================="
echo "1. Windows側でnode_modulesフォルダを完全削除"
echo "2. WSLネイティブファイルシステムでプロジェクトを再構築"
echo "3. または、上記の代替ビルド方法を使用"

# 結果をファイルに保存
{
    echo "ビルド回避策実行結果"
    echo "実行日時: $(date)"
    echo "ビルド状態: node_modules破損のため代替方法が必要"
    echo "推奨対応: WSLネイティブ環境への移行"
} > build-workaround-result.txt
#!/bin/bash

# 開発サーバーエラー修正スクリプト
# Development Server Error Fix Script

echo "🔧 開発サーバーエラー修正"
echo "======================"
echo ""

# WSLプロジェクトディレクトリ
WSL_PROJECT_DIR=~/castchat-wsl

echo "1. プロセスクリーンアップ"
echo "-----------------------"
# 既存のViteプロセスを終了
pkill -f "vite" 2>/dev/null || echo "既存のViteプロセスなし"

echo ""
echo "2. 設定ファイル同期"
echo "-----------------"
cd $WSL_PROJECT_DIR

# 最新の設定ファイルを同期
echo "設定ファイルを同期中..."
cp /mnt/e/dev/castchat/vite.config.ts .
cp /mnt/e/dev/castchat/index.html .
cp /mnt/e/dev/castchat/tsconfig.json .
cp /mnt/e/dev/castchat/tsconfig.app.json .
cp /mnt/e/dev/castchat/tsconfig.node.json .

# src ディレクトリの同期
echo "ソースコードを同期中..."
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  /mnt/e/dev/castchat/src/ ./src/

# public ディレクトリの同期
echo "publicディレクトリを同期中..."
rsync -av --delete /mnt/e/dev/castchat/public/ ./public/

echo ""
echo "3. 開発サーバー起動"
echo "-----------------"
echo "ポート5173で起動を試みます..."

# 環境変数の設定
export NODE_ENV=development

# 開発サーバー起動（バックグラウンド）
npm run dev &
DEV_PID=$!

# 起動待機
sleep 5

# 起動確認
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ 開発サーバーが正常に起動しました"
    echo "URL: http://localhost:5173"
elif curl -s http://localhost:5174 > /dev/null 2>&1; then
    echo "✅ 開発サーバーが正常に起動しました"
    echo "URL: http://localhost:5174"
elif curl -s http://localhost:5175 > /dev/null 2>&1; then
    echo "✅ 開発サーバーが正常に起動しました"
    echo "URL: http://localhost:5175"
else
    echo "❌ 開発サーバーの起動に失敗しました"
fi

echo ""
echo "💡 トラブルシューティング"
echo "====================="
echo "1. ブラウザのキャッシュをクリア"
echo "2. 別のブラウザで試す"
echo "3. http://localhost:5173 にアクセス"
echo ""
echo "エラーが続く場合:"
echo "- F12で開発者ツールを開く"
echo "- Networkタブで500エラーの詳細を確認"
echo "- Consoleタブでエラーメッセージを確認"

# フォアグラウンドで実行継続
wait $DEV_PID
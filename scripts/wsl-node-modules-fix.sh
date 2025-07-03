#!/bin/bash

# WSL環境でのnode_modules破損問題修復スクリプト
# WSL Node Modules Corruption Fix Script

echo "🔧 WSL環境 node_modules 修復スクリプト"
echo "===================================="
echo "実行日時: $(date)"
echo ""

# WSL環境確認
if grep -q Microsoft /proc/version; then
    echo "✅ WSL環境を検出しました"
else
    echo "⚠️  WSL環境ではありません"
fi

echo ""
echo "🚨 現在の問題状況"
echo "================"
echo "- node_modules内に破損したファイルが存在"
echo "- Windows/WSLファイルシステムの競合"
echo "- 実行ファイルのアクセス権限問題"
echo ""

echo "📋 修復方法の提案"
echo "================"

echo ""
echo "### 方法1: Windows側からの削除"
echo "--------------------------------"
cat << 'EOF'
1. Windows エクスプローラーで以下のフォルダを開く:
   E:\dev\castchat\node_modules

2. 以下のフォルダを手動で削除:
   - .esbuild-wSSAF7ez
   - .rollup-e0YdNzos
   - その他すべてのフォルダ

3. WSLターミナルに戻って実行:
   cd /mnt/e/dev/castchat
   npm install
EOF

echo ""
echo "### 方法2: PowerShell管理者権限での削除"
echo "---------------------------------------"
cat << 'EOF'
1. Windows PowerShellを管理者権限で起動

2. 以下のコマンドを実行:
   cd E:\dev\castchat
   Remove-Item -Path ".\node_modules" -Recurse -Force

3. WSLで再インストール:
   npm install
EOF

echo ""
echo "### 方法3: 別ディレクトリでの開発環境構築"
echo "-----------------------------------------"
cat << 'EOF'
1. WSLのネイティブファイルシステムにプロジェクトをコピー:
   cp -r /mnt/e/dev/castchat ~/castchat
   cd ~/castchat
   rm -rf node_modules package-lock.json

2. クリーンインストール:
   npm install

3. 開発作業はWSL内で実施し、定期的にWindowsへ同期
EOF

echo ""
echo "### 方法4: Docker/Dev Container使用"
echo "------------------------------------"
cat << 'EOF'
1. .devcontainer/devcontainer.json を作成:
{
  "name": "CastChat Dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {}
  },
  "postCreateCommand": "npm install",
  "forwardPorts": [5173]
}

2. VS Code Dev Containers拡張機能でコンテナ内開発
EOF

echo ""
echo "🛠️ 即座に試せる回避策"
echo "===================="

echo ""
echo "### npx経由での直接実行"
echo "-----------------------"
cat << 'SCRIPT'
# package.jsonのスクリプトを以下に変更:
{
  "scripts": {
    "dev": "npx vite",
    "build": "npx vite build",
    "type-check": "npx vue-tsc --build --noEmit",
    "preview": "npx vite preview"
  }
}
SCRIPT

echo ""
echo "### グローバルインストール"
echo "-------------------------"
cat << 'SCRIPT'
# 必要なツールをグローバルにインストール:
npm install -g vite vue-tsc

# その後、直接実行:
vite
vite build
vue-tsc --build --noEmit
SCRIPT

echo ""
echo "🔍 現在の環境診断"
echo "================"

# npmキャッシュ状態確認
echo "npmキャッシュ:"
npm config get cache

# グローバルパッケージ確認
echo ""
echo "グローバルにインストール済みのパッケージ:"
npm list -g --depth=0 2>/dev/null | grep -E "vite|vue-tsc|typescript" || echo "関連パッケージなし"

echo ""
echo "📝 推奨される恒久的解決策"
echo "========================"
echo "1. WSLネイティブファイルシステム（~/内）での開発"
echo "2. Docker/Dev Containerの使用"
echo "3. WSL2の最新版へのアップデート"
echo "4. Windows側のウイルス対策ソフトの除外設定"
echo ""

echo "⚡ 緊急対応用コマンド"
echo "==================="
echo "# npx経由でのビルド実行:"
echo "npx vite build"
echo ""
echo "# npx経由での開発サーバー起動:"
echo "npx vite dev --host"
echo ""
echo "# TypeScriptチェック:"
echo "npx vue-tsc --build --noEmit"

# 診断結果をファイルに保存
{
    echo "WSL node_modules修復診断結果"
    echo "実行日時: $(date)"
    echo "推奨対応: Windows側からの手動削除またはWSLネイティブ環境への移行"
} > wsl-node-modules-fix-result.txt

echo ""
echo "💡 次のアクション"
echo "================"
echo "1. 上記の方法1または2でnode_modulesを完全削除"
echo "2. npm installで再インストール"
echo "3. それでも解決しない場合は方法3または4を検討"
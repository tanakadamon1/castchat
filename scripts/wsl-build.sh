#!/bin/bash

# WSL環境での開発・ビルドスクリプト
# WSL Development and Build Script

echo "🚀 CastChat WSL開発環境ビルドスクリプト"
echo "===================================="
echo ""

# WSLネイティブプロジェクトディレクトリ
WSL_PROJECT_DIR=~/castchat-wsl
WINDOWS_PROJECT_DIR=/mnt/e/dev/castchat

# コマンドライン引数の処理
COMMAND=${1:-build}

case $COMMAND in
  "setup")
    echo "📦 WSL開発環境セットアップ"
    echo "========================"
    
    # プロジェクトをWSLネイティブ環境にコピー
    echo "プロジェクトをコピー中..."
    rm -rf $WSL_PROJECT_DIR
    cp -r $WINDOWS_PROJECT_DIR $WSL_PROJECT_DIR
    cd $WSL_PROJECT_DIR
    
    # 依存関係インストール
    echo "依存関係をインストール中..."
    npm install
    
    echo "✅ セットアップ完了！"
    echo "開発サーバー起動: ./scripts/wsl-build.sh dev"
    ;;
    
  "dev")
    echo "💻 開発サーバー起動"
    echo "================="
    
    cd $WSL_PROJECT_DIR
    echo "開発サーバーを起動します..."
    echo "URL: http://localhost:5173"
    npm run dev
    ;;
    
  "build")
    echo "🔨 プロダクションビルド"
    echo "===================="
    
    cd $WSL_PROJECT_DIR
    
    # 最新のソースコードを同期
    echo "ソースコードを同期中..."
    rsync -av --exclude='node_modules' --exclude='dist' --exclude='.git' \
      $WINDOWS_PROJECT_DIR/ $WSL_PROJECT_DIR/
    
    # ビルド実行
    echo "ビルド実行中..."
    npm run build
    
    # ビルド成果物をWindowsにコピー
    echo "ビルド成果物をコピー中..."
    cp -r dist $WINDOWS_PROJECT_DIR/
    
    echo "✅ ビルド完了！"
    echo "成果物: $WINDOWS_PROJECT_DIR/dist/"
    ;;
    
  "sync")
    echo "🔄 ソースコード同期"
    echo "=================="
    
    cd $WSL_PROJECT_DIR
    
    # Windowsからの同期
    echo "Windows → WSL 同期中..."
    rsync -av --exclude='node_modules' --exclude='dist' --exclude='.git' \
      $WINDOWS_PROJECT_DIR/ $WSL_PROJECT_DIR/
    
    echo "✅ 同期完了！"
    ;;
    
  "test")
    echo "🧪 テスト実行"
    echo "============"
    
    cd $WSL_PROJECT_DIR
    npm run test
    ;;
    
  "lint")
    echo "🔍 リント実行"
    echo "============"
    
    cd $WSL_PROJECT_DIR
    npm run lint
    ;;
    
  "clean")
    echo "🧹 クリーンアップ"
    echo "==============="
    
    echo "WSL環境のプロジェクトを削除します..."
    rm -rf $WSL_PROJECT_DIR
    echo "✅ クリーンアップ完了！"
    ;;
    
  *)
    echo "使用方法:"
    echo "  ./scripts/wsl-build.sh [command]"
    echo ""
    echo "利用可能なコマンド:"
    echo "  setup  - WSL開発環境をセットアップ"
    echo "  dev    - 開発サーバーを起動"
    echo "  build  - プロダクションビルド実行"
    echo "  sync   - ソースコードを同期"
    echo "  test   - テストを実行"
    echo "  lint   - リントを実行"
    echo "  clean  - WSL環境をクリーンアップ"
    ;;
esac

echo ""
echo "💡 ヒント:"
echo "- Windows側でソースコードを編集"
echo "- WSL側でビルド・テスト実行"
echo "- 定期的に sync コマンドで同期"
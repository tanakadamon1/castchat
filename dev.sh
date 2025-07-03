#!/bin/bash

# CastChat 開発サーバー起動スクリプト（WSL用）
# Development Server Launch Script for WSL

echo ""
echo "🚀 CastChat 開発サーバー起動"
echo "=========================="
echo ""

# スクリプトが呼ばれた場所から実行
cd /mnt/e/dev/castchat

# 開発サーバー起動
./scripts/wsl-build.sh dev
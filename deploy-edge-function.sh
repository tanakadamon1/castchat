#!/bin/bash

# Square Payment Edge Function のデプロイスクリプト

echo "=== Square Payment Edge Function デプロイ ==="

# Supabase CLI の確認
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI がインストールされていません"
    echo "インストール方法: npm install -g supabase"
    exit 1
fi

# ログイン確認
echo "1. Supabase にログイン中..."
supabase login

# Edge Function のデプロイ
echo "2. square-payment Edge Function をデプロイ中..."
supabase functions deploy square-payment

# デプロイ結果の確認
echo "3. デプロイ完了"
echo "   Edge Function URL: https://ewjfnquypoeyoicmgbnp.supabase.co/functions/v1/square-payment"

# ログ確認コマンドの表示
echo ""
echo "📋 ログ確認コマンド:"
echo "   supabase functions logs square-payment --follow"

echo ""
echo "✅ デプロイ完了！"
echo "   レシート設定の変更が反映されました。"
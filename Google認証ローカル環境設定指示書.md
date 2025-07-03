# 🔑 Google認証ローカル環境設定指示書

**問題**: ローカル環境でGoogle認証が「アクセスできません」エラー  
**原因**: Supabase OAuth設定とローカル環境設定の不備

---

## 🚨 **現在の問題**

### ❌ **`.env.local` プレースホルダー値**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co  # ❌ プレースホルダー
VITE_SUPABASE_ANON_KEY=your-anon-key                # ❌ プレースホルダー
```

### ❌ **Supabase OAuth リダイレクトURL未設定**
ローカル環境 `http://localhost:5174` への OAuth リダイレクトが未設定

---

## 🔧 **修正手順**

### 1. **Supabase 実プロジェクト情報取得**

**開発チーム・DevOps担当者へ確認依頼**:
```bash
# 必要な情報
1. 実際のSupabase Project URL
2. 実際のSupabase Anon Key  
3. Supabase Project ID
4. Google OAuth Client設定状況
```

### 2. **`.env.local` 修正**

**修正例** (実際の値に置換):
```bash
# CastChat Development Environment Configuration

# Supabase Configuration (実際の値に置換)
VITE_SUPABASE_URL=https://[実際のproject-id].supabase.co
VITE_SUPABASE_ANON_KEY=[実際のanon-key]

# Application Environment
VITE_APP_ENV=development
VITE_API_BASE_URL=https://[実際のproject-id].supabase.co

# Application Settings
VITE_APP_NAME=CastChat
VITE_APP_VERSION=1.0.0

# Development Flags
VITE_DEBUG_MODE=true
VITE_MOCK_API=false
```

### 3. **Supabase OAuth リダイレクトURL設定**

**Supabase Dashboard → Authentication → URL Configuration**:
```bash
# Site URL
http://localhost:5174

# Redirect URLs  
http://localhost:5174/auth/callback
http://localhost:5173/auth/callback  # バックアップポート
https://castchat.vercel.app/auth/callback  # 本番URL
```

### 4. **Google OAuth Client 設定確認**

**Google Cloud Console → APIs & Services → Credentials**:
```bash
# Authorized JavaScript origins
http://localhost:5174
http://localhost:5173
https://[project-id].supabase.co

# Authorized redirect URIs  
https://[project-id].supabase.co/auth/v1/callback
```

---

## 🧪 **動作確認手順**

### **Step 1: 環境変数確認**
```bash
# 開発サーバー再起動
npm run dev

# ブラウザの開発者ツールで確認
console.log(import.meta.env.VITE_SUPABASE_URL)
# 正しいURLが表示されることを確認
```

### **Step 2: 認証フロー確認**
```bash
1. http://localhost:5174/login にアクセス
2. "Googleでログイン" ボタンクリック
3. Google認証画面が正常表示されることを確認
4. 認証後、正常にリダイレクトされることを確認
```

### **Step 3: ネットワーク確認**
```bash
# ブラウザ開発者ツール → Network タブで確認
- Supabase APIへのリクエストが成功しているか
- OAuth リダイレクトが正常に動作しているか
```

---

## 🔍 **トラブルシューティング**

### **よくあるエラーと対処法**

#### ❌ **"Invalid redirect URL"**
```bash
# 対処法
1. Supabase Dashboard でリダイレクトURL追加
2. http://localhost:5174/auth/callback を設定
3. 設定反映まで数分待機
```

#### ❌ **"Access blocked: This app's request is invalid"**
```bash
# 対処法  
1. Google Cloud Console でOAuth同意画面確認
2. 承認済みドメインに localhost 追加
3. テストユーザーに開発者メール追加
```

#### ❌ **"Supabase client error"**
```bash
# 対処法
1. .env.local の URL/Key 再確認
2. Supabase プロジェクトのアクティブ状態確認
3. APIキーの権限確認
```

---

## 🎯 **緊急回避策**

### **Option 1: メール認証使用**
```bash
# Google認証の代わりにメール認証でテスト
1. http://localhost:5174/register
2. メールアドレスでユーザー登録
3. 基本機能をテスト
```

### **Option 2: モック認証使用**  
```bash
# 開発専用モック認証
# .env.local に追加
VITE_MOCK_AUTH=true

# src/stores/auth.ts でモック機能有効化
```

---

## 📋 **設定チェックリスト**

### ✅ **Supabase側設定**
- [ ] Project URL が正しく設定
- [ ] Anon Key が正しく設定
- [ ] Google OAuth Provider が有効
- [ ] Redirect URLs にローカル環境追加
- [ ] RLS (Row Level Security) 設定確認

### ✅ **Google Cloud側設定**
- [ ] OAuth 2.0 Client ID 作成済み
- [ ] 承認済みドメインに localhost 追加
- [ ] リダイレクトURI が正しく設定
- [ ] OAuth同意画面設定完了

### ✅ **ローカル環境設定**
- [ ] .env.local に実際の認証情報設定
- [ ] 開発サーバー再起動実行
- [ ] ブラウザキャッシュクリア実行

---

## 🚀 **設定完了後の確認**

```bash
# 1. 環境変数確認
npm run dev
# → 正しいSupabase URLが読み込まれること

# 2. 認証テスト  
# → Google認証が正常に動作すること

# 3. 機能テスト
# → ログイン後に投稿・応募機能が動作すること
```

---

## 📞 **サポート連絡先**

**緊急時連絡**:
- **DevOps担当**: Supabase認証情報提供
- **バックエンド担当**: OAuth設定サポート
- **フロントエンド担当**: 認証フロー修正

**設定完了期限**: 4時間以内  
**優先度**: 高 (ローカル開発環境復旧のため)

---

**作成者**: プロジェクト管理者  
**作成日時**: 2025年7月2日  
**最終更新**: 認証設定トラブル対応
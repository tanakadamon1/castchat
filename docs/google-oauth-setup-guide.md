# 🔑 Google認証設定ガイド

## 概要
CastChatアプリケーションのGoogle OAuth認証設定の完了ガイドです。

## 🎯 設定完了状況

### ✅ 完了済み項目
1. **環境変数設定**
   - `.env.local` - 開発環境用認証情報設定済み
   - `.env.production` - 本番環境用認証情報設定済み

2. **Supabase接続情報**
   - プロジェクトURL: `https://ewjfnquypoeyoicmgbnp.supabase.co`
   - Anon Key: 設定済み

3. **Google OAuth Client ID**
   - Client ID: `244502393612-t7fvuqf9rg2kssse5b1i5qvaqha605fs.apps.googleusercontent.com`

## 🔧 あなたが設定する必要がある項目

### 1. Supabase Dashboard設定

#### A. Authentication Provider設定
1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクト `ewjfnquypoeyoicmgbnp` を選択
3. **Authentication > Providers** へ移動
4. **Google** プロバイダーを有効化
5. 以下の情報を入力：
   ```
   Client ID: 244502393612-t7fvuqf9rg2kssse5b1i5qvaqha605fs.apps.googleusercontent.com
   Client Secret: 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
   ```

#### B. URL Configuration設定
**Authentication > URL Configuration** で以下を設定：

```bash
# Site URL
https://castchat.jp

# Redirect URLs
https://castchat.jp/auth/callback
http://localhost:5173/auth/callback
http://localhost:5174/auth/callback
http://localhost:5175/auth/callback
```

### 2. Google Cloud Console設定

#### A. OAuth 2.0 設定
1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. **APIs & Services > Credentials** へ移動
3. 既存のOAuth 2.0 Client ID `244502393612-t7fvuqf9rg2kssse5b1i5qvaqha605fs.apps.googleusercontent.com` を編集

#### B. 承認済みJavaScript生成元
```
https://castchat.jp
https://ewjfnquypoeyoicmgbnp.supabase.co
http://localhost:5173
http://localhost:5174
http://localhost:5175
```

#### C. 承認済みリダイレクトURI
```
https://ewjfnquypoeyoicmgbnp.supabase.co/auth/v1/callback
```

#### D. OAuth同意画面設定
1. **OAuth consent screen** タブ
2. **公開対象ユーザー**: 外部
3. **承認済みドメイン**:
   ```
   castchat.jp
   supabase.co
   localhost
   ```

### 3. カスタムドメイン設定（castchat.jp）

#### A. Vercel Domain設定
1. [Vercel Dashboard](https://vercel.com) にログイン
2. CastChatプロジェクトを選択
3. **Settings > Domains** へ移動
4. `castchat.jp` を追加
5. DNSレコード設定：
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

#### B. DNS設定確認
ドメインプロバイダーで以下のDNSレコードを設定：
```
# Aレコード
@ → 76.76.19.61

# CNAMEレコード  
www → cname.vercel-dns.com
```

## 🧪 動作確認手順

### 1. ローカル環境テスト
```bash
# 開発サーバー起動
./dev.sh

# ブラウザで確認
http://localhost:5173
```

### 2. 認証フローテスト
1. `/login` ページにアクセス
2. 「Googleでログイン」ボタンをクリック
3. Google認証画面が表示されることを確認
4. 認証後、正常にリダイレクトされることを確認

### 3. 本番環境テスト
1. `https://castchat.jp` にアクセス
2. 同様に認証フローをテスト

## 📋 設定チェックリスト

### Supabase設定
- [ ] Google OAuth Provider有効化
- [ ] Client ID/Secret設定
- [ ] Redirect URLs設定
- [ ] Site URL設定

### Google Cloud設定
- [ ] JavaScript生成元設定
- [ ] リダイレクトURI設定
- [ ] OAuth同意画面設定
- [ ] 承認済みドメイン設定

### ドメイン設定
- [ ] Vercelドメイン追加
- [ ] DNS Aレコード設定
- [ ] DNS CNAMEレコード設定
- [ ] SSL証明書自動取得確認

### 動作確認
- [ ] ローカル環境でGoogle認証動作
- [ ] 本番環境でGoogle認証動作
- [ ] カスタムドメインアクセス確認

## 🚨 トラブルシューティング

### よくあるエラーと対処法

#### 「redirect_uri_mismatch」エラー
- Google Cloud ConsoleのリダイレクトURIを確認
- Supabaseの正確なコールバックURLを設定

#### 「invalid_client」エラー
- Client IDとSecretの値を再確認
- 値にスペースや改行が含まれていないか確認

#### ドメインアクセスできない
- DNS設定の反映を待つ（最大24時間）
- `dig castchat.jp` コマンドでDNS確認

## 📞 サポート

設定で問題が発生した場合：
1. エラーメッセージの詳細をコピー
2. ブラウザの開発者ツールでNetworkタブを確認
3. 設定手順を再度確認

---

**設定完了予定時間**: 30分-1時間
**最終確認**: Google認証とカスタムドメインの動作確認
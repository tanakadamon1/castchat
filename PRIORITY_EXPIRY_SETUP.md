# 優先表示期限切れ機能の設定手順

pg_cronが利用できない環境での優先表示期限切れ機能の実装方法です。

## 設定手順

### 1. SQL関数の作成

Supabase SQL Editorで以下のファイルを実行してください：

```bash
execute-priority-expiry.sql
```

このファイルには以下の関数が含まれています：
- `check_and_expire_priorities()`: 期限切れ投稿を自動更新
- `get_posts_with_expiry_check()`: 期限切れチェック付きの投稿取得
- `posts_with_valid_priority` ビュー: 動的な優先表示判定

### 2. 動作確認

以下のファイルを使用してテストしてください：

```bash
test-priority-expiry.sql
```

### 3. 動作原理

1. **フロントエンド側**: 投稿一覧を取得する際に自動で期限切れチェックが実行されます
2. **バックエンド側**: `check_and_expire_priorities()` 関数が期限切れ投稿を自動更新します
3. **リアルタイム更新**: 投稿一覧の取得時に毎回チェックが実行されるため、リアルタイムで期限切れが反映されます

## 実装された機能

### 自動期限切れ処理
- 投稿一覧取得時に自動実行
- 期限切れ投稿の `is_priority` を `false` に設定
- `priority_expires_at` と `priority_cost` をクリア

### 手動実行も可能
```sql
SELECT check_and_expire_priorities();
```

### 動的ビュー
`posts_with_valid_priority` ビューを使用すると、データベースの更新なしで動的に期限切れを判定できます。

## 注意事項

- pg_cronが利用できない環境でも動作します
- 投稿一覧の取得が若干重くなる可能性があります（期限切れチェックのため）
- 期限切れ処理は投稿一覧取得時にのみ実行されます（バックグラウンドでの自動実行はありません）

## トラブルシューティング

### 関数が見つからない場合
```sql
SELECT proname FROM pg_proc WHERE proname = 'check_and_expire_priorities';
```

### 期限切れ投稿の状態確認
```sql
SELECT 
  id, title, is_priority, priority_expires_at,
  CASE 
    WHEN is_priority = false THEN 'NORMAL'
    WHEN priority_expires_at IS NULL THEN 'PRIORITY_NO_EXPIRY'
    WHEN priority_expires_at > NOW() THEN 'PRIORITY_ACTIVE'
    ELSE 'PRIORITY_EXPIRED'
  END AS status
FROM posts 
WHERE is_priority = true OR priority_expires_at IS NOT NULL;
```
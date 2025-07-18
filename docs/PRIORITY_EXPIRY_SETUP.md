# 優先表示期限切れ処理のセットアップガイド

## 概要
CastChatでは、コインを使用して投稿を24時間優先表示できます。この機能が正しく動作するには、期限切れの優先表示を自動的に無効化する処理が必要です。

## 現在の実装

### 1. データベース関数
`check_and_expire_priorities()` 関数が定義されており、期限切れの投稿の `is_priority` フラグを false に更新します。

### 2. フロントエンド
- **投稿一覧取得時**: `check_and_expire_priorities()` を呼び出して期限切れを更新
- **表示時**: `priority_expires_at` と現在時刻を比較して優先表示の有効性を判定

### 3. Edge Function
`expire-priorities` 関数が定義されていますが、定期実行の設定が必要です。

## セットアップ方法

### オプション1: Supabase CRONジョブ（推奨）

1. Supabaseダッシュボードにログイン
2. 「Database」→「Extensions」に移動
3. `pg_cron` 拡張を有効化
4. 以下のSQLを実行：

```sql
-- pg_cron拡張が有効になっていることを確認
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 5分ごとに期限切れチェックを実行
SELECT cron.schedule(
  'expire-priority-posts',
  '*/5 * * * *',
  $$SELECT check_and_expire_priorities();$$
);
```

### オプション2: Edge Function定期実行

1. Supabaseダッシュボードで「Edge Functions」に移動
2. `expire-priorities` 関数を選択
3. 「Schedule」タブで以下を設定：
   - Schedule: `*/5 * * * *` （5分ごと）
   - Timezone: `Asia/Tokyo`

### オプション3: 外部CRONサービス

外部のCRONサービス（cron-job.org、EasyCron等）から以下のエンドポイントを定期的に呼び出す：

```
POST https://[your-project-ref].supabase.co/functions/v1/expire-priorities
Headers:
  - Authorization: Bearer [your-anon-key]
```

## 動作確認

1. 優先表示を有効にした投稿を作成
2. データベースで `priority_expires_at` を過去の時刻に更新：
   ```sql
   UPDATE posts 
   SET priority_expires_at = NOW() - INTERVAL '1 hour'
   WHERE is_priority = true 
   LIMIT 1;
   ```
3. 5分待つか、手動で関数を実行：
   ```sql
   SELECT check_and_expire_priorities();
   ```
4. `is_priority` が false に更新されていることを確認

## トラブルシューティング

### 期限切れ処理が動作しない場合

1. **pg_cron拡張の確認**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. **スケジュールされたジョブの確認**
   ```sql
   SELECT * FROM cron.job;
   ```

3. **手動実行で動作確認**
   ```sql
   SELECT check_and_expire_priorities();
   ```

4. **ログの確認**
   - Supabaseダッシュボード → Logs → Database
   - Edge Function実行ログ

### パフォーマンスの考慮事項

- 大量の投稿がある場合は、インデックスを追加：
  ```sql
  CREATE INDEX idx_posts_priority_expiry 
  ON posts(is_priority, priority_expires_at) 
  WHERE is_priority = true;
  ```
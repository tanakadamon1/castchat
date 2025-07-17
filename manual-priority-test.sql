-- テスト用の優先表示投稿を作成（過去の日時で期限切れ設定）
-- 注意: 実際の投稿IDに変更してください

-- 1. テスト用の期限切れ投稿を作成
UPDATE posts 
SET 
  is_priority = true,
  priority_expires_at = NOW() - INTERVAL '1 hour',  -- 1時間前に期限切れ
  priority_cost = 1
WHERE id = 'YOUR_POST_ID_HERE';  -- 実際の投稿IDに変更

-- 2. 期限切れ処理を手動実行
SELECT expire_priority_posts();

-- 3. 結果確認
SELECT 
  id,
  title,
  is_priority,
  priority_expires_at,
  'Should be false after expire_priority_posts()' as expected_result
FROM posts 
WHERE id = 'YOUR_POST_ID_HERE';

-- 4. 現在のcronジョブ状態確認
SELECT 
  jobname,
  schedule,
  command,
  active,
  last_run,
  next_run
FROM cron.job 
WHERE jobname = 'expire-priority-posts';

-- 5. pg_cron拡張機能が有効か確認
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
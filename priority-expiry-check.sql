-- 優先表示機能の動作確認SQL

-- 1. 現在の優先表示投稿を確認
SELECT 
  id,
  title,
  is_priority,
  priority_expires_at,
  priority_cost,
  CASE 
    WHEN priority_expires_at IS NULL THEN 'NO_EXPIRY'
    WHEN priority_expires_at > NOW() THEN 'ACTIVE'
    ELSE 'EXPIRED'
  END AS priority_status,
  NOW() - priority_expires_at AS time_since_expiry
FROM posts 
WHERE is_priority = true 
ORDER BY priority_expires_at DESC;

-- 2. 期限切れの優先表示投稿をチェック
SELECT 
  id,
  title,
  is_priority,
  priority_expires_at,
  NOW() - priority_expires_at AS expired_time
FROM posts 
WHERE is_priority = true 
  AND priority_expires_at IS NOT NULL 
  AND priority_expires_at < NOW();

-- 3. cron ジョブの状態確認
SELECT 
  jobname,
  schedule,
  command,
  active,
  last_run,
  next_run
FROM cron.job 
WHERE jobname = 'expire-priority-posts';

-- 4. 手動で期限切れ処理を実行
SELECT expire_priority_posts();

-- 5. 処理後の状態を再確認
SELECT 
  id,
  title,
  is_priority,
  priority_expires_at,
  CASE 
    WHEN priority_expires_at IS NULL THEN 'NO_EXPIRY'
    WHEN priority_expires_at > NOW() THEN 'ACTIVE'
    ELSE 'SHOULD_BE_EXPIRED'
  END AS priority_status
FROM posts 
WHERE is_priority = true OR priority_expires_at IS NOT NULL
ORDER BY priority_expires_at DESC;
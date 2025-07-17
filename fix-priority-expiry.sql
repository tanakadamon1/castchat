-- 優先表示期限切れ機能の修正

-- 1. より頻繁な期限切れチェック（1分おき）
SELECT cron.unschedule('expire-priority-posts');

SELECT cron.schedule(
  'expire-priority-posts',
  '* * * * *',  -- 1分おき
  'SELECT expire_priority_posts();'
);

-- 2. 期限切れ処理関数の改善
CREATE OR REPLACE FUNCTION expire_priority_posts()
RETURNS TABLE(expired_count INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- 期限切れの投稿を更新
  UPDATE posts
  SET 
    is_priority = false,
    priority_expires_at = NULL,
    priority_cost = NULL
  WHERE 
    is_priority = true 
    AND priority_expires_at IS NOT NULL 
    AND priority_expires_at < NOW();
    
  -- 更新された行数を取得
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- ログ出力
  RAISE NOTICE 'Expired % priority posts at %', expired_count, NOW();
  
  -- 結果を返す
  RETURN QUERY SELECT expired_count;
END;
$$;

-- 3. 即座に期限切れ処理を実行
SELECT * FROM expire_priority_posts();

-- 4. 現在の優先表示投稿の状態確認
SELECT 
  id,
  title,
  is_priority,
  priority_expires_at,
  CASE 
    WHEN is_priority = false THEN 'NORMAL'
    WHEN priority_expires_at IS NULL THEN 'PRIORITY_NO_EXPIRY'
    WHEN priority_expires_at > NOW() THEN 'PRIORITY_ACTIVE'
    ELSE 'PRIORITY_EXPIRED'
  END AS status,
  EXTRACT(EPOCH FROM (priority_expires_at - NOW()))/3600 AS hours_remaining
FROM posts 
WHERE is_priority = true OR priority_expires_at IS NOT NULL
ORDER BY is_priority DESC, priority_expires_at DESC;

-- 5. cronジョブの状態確認
SELECT 
  jobname,
  schedule,
  command,
  active,
  last_run,
  next_run
FROM cron.job 
WHERE jobname = 'expire-priority-posts';
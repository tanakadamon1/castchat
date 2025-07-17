-- 優先表示期限切れ機能のテスト用SQLファイル
-- 手動実行してテストしてください

-- 1. 現在の優先表示投稿の状態確認
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

-- 2. テスト用の期限切れ投稿を作成（既存の投稿がある場合）
-- 注意: 実際の投稿IDに変更してから実行してください
/*
UPDATE posts 
SET 
  is_priority = true,
  priority_expires_at = NOW() - INTERVAL '1 hour',  -- 1時間前に期限切れ
  priority_cost = 1
WHERE id = 'YOUR_POST_ID_HERE';
*/

-- 3. 期限切れ処理関数を手動実行
SELECT check_and_expire_priorities() AS expired_count;

-- 4. 処理後の状態確認
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
  END AS status
FROM posts 
WHERE is_priority = true OR priority_expires_at IS NOT NULL
ORDER BY is_priority DESC, priority_expires_at DESC;

-- 5. 関数が正しく作成されているか確認
SELECT 
  proname as function_name,
  prosrc as source_code
FROM pg_proc 
WHERE proname = 'check_and_expire_priorities';
-- 優先表示期限切れ処理の実装（pg_cronを使わない）
-- このファイルをSupabase SQL Editorで実行してください

-- 1. 期限切れチェック関数の作成
CREATE OR REPLACE FUNCTION check_and_expire_priorities()
RETURNS INTEGER
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
    priority_cost = 0
  WHERE 
    is_priority = true 
    AND priority_expires_at IS NOT NULL 
    AND priority_expires_at < NOW();
    
  -- 更新された行数を取得
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- 結果を返す
  RETURN expired_count;
END;
$$;

-- 2. 投稿一覧を取得する関数を作成（期限切れチェック付き）
CREATE OR REPLACE FUNCTION get_posts_with_expiry_check()
RETURNS SETOF posts
LANGUAGE plpgsql
AS $$
BEGIN
  -- まず期限切れチェックを実行
  PERFORM check_and_expire_priorities();
  
  -- その後、投稿を返す
  RETURN QUERY SELECT * FROM posts;
END;
$$;

-- 3. ビューを使用して動的に期限切れを判定
DROP VIEW IF EXISTS posts_with_valid_priority;
CREATE VIEW posts_with_valid_priority AS
SELECT 
  *,
  -- 動的に優先表示の有効性を判定
  CASE 
    WHEN is_priority = true AND (priority_expires_at IS NULL OR priority_expires_at > NOW()) THEN true
    ELSE false
  END AS is_priority_valid
FROM posts;

-- 4. 手動で期限切れ処理を実行
SELECT check_and_expire_priorities() as expired_count;

-- 5. 現在の状態を確認
SELECT 
  id,
  title,
  is_priority,
  priority_expires_at,
  CASE 
    WHEN is_priority = false THEN 'NORMAL'
    WHEN priority_expires_at IS NULL THEN 'PRIORITY_NO_EXPIRY'
    WHEN priority_expires_at > NOW() THEN 'PRIORITY_ACTIVE'
    ELSE 'PRIORITY_SHOULD_EXPIRE'
  END AS status,
  EXTRACT(EPOCH FROM (priority_expires_at - NOW()))/3600 AS hours_remaining
FROM posts 
WHERE is_priority = true OR priority_expires_at IS NOT NULL
ORDER BY is_priority DESC, priority_expires_at DESC;
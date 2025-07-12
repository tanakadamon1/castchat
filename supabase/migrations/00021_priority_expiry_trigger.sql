-- 優先表示期限切れ処理のためのトリガー関数を作成

-- 期限切れ投稿のis_priorityをfalseに更新する関数
CREATE OR REPLACE FUNCTION expire_priority_posts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET 
    is_priority = false,
    priority_expires_at = NULL
  WHERE 
    is_priority = true 
    AND priority_expires_at IS NOT NULL 
    AND priority_expires_at < NOW();
    
  -- ログ出力（本番環境では削除を検討）
  RAISE NOTICE 'Expired % priority posts', ROW_COUNT;
END;
$$;

-- pg_cronを使用した定期実行（5分おき）
-- 注意: pg_cron拡張機能が有効になっている必要があります
-- Supabaseクラウドでは自動的に利用可能ですが、セルフホストの場合は手動で有効化が必要

-- 既存のcronジョブがあれば削除
SELECT cron.unschedule('expire-priority-posts');

-- 新しいcronジョブを登録（5分おきに実行）
SELECT cron.schedule(
  'expire-priority-posts',
  '*/5 * * * *',  -- 5分おき
  'SELECT expire_priority_posts();'
);

-- 手動でも期限切れ処理を実行
SELECT expire_priority_posts();
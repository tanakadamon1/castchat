-- データベースパフォーマンス最適化
-- Performance optimization for CastChat database

-- 追加インデックス最適化
-- Additional index optimizations

-- 投稿検索用の複合インデックス
CREATE INDEX IF NOT EXISTS idx_posts_status_category_created 
ON posts(status, category, created_at DESC) 
WHERE status = 'published';

-- 投稿検索用のテキスト検索インデックス
CREATE INDEX IF NOT EXISTS idx_posts_search_text 
ON posts USING gin(to_tsvector('japanese', title || ' ' || description));

-- ユーザー検索用インデックス
CREATE INDEX IF NOT EXISTS idx_user_profiles_search 
ON user_profiles USING gin(to_tsvector('japanese', display_name || ' ' || COALESCE(bio, '')));

-- 応募統計用インデックス
CREATE INDEX IF NOT EXISTS idx_applications_stats 
ON applications(post_id, status, created_at) 
WHERE status IN ('pending', 'accepted', 'rejected');

-- 通知優先度別インデックス
CREATE INDEX IF NOT EXISTS idx_notifications_priority_unread 
ON notifications(user_id, priority, created_at DESC) 
WHERE read = false;

-- パーティショニング設定（大量データ対応）
-- Partitioning setup for large data volumes

-- 通知テーブルの月別パーティショニング準備
-- （実際のパーティショニングはデータ量に応じて検討）

-- 古いデータのアーカイブビュー
CREATE OR REPLACE VIEW archived_applications AS
SELECT *
FROM applications 
WHERE created_at < NOW() - INTERVAL '1 year'
AND status IN ('rejected', 'withdrawn');

-- パフォーマンス統計関数
CREATE OR REPLACE FUNCTION get_application_stats_optimized(target_post_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_applications BIGINT,
  pending_count BIGINT,
  accepted_count BIGINT,
  rejected_count BIGINT,
  withdrawn_count BIGINT,
  avg_response_time INTERVAL
) AS $$
BEGIN
  IF target_post_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      COUNT(*) as total_applications,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
      COUNT(*) FILTER (WHERE status = 'withdrawn') as withdrawn_count,
      AVG(responded_at - created_at) FILTER (WHERE responded_at IS NOT NULL) as avg_response_time
    FROM applications 
    WHERE post_id = target_post_id;
  ELSE
    RETURN QUERY
    SELECT 
      COUNT(*) as total_applications,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
      COUNT(*) FILTER (WHERE status = 'withdrawn') as withdrawn_count,
      AVG(responded_at - created_at) FILTER (WHERE responded_at IS NOT NULL) as avg_response_time
    FROM applications;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- データ整合性チェック関数
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE (
  table_name TEXT,
  check_name TEXT,
  status TEXT,
  count_value BIGINT
) AS $$
BEGIN
  -- 孤立した応募のチェック
  RETURN QUERY
  SELECT 
    'applications'::TEXT,
    'orphaned_applications'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END,
    COUNT(*)
  FROM applications a
  LEFT JOIN posts p ON a.post_id = p.id
  WHERE p.id IS NULL;

  -- 孤立した通知のチェック
  RETURN QUERY
  SELECT 
    'notifications'::TEXT,
    'orphaned_notifications'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END,
    COUNT(*)
  FROM notifications n
  LEFT JOIN auth.users u ON n.user_id = u.id
  WHERE u.id IS NULL;

  -- 重複応募のチェック
  RETURN QUERY
  SELECT 
    'applications'::TEXT,
    'duplicate_applications'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END,
    COUNT(*)
  FROM (
    SELECT post_id, user_id, COUNT(*)
    FROM applications
    GROUP BY post_id, user_id
    HAVING COUNT(*) > 1
  ) duplicates;

  -- 古い未読通知のチェック（30日以上）
  RETURN QUERY
  SELECT 
    'notifications'::TEXT,
    'old_unread_notifications'::TEXT,
    CASE WHEN COUNT(*) < 1000 THEN 'OK' ELSE 'WARNING' END,
    COUNT(*)
  FROM notifications
  WHERE read = false 
  AND created_at < NOW() - INTERVAL '30 days';

END;
$$ LANGUAGE plpgsql;

-- 自動バキューム設定の最適化
-- Auto vacuum optimization

-- 応募テーブルの自動バキューム調整
ALTER TABLE applications SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- 通知テーブルの自動バキューム調整（更新頻度が高いため）
ALTER TABLE notifications SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

-- 統計情報更新の自動化
-- Automated statistics updates

-- 毎日の統計更新（cron job的な処理）
-- これはSupabase Edge Functionsまたは外部cronで実行

-- クリーンアップ用の関数
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- 1年以上前の却下された応募を削除
  DELETE FROM applications 
  WHERE status = 'rejected' 
  AND created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- 6ヶ月以上前の既読通知を削除
  DELETE FROM notifications 
  WHERE read = true 
  AND created_at < NOW() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- パフォーマンス監視用のビュー
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
  'applications' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as daily_inserts,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '24 hours') as daily_updates,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM applications
UNION ALL
SELECT 
  'notifications' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as daily_inserts,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as daily_updates,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM notifications
UNION ALL
SELECT 
  'posts' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as daily_inserts,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '24 hours') as daily_updates,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM posts;

-- コメント追加
COMMENT ON FUNCTION get_application_stats_optimized IS 'Optimized function for calculating application statistics with better performance';
COMMENT ON FUNCTION check_data_integrity IS 'Comprehensive data integrity checker for all main tables';
COMMENT ON FUNCTION cleanup_old_data IS 'Automated cleanup function for old data - run via scheduled job';
COMMENT ON VIEW performance_metrics IS 'Real-time performance metrics for monitoring database health';

-- 最適化完了のログ
INSERT INTO public.system_logs (event_type, message, metadata) 
VALUES (
  'database_optimization', 
  'Performance optimization migration completed',
  '{"migration": "00003_performance_optimization", "timestamp": "' || NOW()::text || '"}'
);
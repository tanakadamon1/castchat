-- SECURITY DEFINER ビューの警告を修正するSQL
-- 通常のビューとして再作成し、セキュリティを明確にする

-- 1. posts_with_valid_priority ビューを削除して再作成
DROP VIEW IF EXISTS posts_with_valid_priority;

-- 通常のビューとして再作成（SECURITY DEFINERを使わない）
CREATE VIEW posts_with_valid_priority AS
SELECT 
  *,
  -- 動的に優先表示の有効性を判定
  CASE 
    WHEN is_priority = true AND (priority_expires_at IS NULL OR priority_expires_at > NOW()) THEN true
    ELSE false
  END AS is_priority_valid
FROM posts;

-- 2. applications_detail_view ビューを削除して再作成
DROP VIEW IF EXISTS applications_detail_view;

-- 通常のビューとして再作成（SECURITY DEFINERを使わない）
CREATE VIEW applications_detail_view AS
SELECT 
  a.id,
  a.post_id,
  a.user_id,
  a.message,
  a.status,
  a.portfolio_url,
  a.experience_years,
  a.availability,
  a.twitter_id,
  a.created_at,
  a.updated_at,
  a.responded_at,
  a.response_message,
  p.title as post_title,
  p.user_id as post_author_id,
  u.display_name as applicant_name,
  u.avatar_url as applicant_avatar,
  author.display_name as post_author_name
FROM applications a
LEFT JOIN posts p ON a.post_id = p.id
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN users author ON p.user_id = author.id;

-- 3. ビューに対する適切なRLSポリシーを設定
-- posts_with_valid_priority は posts テーブルの RLS を継承
-- applications_detail_view は applications テーブルの RLS を継承

-- 4. 現在の状態を確認
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('posts_with_valid_priority', 'applications_detail_view');
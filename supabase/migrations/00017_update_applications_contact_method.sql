-- applicationsテーブルのcontact_preferenceカラムを削除し、twitter_idカラムを追加
ALTER TABLE public.applications 
DROP COLUMN IF EXISTS contact_preference;

ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS twitter_id VARCHAR(15);

-- twitter_idにコメントを追加
COMMENT ON COLUMN public.applications.twitter_id IS 'Twitter/X username without @ symbol';

-- 既存のapplicationsビューを更新（存在する場合）
CREATE OR REPLACE VIEW applications_with_details AS
SELECT 
  a.*,
  p.title AS post_title,
  p.user_id AS post_author_id,
  u1.display_name AS applicant_name,
  u1.avatar_url AS applicant_avatar,
  u2.display_name AS post_author_name
FROM applications a
LEFT JOIN posts p ON a.post_id = p.id
LEFT JOIN users u1 ON a.user_id = u1.id
LEFT JOIN users u2 ON p.user_id = u2.id;
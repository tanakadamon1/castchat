-- 最大募集人数（recruitment_count）フィールドを削除するマイグレーション
-- このフィールドは実際に使用されていないため削除します

-- 1. recruitment_countカラムに依存するビューを削除
DROP VIEW IF EXISTS posts_with_valid_priority;

-- 2. postsテーブルからrecruitment_countカラムを削除
ALTER TABLE posts DROP COLUMN IF EXISTS recruitment_count;

-- 3. ビューを再作成（recruitment_countカラムなしで）
CREATE VIEW posts_with_valid_priority AS
SELECT 
  *,
  -- 動的に優先表示の有効性を判定
  CASE 
    WHEN is_priority = true AND (priority_expires_at IS NULL OR priority_expires_at > NOW()) THEN true
    ELSE false
  END AS is_priority_valid
FROM posts;
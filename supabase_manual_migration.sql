-- Supabase SQL Editorで実行するマイグレーションスクリプト
-- このファイルの内容をコピーしてSupabaseのSQL Editorで実行してください

-- ========================================
-- 1. RLSポリシーの修正 (00018)
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Post authors can view applications to their posts" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;

-- Recreate with correct column reference
CREATE POLICY "Post authors can view applications to their posts" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = applications.post_id 
            AND posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own applications" ON applications
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = applications.post_id 
            AND posts.user_id = auth.uid()
        )
    );

-- ========================================
-- 2. テーブル構造の修正 (00019)
-- ========================================

-- Add missing columns from migration 00002 that were not in 00001
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS availability TEXT;

ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS experience_years INTEGER;

-- Ensure twitter_id column exists (from migration 00017)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS twitter_id VARCHAR(15);

-- Ensure response_message and responded_at exist (they should from 00001)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS response_message TEXT;

ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Remove old contact_preference column if it still exists
ALTER TABLE public.applications 
DROP COLUMN IF EXISTS contact_preference;

-- Ensure the unique constraint exists
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_post_id_user_id_key;

ALTER TABLE public.applications 
ADD CONSTRAINT applications_post_id_user_id_key UNIQUE(post_id, user_id);

-- Update column comments
COMMENT ON COLUMN public.applications.availability IS 'Applicant availability information';
COMMENT ON COLUMN public.applications.experience_years IS 'Years of relevant experience';
COMMENT ON COLUMN public.applications.twitter_id IS 'Twitter/X username without @ symbol';

-- ========================================
-- 3. 関数の更新
-- ========================================

-- Drop and recreate notification trigger function
DROP FUNCTION IF EXISTS create_application_notification() CASCADE;

CREATE OR REPLACE FUNCTION create_application_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- 新しい応募が作成された時の通知
    IF TG_OP = 'INSERT' THEN
        -- 投稿者への通知
        INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
        SELECT 
            p.user_id,  -- Changed from p.author_id to p.user_id
            'application_received',
            '新しい応募が届きました',
            u.display_name || 'さんが「' || p.title || '」に応募しました',
            NEW.id,
            'application'
        FROM posts p
        JOIN users u ON NEW.user_id = u.id  -- Changed from user_profiles to users
        WHERE p.id = NEW.post_id;
        
        RETURN NEW;
    END IF;
    
    -- 応募ステータスが更新された時の通知
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- 応募者への通知
        INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
        SELECT 
            NEW.user_id,
            CASE 
                WHEN NEW.status = 'accepted' THEN 'application_accepted'
                WHEN NEW.status = 'rejected' THEN 'application_rejected'
                ELSE 'application_status_changed'
            END,
            CASE 
                WHEN NEW.status = 'accepted' THEN '応募が承認されました'
                WHEN NEW.status = 'rejected' THEN '応募が見送られました'
                ELSE '応募状況が更新されました'
            END,
            '「' || p.title || '」の応募状況: ' || 
            CASE 
                WHEN NEW.status = 'accepted' THEN '承認'
                WHEN NEW.status = 'rejected' THEN '見送り'
                WHEN NEW.status = 'pending' THEN '審査中'
                ELSE NEW.status
            END,
            NEW.id,
            'application'
        FROM posts p
        WHERE p.id = NEW.post_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS applications_notification_trigger ON applications;
CREATE TRIGGER applications_notification_trigger
    AFTER INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION create_application_notification();

-- ========================================
-- 4. ビューの作成
-- ========================================

-- Create or replace the applications detail view
CREATE OR REPLACE VIEW applications_detail_view AS
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
  a.response_message,
  a.responded_at,
  a.created_at,
  a.updated_at,
  p.title AS post_title,
  p.user_id AS post_author_id,
  u.display_name AS applicant_name,
  u.avatar_url AS applicant_avatar
FROM applications a
LEFT JOIN posts p ON a.post_id = p.id
LEFT JOIN users u ON a.user_id = u.id;

-- ========================================
-- 5. 確認クエリ
-- ========================================

-- テーブル構造を確認
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'applications'
ORDER BY ordinal_position;

-- RLSポリシーを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'applications';
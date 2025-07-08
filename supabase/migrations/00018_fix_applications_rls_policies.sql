-- Fix applications table RLS policies
-- Issue: RLS policies reference posts.author_id but the actual column is posts.user_id

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

-- Also update the trigger functions that might reference author_id
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

-- Update the stored functions that might reference author_id
DROP FUNCTION IF EXISTS get_post_applications(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION get_post_applications(
    post_uuid UUID,
    author_uuid UUID,
    status_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    application_id UUID,
    applicant_id UUID,
    applicant_name TEXT,
    applicant_avatar TEXT,
    application_message TEXT,
    application_status TEXT,
    portfolio_url TEXT,
    experience_years INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- 投稿者であることを確認 (changed from author_id to user_id)
    IF NOT EXISTS (SELECT 1 FROM posts WHERE id = post_uuid AND user_id = author_uuid) THEN
        RAISE EXCEPTION 'Unauthorized access to post applications';
    END IF;
    
    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        u.display_name,
        u.avatar_url,
        a.message,
        a.status,
        a.portfolio_url,
        a.experience_years,
        a.created_at
    FROM applications a
    JOIN users u ON a.user_id = u.id  -- Changed from user_profiles to users
    WHERE a.post_id = post_uuid
    AND (status_filter IS NULL OR a.status = status_filter)
    ORDER BY 
        CASE a.status 
            WHEN 'pending' THEN 1
            WHEN 'accepted' THEN 2
            WHEN 'rejected' THEN 3
            WHEN 'withdrawn' THEN 4
        END,
        a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
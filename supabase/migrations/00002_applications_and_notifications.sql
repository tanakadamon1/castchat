-- 応募機能と通知機能のデータベーススキーマ
-- Migration: Applications and Notifications System

-- 応募テーブル
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    portfolio_url TEXT,
    experience_years INTEGER,
    availability TEXT,
    contact_preference VARCHAR(20) DEFAULT 'discord',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約
    UNIQUE(post_id, user_id) -- 同じ募集に重複応募防止
);

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID, -- 関連するリソースのID（post_id, application_idなど）
    related_type VARCHAR(50), -- 関連リソースタイプ
    read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プッシュ通知購読テーブル
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id) -- 1ユーザー1購読
);

-- ユーザープロフィールテーブルの拡張
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
    portfolio_url TEXT,
    experience_years INTEGER,
    skills TEXT[],
    availability TEXT,
    hourly_rate INTEGER,
    preferred_contact VARCHAR(20) DEFAULT 'discord',
    is_public BOOLEAN DEFAULT true,
    verification_status VARCHAR(20) DEFAULT 'unverified',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_post_id ON applications(post_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user_created ON applications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_post_status ON applications(post_id, status) WHERE status != 'withdrawn';

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- 応募履歴ビュー
CREATE OR REPLACE VIEW application_history AS
SELECT 
    a.*,
    p.title as post_title,
    p.category as post_category,
    p.type as post_type,
    p.status as post_status,
    p.author_id as post_author_id,
    u.display_name as applicant_name,
    u.avatar_url as applicant_avatar,
    au.display_name as author_name
FROM applications a
JOIN posts p ON a.post_id = p.id
JOIN user_profiles u ON a.user_id = u.user_id
JOIN user_profiles au ON p.author_id = au.user_id;

-- 統計ビュー
CREATE OR REPLACE VIEW application_stats AS
SELECT 
    post_id,
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE status = 'withdrawn') as withdrawn_count
FROM applications 
GROUP BY post_id;

-- RLS (Row Level Security) ポリシー設定

-- 応募テーブルのRLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 応募者は自分の応募のみ参照可能
CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

-- 募集投稿者は自分の投稿への応募を参照可能
CREATE POLICY "Post authors can view applications to their posts" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = applications.post_id 
            AND posts.author_id = auth.uid()
        )
    );

-- 応募作成は認証ユーザーのみ
CREATE POLICY "Authenticated users can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 応募更新は本人または投稿者のみ
CREATE POLICY "Users can update own applications" ON applications
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = applications.post_id 
            AND posts.author_id = auth.uid()
        )
    );

-- 応募削除は本人のみ
CREATE POLICY "Users can delete own applications" ON applications
    FOR DELETE USING (auth.uid() = user_id);

-- 通知テーブルのRLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の通知のみ参照可能
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- 通知更新（既読状態など）は本人のみ
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 通知削除は本人のみ
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- プッシュ通知購読テーブルのRLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の購読情報のみ操作可能
CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 通知自動生成のトリガー関数
CREATE OR REPLACE FUNCTION create_application_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- 新しい応募が作成された時の通知
    IF TG_OP = 'INSERT' THEN
        -- 投稿者への通知
        INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
        SELECT 
            p.author_id,
            'application_received',
            '新しい応募が届きました',
            u.display_name || 'さんが「' || p.title || '」に応募しました',
            NEW.id,
            'application'
        FROM posts p
        JOIN user_profiles u ON NEW.user_id = u.user_id
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

-- トリガー設定
DROP TRIGGER IF EXISTS applications_notification_trigger ON applications;
CREATE TRIGGER applications_notification_trigger
    AFTER INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION create_application_notification();

-- 応募統計更新関数
CREATE OR REPLACE FUNCTION update_post_application_count()
RETURNS TRIGGER AS $$
BEGIN
    -- 投稿の応募数を更新
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET applications_count = applications_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET applications_count = GREATEST(applications_count - 1, 0)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 応募数更新トリガー
DROP TRIGGER IF EXISTS update_application_count_trigger ON applications;
CREATE TRIGGER update_application_count_trigger
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_post_application_count();

-- 効率的な応募一覧取得関数
CREATE OR REPLACE FUNCTION get_user_applications(
    user_uuid UUID, 
    page_size INT DEFAULT 20, 
    page_offset INT DEFAULT 0
)
RETURNS TABLE (
    application_id UUID,
    post_id UUID,
    post_title TEXT,
    post_category TEXT,
    post_type TEXT,
    application_status TEXT,
    application_message TEXT,
    author_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.post_id,
        p.title,
        p.category,
        p.type,
        a.status,
        a.message,
        au.display_name,
        a.created_at,
        a.updated_at
    FROM applications a
    JOIN posts p ON a.post_id = p.id
    JOIN user_profiles au ON p.author_id = au.user_id
    WHERE a.user_id = user_uuid
    ORDER BY a.created_at DESC
    LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 投稿者用応募一覧取得関数
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
    -- 投稿者であることを確認
    IF NOT EXISTS (SELECT 1 FROM posts WHERE id = post_uuid AND author_id = author_uuid) THEN
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
    JOIN user_profiles u ON a.user_id = u.user_id
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

-- 未読通知数取得関数
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications 
        WHERE user_id = user_uuid AND read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
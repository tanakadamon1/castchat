-- Messages System Migration
-- 作成日: 2025-07-02
-- 目的: メッセージ機能のためのテーブルとRLSポリシー作成

-- メッセージテーブル作成
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
    related_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約: 自分自身にメッセージを送信できない
    CONSTRAINT no_self_message CHECK (sender_id != recipient_id),
    
    -- 制約: コンテンツの長さ制限
    CONSTRAINT content_length CHECK (length(content) > 0 AND length(content) <= 2000)
);

-- インデックス作成 - パフォーマンス最適化
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id, created_at);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_related_application ON messages(related_application_id) WHERE related_application_id IS NOT NULL;

-- 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- RLS (Row Level Security) 有効化
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: ユーザーは自分が送信/受信したメッセージのみ参照可能
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        auth.uid() IN (sender_id, recipient_id)
    );

-- RLSポリシー: ユーザーは自分がメッセージを送信可能
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id 
        AND sender_id != recipient_id
    );

-- RLSポリシー: 受信者のみメッセージを既読にできる
CREATE POLICY "Recipients can update read status" ON messages
    FOR UPDATE USING (
        auth.uid() = recipient_id
    ) WITH CHECK (
        auth.uid() = recipient_id
    );

-- RLSポリシー: 送信者のみ自分のメッセージを削除可能
CREATE POLICY "Senders can delete own messages" ON messages
    FOR DELETE USING (
        auth.uid() = sender_id
    );

-- 会話サマリー用ビュー作成
CREATE OR REPLACE VIEW conversation_summaries AS
SELECT 
    CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.sender_id 
        ELSE m.recipient_id 
    END as user1_id,
    CASE 
        WHEN m.sender_id < m.recipient_id 
        THEN m.recipient_id 
        ELSE m.sender_id 
    END as user2_id,
    m.content as last_message,
    m.created_at as last_message_at,
    m.sender_id as last_sender_id,
    COUNT(unread.id) as unread_count
FROM messages m
LEFT JOIN messages unread ON (
    (unread.sender_id = m.sender_id AND unread.recipient_id = m.recipient_id) OR
    (unread.sender_id = m.recipient_id AND unread.recipient_id = m.sender_id)
) AND unread.is_read = false AND unread.recipient_id = auth.uid()
WHERE m.id = (
    SELECT id FROM messages m2 
    WHERE (
        (m2.sender_id = m.sender_id AND m2.recipient_id = m.recipient_id) OR
        (m2.sender_id = m.recipient_id AND m2.recipient_id = m.sender_id)
    )
    ORDER BY created_at DESC 
    LIMIT 1
)
GROUP BY 
    CASE WHEN m.sender_id < m.recipient_id THEN m.sender_id ELSE m.recipient_id END,
    CASE WHEN m.sender_id < m.recipient_id THEN m.recipient_id ELSE m.sender_id END,
    m.content, m.created_at, m.sender_id;

-- リアルタイム通知用のPublication設定
-- Supabaseで実行される設定
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 統計用ビュー
CREATE OR REPLACE VIEW message_statistics AS
SELECT 
    sender_id,
    COUNT(*) as total_sent,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as sent_today,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as sent_this_week
FROM messages
GROUP BY sender_id;

-- メッセージ数制限関数（レート制限）
CREATE OR REPLACE FUNCTION check_message_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    message_count INTEGER;
BEGIN
    -- 1時間以内に送信したメッセージ数をカウント
    SELECT COUNT(*) INTO message_count
    FROM messages
    WHERE sender_id = user_id 
    AND created_at >= NOW() - INTERVAL '1 hour';
    
    -- 1時間に最大50メッセージまで
    RETURN message_count < 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- メッセージ送信前のバリデーション関数
CREATE OR REPLACE FUNCTION validate_message_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- レート制限チェック
    IF NOT check_message_rate_limit(NEW.sender_id) THEN
        RAISE EXCEPTION 'Message rate limit exceeded. Please wait before sending more messages.';
    END IF;
    
    -- 受信者の存在確認
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.recipient_id) THEN
        RAISE EXCEPTION 'Recipient not found.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_message_insert
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION validate_message_insert();

-- 自動通知トリガー関数
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
    -- 新しいメッセージの通知を作成
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_id,
        is_read
    ) VALUES (
        NEW.recipient_id,
        'message_received',
        '新しいメッセージが届きました',
        CASE 
            WHEN length(NEW.content) > 50 
            THEN substring(NEW.content from 1 for 50) || '...'
            ELSE NEW.content
        END,
        NEW.id::text,
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();

-- データベースコメント追加
COMMENT ON TABLE messages IS 'ユーザー間のメッセージを保存するテーブル';
COMMENT ON COLUMN messages.content IS 'メッセージの内容（最大2000文字）';
COMMENT ON COLUMN messages.message_type IS 'メッセージタイプ（text, image）';
COMMENT ON COLUMN messages.related_application_id IS '関連する応募のID（オプション）';
COMMENT ON COLUMN messages.is_read IS '既読フラグ';
COMMENT ON COLUMN messages.read_at IS '既読日時';

-- マイグレーション完了ログ
INSERT INTO migrations (version, description, executed_at) 
VALUES ('00004', 'Messages system with RLS and triggers', NOW())
ON CONFLICT (version) DO NOTHING;
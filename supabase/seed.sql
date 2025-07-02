-- Seed data for development environment
-- This file contains sample data for testing

-- Insert sample users (after auth.users is populated via Auth)
-- Note: Users should be created through Supabase Auth first

-- Sample categories for posts
INSERT INTO post_categories (name, slug, description) VALUES
  ('ワールド制作', 'world-creation', 'VRChatワールドの制作に関するキャスト募集'),
  ('アバター制作', 'avatar-creation', 'VRChatアバターの制作に関するキャスト募集'),
  ('イベント', 'events', 'VRChatイベントのキャスト募集'),
  ('配信・動画', 'streaming', '配信や動画制作のキャスト募集'),
  ('その他', 'other', 'その他のキャスト募集');

-- Sample tags
INSERT INTO tags (name, slug) VALUES
  ('初心者歓迎', 'beginner-welcome'),
  ('経験者優遇', 'experienced-preferred'),
  ('報酬あり', 'paid'),
  ('ボランティア', 'volunteer'),
  ('長期', 'long-term'),
  ('短期', 'short-term'),
  ('緊急', 'urgent'),
  ('リモート', 'remote');

-- Note: Actual post data should be inserted after users are created through Auth
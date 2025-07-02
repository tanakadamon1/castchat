# 応募機能API開発サポート

## 第4-5スプリント - 応募機能とプロフィール機能の実装支援

### 応募機能API設計

#### 1. API エンドポイント設計
```typescript
// 応募関連エンドポイント
POST   /api/applications          - 新規応募作成
GET    /api/applications          - 応募一覧取得（応募者用）
GET    /api/applications/:id      - 応募詳細取得
PUT    /api/applications/:id      - 応募内容更新
DELETE /api/applications/:id      - 応募取消
PATCH  /api/applications/:id/status - 応募ステータス更新（主催者用）

// 募集投稿の応募管理（主催者用）
GET    /api/posts/:id/applications - 特定募集の応募一覧
POST   /api/posts/:id/applications/:applicationId/accept - 応募承認
POST   /api/posts/:id/applications/:applicationId/reject - 応募拒否

// ユーザープロフィール
GET    /api/users/profile         - 自分のプロフィール取得
PUT    /api/users/profile         - プロフィール更新
POST   /api/users/avatar          - アバター画像アップロード
GET    /api/users/:id             - 他ユーザーのプロフィール取得（公開情報のみ）
```

#### 2. データベーススキーマ拡張
```sql
-- 応募テーブルの詳細設計
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    portfolio_url TEXT,
    experience_years INTEGER,
    availability TEXT,
    contact_preference VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約
    UNIQUE(post_id, user_id) -- 同じ募集に重複応募防止
);

-- ユーザープロフィール拡張
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
    portfolio_url TEXT,
    experience_years INTEGER,
    skills TEXT[],
    availability TEXT,
    hourly_rate INTEGER,
    preferred_contact VARCHAR(20) DEFAULT 'discord',
    is_public BOOLEAN DEFAULT true,
    verification_status VARCHAR(20) DEFAULT 'unverified';

-- 応募履歴ビュー
CREATE OR REPLACE VIEW application_history AS
SELECT 
    a.*,
    p.title as post_title,
    p.category as post_category,
    p.type as post_type,
    p.status as post_status,
    u.display_name as applicant_name,
    u.avatar_url as applicant_avatar
FROM applications a
JOIN posts p ON a.post_id = p.id
JOIN user_profiles u ON a.user_id = u.user_id;
```

#### 3. Row Level Security (RLS) ポリシー
```sql
-- 応募テーブルのRLSポリシー
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
```

### 通知機能インフラストラクチャ

#### 1. 通知システム設計
```typescript
// 通知タイプ定義
export enum NotificationType {
  APPLICATION_RECEIVED = 'application_received',    // 応募受信
  APPLICATION_ACCEPTED = 'application_accepted',    // 応募承認
  APPLICATION_REJECTED = 'application_rejected',    // 応募拒否
  POST_DEADLINE_REMINDER = 'post_deadline_reminder', // 締切リマインダー
  POST_STATUS_CHANGED = 'post_status_changed',      // 投稿ステータス変更
  NEW_MESSAGE = 'new_message',                      // 新着メッセージ
  SYSTEM_ANNOUNCEMENT = 'system_announcement'       // システム通知
}

// 通知テーブルスキーマ
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- インデックス
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_read (read)
);
```

#### 2. リアルタイム通知システム
```typescript
// Supabase Realtime設定
import { createClient } from '@supabase/supabase-js'

// リアルタイム通知購読
export const subscribeToNotifications = (userId: string, callback: (notification: any) => void) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// プッシュ通知対応（PWA）
export const registerPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.register('/sw.js')
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
    })
    
    // Supabaseにsubscription情報を保存
    await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        subscription: JSON.stringify(subscription)
      })
  }
}
```

#### 3. メール通知システム
```typescript
// Edge Function for email notifications
// supabase/functions/send-notification-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, type, data } = await req.json()
    
    // ユーザーのメール設定を確認
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { data: user } = await supabase
      .from('user_profiles')
      .select('email, email_notifications')
      .eq('user_id', userId)
      .single()
    
    if (!user?.email_notifications) {
      return new Response(JSON.stringify({ success: false, reason: 'Email notifications disabled' }))
    }
    
    // メールテンプレート生成
    const emailContent = generateEmailTemplate(type, data)
    
    // 外部メールサービス（SendGrid, Resendなど）を使用
    const emailResponse = await fetch('https://api.sendgrid.v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: user.email }],
          subject: emailContent.subject,
        }],
        from: { email: 'noreply@castchat.jp', name: 'CastChat' },
        content: [{
          type: 'text/html',
          value: emailContent.html
        }]
      })
    })
    
    return new Response(JSON.stringify({ success: emailResponse.ok }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

### ファイルアップロード機能

#### 1. Supabase Storage設定
```typescript
// ストレージバケット設定
// storage/buckets.sql
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('portfolios', 'portfolios', true),
  ('attachments', 'attachments', false);

-- RLSポリシー設定
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### 2. ファイルアップロード API
```typescript
// ファイルアップロードヘルパー
export class FileUploadService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async uploadAvatar(file: File, userId: string): Promise<string> {
    // ファイル名生成
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`
    
    // ファイルサイズチェック
    if (file.size > 5 * 1024 * 1024) { // 5MB制限
      throw new Error('ファイルサイズは5MB以下にしてください')
    }
    
    // 画像形式チェック
    if (!file.type.startsWith('image/')) {
      throw new Error('画像ファイルをアップロードしてください')
    }
    
    // 画像リサイズ（クライアントサイド）
    const resizedFile = await this.resizeImage(file, 512, 512)
    
    // Supabase Storageにアップロード
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, resizedFile, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    // 公開URLを取得
    const { data: urlData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return urlData.publicUrl
  }

  private async resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // アスペクト比を保持してリサイズ
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: file.type }))
        }, file.type, 0.9)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }
}
```

### 統合テスト環境構築

#### 1. E2E テスト設定
```typescript
// cypress/e2e/application-flow.cy.ts
describe('Application Flow', () => {
  beforeEach(() => {
    // テストユーザーでログイン
    cy.login('test@example.com', 'password')
  })

  it('should complete full application flow', () => {
    // 募集一覧を表示
    cy.visit('/posts')
    cy.get('[data-testid="post-card"]').first().click()
    
    // 募集詳細から応募
    cy.get('[data-testid="apply-button"]').click()
    cy.get('[data-testid="application-message"]').type('応募メッセージです')
    cy.get('[data-testid="submit-application"]').click()
    
    // 応募完了確認
    cy.get('[data-testid="application-success"]').should('be.visible')
    
    // 応募履歴を確認
    cy.visit('/profile/applications')
    cy.get('[data-testid="application-item"]').should('contain', '応募メッセージです')
  })
})

// API統合テスト
// tests/integration/applications.test.ts
describe('Applications API', () => {
  test('should create application', async () => {
    const response = await apiClient.post('/api/applications', {
      postId: 'test-post-id',
      message: 'Test application message'
    })
    
    expect(response.status).toBe(201)
    expect(response.data.message).toBe('Test application message')
  })
  
  test('should prevent duplicate applications', async () => {
    // 最初の応募
    await apiClient.post('/api/applications', {
      postId: 'test-post-id',
      message: 'First application'
    })
    
    // 重複応募を試行
    await expect(
      apiClient.post('/api/applications', {
        postId: 'test-post-id',
        message: 'Duplicate application'
      })
    ).rejects.toThrow('既に応募済みです')
  })
})
```

### パフォーマンス最適化

#### 1. データベースクエリ最適化
```sql
-- 応募一覧の効率的な取得
CREATE OR REPLACE FUNCTION get_user_applications(user_uuid UUID, page_size INT DEFAULT 20, page_offset INT DEFAULT 0)
RETURNS TABLE (
    application_id UUID,
    post_title TEXT,
    post_category TEXT,
    application_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        p.title,
        p.category,
        a.status,
        a.created_at
    FROM applications a
    JOIN posts p ON a.post_id = p.id
    WHERE a.user_id = user_uuid
    ORDER BY a.created_at DESC
    LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- インデックス最適化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_created 
ON applications(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_post_status 
ON applications(post_id, status) WHERE status != 'withdrawn';
```

#### 2. キャッシュ戦略
```typescript
// Redis キャッシュ設定（将来的な拡張）
export const cacheConfig = {
  userProfile: { ttl: 300 }, // 5分
  postsList: { ttl: 60 },    // 1分
  notifications: { ttl: 30 }, // 30秒
}

// メモリキャッシュ（開発環境）
const cache = new Map<string, { data: any; expires: number }>()

export const getCached = <T>(key: string): T | null => {
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  cache.delete(key)
  return null
}

export const setCache = <T>(key: string, data: T, ttlSeconds: number): void => {
  cache.set(key, {
    data,
    expires: Date.now() + (ttlSeconds * 1000)
  })
}
```

---

これで第4-5スプリントの応募機能とプロフィール機能の実装に必要なインフラサポートが整いました。統合テスト環境も構築され、品質の高い機能開発が可能です。
# API Documentation

## Overview

CastChat uses Supabase as the backend, providing a PostgreSQL database with automatic API generation, real-time subscriptions, and authentication.

## Base URL

- **Production**: `https://ewjfnquypoeyoicmgbnp.supabase.co`
- **Local Development**: `http://localhost:54321`

## Authentication

All API requests require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Sign In
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Google OAuth (Sprint 1 Implementation)
```javascript
// フロントエンド実装（JavaScript/TypeScript）
import { supabase } from './supabase'

// Google OAuth ログイン
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  }
})

// セッション取得
const { data: { session } } = await supabase.auth.getSession()

// セッション更新
const { data, error } = await supabase.auth.refreshSession()

// ログアウト
const { error } = await supabase.auth.signOut()

// 認証状態変更の監視
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
  // イベント: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
})
```

#### 認証設定（Supabase config）
```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id"
secret = "your-google-client-secret"
redirect_uri = "http://localhost:54321/auth/v1/callback"
```

## Database API

### Base Pattern
```
https://ewjfnquypoeyoicmgbnp.supabase.co/rest/v1/<table_name>
```

### Common Headers
```
apikey: <anon_key>
Authorization: Bearer <jwt_token>
Content-Type: application/json
Prefer: return=representation
```

## Users API

### Get User Profile
```http
GET /rest/v1/users?id=eq.<user_id>
```

### Update User Profile
```http
PATCH /rest/v1/users?id=eq.<user_id>
Content-Type: application/json

{
  "display_name": "New Display Name",
  "bio": "Updated bio",
  "vrchat_username": "vrchat_user"
}
```

### User Schema
```typescript
interface User {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  vrchat_username?: string
  twitter_username?: string
  discord_username?: string
  website_url?: string
  role: 'user' | 'moderator' | 'admin'
  is_verified: boolean
  created_at: string
  updated_at: string
}
```

## Posts API

### Get All Posts
```http
GET /rest/v1/posts?status=eq.published&order=created_at.desc
```

### Get Post by ID
```http
GET /rest/v1/posts?id=eq.<post_id>
```

### Create Post
```http
POST /rest/v1/posts
Content-Type: application/json

{
  "title": "キャスト募集",
  "description": "詳細な説明",
  "category_id": "<category_id>",
  "requirements": "必要なスキル",
  "recruitment_count": 3,
  "deadline": "2024-12-31"
}
```

### Update Post
```http
PATCH /rest/v1/posts?id=eq.<post_id>&user_id=eq.<user_id>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description"
}
```

### Close Post
```http
PATCH /rest/v1/posts?id=eq.<post_id>&user_id=eq.<user_id>
Content-Type: application/json

{
  "status": "closed",
  "closed_at": "2024-01-15T10:00:00Z"
}
```

### Post Schema
```typescript
interface Post {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  requirements?: string
  world_name?: string
  recruitment_count: number
  deadline?: string
  status: 'draft' | 'published' | 'closed' | 'archived'
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
  published_at?: string
  closed_at?: string
}
```

## Applications API

### Get Applications for Post
```http
GET /rest/v1/applications?post_id=eq.<post_id>
```

### Get User's Applications
```http
GET /rest/v1/applications?user_id=eq.<user_id>
```

### Create Application
```http
POST /rest/v1/applications
Content-Type: application/json

{
  "post_id": "<post_id>",
  "message": "応募メッセージ",
  "portfolio_url": "https://portfolio.example.com"
}
```

### Update Application Status
```http
PATCH /rest/v1/applications?id=eq.<application_id>
Content-Type: application/json

{
  "status": "accepted",
  "response_message": "採用決定のご連絡",
  "responded_at": "2024-01-15T10:00:00Z"
}
```

### Application Schema
```typescript
interface Application {
  id: string
  post_id: string
  user_id: string
  message: string
  portfolio_url?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  response_message?: string
  created_at: string
  updated_at: string
  responded_at?: string
}
```

## Categories API

### Get All Categories
```http
GET /rest/v1/post_categories?order=display_order.asc
```

### Category Schema
```typescript
interface PostCategory {
  id: string
  name: string
  slug: string
  description?: string
  display_order: number
  created_at: string
}
```

## Tags API

### Get All Tags
```http
GET /rest/v1/tags?order=name.asc
```

### Get Posts by Tag
```http
GET /rest/v1/post_tags?tag_id=eq.<tag_id>&select=post_id,posts(*)
```

### Tag Schema
```typescript
interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}
```

## Search and Filtering

### Text Search
```http
GET /rest/v1/posts?or=(title.ilike.*<query>*,description.ilike.*<query>*)
```

### Filter by Category
```http
GET /rest/v1/posts?category_id=eq.<category_id>
```

### Filter by Status
```http
GET /rest/v1/posts?status=eq.published
```

### Complex Filters
```http
GET /rest/v1/posts?status=eq.published&category_id=eq.<category_id>&order=created_at.desc&limit=20&offset=0
```

## Real-time Subscriptions

### Subscribe to Post Changes
```javascript
const channel = supabase
  .channel('public:posts')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'posts'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

### Subscribe to Application Updates
```javascript
const channel = supabase
  .channel('public:applications')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'applications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Application updated!', payload)
  })
  .subscribe()
```

## File Storage

### Upload Image
```javascript
const { data, error } = await supabase.storage
  .from('post-images')
  .upload(`${postId}/${fileName}`, file)
```

### Get Public URL
```javascript
const { data } = supabase.storage
  .from('post-images')
  .getPublicUrl(`${postId}/${fileName}`)
```

### Storage Buckets
- `avatars`: User profile images
- `post-images`: Images for posts
- `portfolios`: Portfolio files

## Error Handling

### Common Error Codes
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Invalid or missing auth token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Unique constraint violation
- `422`: Unprocessable Entity - Validation error
- `500`: Internal Server Error

### Error Response Format
```json
{
  "code": "22P02",
  "details": "invalid input syntax for type uuid",
  "hint": null,
  "message": "invalid input syntax for type uuid: \"invalid-uuid\""
}
```

## Rate Limiting

- **Authenticated requests**: 100 requests per minute
- **Anonymous requests**: 30 requests per minute
- **File uploads**: 10 uploads per minute

## Pagination

### Using Range Headers
```http
GET /rest/v1/posts
Range: 0-19
```

### Response Headers
```
Content-Range: 0-19/100
```

### Query Parameters
```http
GET /rest/v1/posts?limit=20&offset=40
```

## Data Validation

### Input Validation Rules
- **Email**: Valid email format
- **Password**: Minimum 8 characters
- **Username**: 3-20 characters, alphanumeric and underscores
- **Post title**: 1-100 characters
- **Post description**: 1-2000 characters

### Required Fields
- **User**: email, username, display_name
- **Post**: title, description, category_id, user_id
- **Application**: post_id, user_id, message

## Testing

### Test Environment
- **Base URL**: `http://localhost:54321`
- **Test Database**: Isolated test data
- **Auth**: Test user credentials

### Example Test Request
```javascript
// Test creating a post
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'Test Post',
    description: 'Test Description',
    category_id: testCategoryId,
    user_id: testUserId
  })
  .select()
```

## TypeScript SDK

### Installation
```bash
npm install @supabase/supabase-js
```

### Usage
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)
```

### Type Safety
```typescript
// Type-safe queries
const { data, error } = await supabase
  .from('posts')
  .select('id, title, description, users(display_name)')
  .eq('status', 'published')

// data is automatically typed
```

## Migration and Versioning

### Database Migrations
```bash
# Create migration
supabase migration new <migration_name>

# Apply migrations
supabase db push

# Reset database
supabase db reset
```

### API Versioning
- Current version: v1
- Backwards compatibility maintained
- Deprecation notices provided for breaking changes

## 権限システム (Sprint 1 Implementation)

### ユーザー役割
```typescript
type UserRole = 'user' | 'moderator' | 'admin'
```

### 権限定義
```typescript
enum Permission {
  // 基本権限
  READ_POSTS = 'read_posts',
  CREATE_POSTS = 'create_posts',
  UPDATE_OWN_POSTS = 'update_own_posts',
  DELETE_OWN_POSTS = 'delete_own_posts',
  
  // プロフィール権限
  UPDATE_OWN_PROFILE = 'update_own_profile',
  VIEW_PROFILES = 'view_profiles',
  
  // 応募権限
  CREATE_APPLICATIONS = 'create_applications',
  VIEW_OWN_APPLICATIONS = 'view_own_applications',
  VIEW_POST_APPLICATIONS = 'view_post_applications',
  MANAGE_POST_APPLICATIONS = 'manage_post_applications',
  
  // モデレーター権限
  UPDATE_ANY_POSTS = 'update_any_posts',
  DELETE_ANY_POSTS = 'delete_any_posts',
  MODERATE_CONTENT = 'moderate_content',
  
  // 管理者権限
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_ANALYTICS = 'view_analytics'
}
```

### 役割別権限
```javascript
// 権限チェック例
import { usePermissions } from '@/lib/permissions'

const permissions = usePermissions(userProfile)

// 投稿作成権限チェック
if (permissions.canCreatePost()) {
  // 投稿作成フォーム表示
}

// 投稿編集権限チェック
if (permissions.canUpdatePost(postOwnerId)) {
  // 編集ボタン表示
}

// プロフィール編集権限チェック
if (permissions.canUpdateProfile(targetUserId)) {
  // プロフィール編集フォーム表示
}
```

### ルートガード
```typescript
import { requireAuth, requirePermission, Permission } from '@/lib/guards'

// 認証が必要なルート
{
  path: '/profile',
  beforeEnter: requireAuth
}

// 特定の権限が必要なルート
{
  path: '/posts/create',
  beforeEnter: requirePermission(Permission.CREATE_POSTS)
}

// 管理者のみアクセス可能
{
  path: '/admin',
  beforeEnter: requireAdmin
}
```

## セッション管理 (Sprint 1 Implementation)

### セッション自動監視
```javascript
import { sessionManager } from '@/lib/session'

// セッション監視開始（1分間隔）
sessionManager.startSessionMonitoring()

// セッション状態確認
const sessionState = await sessionManager.getCurrentSession()
console.log('Session valid:', sessionState.isValid)
console.log('Expires at:', sessionState.expiresAt)

// 手動セッション更新
const { session, error } = await sessionManager.refreshSession()
```

### セッション設定
- **自動リフレッシュ**: 有効期限5分前
- **監視間隔**: 1分
- **セッション有効期限**: 1時間
- **リフレッシュトークン**: 無期限（使用時更新）

## エラーハンドリング (Sprint 1 Implementation)

### 認証エラー
```typescript
interface AuthError {
  code: string
  message: string
  details?: string
}

// エラーコード
const AUTH_ERRORS = {
  INVALID_TOKEN: 'AUTH_001',
  SESSION_EXPIRED: 'AUTH_002',
  INSUFFICIENT_PERMISSION: 'AUTH_003',
  USER_NOT_FOUND: 'AUTH_004'
}
```

### エラーハンドリング例
```javascript
try {
  await authStore.signInWithGoogle()
} catch (error) {
  if (error.code === 'AUTH_001') {
    // トークン無効エラー処理
    await authStore.refreshSession()
  } else if (error.code === 'AUTH_002') {
    // セッション期限切れ
    router.push('/login')
  }
}
```

## Sprint 1 実装状況

### ✅ 完了済み
- データベーススキーマ設計・実装
- Google OAuth認証機能
- セッション管理システム
- 権限管理システム
- ユーザープロフィール管理
- 基本的なエラーハンドリング
- 認証ガード・ルート保護

### 🚧 Sprint 2以降で実装予定
- 投稿CRUD API
- 応募管理API
- 検索・フィルターAPI
- 通知機能
- ファイルアップロード
- メール送信機能

---

**最終更新**: 2025-01-01  
**Sprint 1 完了状況**: 認証・権限システム実装済み

For more detailed information, refer to the [Supabase Documentation](https://supabase.com/docs).
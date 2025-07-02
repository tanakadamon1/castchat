# API開発サポートガイド

## 第2-3スプリント - インフラ担当からのAPI開発サポート

### 募集投稿API開発サポート

#### 1. API設計支援
```typescript
// API Endpoint Structure
POST   /api/posts          - 新規募集投稿作成
GET    /api/posts          - 募集一覧取得（検索・フィルター対応）
GET    /api/posts/:id      - 募集詳細取得
PUT    /api/posts/:id      - 募集更新
DELETE /api/posts/:id      - 募集削除
PATCH  /api/posts/:id/status - 募集ステータス更新
```

#### 2. 環境設定サポート
```bash
# 開発用APIサーバー起動
npm run dev:api

# データベースマイグレーション実行
npm run db:migrate

# シードデータ投入
npm run db:seed
```

#### 3. 認証・認可サポート
- JWT トークン検証ミドルウェア設定済み
- RLS（Row Level Security）ポリシー適用済み
- ユーザー権限管理システム構築済み

#### 4. バリデーション支援
```typescript
// Zod スキーマ例（/src/schemas/post.ts に設置予定）
import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  category: z.enum(['voice_actor', 'dancer', 'model', 'photographer', 'event_staff']),
  type: z.enum(['paid', 'volunteer', 'collaboration']),
  worldName: z.string().optional(),
  compensation: z.string().optional(),
  deadline: z.string().datetime().optional(),
  requirements: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  contactMethod: z.enum(['discord', 'twitter', 'email', 'other']),
  contactValue: z.string().min(1)
})
```

### 検索・フィルターAPI開発サポート

#### 1. 検索仕様
```typescript
// 検索パラメータ
interface SearchParams {
  search?: string        // タイトル・説明・タグでの全文検索
  category?: string      // カテゴリフィルター
  type?: string          // 募集タイプフィルター
  status?: string        // ステータスフィルター
  sortBy?: 'newest' | 'oldest' | 'deadline' | 'popular'
  page?: number          // ページネーション
  limit?: number         // 1ページあたりの件数
}
```

#### 2. パフォーマンス最適化
- データベースインデックス設定済み
- キャッシュ戦略（Redis）設定準備済み
- ページネーション実装支援

#### 3. 監視・ログ設定
```typescript
// API パフォーマンス監視
import { logger } from '@/utils/logger'

// API呼び出しログ
logger.measurePerformance('posts_search', async () => {
  // 検索処理
})
```

### フロントエンド統合サポート

#### 1. API型定義提供
```typescript
// /src/types/api.ts
export interface PostResponse {
  id: string
  title: string
  description: string
  authorId: string
  authorName: string
  authorAvatar?: string
  category: string
  type: string
  status: string
  worldName?: string
  compensation?: string
  deadline?: string
  requirements: string[]
  tags: string[]
  contactMethod: string
  contactValue: string
  viewsCount: number
  applicationsCount: number
  createdAt: string
  updatedAt: string
}

export interface SearchResponse {
  posts: PostResponse[]
  total: number
  page: number
  totalPages: number
}
```

#### 2. エラーハンドリング支援
```typescript
// 統一エラーレスポンス形式
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// HTTP ステータスコード標準化
- 200: 成功
- 201: 作成成功
- 400: バリデーションエラー
- 401: 認証エラー
- 403: 権限エラー
- 404: リソース未発見
- 500: サーバーエラー
```

#### 3. 開発効率化ツール
```typescript
// モックデータ生成支援
import { mockPosts } from '@/utils/mockData'

// API呼び出しヘルパー
import { apiClient } from '@/utils/apiClient'

// 型安全なAPI呼び出し
const posts = await apiClient.get<SearchResponse>('/api/posts', {
  params: searchParams
})
```

### デプロイメント継続監視

#### 1. ステージング環境
```bash
# ステージング環境URL
https://staging.castchat.jp

# ステージング環境での動作確認
npm run test:staging
```

#### 2. パフォーマンス監視
- Core Web Vitals 監視継続
- API レスポンス時間監視
- エラー率監視
- ユーザー行動分析

#### 3. セキュリティ監視
```bash
# 定期セキュリティスキャン
./scripts/security-check.sh

# 依存関係脆弱性チェック
npm audit

# Supabase セキュリティ設定確認
supabase projects list
```

### 開発チーム連携

#### 1. コードレビュー支援
- PRテンプレート設定済み
- 自動コード品質チェック設定済み
- セキュリティスキャン自動実行

#### 2. 問題解決支援
```bash
# ログ確認
./scripts/monitoring-setup.sh logs

# パフォーマンス分析
./scripts/performance-optimization.sh analyze

# エラー調査
./scripts/bug-tracker.sh investigate
```

#### 3. 定期チェック項目
- [ ] API レスポンス時間 < 500ms
- [ ] データベース接続プール正常動作
- [ ] 認証システム正常動作  
- [ ] ファイルアップロード機能テスト
- [ ] バックアップ取得確認
- [ ] 監視アラート動作確認

### 緊急対応手順
1. **即座連絡**: Slack #incident-response
2. **ログ確認**: `./scripts/monitoring-setup.sh emergency`
3. **ロールバック**: `./scripts/deploy.sh rollback`
4. **システム復旧**: `./scripts/disaster-recovery.sh application`

---

このドキュメントは第2-3スプリント期間中のリファレンスとして活用してください。
質問や技術的支援が必要な場合は、インフラ担当まで連絡してください。
// API型定義
// フロントエンドとバックエンドで共有する型定義

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

export interface CreatePostRequest {
  title: string
  description: string
  category: string
  type: string
  worldName?: string
  compensation?: string
  deadline?: string
  requirements?: string[]
  tags?: string[]
  contactMethod: string
  contactValue: string
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  status?: string
}

export interface SearchParams {
  search?: string
  category?: string
  type?: string
  status?: string
  sortBy?: 'newest' | 'oldest' | 'deadline' | 'popular'
  page?: number
  limit?: number
}

export interface SearchResponse {
  posts: PostResponse[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
}

// Supabase統一レスポンス型（指示書対応）
export interface SupabaseResponse<T = any> {
  data: T | null
  error: string | null
  count?: number
}

// ユーザー関連
export interface UserResponse {
  id: string
  email: string
  displayName: string
  avatar?: string
  bio?: string
  twitterHandle?: string
  discordHandle?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateUserRequest {
  displayName?: string
  bio?: string
  twitterHandle?: string
  discordHandle?: string
  avatar?: string
}

// 応募関連
export interface ApplicationResponse {
  id: string
  postId: string
  userId: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  createdAt: string
  updatedAt: string
  user: Pick<UserResponse, 'id' | 'displayName' | 'avatar'>
  post: Pick<PostResponse, 'id' | 'title' | 'category'>
}

export interface CreateApplicationRequest {
  postId: string
  message: string
}

export interface UpdateApplicationRequest {
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  message?: string
}

// 通知関連
export interface NotificationResponse {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  relatedId?: string
  relatedType?: string
  createdAt: string
}

// ファイルアップロード関連
export interface UploadResponse {
  url: string
  key: string
  size: number
  mimeType: string
}

export interface UploadRequest {
  file: File
  category: 'avatar' | 'attachment' | 'image'
}

// ヘルスチェック関連
export interface HealthResponse {
  status: 'ok' | 'warning' | 'error'
  timestamp: string
  services: {
    database: 'ok' | 'error'
    storage: 'ok' | 'error'
    auth: 'ok' | 'error'
  }
  version: string
}

// 統計関連
export interface StatsResponse {
  totalPosts: number
  activePosts: number
  totalUsers: number
  totalApplications: number
  categoryCounts: Record<string, number>
  typeCounts: Record<string, number>
}
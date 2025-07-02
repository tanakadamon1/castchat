export interface Post {
  id: string
  title: string
  description: string
  category: PostCategory
  type: PostType
  requirements: string[]
  compensation?: string
  deadline?: string
  worldName?: string
  worldUrl?: string
  contactMethod: ContactMethod
  contactValue: string
  authorId: string
  authorName: string
  authorAvatar?: string
  status: PostStatus
  createdAt: string
  updatedAt: string
  applicationsCount: number
  viewsCount: number
  tags: string[]
  images?: string[]
  // Legacy fields for compatibility
  startDate?: string
  endDate?: string
  maxParticipants?: number
  minParticipants?: number
  payment?: string
}

export type PostCategory = 
  | 'video' // 動画制作
  | 'streaming' // 配信
  | 'event' // イベント
  | 'photo' // 写真撮影
  | 'modeling' // モデル
  | 'voice' // ボイス
  | 'other' // その他

export type PostType = 
  | 'paid' // 有償
  | 'volunteer' // 無償
  | 'collaboration' // コラボ

export type ContactMethod = 
  | 'discord' // Discord
  | 'twitter' // Twitter/X
  | 'email' // メール
  | 'vrchat' // VRChat

export type PostStatus = 
  | 'active' // 募集中
  | 'closed' // 募集終了
  | 'draft' // 下書き

export interface PostFilter {
  category?: PostCategory
  type?: PostType
  search?: string
  tags?: string[]
  status?: PostStatus
  sortBy?: 'newest' | 'oldest' | 'deadline' | 'popular'
}

export interface PostListResponse {
  posts: Post[]
  total: number
  hasNextPage: boolean
  page: number
  limit: number
}
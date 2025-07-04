export interface Post {
  id: string
  title: string
  description: string
  category: PostCategory
  requirements: string[]
  deadline?: string
  worldName?: string
  contactMethod: ContactMethod
  contactValue: string
  authorId: string
  authorName: string
  status: PostStatus
  createdAt: string
  updatedAt: string
  applicationsCount: number
  tags: string[]
  images?: string[]
  maxParticipants?: number
  eventStartDate?: string
  eventFrequency?: EventFrequency
}

export type PostCategory = 
  | 'customer-service' // 接客
  | 'meetings' // 集会
  | 'music-dance' // 音楽・ダンス
  | 'social' // 出会い
  | 'beginners' // 初心者
  | 'roleplay' // ロールプレイ
  | 'games' // ゲーム
  | 'other' // その他

export type EventFrequency = 
  | 'once' // 単発
  | 'weekly' // 週1
  | 'biweekly' // 隔週
  | 'monthly' // 月1

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
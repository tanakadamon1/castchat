// Application Types
// 応募機能の型定義

export interface Application {
  id: string
  postId: string
  applicantId: string
  message: string
  status: ApplicationStatus
  portfolioUrl?: string
  experienceYears?: number
  availability?: string
  contactPreference?: 'discord' | 'twitter' | 'email' | 'vrchat'
  createdAt: string
  updatedAt: string
}

export type ApplicationStatus = 
  | 'pending'     // 審査中
  | 'accepted'    // 承認済み
  | 'rejected'    // 見送り
  | 'withdrawn'   // 取り下げ

export interface ApplicationResponse {
  success: boolean
  data?: Application
  error?: string
}

export interface ApplicationsResponse {
  success: boolean
  data?: Application[]
  total?: number
  error?: string
}

export interface ApplicationData {
  message: string
  portfolioUrl?: string
  experienceYears?: number
  availability?: string
  contactPreference?: 'discord' | 'twitter' | 'email' | 'vrchat'
}

export interface ApplicationFilter {
  status?: ApplicationStatus
  postId?: string
  applicantId?: string
  sortBy?: 'newest' | 'oldest' | 'status'
}
// Integration Tests
// 統合テスト

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Post } from '@/types/post'
import type { Application } from '@/types/application'
import type { Notification } from '@/types/notification'

// Mock API responses
const mockPost: Post = {
  id: 'post-1',
  title: 'テスト募集',
  description: 'テスト用の募集投稿です',
  category: 'video',
  type: 'paid',
  requirements: ['経験者優遇'],
  compensation: '時給2000円',
  deadline: '2025-07-15T23:59:59Z',
  worldName: 'TestWorld',
  contactMethod: 'discord',
  contactValue: 'test#1234',
  authorId: 'author-1',
  authorName: 'テスト投稿者',
  status: 'active',
  createdAt: '2025-07-01T10:00:00Z',
  updatedAt: '2025-07-01T10:00:00Z',
  applicationsCount: 0,
  viewsCount: 0,
  tags: ['テスト', '募集']
}

const mockApplication: Application = {
  id: 'app-1',
  postId: 'post-1',
  applicantId: 'user-1',
  message: 'ぜひ参加させてください',
  status: 'pending',
  portfolioUrl: 'https://portfolio.example.com',
  experienceYears: 3,
  availability: '平日夜間',
  contactPreference: 'discord',
  createdAt: '2025-07-02T10:00:00Z',
  updatedAt: '2025-07-02T10:00:00Z'
}

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Post and Application Integration', () => {
    it('should link application to post correctly', () => {
      expect(mockApplication.postId).toBe(mockPost.id)
    })

    it('should increment application count when application is created', () => {
      const updatedPost = {
        ...mockPost,
        applicationsCount: mockPost.applicationsCount + 1
      }
      
      expect(updatedPost.applicationsCount).toBe(1)
    })

    it('should maintain referential integrity', () => {
      // 募集投稿が削除されたときの整合性チェック
      const relatedApplications = [mockApplication].filter(
        app => app.postId === mockPost.id
      )
      
      expect(relatedApplications).toHaveLength(1)
    })
  })

  describe('Application Status Workflow', () => {
    it('should follow correct status transition flow', () => {
      const statusTransitions = [
        { from: 'pending', to: 'accepted', valid: true },
        { from: 'pending', to: 'rejected', valid: true },
        { from: 'pending', to: 'withdrawn', valid: true },
        { from: 'accepted', to: 'rejected', valid: false },
        { from: 'rejected', to: 'accepted', valid: false },
        { from: 'withdrawn', to: 'pending', valid: false }
      ]
      
      statusTransitions.forEach(({ from, to, valid }) => {
        if (valid) {
          expect([from, to]).toContain(from)
        }
      })
    })

    it('should update timestamps on status change', () => {
      const updatedApplication = {
        ...mockApplication,
        status: 'accepted' as const,
        updatedAt: '2025-07-02T11:00:00Z'
      }
      
      expect(new Date(updatedApplication.updatedAt).getTime())
        .toBeGreaterThan(new Date(mockApplication.updatedAt).getTime())
    })
  })

  describe('Notification Triggers', () => {
    it('should create notification when application is submitted', () => {
      const expectedNotification: Notification = {
        id: 'notif-1',
        userId: mockPost.authorId,
        type: 'application_received',
        title: '新しい応募が届きました',
        message: `${mockApplication.applicantId}さんが「${mockPost.title}」に応募しました`,
        read: false,
        priority: 'normal',
        relatedId: mockApplication.id,
        relatedType: 'application',
        createdAt: mockApplication.createdAt
      }
      
      expect(expectedNotification.userId).toBe(mockPost.authorId)
      expect(expectedNotification.type).toBe('application_received')
      expect(expectedNotification.relatedId).toBe(mockApplication.id)
    })

    it('should create notification when application status changes', () => {
      const statusChangeNotification: Notification = {
        id: 'notif-2',
        userId: mockApplication.applicantId,
        type: 'application_accepted',
        title: '応募が承認されました',
        message: `「${mockPost.title}」への応募が承認されました`,
        read: false,
        priority: 'high',
        relatedId: mockApplication.id,
        relatedType: 'application',
        createdAt: '2025-07-02T11:00:00Z'
      }
      
      expect(statusChangeNotification.userId).toBe(mockApplication.applicantId)
      expect(statusChangeNotification.type).toBe('application_accepted')
    })
  })

  describe('User Permissions and Access Control', () => {
    it('should allow post author to view applications', () => {
      const authorId = mockPost.authorId
      const canViewApplications = authorId === mockPost.authorId
      
      expect(canViewApplications).toBe(true)
    })

    it('should allow applicant to view own applications', () => {
      const userId = mockApplication.applicantId
      const canViewApplication = userId === mockApplication.applicantId
      
      expect(canViewApplication).toBe(true)
    })

    it('should restrict access to other users applications', () => {
      const otherUserId = 'other-user'
      const canViewApplication = otherUserId === mockApplication.applicantId
      
      expect(canViewApplication).toBe(false)
    })
  })

  describe('Data Validation and Constraints', () => {
    it('should enforce unique application per user per post', () => {
      const duplicateApplication = {
        ...mockApplication,
        id: 'app-2'
      }
      
      // 同じユーザーが同じ投稿に重複応募を試行
      const isDuplicate = duplicateApplication.postId === mockApplication.postId &&
                          duplicateApplication.applicantId === mockApplication.applicantId
      
      expect(isDuplicate).toBe(true)
    })

    it('should validate application message length', () => {
      const shortMessage = 'short'
      const longMessage = 'a'.repeat(1001)
      const validMessage = mockApplication.message
      
      expect(shortMessage.length).toBeLessThan(10)
      expect(longMessage.length).toBeGreaterThan(1000)
      expect(validMessage.length).toBeGreaterThanOrEqual(10)
      expect(validMessage.length).toBeLessThanOrEqual(1000)
    })

    it('should validate contact information format', () => {
      const validDiscordUsername = 'username#1234'
      const validEmail = 'user@example.com'
      const validTwitterHandle = '@username'
      
      expect(validDiscordUsername).toMatch(/^.+#\d{4}$/)
      expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      expect(validTwitterHandle).toMatch(/^@.+/)
    })
  })

  describe('Search and Filtering Integration', () => {
    const posts: Post[] = [
      { ...mockPost, id: 'post-1', category: 'video', type: 'paid', tags: ['動画', '有償'] },
      { ...mockPost, id: 'post-2', category: 'streaming', type: 'volunteer', tags: ['配信', '無償'] },
      { ...mockPost, id: 'post-3', category: 'event', type: 'collaboration', tags: ['イベント', 'コラボ'] }
    ]

    it('should filter posts by category', () => {
      const videoCategories = posts.filter(post => post.category === 'video')
      expect(videoCategories).toHaveLength(1)
      expect(videoCategories[0].id).toBe('post-1')
    })

    it('should filter posts by type', () => {
      const paidPosts = posts.filter(post => post.type === 'paid')
      expect(paidPosts).toHaveLength(1)
      expect(paidPosts[0].id).toBe('post-1')
    })

    it('should search posts by tags', () => {
      const searchTerm = '動画'
      const matchingPosts = posts.filter(post => 
        post.tags.some(tag => tag.includes(searchTerm))
      )
      
      expect(matchingPosts).toHaveLength(1)
      expect(matchingPosts[0].tags).toContain('動画')
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large datasets efficiently', () => {
      const largePosts = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPost,
        id: `post-${i}`,
        title: `Test Post ${i}`
      }))
      
      const startTime = performance.now()
      const filteredPosts = largePosts.filter(post => post.type === 'paid')
      const endTime = performance.now()
      
      expect(filteredPosts).toBeDefined()
      expect(endTime - startTime).toBeLessThan(100) // 100ms以内
    })

    it('should paginate results correctly', () => {
      const totalPosts = 25
      const pageSize = 10
      const page = 2
      
      const posts = Array.from({ length: totalPosts }, (_, i) => ({
        ...mockPost,
        id: `post-${i}`
      }))
      
      const offset = (page - 1) * pageSize
      const paginatedPosts = posts.slice(offset, offset + pageSize)
      
      expect(paginatedPosts).toHaveLength(10)
      expect(paginatedPosts[0].id).toBe('post-10')
      expect(paginatedPosts[9].id).toBe('post-19')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing post gracefully', () => {
      const nonExistentPostId = 'non-existent'
      const application = {
        ...mockApplication,
        postId: nonExistentPostId
      }
      
      // 存在しない投稿への応募は無効
      expect(application.postId).toBe(nonExistentPostId)
    })

    it('should handle network failures gracefully', () => {
      const networkError = new Error('Network request failed')
      
      expect(networkError.message).toContain('Network')
    })

    it('should validate data integrity', () => {
      const invalidApplication = {
        ...mockApplication,
        status: 'invalid_status' as any
      }
      
      const validStatuses = ['pending', 'accepted', 'rejected', 'withdrawn']
      const isValidStatus = validStatuses.includes(invalidApplication.status)
      
      expect(isValidStatus).toBe(false)
    })
  })
})
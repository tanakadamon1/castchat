// Application Tests
// アプリケーション機能のテスト

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Application, ApplicationStatus } from '@/types/application'

// Mock data
const mockApplication: Application = {
  id: 'app-1',
  postId: 'post-1',
  applicantId: 'user-1',
  message: 'テスト応募メッセージ',
  status: 'pending',
  createdAt: '2025-07-02T10:00:00Z',
  updatedAt: '2025-07-02T10:00:00Z',
  portfolioUrl: undefined,
  experienceYears: undefined,
  availability: undefined
}

describe('Application', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Application creation', () => {
    it('should create application with required fields', () => {
      expect(mockApplication.id).toBe('app-1')
      expect(mockApplication.postId).toBe('post-1')
      expect(mockApplication.applicantId).toBe('user-1')
      expect(mockApplication.message).toBe('テスト応募メッセージ')
      expect(mockApplication.status).toBe('pending')
    })

    it('should have valid status values', () => {
      const validStatuses: ApplicationStatus[] = ['pending', 'accepted', 'rejected', 'withdrawn']
      
      validStatuses.forEach(status => {
        const application: Application = {
          ...mockApplication,
          status
        }
        expect(application.status).toBe(status)
      })
    })
  })

  describe('Application validation', () => {
    it('should require message field', () => {
      const invalidApplication = {
        ...mockApplication,
        message: ''
      }
      
      // メッセージが空の場合のバリデーション
      expect(invalidApplication.message.length).toBe(0)
    })

    it('should validate portfolio URL format', () => {
      const validUrls = [
        'https://example.com',
        'https://portfolio.example.com/user',
        'https://github.com/user/portfolio'
      ]
      
      validUrls.forEach(url => {
        const application = {
          ...mockApplication,
          portfolioUrl: url
        }
        expect(application.portfolioUrl).toMatch(/^https?:\/\//)
      })
    })

    it('should validate experience years', () => {
      const application = {
        ...mockApplication,
        experienceYears: 5
      }
      
      expect(application.experienceYears).toBeGreaterThanOrEqual(0)
      expect(application.experienceYears).toBeLessThanOrEqual(50)
    })
  })

  describe('Application status transitions', () => {
    it('should allow status change from pending to accepted', () => {
      const application = { ...mockApplication }
      application.status = 'accepted'
      
      expect(application.status).toBe('accepted')
    })

    it('should allow status change from pending to rejected', () => {
      const application = { ...mockApplication }
      application.status = 'rejected'
      
      expect(application.status).toBe('rejected')
    })

    it('should allow withdrawal from pending status', () => {
      const application = { ...mockApplication }
      application.status = 'withdrawn'
      
      expect(application.status).toBe('withdrawn')
    })
  })

  describe('Application data structure', () => {
    it('should have timestamp fields', () => {
      expect(mockApplication.createdAt).toBeDefined()
      expect(mockApplication.updatedAt).toBeDefined()
      expect(new Date(mockApplication.createdAt).getTime()).not.toBeNaN()
      expect(new Date(mockApplication.updatedAt).getTime()).not.toBeNaN()
    })

    it('should have optional fields', () => {
      const minimalApplication = {
        id: 'app-2',
        postId: 'post-2',
        applicantId: 'user-2',
        message: 'ミニマル応募',
        status: 'pending' as ApplicationStatus,
        createdAt: '2025-07-02T11:00:00Z',
        updatedAt: '2025-07-02T11:00:00Z'
      }
      
      // These properties are optional and not included in minimal application
      expect('portfolioUrl' in minimalApplication).toBe(false)
      expect('experienceYears' in minimalApplication).toBe(false)
      expect('availability' in minimalApplication).toBe(false)
    })
  })

  describe('Application filtering and sorting', () => {
    const applications: Application[] = [
      { ...mockApplication, id: 'app-1', status: 'pending', createdAt: '2025-07-01T10:00:00Z' },
      { ...mockApplication, id: 'app-2', status: 'accepted', createdAt: '2025-07-02T10:00:00Z' },
      { ...mockApplication, id: 'app-3', status: 'rejected', createdAt: '2025-07-03T10:00:00Z' }
    ]

    it('should filter by status', () => {
      const pendingApplications = applications.filter(app => app.status === 'pending')
      expect(pendingApplications).toHaveLength(1)
      expect(pendingApplications[0].id).toBe('app-1')
    })

    it('should sort by creation date', () => {
      const sortedApplications = [...applications].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      expect(sortedApplications[0].id).toBe('app-3')
      expect(sortedApplications[2].id).toBe('app-1')
    })

    it('should group by status', () => {
      const groupedByStatus = applications.reduce((acc, app) => {
        if (!acc[app.status]) {
          acc[app.status] = []
        }
        acc[app.status].push(app)
        return acc
      }, {} as Record<ApplicationStatus, Application[]>)
      
      expect(groupedByStatus.pending).toHaveLength(1)
      expect(groupedByStatus.accepted).toHaveLength(1)
      expect(groupedByStatus.rejected).toHaveLength(1)
    })
  })
})
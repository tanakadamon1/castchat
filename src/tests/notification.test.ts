// Notification Tests
// 通知機能のテスト

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Notification, NotificationType } from '@/types/notification'

// Mock data
const mockNotification: Notification = {
  id: 'notif-1',
  userId: 'user-1',
  type: 'application_received',
  title: '新しい応募が届きました',
  message: 'あなたの募集「テスト募集」に新しい応募がありました',
  read: false,
  priority: 'normal',
  relatedId: 'app-1',
  relatedType: 'application',
  createdAt: '2025-07-02T10:00:00Z'
}

describe('Notification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Notification creation', () => {
    it('should create notification with required fields', () => {
      expect(mockNotification.id).toBe('notif-1')
      expect(mockNotification.userId).toBe('user-1')
      expect(mockNotification.type).toBe('application_received')
      expect(mockNotification.title).toBe('新しい応募が届きました')
      expect(mockNotification.message).toBeDefined()
      expect(mockNotification.read).toBe(false)
    })

    it('should have valid notification types', () => {
      const validTypes: NotificationType[] = [
        'application_received',
        'application_accepted',
        'application_rejected',
        'post_deadline_reminder',
        'post_status_changed',
        'new_message',
        'system_announcement'
      ]
      
      validTypes.forEach(type => {
        const notification: Notification = {
          ...mockNotification,
          type
        }
        expect(notification.type).toBe(type)
      })
    })

    it('should have valid priority levels', () => {
      const validPriorities = ['low', 'normal', 'high', 'urgent'] as const
      
      validPriorities.forEach(priority => {
        const notification: Notification = {
          ...mockNotification,
          priority
        }
        expect(notification.priority).toBe(priority)
      })
    })
  })

  describe('Notification state management', () => {
    it('should start as unread by default', () => {
      const notification = { ...mockNotification }
      expect(notification.read).toBe(false)
    })

    it('should be markable as read', () => {
      const notification = { ...mockNotification }
      notification.read = true
      expect(notification.read).toBe(true)
    })

    it('should support related entity references', () => {
      const notification = { ...mockNotification }
      expect(notification.relatedId).toBe('app-1')
      expect(notification.relatedType).toBe('application')
    })
  })

  describe('Notification filtering and sorting', () => {
    const notifications: Notification[] = [
      { 
        ...mockNotification, 
        id: 'notif-1', 
        type: 'application_received', 
        read: false, 
        priority: 'high',
        createdAt: '2025-07-01T10:00:00Z' 
      },
      { 
        ...mockNotification, 
        id: 'notif-2', 
        type: 'application_accepted', 
        read: true, 
        priority: 'normal',
        createdAt: '2025-07-02T10:00:00Z' 
      },
      { 
        ...mockNotification, 
        id: 'notif-3', 
        type: 'system_announcement', 
        read: false, 
        priority: 'urgent',
        createdAt: '2025-07-03T10:00:00Z' 
      }
    ]

    it('should filter unread notifications', () => {
      const unreadNotifications = notifications.filter(notif => !notif.read)
      expect(unreadNotifications).toHaveLength(2)
    })

    it('should filter by type', () => {
      const applicationNotifications = notifications.filter(notif => 
        notif.type.startsWith('application_')
      )
      expect(applicationNotifications).toHaveLength(2)
    })

    it('should sort by priority', () => {
      const priorityOrder = { urgent: 3, high: 2, normal: 1, low: 0 }
      const sortedByPriority = [...notifications].sort((a, b) => 
        priorityOrder[b.priority] - priorityOrder[a.priority]
      )
      
      expect(sortedByPriority[0].priority).toBe('urgent')
      expect(sortedByPriority[1].priority).toBe('high')
      expect(sortedByPriority[2].priority).toBe('normal')
    })

    it('should sort by creation date (newest first)', () => {
      const sortedByDate = [...notifications].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      expect(sortedByDate[0].id).toBe('notif-3')
      expect(sortedByDate[2].id).toBe('notif-1')
    })
  })

  describe('Notification grouping', () => {
    const notifications: Notification[] = [
      { 
        ...mockNotification, 
        id: 'notif-1', 
        type: 'application_received',
        createdAt: '2025-07-02T10:00:00Z' 
      },
      { 
        ...mockNotification, 
        id: 'notif-2', 
        type: 'application_received',
        createdAt: '2025-07-02T11:00:00Z' 
      },
      { 
        ...mockNotification, 
        id: 'notif-3', 
        type: 'system_announcement',
        createdAt: '2025-07-01T10:00:00Z' 
      }
    ]

    it('should group by type', () => {
      const groupedByType = notifications.reduce((acc, notif) => {
        if (!acc[notif.type]) {
          acc[notif.type] = []
        }
        acc[notif.type].push(notif)
        return acc
      }, {} as Record<NotificationType, Notification[]>)
      
      expect(groupedByType.application_received).toHaveLength(2)
      expect(groupedByType.system_announcement).toHaveLength(1)
    })

    it('should group by date', () => {
      const groupedByDate = notifications.reduce((acc, notif) => {
        const date = notif.createdAt.split('T')[0]
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(notif)
        return acc
      }, {} as Record<string, Notification[]>)
      
      expect(groupedByDate['2025-07-02']).toHaveLength(2)
      expect(groupedByDate['2025-07-01']).toHaveLength(1)
    })
  })

  describe('Notification expiration', () => {
    it('should handle expiration dates', () => {
      const notification: Notification = {
        ...mockNotification,
        expiresAt: '2025-07-09T10:00:00Z'
      }
      
      const expirationDate = new Date(notification.expiresAt!)
      const now = new Date('2025-07-02T10:00:00Z')
      
      expect(expirationDate.getTime()).toBeGreaterThan(now.getTime())
    })

    it('should identify expired notifications', () => {
      const expiredNotification: Notification = {
        ...mockNotification,
        expiresAt: '2025-07-01T10:00:00Z'
      }
      
      const now = new Date('2025-07-02T10:00:00Z')
      const expirationDate = new Date(expiredNotification.expiresAt!)
      
      expect(expirationDate.getTime()).toBeLessThan(now.getTime())
    })
  })

  describe('Notification actions', () => {
    it('should support action data for interactive notifications', () => {
      const actionableNotification: Notification = {
        ...mockNotification,
        actionData: {
          buttonText: '応募を確認',
          actionUrl: '/applications/app-1',
          actionType: 'navigate'
        }
      }
      
      expect(actionableNotification.actionData?.buttonText).toBe('応募を確認')
      expect(actionableNotification.actionData?.actionUrl).toBe('/applications/app-1')
    })
  })
})
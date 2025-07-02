import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { postsService } from '../lib/posts'
import { categoriesService } from '../lib/categories'
import { tagsService } from '../lib/tags'
import { imagesService } from '../lib/images'
import { searchService } from '../lib/search'
import { statisticsService } from '../lib/statistics'
import type { Tables } from '../lib/database.types'

// テスト用のモックデータ
const mockUser: Tables<'users'> = {
  id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  bio: null,
  website_url: null,
  discord_username: null,
  twitter_username: null,
  vrchat_username: null,
  is_verified: false,
  role: 'user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockAdminUser: Tables<'users'> = {
  ...mockUser,
  id: 'admin-user-id',
  username: 'admin',
  role: 'admin'
}

const mockCategory: Tables<'post_categories'> = {
  id: 'test-category-id',
  name: 'テストカテゴリ',
  description: 'テスト用のカテゴリです',
  slug: 'test-category',
  display_order: 1,
  created_at: new Date().toISOString(),
}

const mockTag: Tables<'tags'> = {
  id: 'test-tag-id',
  name: 'テストタグ',
  slug: 'test-tag',
  created_at: new Date().toISOString(),
}

// Supabaseクライアントのモック
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      count: vi.fn()
    })),
    rpc: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn()
      }))
    }
  }
}))

describe('Posts API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockPost = {
        id: 'test-post-id',
        user_id: mockUser.id,
        title: 'テスト投稿',
        description: 'テスト投稿の説明',
        category_id: mockCategory.id,
        status: 'published' as const,
        created_at: new Date().toISOString()
      }

      const mockSupabaseResponse = {
        data: mockPost,
        error: null
      }

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse)
      } as any)

      const result = await postsService.createPost(mockUser.id, {
        title: 'テスト投稿',
        description: 'テスト投稿の説明',
        category_id: mockCategory.id
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockPost)
    })

    it('should fail with invalid title', async () => {
      const result = await postsService.createPost(mockUser.id, {
        title: '', // 空のタイトル
        description: 'テスト投稿の説明',
        category_id: mockCategory.id
      })

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('updatePost', () => {
    it('should update post successfully with proper permissions', async () => {
      const mockPost = {
        id: 'test-post-id',
        user_id: mockUser.id,
        title: '更新された投稿',
        status: 'published' as const
      }

      const mockSupabaseResponse = {
        data: mockPost,
        error: null
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse)
      } as any)

      const result = await postsService.updatePost(
        'test-post-id',
        mockUser.id,
        { title: '更新された投稿' },
        mockUser
      )

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockPost)
    })
  })
})

describe('Categories API', () => {
  describe('createCategory', () => {
    it('should create category with admin permissions', async () => {
      const mockSupabaseResponse = {
        data: mockCategory,
        error: null
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse)
      } as any)

      const result = await categoriesService.createCategory(
        mockAdminUser.id,
        {
          name: 'テストカテゴリ',
          description: 'テスト用のカテゴリです'
        },
        mockAdminUser
      )

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCategory)
    })

    it('should fail without admin permissions', async () => {
      const result = await categoriesService.createCategory(
        mockUser.id,
        {
          name: 'テストカテゴリ',
          description: 'テスト用のカテゴリです'
        },
        mockUser
      )

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('getCategories', () => {
    it('should return active categories', async () => {
      const mockSupabaseResponse = {
        data: [mockCategory],
        error: null
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSupabaseResponse)
      } as any)

      const result = await categoriesService.getCategories()

      expect(result.error).toBeNull()
      expect(result.data).toEqual([mockCategory])
    })
  })
})

describe('Tags API', () => {
  describe('createTag', () => {
    it('should create tag with proper permissions', async () => {
      const mockSupabaseResponse = {
        data: mockTag,
        error: null
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse)
      } as any)

      const result = await tagsService.createTag(
        mockAdminUser.id,
        {
          name: 'テストタグ',
          description: 'テスト用のタグです'
        },
        mockAdminUser
      )

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockTag)
    })
  })

  describe('getTags', () => {
    it('should return tags with search filter', async () => {
      const mockSupabaseResponse = {
        data: [mockTag],
        error: null,
        count: 1
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockSupabaseResponse)
      } as any)

      const result = await tagsService.getTags({
        search: 'テスト',
        limit: 10
      })

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
      expect(result.count).toBe(1)
    })
  })
})

describe('Images API', () => {
  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockUploadResponse = {
        data: { path: 'test-path' },
        error: null
      }

      const mockPublicUrlResponse = {
        data: { publicUrl: 'https://example.com/test.jpg' }
      }

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue(mockUploadResponse),
        getPublicUrl: vi.fn().mockReturnValue(mockPublicUrlResponse)
      } as any)

      const result = await imagesService.uploadImage(
        mockUser.id,
        {
          file: mockFile,
          alt_text: 'テスト画像'
        },
        mockUser
      )

      expect(result.error).toBeNull()
      expect(result.data?.url).toBe('https://example.com/test.jpg')
    })

    it('should fail with invalid file type', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      const result = await imagesService.uploadImage(
        mockUser.id,
        {
          file: mockFile
        },
        mockUser
      )

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })
})

describe('Search API', () => {
  describe('searchPosts', () => {
    it('should search posts with text query', async () => {
      const mockSearchResponse = {
        data: [
          {
            id: 'test-post-id',
            title: 'VRChatテスト募集',
            description: 'テスト用の募集投稿',
            users: mockUser,
            post_categories: mockCategory,
            post_tags: [{ tags: mockTag }],
            post_images: [],
            applications: [],
            favorites: []
          }
        ],
        error: null,
        count: 1
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockSearchResponse)
      } as any)

      const result = await searchService.searchPosts({
        query: 'VRChat',
        page: 1,
        limit: 10
      })

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].title).toContain('VRChat')
    })

    it('should search with category filter', async () => {
      const mockSearchResponse = {
        data: [],
        error: null,
        count: 0
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockSearchResponse)
      } as any)

      const result = await searchService.searchPosts({
        query: 'test',
        categories: [mockCategory.id],
        page: 1,
        limit: 10
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual([])
    })
  })

  describe('getSearchSuggestions', () => {
    it('should return search suggestions', async () => {
      const mockUsersResponse = {
        data: [{ username: 'testuser', display_name: 'Test User' }],
        error: null
      }

      const mockCategoriesResponse = {
        data: [{ name: 'テストカテゴリ', slug: 'test-category' }],
        error: null
      }

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue(mockUsersResponse)
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue(mockCategoriesResponse)
        } as any)
        .mockReturnValue({
          select: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: [], error: null })
        } as any)

      const result = await searchService.getSearchSuggestions('test')

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.length).toBeGreaterThan(0)
    })
  })
})

describe('Statistics API', () => {
  describe('getPostStatistics', () => {
    it('should return post statistics', async () => {
      const mockCountResponses = [
        { count: 100, error: null },
        { count: 80, error: null },
        { count: 15, error: null },
        { count: 5, error: null },
        { count: 10, error: null },
        { count: 30, error: null }
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis()
      } as any)

      // 複数の呼び出しに対してそれぞれ異なるレスポンスを返す
      mockCountResponses.forEach((response, index) => {
        vi.mocked(supabase.from).mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockResolvedValue(response)
        } as any)
      })

      const result = await statisticsService.getPostStatistics()

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.total_posts).toBe(100)
      expect(result.data?.published_posts).toBe(80)
    })
  })

  describe('getDashboardStatistics', () => {
    it('should return dashboard statistics for admin user', async () => {
      // 各統計メソッドをモック
      vi.spyOn(statisticsService, 'getPostStatistics').mockResolvedValue({
        data: {
          total_posts: 100,
          published_posts: 80,
          draft_posts: 15,
          closed_posts: 5,
          posts_this_week: 10,
          posts_this_month: 30,
          average_posts_per_day: 1
        },
        error: null
      })

      vi.spyOn(statisticsService, 'getUserStatistics').mockResolvedValue({
        data: {
          total_users: 50,
          active_users: 30,
          new_users_this_week: 5,
          new_users_this_month: 15,
          verified_users: 10
        },
        error: null
      })

      vi.spyOn(statisticsService, 'getApplicationStatistics').mockResolvedValue({
        data: {
          total_applications: 200,
          pending_applications: 50,
          accepted_applications: 100,
          rejected_applications: 50,
          applications_this_week: 20,
          applications_this_month: 60,
          average_applications_per_post: 2
        },
        error: null
      })

      vi.spyOn(statisticsService, 'getViewStatistics').mockResolvedValue({
        data: {
          total_views: 1000,
          unique_views: 700,
          views_this_week: 100,
          views_this_month: 300,
          most_viewed_posts: []
        },
        error: null
      })

      vi.spyOn(statisticsService, 'getCategoryStatistics').mockResolvedValue({
        data: [],
        error: null
      })

      vi.spyOn(statisticsService, 'getTagStatistics').mockResolvedValue({
        data: [],
        error: null
      })

      const result = await statisticsService.getDashboardStatistics(
        mockAdminUser.id,
        mockAdminUser
      )

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.posts.total_posts).toBe(100)
      expect(result.data?.users.total_users).toBe(50)
    })

    it('should fail without admin permissions', async () => {
      const result = await statisticsService.getDashboardStatistics(
        mockUser.id,
        mockUser
      )

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })
})

describe('Error Handling', () => {
  it('should handle database errors properly', async () => {
    const mockError = new Error('Database connection failed')

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    } as any)

    const result = await postsService.getPost('invalid-id')

    expect(result.error).not.toBeNull()
    expect(result.data).toBeNull()
  })

  it('should handle validation errors', async () => {
    const result = await postsService.createPost(mockUser.id, {
      title: '', // 無効な入力
      description: 'テスト',
      category_id: mockCategory.id
    })

    expect(result.error).not.toBeNull()
    expect(result.error?.code).toBe('VALIDATION_INVALID_FORMAT')
  })
})

describe('Performance', () => {
  it('should complete search within reasonable time', async () => {
    const start = Date.now()

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0
      })
    } as any)

    await searchService.searchPosts({
      query: 'test',
      page: 1,
      limit: 20
    })

    const duration = Date.now() - start
    expect(duration).toBeLessThan(1000) // 1秒以内
  })
})
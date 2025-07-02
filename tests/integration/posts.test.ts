// Integration tests for posts functionality
import { describe, it, expect, beforeEach } from 'vitest'
import { 
  testSupabase, 
  signUpTestUser, 
  signInTestUser, 
  createTestPost,
  expectValidUUID,
  expectValidDate
} from './setup'

describe('Posts Integration Tests', () => {
  let userId: string
  let categoryId: string

  beforeEach(async () => {
    // Create test user
    const authData = await signUpTestUser('user1')
    userId = authData.user!.id

    // Sign in
    await signInTestUser('user1')

    // Get a test category
    const { data: categories } = await testSupabase
      .from('post_categories')
      .select('id')
      .limit(1)

    categoryId = categories?.[0]?.id
    expect(categoryId).toBeDefined()
  })

  describe('Post Creation', () => {
    it('should create a new post', async () => {
      const postData = {
        title: 'テストワールド制作キャスト募集',
        description: 'VRChatワールド制作のキャストを募集します',
        requirements: '3Dモデリング経験者希望',
        recruitment_count: 3,
        world_name: 'テストワールド'
      }

      const post = await createTestPost(userId, categoryId, postData)

      expect(post).toBeDefined()
      expectValidUUID(post.id)
      expect(post.user_id).toBe(userId)
      expect(post.category_id).toBe(categoryId)
      expect(post.title).toBe(postData.title)
      expect(post.description).toBe(postData.description)
      expect(post.requirements).toBe(postData.requirements)
      expect(post.recruitment_count).toBe(postData.recruitment_count)
      expect(post.world_name).toBe(postData.world_name)
      expect(post.status).toBe('published')
      expectValidDate(post.created_at)
    })

    it('should validate required fields', async () => {
      const { error } = await testSupabase
        .from('posts')
        .insert({
          user_id: userId,
          category_id: categoryId,
          // Missing required title and description
        })

      expect(error).toBeDefined()
    })
  })

  describe('Post Retrieval', () => {
    it('should fetch all published posts', async () => {
      // Create test posts
      await createTestPost(userId, categoryId, { title: 'テスト投稿1' })
      await createTestPost(userId, categoryId, { title: 'テスト投稿2' })

      const { data: posts, error } = await testSupabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(posts).toBeDefined()
      expect(posts!.length).toBeGreaterThanOrEqual(2)
    })

    it('should fetch post with author and category details', async () => {
      const post = await createTestPost(userId, categoryId)

      const { data, error } = await testSupabase
        .from('posts')
        .select(`
          *,
          users:user_id (
            username,
            display_name,
            avatar_url
          ),
          post_categories:category_id (
            name,
            slug
          )
        `)
        .eq('id', post.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.users).toBeDefined()
      expect(data?.post_categories).toBeDefined()
    })
  })

  describe('Post Updates', () => {
    it('should allow post owner to update post', async () => {
      const post = await createTestPost(userId, categoryId)

      const updateData = {
        title: '更新されたタイトル',
        description: '更新された説明'
      }

      const { data: updatedPost, error } = await testSupabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id)
        .eq('user_id', userId) // Ensure only owner can update
        .select()
        .single()

      expect(error).toBeNull()
      expect(updatedPost?.title).toBe(updateData.title)
      expect(updatedPost?.description).toBe(updateData.description)
    })

    it('should increment view count', async () => {
      const post = await createTestPost(userId, categoryId)
      const initialViewCount = post.view_count

      // Simulate viewing the post
      const { error } = await testSupabase
        .from('posts')
        .update({ view_count: initialViewCount + 1 })
        .eq('id', post.id)

      expect(error).toBeNull()

      // Verify view count increased
      const { data: updatedPost } = await testSupabase
        .from('posts')
        .select('view_count')
        .eq('id', post.id)
        .single()

      expect(updatedPost?.view_count).toBe(initialViewCount + 1)
    })
  })

  describe('Post Search and Filtering', () => {
    beforeEach(async () => {
      // Create posts with different attributes for testing
      await createTestPost(userId, categoryId, {
        title: 'ワールド制作募集',
        description: 'Unity経験者募集'
      })
      await createTestPost(userId, categoryId, {
        title: 'アバター制作募集',
        description: 'Blender使える方'
      })
    })

    it('should search posts by title', async () => {
      const { data: posts, error } = await testSupabase
        .from('posts')
        .select('*')
        .ilike('title', '%ワールド%')

      expect(error).toBeNull()
      expect(posts).toBeDefined()
      expect(posts!.some(p => p.title.includes('ワールド'))).toBe(true)
    })

    it('should filter posts by category', async () => {
      const { data: posts, error } = await testSupabase
        .from('posts')
        .select('*')
        .eq('category_id', categoryId)

      expect(error).toBeNull()
      expect(posts).toBeDefined()
      expect(posts!.every(p => p.category_id === categoryId)).toBe(true)
    })

    it('should search posts by description content', async () => {
      const { data: posts, error } = await testSupabase
        .from('posts')
        .select('*')
        .textSearch('description', 'Unity')

      expect(error).toBeNull()
      expect(posts).toBeDefined()
    })
  })

  describe('Post Status Management', () => {
    it('should allow changing post status to closed', async () => {
      const post = await createTestPost(userId, categoryId)

      const { data: closedPost, error } = await testSupabase
        .from('posts')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', post.id)
        .eq('user_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(closedPost?.status).toBe('closed')
      expect(closedPost?.closed_at).toBeDefined()
    })
  })
})
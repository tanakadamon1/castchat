import { supabase } from './supabase'
import { validator } from './validation'
import { errorHandler, ErrorCode, type AppError } from './errors'
import { permissionManager } from './permissions'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type PostCategory = Tables<'post_categories'>
export type PostCategoryInsert = TablesInsert<'post_categories'>
export type PostCategoryUpdate = TablesUpdate<'post_categories'>

export interface PostCategoryWithStats extends PostCategory {
  post_count?: number
  recent_post_count?: number
}

export interface CategoryCreateData {
  name: string
  description?: string
  slug?: string
  color?: string
  icon?: string
  display_order?: number
}

export interface CategoryUpdateData {
  name?: string
  description?: string
  slug?: string
  color?: string
  icon?: string
  display_order?: number
  is_active?: boolean
}

export interface CategoriesApiResult<T = any> {
  data: T | null
  error: AppError | null
  count?: number
}

export class CategoriesService {
  private static instance: CategoriesService

  private constructor() {}

  static getInstance(): CategoriesService {
    if (!CategoriesService.instance) {
      CategoriesService.instance = new CategoriesService()
    }
    return CategoriesService.instance
  }

  async createCategory(
    userId: string,
    categoryData: CategoryCreateData,
    userProfile?: Tables<'users'>
  ): Promise<CategoriesApiResult<PostCategory>> {
    try {
      // 権限チェック（管理者のみ）
      if (!userProfile || !permissionManager.canCreateCategory(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to create category',
            `User ${userId} cannot create categories`
          )
        }
      }

      // バリデーション
      const nameValidation = validator.categoryName(categoryData.name)
      if (!nameValidation.isValid) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'Invalid category name',
            nameValidation.errors.join(', ')
          )
        }
      }

      // スラッグ生成（指定されていない場合）
      let slug = categoryData.slug
      if (!slug) {
        slug = this.generateSlug(categoryData.name)
      }

      // スラッグの重複チェック
      const { data: existingCategory } = await supabase
        .from('post_categories')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existingCategory) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_DUPLICATE_ENTRY,
            'Category slug already exists',
            `Slug "${slug}" is already in use`
          )
        }
      }

      // 表示順序の決定
      let displayOrder = categoryData.display_order
      if (displayOrder === undefined) {
        const { data: lastCategory } = await supabase
          .from('post_categories')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1)
          .single()

        displayOrder = (lastCategory?.display_order || 0) + 1
      }

      // カテゴリ作成
      const insertData: PostCategoryInsert = {
        name: categoryData.name,
        description: categoryData.description || null,
        slug,
        display_order: displayOrder
      }

      const { data: category, error } = await supabase
        .from('post_categories')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'create_category',
            userId,
            categoryData
          })
        }
      }

      return { data: category, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'create_category',
          userId,
          categoryData
        })
      }
    }
  }

  async updateCategory(
    categoryId: string,
    userId: string,
    updateData: CategoryUpdateData,
    userProfile?: Tables<'users'>
  ): Promise<CategoriesApiResult<PostCategory>> {
    try {
      // 権限チェック（管理者のみ）
      if (!userProfile || !permissionManager.canUpdateCategory(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to update category',
            `User ${userId} cannot update categories`
          )
        }
      }

      // カテゴリの存在確認
      const { data: existingCategory, error: fetchError } = await supabase
        .from('post_categories')
        .select('*')
        .eq('id', categoryId)
        .single()

      if (fetchError || !existingCategory) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Category not found',
            `Category with ID ${categoryId} not found`
          )
        }
      }

      // バリデーション
      if (updateData.name) {
        const nameValidation = validator.categoryName(updateData.name)
        if (!nameValidation.isValid) {
          return {
            data: null,
            error: errorHandler.createError(
              ErrorCode.VALIDATION_INVALID_FORMAT,
              'Invalid category name',
              nameValidation.errors.join(', ')
            )
          }
        }
      }

      // スラッグの重複チェック（変更される場合）
      if (updateData.slug && updateData.slug !== existingCategory.slug) {
        const { data: duplicateCategory } = await supabase
          .from('post_categories')
          .select('id')
          .eq('slug', updateData.slug)
          .neq('id', categoryId)
          .single()

        if (duplicateCategory) {
          return {
            data: null,
            error: errorHandler.createError(
              ErrorCode.DATABASE_DUPLICATE_ENTRY,
              'Category slug already exists',
              `Slug "${updateData.slug}" is already in use`
            )
          }
        }
      }

      // 更新データ準備
      const updatePayload: PostCategoryUpdate = {}
      
      if (updateData.name !== undefined) updatePayload.name = updateData.name
      if (updateData.description !== undefined) updatePayload.description = updateData.description
      if (updateData.slug !== undefined) updatePayload.slug = updateData.slug
      if (updateData.display_order !== undefined) updatePayload.display_order = updateData.display_order

      // カテゴリ更新
      const { data: updatedCategory, error } = await supabase
        .from('post_categories')
        .update(updatePayload)
        .eq('id', categoryId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'update_category',
            categoryId,
            userId,
            updateData
          })
        }
      }

      return { data: updatedCategory, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'update_category',
          categoryId,
          userId,
          updateData
        })
      }
    }
  }

  async deleteCategory(
    categoryId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<CategoriesApiResult<void>> {
    try {
      // 権限チェック（管理者のみ）
      if (!userProfile || !permissionManager.canDeleteCategory(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to delete category',
            `User ${userId} cannot delete categories`
          )
        }
      }

      // カテゴリの存在確認
      const { data: existingCategory, error: fetchError } = await supabase
        .from('post_categories')
        .select('*')
        .eq('id', categoryId)
        .single()

      if (fetchError || !existingCategory) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Category not found',
            `Category with ID ${categoryId} not found`
          )
        }
      }

      // カテゴリを使用している投稿があるかチェック
      const { count: postCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('category_id', categoryId)

      if (postCount && postCount > 0) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_FOREIGN_KEY_CONSTRAINT,
            'Cannot delete category with existing posts',
            `Category has ${postCount} associated posts`
          )
        }
      }

      // カテゴリ削除
      const { error } = await supabase
        .from('post_categories')
        .delete()
        .eq('id', categoryId)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'delete_category',
            categoryId,
            userId
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'delete_category',
          categoryId,
          userId
        })
      }
    }
  }

  async getCategory(categoryId: string): Promise<CategoriesApiResult<PostCategoryWithStats>> {
    try {
      const { data, error } = await supabase
        .from('post_categories')
        .select(`
          *,
          posts!posts_category_id_fkey(id)
        `)
        .eq('id', categoryId)
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_category',
            categoryId
          })
        }
      }

      if (!data) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Category not found',
            `Category with ID ${categoryId} not found`
          )
        }
      }

      // 統計データを追加
      const categoryWithStats: PostCategoryWithStats = {
        ...data,
        post_count: data.posts ? data.posts.length : 0
      }

      // 最近の投稿数（過去30日）
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentPostCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('category_id', categoryId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      categoryWithStats.recent_post_count = recentPostCount || 0

      return { data: categoryWithStats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_category',
          categoryId
        })
      }
    }
  }

  async getCategories(includeStats = false): Promise<CategoriesApiResult<PostCategoryWithStats[]>> {
    try {
      let query = supabase
        .from('post_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (includeStats) {
        query = supabase
          .from('post_categories')
          .select(`
            *,
            posts!posts_category_id_fkey(id)
          `)
          .eq('is_active', true)
          .order('display_order', { ascending: true })
      }

      const { data, error } = await query

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_categories'
          })
        }
      }

      let categories: PostCategoryWithStats[] = data || []

      if (includeStats) {
        categories = categories.map(category => ({
          ...category,
          post_count: (category as any).posts ? (category as any).posts.length : 0
        }))
      }

      return { data: categories, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_categories'
        })
      }
    }
  }

  async getCategoryBySlug(slug: string): Promise<CategoriesApiResult<PostCategoryWithStats>> {
    try {
      const { data, error } = await supabase
        .from('post_categories')
        .select(`
          *,
          posts!posts_category_id_fkey(id)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_category_by_slug',
            slug
          })
        }
      }

      if (!data) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Category not found',
            `Category with slug "${slug}" not found`
          )
        }
      }

      const categoryWithStats: PostCategoryWithStats = {
        ...data,
        post_count: data.posts ? data.posts.length : 0
      }

      return { data: categoryWithStats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_category_by_slug',
          slug
        })
      }
    }
  }

  async reorderCategories(
    categoryOrders: { id: string; display_order: number }[],
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<CategoriesApiResult<void>> {
    try {
      // 権限チェック（管理者のみ）
      if (!userProfile || !permissionManager.canUpdateCategory(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to reorder categories',
            `User ${userId} cannot reorder categories`
          )
        }
      }

      // バッチ更新
      for (const { id, display_order } of categoryOrders) {
        await supabase
          .from('post_categories')
          .update({ display_order })
          .eq('id', id)
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'reorder_categories',
          userId,
          categoryOrders
        })
      }
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

export const categoriesService = CategoriesService.getInstance()
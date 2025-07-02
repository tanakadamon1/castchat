import { supabase } from './supabase'
import { validator } from './validation'
import { errorHandler, ErrorCode, type AppError } from './errors'
import { permissionManager } from './permissions'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type Tag = Tables<'tags'>
export type TagInsert = TablesInsert<'tags'>
export type TagUpdate = TablesUpdate<'tags'>
export type PostTag = Tables<'post_tags'>

export interface TagWithStats extends Tag {
  post_count?: number
  recent_post_count?: number
}

export interface TagCreateData {
  name: string
  description?: string
  slug?: string
  color?: string
}

export interface TagUpdateData {
  name?: string
  description?: string
  slug?: string
  color?: string
  is_active?: boolean
}

export interface TagsApiResult<T = any> {
  data: T | null
  error: AppError | null
  count?: number
}

export interface TagsQuery {
  search?: string
  is_active?: boolean
  sort_by?: 'name' | 'created_at' | 'post_count'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export class TagsService {
  private static instance: TagsService

  private constructor() {}

  static getInstance(): TagsService {
    if (!TagsService.instance) {
      TagsService.instance = new TagsService()
    }
    return TagsService.instance
  }

  async createTag(
    userId: string,
    tagData: TagCreateData,
    userProfile?: Tables<'users'>
  ): Promise<TagsApiResult<Tag>> {
    try {
      // 権限チェック（管理者またはモデレーター）
      if (!userProfile || !permissionManager.canCreateTag(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to create tag',
            `User ${userId} cannot create tags`
          )
        }
      }

      // バリデーション
      const nameValidation = validator.tagName(tagData.name)
      if (!nameValidation.isValid) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'Invalid tag name',
            nameValidation.errors.join(', ')
          )
        }
      }

      // スラッグ生成（指定されていない場合）
      let slug = tagData.slug
      if (!slug) {
        slug = this.generateSlug(tagData.name)
      }

      // スラッグの重複チェック
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existingTag) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_DUPLICATE_ENTRY,
            'Tag slug already exists',
            `Slug "${slug}" is already in use`
          )
        }
      }

      // タグ作成
      const insertData: TagInsert = {
        name: tagData.name,
        slug
      }

      const { data: tag, error } = await supabase
        .from('tags')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'create_tag',
            userId,
            tagData
          })
        }
      }

      return { data: tag, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'create_tag',
          userId,
          tagData
        })
      }
    }
  }

  async updateTag(
    tagId: string,
    userId: string,
    updateData: TagUpdateData,
    userProfile?: Tables<'users'>
  ): Promise<TagsApiResult<Tag>> {
    try {
      // 権限チェック（管理者またはモデレーター）
      if (!userProfile || !permissionManager.canUpdateTag(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to update tag',
            `User ${userId} cannot update tags`
          )
        }
      }

      // タグの存在確認
      const { data: existingTag, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .eq('id', tagId)
        .single()

      if (fetchError || !existingTag) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Tag not found',
            `Tag with ID ${tagId} not found`
          )
        }
      }

      // バリデーション
      if (updateData.name) {
        const nameValidation = validator.tagName(updateData.name)
        if (!nameValidation.isValid) {
          return {
            data: null,
            error: errorHandler.createError(
              ErrorCode.VALIDATION_INVALID_FORMAT,
              'Invalid tag name',
              nameValidation.errors.join(', ')
            )
          }
        }
      }

      // スラッグの重複チェック（変更される場合）
      if (updateData.slug && updateData.slug !== existingTag.slug) {
        const { data: duplicateTag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', updateData.slug)
          .neq('id', tagId)
          .single()

        if (duplicateTag) {
          return {
            data: null,
            error: errorHandler.createError(
              ErrorCode.DATABASE_DUPLICATE_ENTRY,
              'Tag slug already exists',
              `Slug "${updateData.slug}" is already in use`
            )
          }
        }
      }

      // 更新データ準備
      const updatePayload: TagUpdate = {}
      
      if (updateData.name !== undefined) updatePayload.name = updateData.name
      if (updateData.slug !== undefined) updatePayload.slug = updateData.slug

      // タグ更新
      const { data: updatedTag, error } = await supabase
        .from('tags')
        .update(updatePayload)
        .eq('id', tagId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'update_tag',
            tagId,
            userId,
            updateData
          })
        }
      }

      return { data: updatedTag, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'update_tag',
          tagId,
          userId,
          updateData
        })
      }
    }
  }

  async deleteTag(
    tagId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<TagsApiResult<void>> {
    try {
      // 権限チェック（管理者またはモデレーター）
      if (!userProfile || !permissionManager.canDeleteTag(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to delete tag',
            `User ${userId} cannot delete tags`
          )
        }
      }

      // タグの存在確認
      const { data: existingTag, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .eq('id', tagId)
        .single()

      if (fetchError || !existingTag) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Tag not found',
            `Tag with ID ${tagId} not found`
          )
        }
      }

      // タグを使用している投稿があるかチェック
      const { count: postTagCount } = await supabase
        .from('post_tags')
        .select('post_id', { count: 'exact' })
        .eq('tag_id', tagId)

      if (postTagCount && postTagCount > 0) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_FOREIGN_KEY_CONSTRAINT,
            'Cannot delete tag with existing post associations',
            `Tag has ${postTagCount} associated posts`
          )
        }
      }

      // タグ削除（CASCADE により関連データも削除される）
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'delete_tag',
            tagId,
            userId
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'delete_tag',
          tagId,
          userId
        })
      }
    }
  }

  async getTag(tagId: string): Promise<TagsApiResult<TagWithStats>> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          post_tags!post_tags_tag_id_fkey(post_id)
        `)
        .eq('id', tagId)
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_tag',
            tagId
          })
        }
      }

      if (!data) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Tag not found',
            `Tag with ID ${tagId} not found`
          )
        }
      }

      // 統計データを追加
      const tagWithStats: TagWithStats = {
        ...data,
        post_count: data.post_tags ? data.post_tags.length : 0
      }

      return { data: tagWithStats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_tag',
          tagId
        })
      }
    }
  }

  async getTags(query: TagsQuery = {}): Promise<TagsApiResult<TagWithStats[]>> {
    try {
      const {
        search,
        is_active = true,
        sort_by = 'name',
        sort_order = 'asc',
        limit = 50,
        offset = 0
      } = query

      let supabaseQuery = supabase
        .from('tags')
        .select(`
          *,
          post_tags!post_tags_tag_id_fkey(post_id)
        `, { count: 'exact' })

      // フィルター適用
      if (is_active !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_active', is_active)
      }

      // テキスト検索
      if (search) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        )
      }

      // ソート
      supabaseQuery = supabaseQuery.order(sort_by, { ascending: sort_order === 'asc' })

      // ページネーション
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

      const { data, error, count } = await supabaseQuery

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_tags',
            query
          })
        }
      }

      const tagsWithStats: TagWithStats[] = (data || []).map(tag => ({
        ...tag,
        post_count: tag.post_tags ? tag.post_tags.length : 0
      }))

      return { 
        data: tagsWithStats, 
        error: null,
        count: count || 0
      }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_tags',
          query
        })
      }
    }
  }

  async getTagBySlug(slug: string): Promise<TagsApiResult<TagWithStats>> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          post_tags!post_tags_tag_id_fkey(post_id)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_tag_by_slug',
            slug
          })
        }
      }

      if (!data) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Tag not found',
            `Tag with slug "${slug}" not found`
          )
        }
      }

      const tagWithStats: TagWithStats = {
        ...data,
        post_count: data.post_tags ? data.post_tags.length : 0
      }

      return { data: tagWithStats, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_tag_by_slug',
          slug
        })
      }
    }
  }

  async getPopularTags(limit = 20): Promise<TagsApiResult<TagWithStats[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_popular_tags', { tag_limit: limit })

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_popular_tags',
            limit
          })
        }
      }

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_popular_tags',
          limit
        })
      }
    }
  }

  async addTagsToPost(postId: string, tagIds: string[]): Promise<TagsApiResult<void>> {
    try {
      // 既存のタグ関連付けを削除
      await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', postId)

      // 新しいタグ関連付けを作成
      if (tagIds.length > 0) {
        const postTags = tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId
        }))

        const { error } = await supabase
          .from('post_tags')
          .insert(postTags)

        if (error) {
          return {
            data: null,
            error: errorHandler.handleError(error, {
              operation: 'add_tags_to_post',
              postId,
              tagIds
            })
          }
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'add_tags_to_post',
          postId,
          tagIds
        })
      }
    }
  }

  async removeTagsFromPost(postId: string, tagIds?: string[]): Promise<TagsApiResult<void>> {
    try {
      let query = supabase
        .from('post_tags')
        .delete()
        .eq('post_id', postId)

      if (tagIds && tagIds.length > 0) {
        query = query.in('tag_id', tagIds)
      }

      const { error } = await query

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'remove_tags_from_post',
            postId,
            tagIds
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'remove_tags_from_post',
          postId,
          tagIds
        })
      }
    }
  }

  async getPostTags(postId: string): Promise<TagsApiResult<Tag[]>> {
    try {
      const { data, error } = await supabase
        .from('post_tags')
        .select(`
          tags(*)
        `)
        .eq('post_id', postId)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_post_tags',
            postId
          })
        }
      }

      const tags = (data || []).map((item: any) => item.tags).filter(Boolean) as Tag[]

      return { data: tags, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_post_tags',
          postId
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

export const tagsService = TagsService.getInstance()
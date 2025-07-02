import { supabase } from './supabase'
import { validator } from './validation'
import { errorHandler, ErrorCode, type AppError } from './errors'
import { permissionManager } from './permissions'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type PostImage = Tables<'post_images'>
export type PostImageInsert = TablesInsert<'post_images'>
export type PostImageUpdate = TablesUpdate<'post_images'>

export interface ImageUploadData {
  file: File
  alt_text?: string
  display_order?: number
}

export interface ImageUpdateData {
  alt_text?: string
  display_order?: number
}

export interface ImagesApiResult<T = any> {
  data: T | null
  error: AppError | null
  count?: number
}

export interface StorageUploadResult {
  url: string
  path: string
  size: number
}

export class ImagesService {
  private static instance: ImagesService
  private readonly BUCKET_NAME = 'post-images'
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  private constructor() {}

  static getInstance(): ImagesService {
    if (!ImagesService.instance) {
      ImagesService.instance = new ImagesService()
    }
    return ImagesService.instance
  }

  async uploadImage(
    userId: string,
    imageData: ImageUploadData,
    userProfile?: Tables<'users'>
  ): Promise<ImagesApiResult<StorageUploadResult>> {
    try {
      // 権限チェック
      if (!userProfile || !permissionManager.canUploadImage(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to upload image',
            `User ${userId} cannot upload images`
          )
        }
      }

      // ファイルサイズチェック
      if (imageData.file.size > this.MAX_FILE_SIZE) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'File size too large',
            `File size ${imageData.file.size} exceeds maximum ${this.MAX_FILE_SIZE} bytes`
          )
        }
      }

      // ファイル形式チェック
      if (!this.ALLOWED_TYPES.includes(imageData.file.type)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.VALIDATION_INVALID_FORMAT,
            'Invalid file type',
            `File type ${imageData.file.type} is not allowed`
          )
        }
      }

      // ファイル名生成
      const fileExtension = imageData.file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

      // Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, imageData.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        return {
          data: null,
          error: errorHandler.handleError(uploadError, {
            operation: 'upload_image',
            userId,
            fileName
          })
        }
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName)

      const result: StorageUploadResult = {
        url: publicUrl,
        path: fileName,
        size: imageData.file.size
      }

      return { data: result, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'upload_image',
          userId,
          imageData
        })
      }
    }
  }

  async addImageToPost(
    postId: string,
    userId: string,
    imageUrl: string,
    altText?: string,
    displayOrder?: number,
    userProfile?: Tables<'users'>
  ): Promise<ImagesApiResult<PostImage>> {
    try {
      // 投稿の存在確認と権限チェック
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (postError || !post) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Post not found',
            `Post with ID ${postId} not found`
          )
        }
      }

      // 権限チェック（投稿者または管理者）
      if (userProfile && !permissionManager.canUpdatePost(userProfile, post.user_id)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to add image to post',
            `User ${userId} cannot add images to post ${postId}`
          )
        }
      }

      // 表示順序の決定
      let finalDisplayOrder = displayOrder
      if (finalDisplayOrder === undefined) {
        const { data: lastImage } = await supabase
          .from('post_images')
          .select('display_order')
          .eq('post_id', postId)
          .order('display_order', { ascending: false })
          .limit(1)
          .single()

        finalDisplayOrder = (lastImage?.display_order || -1) + 1
      }

      // 画像レコード作成
      const insertData: PostImageInsert = {
        post_id: postId,
        url: imageUrl,
        alt_text: altText || null,
        display_order: finalDisplayOrder
      }

      const { data: image, error } = await supabase
        .from('post_images')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'add_image_to_post',
            postId,
            userId,
            imageUrl
          })
        }
      }

      return { data: image, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'add_image_to_post',
          postId,
          userId,
          imageUrl
        })
      }
    }
  }

  async updatePostImage(
    imageId: string,
    userId: string,
    updateData: ImageUpdateData,
    userProfile?: Tables<'users'>
  ): Promise<ImagesApiResult<PostImage>> {
    try {
      // 画像の存在確認
      const { data: existingImage, error: fetchError } = await supabase
        .from('post_images')
        .select(`
          *,
          posts!post_images_post_id_fkey(user_id)
        `)
        .eq('id', imageId)
        .single()

      if (fetchError || !existingImage) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Image not found',
            `Image with ID ${imageId} not found`
          )
        }
      }

      // 権限チェック（投稿者または管理者）
      if (userProfile && !permissionManager.canUpdatePost(userProfile, existingImage.posts.user_id)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to update image',
            `User ${userId} cannot update image ${imageId}`
          )
        }
      }

      // 更新データ準備
      const updatePayload: PostImageUpdate = {}
      
      if (updateData.alt_text !== undefined) updatePayload.alt_text = updateData.alt_text
      if (updateData.display_order !== undefined) updatePayload.display_order = updateData.display_order

      // 画像更新
      const { data: updatedImage, error } = await supabase
        .from('post_images')
        .update(updatePayload)
        .eq('id', imageId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'update_post_image',
            imageId,
            userId,
            updateData
          })
        }
      }

      return { data: updatedImage, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'update_post_image',
          imageId,
          userId,
          updateData
        })
      }
    }
  }

  async deletePostImage(
    imageId: string,
    userId: string,
    userProfile?: Tables<'users'>
  ): Promise<ImagesApiResult<void>> {
    try {
      // 画像の存在確認
      const { data: existingImage, error: fetchError } = await supabase
        .from('post_images')
        .select(`
          *,
          posts!post_images_post_id_fkey(user_id)
        `)
        .eq('id', imageId)
        .single()

      if (fetchError || !existingImage) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Image not found',
            `Image with ID ${imageId} not found`
          )
        }
      }

      // 権限チェック（投稿者または管理者）
      if (userProfile && !permissionManager.canUpdatePost(userProfile, existingImage.posts.user_id)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to delete image',
            `User ${userId} cannot delete image ${imageId}`
          )
        }
      }

      // Storageから画像ファイル削除
      const imagePath = this.extractPathFromUrl(existingImage.url)
      if (imagePath) {
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([imagePath])
      }

      // データベースレコード削除
      const { error } = await supabase
        .from('post_images')
        .delete()
        .eq('id', imageId)

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'delete_post_image',
            imageId,
            userId
          })
        }
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'delete_post_image',
          imageId,
          userId
        })
      }
    }
  }

  async getPostImages(postId: string): Promise<ImagesApiResult<PostImage[]>> {
    try {
      const { data, error } = await supabase
        .from('post_images')
        .select('*')
        .eq('post_id', postId)
        .order('display_order', { ascending: true })

      if (error) {
        return {
          data: null,
          error: errorHandler.handleError(error, {
            operation: 'get_post_images',
            postId
          })
        }
      }

      return { data: data || [], error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'get_post_images',
          postId
        })
      }
    }
  }

  async reorderPostImages(
    postId: string,
    userId: string,
    imageOrders: { id: string; display_order: number }[],
    userProfile?: Tables<'users'>
  ): Promise<ImagesApiResult<void>> {
    try {
      // 投稿の存在確認と権限チェック
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (postError || !post) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Post not found',
            `Post with ID ${postId} not found`
          )
        }
      }

      // 権限チェック（投稿者または管理者）
      if (userProfile && !permissionManager.canUpdatePost(userProfile, post.user_id)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to reorder images',
            `User ${userId} cannot reorder images for post ${postId}`
          )
        }
      }

      // バッチ更新
      for (const { id, display_order } of imageOrders) {
        await supabase
          .from('post_images')
          .update({ display_order })
          .eq('id', id)
          .eq('post_id', postId) // セキュリティのため投稿IDも確認
      }

      return { data: null, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'reorder_post_images',
          postId,
          userId,
          imageOrders
        })
      }
    }
  }

  async uploadAndAddToPost(
    postId: string,
    userId: string,
    imageData: ImageUploadData,
    userProfile?: Tables<'users'>
  ): Promise<ImagesApiResult<PostImage>> {
    try {
      // 画像アップロード
      const uploadResult = await this.uploadImage(userId, imageData, userProfile)
      if (uploadResult.error || !uploadResult.data) {
        return {
          data: null,
          error: uploadResult.error || errorHandler.createError(
            ErrorCode.STORAGE_UPLOAD_FAILED,
            'Failed to upload image',
            'Image upload returned no data'
          )
        }
      }

      // 投稿に画像を追加
      const addResult = await this.addImageToPost(
        postId,
        userId,
        uploadResult.data.url,
        imageData.alt_text,
        imageData.display_order,
        userProfile
      )

      return addResult
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'upload_and_add_to_post',
          postId,
          userId,
          imageData
        })
      }
    }
  }

  async deleteUnusedImages(userId: string, userProfile?: Tables<'users'>): Promise<ImagesApiResult<number>> {
    try {
      // 管理者権限が必要
      if (!userProfile || !permissionManager.canDeleteUnusedImages(userProfile)) {
        return {
          data: null,
          error: errorHandler.createError(
            ErrorCode.PERMISSION_DENIED,
            'Insufficient permissions to delete unused images',
            `User ${userId} cannot delete unused images`
          )
        }
      }

      // 24時間以上前にアップロードされた未使用画像を検索
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)

      // 実装詳細は使用されていない画像を特定するロジックが必要
      // この例では簡略化
      
      return { data: 0, error: null }
    } catch (err) {
      return {
        data: null,
        error: errorHandler.handleError(err, {
          operation: 'delete_unused_images',
          userId
        })
      }
    }
  }

  private extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === this.BUCKET_NAME)
      
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/')
      }
      
      return null
    } catch {
      return null
    }
  }

  // 画像最適化のためのヘルパーメソッド
  async generateThumbnail(imageUrl: string, width = 300, height = 200): Promise<string> {
    // Supabase Image Transformationを使用
    const url = new URL(imageUrl)
    url.searchParams.set('width', width.toString())
    url.searchParams.set('height', height.toString())
    url.searchParams.set('resize', 'cover')
    return url.toString()
  }
}

export const imagesService = ImagesService.getInstance()
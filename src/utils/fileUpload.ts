// ファイルアップロードユーティリティ
// Supabase Storage統合

import { ref, readonly } from 'vue'
import { supabase } from '@/lib/supabase'
import { logger } from './logger'

export interface UploadOptions {
  bucket: 'avatars' | 'portfolios' | 'attachments'
  maxSize?: number // bytes
  allowedTypes?: string[]
  resize?: {
    width: number
    height: number
    quality?: number
  }
}

export interface UploadResult {
  url: string
  path: string
  size: number
  type: string
}

export class FileUploadService {
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly DEFAULT_ALLOWED_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif'
  ]

  /**
   * ファイルをアップロードする
   */
  static async uploadFile(
    file: File, 
    options: UploadOptions,
    userId?: string
  ): Promise<UploadResult> {
    try {
      // ファイル検証
      await this.validateFile(file, options)
      
      // ファイル処理（リサイズなど）
      const processedFile = await this.processFile(file, options)
      
      // ファイルパス生成
      const filePath = this.generateFilePath(file.name, options.bucket, userId)
      
      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }
      
      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath)
      
      const result: UploadResult = {
        url: urlData.publicUrl,
        path: filePath,
        size: processedFile.size,
        type: processedFile.type
      }
      
      logger.info('File uploaded successfully', {
        action: 'file_upload',
        metadata: {
          bucket: options.bucket,
          size: result.size,
          type: result.type
        }
      })
      
      return result
      
    } catch (error) {
      logger.error('File upload failed', error as Error, {
        action: 'file_upload_error',
        metadata: {
          bucket: options.bucket,
          fileName: file.name,
          fileSize: file.size
        }
      })
      throw error
    }
  }

  /**
   * アバター画像をアップロードする
   */
  static async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'avatars',
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      resize: {
        width: 512,
        height: 512,
        quality: 0.9
      }
    }, userId)
  }

  /**
   * ポートフォリオ画像をアップロードする
   */
  static async uploadPortfolio(file: File, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'portfolios',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    }, userId)
  }

  /**
   * 添付ファイルをアップロードする
   */
  static async uploadAttachment(file: File, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'attachments',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
    }, userId)
  }

  /**
   * ファイルを削除する
   */
  static async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])
      
      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
      
      logger.info('File deleted successfully', {
        action: 'file_delete',
        metadata: { bucket, path }
      })
      
    } catch (error) {
      logger.error('File deletion failed', error as Error, {
        action: 'file_delete_error',
        metadata: { bucket, path }
      })
      throw error
    }
  }

  /**
   * ファイル検証
   */
  private static async validateFile(file: File, options: UploadOptions): Promise<void> {
    // ファイルサイズチェック
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE
    if (file.size > maxSize) {
      throw new Error(`ファイルサイズは${this.formatFileSize(maxSize)}以下にしてください`)
    }
    
    // ファイルタイプチェック
    const allowedTypes = options.allowedTypes || this.DEFAULT_ALLOWED_TYPES
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`対応していないファイル形式です。${allowedTypes.join(', ')}が利用できます`)
    }
    
    // 画像の場合は追加チェック
    if (file.type.startsWith('image/')) {
      await this.validateImage(file)
    }
  }

  /**
   * 画像ファイルの検証
   */
  private static async validateImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        // 最大解像度チェック
        const maxDimension = 4096
        if (img.width > maxDimension || img.height > maxDimension) {
          reject(new Error(`画像のサイズは${maxDimension}x${maxDimension}ピクセル以下にしてください`))
          return
        }
        
        // 最小解像度チェック
        const minDimension = 32
        if (img.width < minDimension || img.height < minDimension) {
          reject(new Error(`画像のサイズは${minDimension}x${minDimension}ピクセル以上にしてください`))
          return
        }
        
        resolve()
      }
      
      img.onerror = () => {
        reject(new Error('画像ファイルが破損しています'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * ファイル処理（リサイズなど）
   */
  private static async processFile(file: File, options: UploadOptions): Promise<File> {
    // 画像ファイルでリサイズ指定がある場合
    if (file.type.startsWith('image/') && options.resize) {
      return this.resizeImage(file, options.resize)
    }
    
    return file
  }

  /**
   * 画像リサイズ
   */
  private static async resizeImage(
    file: File, 
    resize: { width: number; height: number; quality?: number }
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // アスペクト比を保持してリサイズ
        const aspectRatio = img.width / img.height
        let { width, height } = resize
        
        if (width / height > aspectRatio) {
          width = height * aspectRatio
        } else {
          height = width / aspectRatio
        }
        
        canvas.width = width
        canvas.height = height
        
        // 高品質スケーリング設定
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height)
        
        // Blobに変換
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob!], file.name, { 
              type: file.type,
              lastModified: Date.now()
            }))
          }, 
          file.type, 
          resize.quality || 0.9
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * ファイルパス生成
   */
  private static generateFilePath(
    originalName: string, 
    bucket: string, 
    userId?: string
  ): string {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileExt = originalName.split('.').pop()?.toLowerCase() || ''
    
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
    
    if (userId) {
      return `${userId}/${bucket}-${timestamp}-${randomSuffix}.${fileExt}`
    }
    
    return `${bucket}-${timestamp}-${randomSuffix}.${fileExt}`
  }

  /**
   * ファイルサイズのフォーマット
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 複数ファイルの一括アップロード
   */
  static async uploadMultipleFiles(
    files: File[],
    options: UploadOptions,
    userId?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    const total = files.length
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadFile(files[i], options, userId)
        results.push(result)
        
        if (onProgress) {
          onProgress(Math.round(((i + 1) / total) * 100))
        }
      } catch (error) {
        logger.error(`Failed to upload file ${files[i].name}`, error as Error)
        // 個別のファイルエラーは続行
      }
    }
    
    return results
  }
}

// Vue.js composable
export function useFileUpload() {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  const uploadFile = async (
    file: File,
    options: UploadOptions,
    userId?: string
  ): Promise<UploadResult | null> => {
    try {
      uploading.value = true
      error.value = null
      progress.value = 0
      
      const result = await FileUploadService.uploadFile(file, options, userId)
      progress.value = 100
      
      return result
    } catch (err) {
      error.value = (err as Error).message
      return null
    } finally {
      uploading.value = false
    }
  }

  const uploadAvatar = async (file: File, userId: string) => {
    return uploadFile(file, {
      bucket: 'avatars',
      maxSize: 2 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      resize: { width: 512, height: 512 }
    }, userId)
  }

  return {
    uploading: readonly(uploading),
    progress: readonly(progress),
    error: readonly(error),
    uploadFile,
    uploadAvatar
  }
}

// ドラッグ&ドロップ用composable
export function useFileDrop(callback: (files: File[]) => void) {
  const isDragging = ref(false)
  
  const onDragEnter = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = true
  }
  
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault()
    if (!e.relatedTarget) {
      isDragging.value = false
    }
  }
  
  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
  }
  
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = false
    
    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length > 0) {
      callback(files)
    }
  }
  
  return {
    isDragging: readonly(isDragging),
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop
  }
}
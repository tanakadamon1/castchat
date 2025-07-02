import { supabase } from './supabase'

export interface UploadResult {
  data?: {
    url: string
    path: string
  }
  error?: string
}

// 画像をリサイズする関数
const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // アスペクト比を保持してリサイズ
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // 画像を描画
      ctx.drawImage(img, 0, 0, width, height)
      
      // Blobに変換
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        } else {
          resolve(file)
        }
      }, file.type, quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// 画像をアップロードする関数
export const uploadImage = async (
  file: File, 
  bucket: string, 
  path: string,
  options?: {
    resize?: boolean
    maxWidth?: number
    maxHeight?: number
    quality?: number
  }
): Promise<UploadResult> => {
  try {
    let fileToUpload = file
    
    // リサイズが有効な場合
    if (options?.resize) {
      const maxWidth = options.maxWidth || 1024
      const maxHeight = options.maxHeight || 1024
      const quality = options.quality || 0.8
      
      fileToUpload = await resizeImage(file, maxWidth, maxHeight, quality)
    }
    
    // ファイルサイズチェック (5MB)
    if (fileToUpload.size > 5 * 1024 * 1024) {
      return { error: 'ファイルサイズが5MBを超えています' }
    }
    
    // 画像ファイルかチェック
    if (!fileToUpload.type.startsWith('image/')) {
      return { error: '画像ファイルのみアップロード可能です' }
    }
    
    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('Upload error:', error)
      return { error: `アップロードに失敗しました: ${error.message}` }
    }
    
    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return {
      data: {
        url: urlData.publicUrl,
        path: data.path
      }
    }
  } catch (err) {
    console.error('Image upload error:', err)
    return { error: 'アップロードに失敗しました' }
  }
}

// プロフィール画像をアップロードする関数
export const uploadProfileImage = async (file: File, userId: string): Promise<UploadResult> => {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const path = `profiles/${userId}/${timestamp}.${extension}`
  
  return uploadImage(file, 'avatars', path, {
    resize: true,
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9
  })
}

// 投稿画像をアップロードする関数
export const uploadPostImage = async (file: File, userId: string, postId?: string): Promise<UploadResult> => {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const folder = postId ? `posts/${postId}` : `posts/temp/${userId}`
  const path = `${folder}/${timestamp}.${extension}`
  
  return uploadImage(file, 'post-images', path, {
    resize: true,
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8
  })
}

// メッセージ画像をアップロードする関数
export const uploadMessageImage = async (file: File, userId: string): Promise<UploadResult> => {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const path = `messages/${userId}/${timestamp}.${extension}`
  
  return uploadImage(file, 'message-images', path, {
    resize: true,
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.8
  })
}
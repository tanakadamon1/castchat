// バリデーションスキーマ定義
// Zod を使用した型安全なバリデーション

import { z } from 'zod'

// 基本的な列挙型
export const PostCategory = z.enum([
  'voice_actor',
  'dancer', 
  'model',
  'photographer',
  'event_staff'
])

export const PostType = z.enum([
  'paid',
  'volunteer', 
  'collaboration'
])

export const PostStatus = z.enum([
  'draft',
  'active',
  'closed'
])

export const ContactMethod = z.enum([
  'discord',
  'twitter',
  'email',
  'other'
])

export const SortBy = z.enum([
  'newest',
  'oldest', 
  'deadline',
  'popular'
])

// 募集投稿作成スキーマ
export const createPostSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  
  description: z.string()
    .min(10, '説明は10文字以上で入力してください')
    .max(2000, '説明は2000文字以内で入力してください'),
  
  category: PostCategory,
  
  type: PostType,
  
  worldName: z.string()
    .max(50, 'ワールド名は50文字以内で入力してください')
    .optional(),
  
  compensation: z.string()
    .max(200, '報酬情報は200文字以内で入力してください')
    .optional(),
  
  deadline: z.string()
    .datetime('正しい日時形式で入力してください')
    .optional()
    .refine((date) => {
      if (!date) return true
      return new Date(date) > new Date()
    }, '締切は未来の日時を設定してください'),
  
  requirements: z.array(z.string().max(100))
    .max(10, '応募条件は10項目以内で入力してください')
    .optional(),
  
  tags: z.array(z.string().max(20))
    .max(10, 'タグは10個以内で入力してください')
    .optional(),
  
  contactMethod: ContactMethod,
  
  contactValue: z.string()
    .min(1, '連絡先は必須です')
    .max(100, '連絡先は100文字以内で入力してください')
})

// 募集投稿更新スキーマ
export const updatePostSchema = createPostSchema
  .partial()
  .extend({
    status: PostStatus.optional()
  })

// 検索パラメータスキーマ
export const searchParamsSchema = z.object({
  search: z.string()
    .max(100, '検索キーワードは100文字以内で入力してください')
    .optional(),
  
  category: PostCategory.optional(),
  
  type: PostType.optional(),
  
  status: PostStatus.optional(),
  
  sortBy: SortBy.default('newest'),
  
  page: z.coerce.number()
    .int('ページ番号は整数で指定してください')
    .positive('ページ番号は1以上で指定してください')
    .default(1),
  
  limit: z.coerce.number()
    .int('取得件数は整数で指定してください')
    .min(1, '取得件数は1以上で指定してください')
    .max(100, '取得件数は100以下で指定してください')
    .default(10)
})

// 応募作成スキーマ
export const createApplicationSchema = z.object({
  postId: z.string()
    .uuid('正しい募集IDを指定してください'),
  
  message: z.string()
    .min(10, '応募メッセージは10文字以上で入力してください')
    .max(1000, '応募メッセージは1000文字以内で入力してください')
})

// 応募更新スキーマ
export const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional(),
  
  message: z.string()
    .min(10, '応募メッセージは10文字以上で入力してください')
    .max(1000, '応募メッセージは1000文字以内で入力してください')
    .optional()
})

// ユーザー更新スキーマ
export const updateUserSchema = z.object({
  displayName: z.string()
    .min(1, '表示名は必須です')
    .max(50, '表示名は50文字以内で入力してください')
    .optional(),
  
  bio: z.string()
    .max(500, '自己紹介は500文字以内で入力してください')
    .optional(),
  
  twitterHandle: z.string()
    .regex(/^[a-zA-Z0-9_]{1,15}$/, '正しいTwitterハンドルを入力してください')
    .optional(),
  
  discordHandle: z.string()
    .max(37, '正しいDiscordハンドルを入力してください')
    .optional()
})

// ファイルアップロードスキーマ
export const uploadFileSchema = z.object({
  category: z.enum(['avatar', 'attachment', 'image']),
  
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, '5MB以下のファイルをアップロードしてください')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'JPEG、PNG、WebP形式の画像ファイルをアップロードしてください'
    )
})

// 型エクスポート
export type CreatePostData = z.infer<typeof createPostSchema>
export type UpdatePostData = z.infer<typeof updatePostSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type CreateApplicationData = z.infer<typeof createApplicationSchema>
export type UpdateApplicationData = z.infer<typeof updateApplicationSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type UploadFileData = z.infer<typeof uploadFileSchema>

// バリデーションヘルパー関数
export const validateCreatePost = (data: unknown) => {
  return createPostSchema.safeParse(data)
}

export const validateUpdatePost = (data: unknown) => {
  return updatePostSchema.safeParse(data)
}

export const validateSearchParams = (data: unknown) => {
  return searchParamsSchema.safeParse(data)
}

export const validateCreateApplication = (data: unknown) => {
  return createApplicationSchema.safeParse(data)
}

export const validateUpdateApplication = (data: unknown) => {
  return updateApplicationSchema.safeParse(data)
}

export const validateUpdateUser = (data: unknown) => {
  return updateUserSchema.safeParse(data)
}

export const validateUploadFile = (data: unknown) => {
  return uploadFileSchema.safeParse(data)
}

// エラーメッセージの日本語化ヘルパー
export const getValidationErrorMessage = (error: z.ZodError): string => {
  const firstError = error.errors[0]
  if (!firstError) return 'バリデーションエラーが発生しました'
  
  return firstError.message
}

// フィールド別エラーメッセージの取得
export const getFieldErrors = (error: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const fieldName = err.path.join('.')
    if (fieldName) {
      fieldErrors[fieldName] = err.message
    }
  })
  
  return fieldErrors
}
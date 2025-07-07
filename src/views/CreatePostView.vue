<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- ヘッダー -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isEditing ? '募集を編集' : '新規募集投稿' }}
        </h1>
        <p class="text-gray-600">
          {{ isEditing ? '募集内容を編集してください' : 'VRChatでのキャスト募集を投稿しましょう' }}
        </p>
      </div>

      <!-- フォーム -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- 基本情報 -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
          
          <div class="space-y-4">
            <!-- タイトル -->
            <div>
              <BaseInput
                v-model="formData.title"
                label="募集タイトル"
                placeholder="例：VRChat配信のキャスト募集！"
                required
                :error="getFieldError('title')"
                @blur="validateField('title', formData.title, titleRules)"
              />
            </div>

            <!-- カテゴリ -->
            <div>
              <BaseSelect
                v-model="formData.category"
                label="カテゴリ"
                :options="categoryOptions"
                required
                :error="getFieldError('category')"
                @change="validateField('category', formData.category, requiredRules)"
              />
            </div>
          </div>
        </div>

        <!-- 詳細情報 -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">詳細情報</h2>
          
          <div class="space-y-4">
            <!-- 説明文 -->
            <div>
              <BaseTextarea
                v-model="formData.description"
                label="募集内容"
                placeholder="詳しい募集内容や求める人材について記載してください..."
                :rows="6"
                required
                :error="getFieldError('description')"
                @blur="validateField('description', formData.description, descriptionRules)"
                class="px-4"
              />
            </div>

            <!-- 必要スキル -->
            <div>
              <BaseTextarea
                v-model="formData.requirements"
                label="必要なスキル・条件"
                placeholder="例：VRChatの基本操作、配信経験、コミュニケーション能力など"
                :rows="3"
                :error="getFieldError('requirements')"
                @blur="validateField('requirements', formData.requirements, {})"
                class="px-4"
              />
            </div>


            <!-- 開催頻度 -->
            <div>
              <BaseSelect
                v-model="formData.eventFrequency"
                label="開催頻度"
                :options="frequencyOptions"
                required
                :error="getFieldError('eventFrequency')"
                @change="validateField('eventFrequency', formData.eventFrequency, requiredRules)"
              />
            </div>

            <!-- 単発イベントの場合 -->
            <div v-if="formData.eventFrequency === 'once'">
              <BaseInput
                v-model="formData.eventSpecificDate"
                type="datetime-local"
                label="イベント開催日時"
                required
                :error="getFieldError('eventSpecificDate')"
                @blur="validateField('eventSpecificDate', formData.eventSpecificDate, requiredRules)"
              />
            </div>

            <!-- 定期イベントの場合 -->
            <div v-else-if="formData.eventFrequency" class="space-y-4">
              <!-- 月1回の場合 -->
              <div v-if="formData.eventFrequency === 'monthly'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <BaseSelect
                    v-model="formData.eventWeekOfMonth"
                    label="第何週"
                    :options="weekOfMonthOptions"
                    required
                    :error="getFieldError('eventWeekOfMonth')"
                  />
                </div>
                <div>
                  <BaseSelect
                    v-model="formData.eventWeekday"
                    label="曜日"
                    :options="weekdayOptions"
                    required
                    :error="getFieldError('eventWeekday')"
                  />
                </div>
                <div>
                  <BaseInput
                    v-model="formData.eventTime"
                    type="time"
                    label="時間"
                    required
                    :error="getFieldError('eventTime')"
                  />
                </div>
              </div>

              <!-- 隔週の場合 -->
              <div v-else-if="formData.eventFrequency === 'biweekly'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <BaseSelect
                    v-model="formData.eventWeekOfMonth"
                    label="第何週（第1・第3 or 第2・第4）"
                    :options="biweeklyOptions"
                    required
                    :error="getFieldError('eventWeekOfMonth')"
                  />
                </div>
                <div>
                  <BaseSelect
                    v-model="formData.eventWeekday"
                    label="曜日"
                    :options="weekdayOptions"
                    required
                    :error="getFieldError('eventWeekday')"
                  />
                </div>
                <div>
                  <BaseInput
                    v-model="formData.eventTime"
                    type="time"
                    label="時間"
                    required
                    :error="getFieldError('eventTime')"
                  />
                </div>
              </div>

              <!-- 週1回の場合 -->
              <div v-else-if="formData.eventFrequency === 'weekly'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <BaseSelect
                    v-model="formData.eventWeekday"
                    label="曜日"
                    :options="weekdayOptions"
                    required
                    :error="getFieldError('eventWeekday')"
                  />
                </div>
                <div>
                  <BaseInput
                    v-model="formData.eventTime"
                    type="time"
                    label="時間"
                    required
                    :error="getFieldError('eventTime')"
                  />
                </div>
              </div>
            </div>

            <!-- 募集人数 -->
            <div>
              <BaseInput
                v-model="formData.maxParticipants"
                type="number"
                label="最大募集人数"
                placeholder="例：5"
                min="1"
                max="100"
                :error="getFieldError('maxParticipants')"
                @blur="validateField('maxParticipants', formData.maxParticipants, participantsRules)"
              />
            </div>
          </div>
        </div>

        <!-- 連絡先情報 -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">連絡先情報</h2>
          
          <div class="space-y-4">
            <!-- Twitter ID -->
            <div>
              <BaseInput
                v-model="formData.contactInfo"
                label="Twitter ID"
                placeholder="@username または username"
                required
                :error="getFieldError('contactInfo')"
                @blur="validateContactInfo"
                class="px-4"
              />
            </div>

            <!-- 追加情報 -->
            <div>
              <BaseTextarea
                v-model="formData.additionalNotes"
                label="備考・その他"
                placeholder="追加で伝えたい情報があれば記載してください"
                :rows="3"
                :error="getFieldError('additionalNotes')"
                class="px-4"
              />
            </div>
          </div>
        </div>

        <!-- 画像アップロード -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">画像</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                募集画像（任意）
              </label>
              <div 
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent="dragOver = true"
                @dragleave="dragOver = false"
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                :class="{ 'border-indigo-500 bg-indigo-50': dragOver }"
              >
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                
                <p class="text-gray-600 mb-2">画像をドラッグ&ドロップまたはクリックしてアップロード</p>
                <p class="text-sm text-gray-500">PNG, JPG, GIF形式をサポート（最大3枚、各5MB）</p>
                
                <BaseButton
                  type="button"
                  variant="outline"
                  @click="fileInput?.click()"
                  :disabled="uploadingImages"
                  class="mt-4"
                >
                  {{ uploadingImages ? 'アップロード中...' : 'ファイルを選択' }}
                </BaseButton>
              </div>
              
              <!-- 選択された画像のプレビュー -->
              <div v-if="selectedImages.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  v-for="(image, index) in selectedImages"
                  :key="index"
                  class="relative group"
                >
                  <img
                    :src="image.preview"
                    :alt="`プレビュー ${index + 1}`"
                    class="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    @click="removeImage(index)"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- プレビューセクション -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">プレビュー</h2>
          
          <div class="border rounded-lg p-4 bg-gray-50">
            <PostCard
              v-if="previewPost"
              :post="previewPost"
              :preview="true"
            />
            <div v-else class="text-center text-gray-500 py-8">
              フォームに入力すると投稿のプレビューが表示されます
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex flex-col sm:flex-row gap-4 justify-end">
          <BaseButton
            type="button"
            variant="outline"
            @click="handleCancel"
            class="order-2 sm:order-1"
          >
            キャンセル
          </BaseButton>
          
          <!-- デバッグ用テストボタン -->
          <BaseButton
            type="button"
            variant="outline"
            @click="handleTestPost"
            class="order-2 sm:order-2 bg-yellow-500 text-white"
          >
            テスト投稿
          </BaseButton>

          <BaseButton
            type="button"
            variant="outline"
            @click="handleSaveDraft"
            :loading="saving"
            class="order-3 sm:order-3"
          >
            下書き保存
          </BaseButton>
          
          <BaseButton
            type="submit"
            :loading="submitting"
            :disabled="!isFormValid"
            class="order-1 sm:order-4"
          >
            {{ isEditing ? '更新する' : '投稿する' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useValidation, commonRules } from '@/utils/validation'
import { postsApi } from '@/lib/postsApi'
import { uploadPostImage } from '@/lib/imageUpload'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PostCard from '@/components/post/PostCard.vue'
import type { PostCategory, ContactMethod, Post, EventFrequency } from '@/types/post'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const { validate: validateField, validateAll, getFieldError, hasErrors } = useValidation()

// 編集モードの判定
const isEditing = computed(() => !!route.params.id)
const postId = computed(() => route.params.id as string)

// フォームデータ
const formData = ref({
  title: '',
  category: '' as PostCategory | '',
  description: '',
  requirements: '',
  eventFrequency: '' as EventFrequency | '',
  eventSpecificDate: '', // 単発イベント用
  eventWeekday: undefined as number | undefined, // 曜日
  eventTime: '', // 時間
  eventWeekOfMonth: undefined as number | undefined, // 第何週
  maxParticipants: undefined as number | undefined,
  contactMethod: 'twitter' as ContactMethod,
  contactInfo: '',
  deadline: '',
  additionalNotes: ''
})

// 画像アップロード関連
const selectedImages = ref<Array<{ file: File; preview: string; uploaded?: { url: string; path: string } }>>([])
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement>()
const uploadingImages = ref(false)

// ローディング状態
const submitting = ref(false)
const saving = ref(false)

// プレビュー用の投稿データ
const previewPost = computed(() => {
  if (!formData.value.title || !formData.value.description) {
    return null
  }
  
  return {
    id: 'preview',
    title: formData.value.title,
    category: formData.value.category as PostCategory,
    description: formData.value.description,
    requirements: formData.value.requirements ? [formData.value.requirements] : [],
    contactMethod: formData.value.contactMethod as ContactMethod,
    contactValue: formData.value.contactInfo,
    authorId: authStore.user?.id || 'preview-user',
    authorName: authStore.user?.user_metadata?.display_name || 'プレビューユーザー',
    status: 'active' as const,
    tags: [],
    applicationsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    maxParticipants: formData.value.maxParticipants || 1,
    eventFrequency: formData.value.eventFrequency as EventFrequency,
    eventSpecificDate: formData.value.eventSpecificDate,
    eventWeekday: formData.value.eventWeekday,
    eventTime: formData.value.eventTime,
    eventWeekOfMonth: formData.value.eventWeekOfMonth
  } as Post
})

// セレクトボックスのオプション
const categoryOptions = [
  { value: 'customer-service', label: '接客' },
  { value: 'meetings', label: '集会' },
  { value: 'music-dance', label: '音楽・ダンス' },
  { value: 'social', label: '出会い' },
  { value: 'beginners', label: '初心者' },
  { value: 'roleplay', label: 'ロールプレイ' },
  { value: 'games', label: 'ゲーム' },
  { value: 'other', label: 'その他' }
]

const frequencyOptions = [
  { value: 'once', label: '単発' },
  { value: 'weekly', label: '週1' },
  { value: 'biweekly', label: '隔週' },
  { value: 'monthly', label: '月1' }
]

const weekdayOptions = [
  { value: 0, label: '日曜日' },
  { value: 1, label: '月曜日' },
  { value: 2, label: '火曜日' },
  { value: 3, label: '水曜日' },
  { value: 4, label: '木曜日' },
  { value: 5, label: '金曜日' },
  { value: 6, label: '土曜日' }
]

const weekOfMonthOptions = [
  { value: 1, label: '第1週' },
  { value: 2, label: '第2週' },
  { value: 3, label: '第3週' },
  { value: 4, label: '第4週' }
]

const biweeklyOptions = [
  { value: 1, label: '第1・第3週' },
  { value: 2, label: '第2・第4週' }
]

// 連絡方法は Twitter ID 固定
const contactMethod = 'twitter'

// バリデーションルール
const titleRules = {
  required: true,
  minLength: 5,
  maxLength: 100,
  message: 'タイトルは5文字以上100文字以内で入力してください'
}

const descriptionRules = {
  required: true,
  minLength: 20,
  maxLength: 2000,
  message: '募集内容は20文字以上2000文字以内で入力してください'
}

const requiredRules = {
  required: true,
  message: 'この項目は必須です'
}

const participantsRules = {
  required: true,
  custom: (value: any) => value >= 1 && value <= 100,
  message: '募集人数は1人以上100人以下で入力してください'
}

// フォームバリデーション
const isFormValid = computed(() => {
  const basicRequiredFields = formData.value.title && 
         formData.value.category && 
         formData.value.description && 
         formData.value.eventFrequency && 
         formData.value.contactInfo
  
  let eventRequiredFields = false
  
  if (formData.value.eventFrequency === 'once') {
    eventRequiredFields = !!formData.value.eventSpecificDate
  } else if (formData.value.eventFrequency) {
    eventRequiredFields = !!(formData.value.eventWeekday !== undefined && formData.value.eventTime)
    if (formData.value.eventFrequency === 'monthly' || formData.value.eventFrequency === 'biweekly') {
      eventRequiredFields = eventRequiredFields && (formData.value.eventWeekOfMonth !== undefined)
    }
  }
         
  console.log('Post form validation:', {
    hasErrors: hasErrors.value,
    basicRequiredFields,
    eventRequiredFields,
    formData: formData.value
  })
  
  return basicRequiredFields && eventRequiredFields
})

// 連絡先のラベルとプレースホルダーを取得
const getContactLabel = (method: ContactMethod) => {
  const labels = {
    discord: 'Discord ID',
    twitter: 'Twitter ID',
    vrchat: 'VRChat ID',
    email: 'メールアドレス'
  }
  return labels[method] || '連絡先'
}

const getContactPlaceholder = (method: ContactMethod) => {
  const placeholders = {
    discord: 'username#1234',
    twitter: '@username',
    vrchat: 'VRChatユーザー名',
    email: 'example@gmail.com'
  }
  return placeholders[method] || ''
}



// 連絡先情報のバリデーション
const validateContactInfo = () => {
  const info = formData.value.contactInfo
  
  let rules = { required: true, ...commonRules.twitter }
  
  validateField('contactInfo', info, rules)
}

// 画像アップロード関連のメソッド
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (files: File[]) => {
  // 3枚までの制限
  const remainingSlots = 3 - selectedImages.value.length
  if (remainingSlots <= 0) {
    toast.error('画像は最大3枚まで追加できます')
    return
  }
  
  const filesToAdd = files.slice(0, remainingSlots)
  
  filesToAdd.forEach(file => {
    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} のファイルサイズが5MBを超えています`)
      return
    }
    
    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} は画像ファイルではありません`)
      return
    }
    
    // プレビュー用のDataURL生成
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        selectedImages.value.push({
          file,
          preview: e.target.result as string
        })
      }
    }
    reader.readAsDataURL(file)
  })
  
  if (files.length > remainingSlots) {
    toast.info(`${remainingSlots}枚のみ追加されました（最大3枚まで）`)
  }
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

// フォーム送信
const handleSubmit = async () => {
  console.log('Submit button clicked!')
  console.log('Form valid?', isFormValid.value)
  console.log('Form data:', formData.value)
  
  if (!authStore.isAuthenticated) {
    toast.error('ログインが必要です')
    router.push('/login')
    return
  }

  // 全フィールドのバリデーション
  const validationRules = {
    title: titleRules,
    category: requiredRules,
    description: descriptionRules,
    eventFrequency: requiredRules,
    contactInfo: requiredRules
  }

  if (!validateAll(formData.value, validationRules)) {
    toast.error('入力内容に誤りがあります')
    return
  }

  submitting.value = true
  console.log('Starting post submission process...')
  console.log('Form data at submission:', formData.value)
  console.log('Auth store user:', authStore.user)
  console.log('Selected images:', selectedImages.value)
  
  try {
    console.log('Calling submitPost()...')
    const result = await submitPost()
    console.log('submitPost() completed successfully:', result)
    
    toast.success(
      isEditing.value ? '募集を更新しました' : '募集を投稿しました'
    )
    
    console.log('Navigating to /posts...')
    router.push('/posts')
  } catch (error) {
    console.error('投稿エラー - handleSubmit catch:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    toast.error('投稿に失敗しました')
  } finally {
    console.log('handleSubmit finally block - resetting submitting')
    submitting.value = false
  }
}

// 下書き保存
const handleSaveDraft = async () => {
  if (!authStore.isAuthenticated) {
    toast.error('ログインが必要です')
    return
  }

  saving.value = true
  
  try {
    await saveDraft()
    toast.success('下書きを保存しました')
  } catch (error) {
    console.error('下書き保存エラー:', error)
    toast.error('下書き保存に失敗しました')
  } finally {
    saving.value = false
  }
}

// キャンセル
const handleCancel = () => {
  if (confirm('編集内容が失われますが、よろしいですか？')) {
    router.back()
  }
}

// デバッグ用テスト投稿
const handleTestPost = async () => {
  console.log('=== TEST POST BUTTON CLICKED ===')
  try {
    const result = await postsApi.testCreatePost()
    console.log('Test post result:', result)
    if (result.error) {
      toast.error(`テスト投稿失敗: ${result.error}`)
    } else {
      toast.success('テスト投稿成功！')
    }
  } catch (error) {
    console.error('Test post error:', error)
    toast.error('テスト投稿でエラーが発生しました')
  }
}

// 画像アップロード処理
const uploadImages = async (postId?: string) => {
  console.log('uploadImages: Starting with', selectedImages.value.length, 'images')
  if (selectedImages.value.length === 0) {
    console.log('uploadImages: No images to upload')
    return []
  }
  
  if (!authStore.user?.id) {
    console.error('uploadImages: No user ID found')
    throw new Error('ユーザー情報が見つかりません')
  }
  
  console.log('uploadImages: User ID:', authStore.user.id)
  uploadingImages.value = true
  const uploadedUrls = []
  
  try {
    for (let i = 0; i < selectedImages.value.length; i++) {
      const imageData = selectedImages.value[i]
      console.log(`uploadImages: Processing image ${i + 1}/${selectedImages.value.length}`)
      
      if (imageData.uploaded) {
        console.log(`uploadImages: Image ${i + 1} already uploaded:`, imageData.uploaded.url)
        // 既にアップロード済み
        uploadedUrls.push(imageData.uploaded.url)
        continue
      }
      
      console.log(`uploadImages: Uploading image ${i + 1}:`, imageData.file.name)
      const result = await uploadPostImage(imageData.file, authStore.user.id, postId)
      console.log(`uploadImages: Upload result for image ${i + 1}:`, result)
      
      if (result.error) {
        console.error(`uploadImages: Error uploading image ${i + 1}:`, result.error)
        throw new Error(result.error)
      }
      
      if (result.data) {
        console.log(`uploadImages: Image ${i + 1} uploaded successfully:`, result.data.url)
        uploadedUrls.push(result.data.url)
        // アップロード情報をキャッシュ
        imageData.uploaded = result.data
      }
    }
    
    console.log('uploadImages: All images processed, URLs:', uploadedUrls)
    return uploadedUrls
  } finally {
    uploadingImages.value = false
    console.log('uploadImages: Finished, reset uploading state')
  }
}

// API呼び出し関数
const submitPost = async () => {
  console.log('submitPost: Starting...')
  // まず画像をアップロード
  console.log('submitPost: Uploading images...')
  const imageUrls = await uploadImages()
  console.log('submitPost: Images uploaded:', imageUrls)
  
  const postData: Partial<Post> = {
    title: formData.value.title,
    category: formData.value.category as PostCategory,
    description: formData.value.description,
    requirements: formData.value.requirements ? [formData.value.requirements] : [],
    deadline: formData.value.deadline || undefined,
    maxParticipants: formData.value.maxParticipants || 1,
    contactMethod: 'twitter' as ContactMethod,
    contactValue: formData.value.contactInfo,
    eventFrequency: formData.value.eventFrequency as EventFrequency,
    eventSpecificDate: formData.value.eventSpecificDate || undefined,
    eventWeekday: formData.value.eventWeekday,
    eventTime: formData.value.eventTime || undefined,
    eventWeekOfMonth: formData.value.eventWeekOfMonth,
    tags: [],
    images: imageUrls
  }
  console.log('submitPost: Post data prepared:', postData)

  if (isEditing.value) {
    console.log('submitPost: Editing mode - using mock update')
    // 更新処理（実装予定）
    return new Promise(resolve => setTimeout(resolve, 1000))
  } else {
    console.log('submitPost: Creating new post via API...')
    // 新規作成処理
    const result = await postsApi.createPost(postData)
    console.log('submitPost: API result:', result)
    if (result.error) {
      console.error('submitPost: API error:', result.error)
      throw new Error(result.error)
    }
    console.log('submitPost: Success, returning data:', result.data)
    return result.data
  }
}

const saveDraft = () => {
  // 下書き保存処理（実装予定）
  return new Promise(resolve => setTimeout(resolve, 500))
}

const loadPost = async () => {
  if (!isEditing.value) return null
  
  const result = await postsApi.getPost(postId.value)
  if (result.error) {
    throw new Error(result.error)
  }
  
  return result.data
}

// 編集時のデータ読み込み
onMounted(async () => {
  if (isEditing.value) {
    try {
      const postData = await loadPost()
      if (postData) {
        formData.value = {
          title: postData.title,
          category: postData.category,
          description: postData.description,
          requirements: postData.requirements?.join(', ') || '',
          eventFrequency: postData.eventFrequency || '',
          eventSpecificDate: postData.eventSpecificDate || '',
          eventWeekday: postData.eventWeekday,
          eventTime: postData.eventTime || '',
          eventWeekOfMonth: postData.eventWeekOfMonth,
          maxParticipants: postData.maxParticipants || undefined,
          contactMethod: postData.contactMethod,
          contactInfo: postData.contactValue || '',
          deadline: postData.deadline || '',
          additionalNotes: ''
        }
      }
    } catch (error) {
      console.error('投稿データ取得エラー:', error)
      toast.error('投稿データの取得に失敗しました')
      router.push('/posts')
    }
  }
})
</script>
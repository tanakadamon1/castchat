<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- デバッグ表示 -->
      <div class="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs rounded">
        DEBUG: CreatePostView rendered. isEditing: {{ isEditing }}, postId: {{ postId }}, route: {{ $route.path }}
      </div>
      <!-- エラー表示 -->
      <div v-if="loadError" class="mb-6 p-4 bg-red-100 text-red-700 rounded">
        {{ loadError }}
      </div>
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
                @blur="
                  validateField('eventSpecificDate', formData.eventSpecificDate, requiredRules)
                "
              />
            </div>

            <!-- 定期イベントの場合 -->
            <div v-else-if="formData.eventFrequency" class="space-y-4">
              <!-- 月1回の場合 -->
              <div
                v-if="formData.eventFrequency === 'monthly'"
                class="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
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
              <div
                v-else-if="formData.eventFrequency === 'biweekly'"
                class="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
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
              <div
                v-else-if="formData.eventFrequency === 'weekly'"
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
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
                @blur="
                  validateField('maxParticipants', formData.maxParticipants, participantsRules)
                "
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
              />
            </div>
          </div>
        </div>

        <!-- 画像アップロード -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">画像</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> 募集画像（任意） </label>
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

                <svg
                  class="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                <p class="text-gray-600 mb-2">
                  画像をドラッグ&ドロップまたはクリックしてアップロード
                </p>
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
              <div
                v-if="selectedImages.length > 0"
                class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div v-for="(image, index) in selectedImages" :key="index" class="relative group">
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
            <PostCard v-if="previewPost" :post="previewPost" :preview="true" />
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
console.log('=== CreatePostView SCRIPT LOADED ===')
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
const isEditing = computed(() => {
  const editing = !!route.params.id
  console.log('isEditing computed:', { editing, routeParams: route.params, routePath: route.path })
  return editing
})
const postId = computed(() => {
  const id = route.params.id as string
  console.log('postId computed:', { id, routeParams: route.params })
  return id
})

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
})

// 画像アップロード関連
const selectedImages = ref<
  Array<{ file: File; preview: string; uploaded?: { url: string; path: string } }>
>([])
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement>()
const uploadingImages = ref(false)

// ローディング状態
const submitting = ref(false)
const saving = ref(false)

// エラー表示
const loadError = ref<string | null>(null)

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
    eventWeekOfMonth: formData.value.eventWeekOfMonth,
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
  { value: 'other', label: 'その他' },
]

const frequencyOptions = [
  { value: 'once', label: '単発' },
  { value: 'weekly', label: '週1' },
  { value: 'biweekly', label: '隔週' },
  { value: 'monthly', label: '月1' },
]

const weekdayOptions = [
  { value: 0, label: '日曜日' },
  { value: 1, label: '月曜日' },
  { value: 2, label: '火曜日' },
  { value: 3, label: '水曜日' },
  { value: 4, label: '木曜日' },
  { value: 5, label: '金曜日' },
  { value: 6, label: '土曜日' },
]

const weekOfMonthOptions = [
  { value: 1, label: '第1週' },
  { value: 2, label: '第2週' },
  { value: 3, label: '第3週' },
  { value: 4, label: '第4週' },
]

const biweeklyOptions = [
  { value: 1, label: '第1・第3週' },
  { value: 2, label: '第2・第4週' },
]

// 連絡方法は Twitter ID 固定

// バリデーションルール
const titleRules = {
  required: true,
  minLength: 5,
  maxLength: 100,
  message: 'タイトルは5文字以上100文字以内で入力してください',
}

const descriptionRules = {
  required: true,
  minLength: 20,
  maxLength: 2000,
  message: '募集内容は20文字以上2000文字以内で入力してください',
}

const requiredRules = {
  required: true,
  message: 'この項目は必須です',
}

const participantsRules = {
  required: true,
  custom: (value: any) => value >= 1 && value <= 100,
  message: '募集人数は1人以上100人以下で入力してください',
}

// フォームバリデーション
const isFormValid = computed(() => {
  const basicRequiredFields =
    formData.value.title &&
    formData.value.category &&
    formData.value.description &&
    formData.value.eventFrequency &&
    formData.value.contactInfo

  let eventRequiredFields = false

  if (formData.value.eventFrequency === 'once') {
    eventRequiredFields = !!formData.value.eventSpecificDate
  } else if (formData.value.eventFrequency) {
    eventRequiredFields = !!(formData.value.eventWeekday !== undefined && formData.value.eventTime)
    if (
      formData.value.eventFrequency === 'monthly' ||
      formData.value.eventFrequency === 'biweekly'
    ) {
      eventRequiredFields = eventRequiredFields && formData.value.eventWeekOfMonth !== undefined
    }
  }

  console.log('Post form validation:', {
    hasErrors: hasErrors.value,
    basicRequiredFields,
    eventRequiredFields,
    formData: formData.value,
  })

  return basicRequiredFields && eventRequiredFields
})

// 連絡先情報のバリデーション
const validateContactInfo = () => {
  const info = formData.value.contactInfo
  const rules: Record<string, unknown> = { required: true, ...commonRules.twitter }
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

  filesToAdd.forEach((file) => {
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
          preview: e.target.result as string,
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
  console.log('=== Submit button clicked ===')
  console.log('Form valid?', isFormValid.value)
  console.log('Form data:', formData.value)
  console.log('Event fields check:', {
    eventFrequency: formData.value.eventFrequency,
    eventWeekday: formData.value.eventWeekday,
    eventTime: formData.value.eventTime,
    eventWeekOfMonth: formData.value.eventWeekOfMonth
  })

  if (!authStore.isAuthenticated) {
    toast.error('ログインが必要です')
    router.push('/login')
    return
  }

  // イベント詳細のバリデーション
  if (formData.value.eventFrequency === 'weekly') {
    if (formData.value.eventWeekday === undefined) {
      toast.error('週1回の場合は曜日を選択してください')
      return
    }
    if (!formData.value.eventTime) {
      toast.error('週1回の場合は時間を入力してください')
      return
    }
  } else if (formData.value.eventFrequency === 'monthly') {
    if (formData.value.eventWeekOfMonth === undefined) {
      toast.error('月1回の場合は第何週かを選択してください')
      return
    }
    if (formData.value.eventWeekday === undefined) {
      toast.error('月1回の場合は曜日を選択してください')
      return
    }
    if (!formData.value.eventTime) {
      toast.error('月1回の場合は時間を入力してください')
      return
    }
  } else if (formData.value.eventFrequency === 'biweekly') {
    if (formData.value.eventWeekOfMonth === undefined) {
      toast.error('隔週の場合は第何週かを選択してください')
      return
    }
    if (formData.value.eventWeekday === undefined) {
      toast.error('隔週の場合は曜日を選択してください')
      return
    }
    if (!formData.value.eventTime) {
      toast.error('隔週の場合は時間を入力してください')
      return
    }
  } else if (formData.value.eventFrequency === 'once') {
    if (!formData.value.eventSpecificDate) {
      toast.error('単発の場合は開催日時を入力してください')
      return
    }
  }

  // 全フィールドのバリデーション
  const validationRules = {
    title: titleRules,
    category: requiredRules,
    description: descriptionRules,
    eventFrequency: requiredRules,
    contactInfo: requiredRules,
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

    toast.success(isEditing.value ? '募集を更新しました' : '募集を投稿しました')

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

      if (!imageData.file) {
        console.error(`uploadImages: Image ${i + 1} has no file object`)
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
    images: imageUrls,
  }
  console.log('submitPost: Post data prepared:', postData)
  console.log('submitPost: Event details:', {
    eventFrequency: postData.eventFrequency,
    eventWeekday: postData.eventWeekday,
    eventTime: postData.eventTime,
    eventWeekOfMonth: postData.eventWeekOfMonth,
  })
  
  // 送信前の最終チェックログ
  if (postData.eventFrequency === 'weekly' && (postData.eventWeekday === undefined || !postData.eventTime)) {
    console.error('VALIDATION ERROR: Weekly event missing required fields:', {
      eventWeekday: postData.eventWeekday,
      eventTime: postData.eventTime
    })
    throw new Error('週1回イベントに必要な情報が不足しています')
  }

  if (isEditing.value) {
    console.log('submitPost: Editing mode - calling updatePost API...')
    // 更新処理
    const result = await postsApi.updatePost(postId.value, postData)
    console.log('submitPost: Update API result:', result)
    if (result.error) {
      console.error('submitPost: Update API error:', result.error)
      throw new Error(result.error)
    }
    console.log('submitPost: Update success, returning data:', result.data)
    return result.data
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
  return new Promise((resolve) => setTimeout(resolve, 500))
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
  console.log('=== CreatePostView onMounted called ===')
  console.log('isEditing.value:', isEditing.value)
  console.log('postId.value:', postId.value)
  console.log('route.params:', route.params)
  console.log('Current URL:', window.location.href)
  
  if (isEditing.value) {
    try {
      const postData = await loadPost()
      console.log('編集モード: 取得した投稿データ', postData)
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
        }
        
        // 画像データの読み込み
        if (postData.images && postData.images.length > 0) {
          console.log('編集モード: 画像データを読み込み中...', postData.images)
          selectedImages.value = postData.images.map((url, index) => ({
            file: null as any, // 既存画像の場合はファイルオブジェクトは無い
            preview: url, // 既存画像のURLをプレビューとして使用
            uploaded: { url, path: '' } // 既にアップロード済みとしてマーク
          }))
          console.log('編集モード: selectedImages設定完了', selectedImages.value)
        }
        
        loadError.value = null
      } else {
        loadError.value = '投稿データが見つかりませんでした。URLや権限をご確認ください。'
      }
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null) {
        const errObj = error as Record<string, unknown>
        const errMsg = typeof errObj.message === 'string' ? errObj.message : ''
        const errStack = typeof errObj.stack === 'string' ? errObj.stack : ''
        console.error('投稿データ取得エラー:', errMsg, errStack)
      } else {
        console.error('投稿データ取得エラー:', error)
      }
      loadError.value = '投稿データの取得に失敗しました。しばらくしてから再度お試しください。'
      router.push('/posts')
    }
  }
})
</script>

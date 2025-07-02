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

            <!-- カテゴリとタイプ -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <BaseSelect
                  v-model="formData.type"
                  label="募集タイプ"
                  :options="typeOptions"
                  required
                  :error="getFieldError('type')"
                  @change="validateField('type', formData.type, requiredRules)"
                />
              </div>
            </div>

            <!-- 報酬 -->
            <div>
              <BaseInput
                v-model="formData.payment"
                label="報酬・条件"
                placeholder="例：時給1,000円、ボランティア、相談"
                :error="getFieldError('payment')"
                @blur="validateField('payment', formData.payment, {})"
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

            <!-- 日時設定 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <BaseInput
                  v-model="formData.startDate"
                  type="datetime-local"
                  label="開始日時"
                  required
                  :error="getFieldError('startDate')"
                  @change="validateField('startDate', formData.startDate, requiredRules)"
                />
              </div>
              <div>
                <BaseInput
                  v-model="formData.endDate"
                  type="datetime-local"
                  label="終了日時（任意）"
                  :error="getFieldError('endDate')"
                  @change="validateEndDate"
                />
              </div>
            </div>

            <!-- 募集人数 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <BaseInput
                  v-model="formData.minParticipants"
                  type="number"
                  label="最小催行人数（任意）"
                  placeholder="例：2"
                  min="1"
                  :max="formData.maxParticipants || 100"
                  :error="getFieldError('minParticipants')"
                  @blur="validateMinParticipants"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 連絡先情報 -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">連絡先情報</h2>
          
          <div class="space-y-4">
            <!-- 連絡方法 -->
            <div>
              <BaseSelect
                v-model="formData.contactMethod"
                label="希望連絡方法"
                :options="contactMethodOptions"
                required
                :error="getFieldError('contactMethod')"
                @change="validateField('contactMethod', formData.contactMethod, requiredRules)"
              />
            </div>

            <!-- 連絡先詳細 -->
            <div v-if="formData.contactMethod">
              <BaseInput
                v-model="formData.contactInfo"
                :label="getContactLabel(formData.contactMethod)"
                :placeholder="getContactPlaceholder(formData.contactMethod)"
                required
                :error="getFieldError('contactInfo')"
                @blur="validateContactInfo"
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
          
          <BaseButton
            type="button"
            variant="outline"
            @click="handleSaveDraft"
            :loading="saving"
            class="order-3 sm:order-2"
          >
            下書き保存
          </BaseButton>
          
          <BaseButton
            type="submit"
            :loading="submitting"
            :disabled="!isFormValid"
            class="order-1 sm:order-3"
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
import type { PostCategory, PostType, ContactMethod, Post } from '@/types/post'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showToast = useToast()
const { validate: validateField, validateAll, getFieldError, hasErrors } = useValidation()

// 編集モードの判定
const isEditing = computed(() => !!route.params.id)
const postId = computed(() => route.params.id as string)

// フォームデータ
const formData = ref({
  title: '',
  category: '' as PostCategory | '',
  type: '' as PostType | '',
  description: '',
  requirements: '',
  payment: '',
  startDate: '',
  endDate: '',
  maxParticipants: undefined as number | undefined,
  minParticipants: undefined as number | undefined,
  contactMethod: '' as ContactMethod | '',
  contactInfo: '',
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
    type: formData.value.type as PostType,
    description: formData.value.description,
    requirements: formData.value.requirements ? [formData.value.requirements] : [],
    compensation: formData.value.payment,
    contactMethod: formData.value.contactMethod as ContactMethod,
    contactValue: formData.value.contactInfo,
    authorId: authStore.user?.id || 'preview-user',
    authorName: authStore.user?.user_metadata?.display_name || 'プレビューユーザー',
    authorAvatar: authStore.user?.user_metadata?.avatar_url,
    status: 'active' as const,
    tags: [],
    applicationsCount: 0,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Legacy fields for compatibility
    startDate: formData.value.startDate,
    endDate: formData.value.endDate || undefined,
    maxParticipants: formData.value.maxParticipants || 1,
    minParticipants: formData.value.minParticipants || 1,
    payment: formData.value.payment
  } as Post
})

// セレクトボックスのオプション
const categoryOptions = [
  { value: 'streaming', label: '配信・動画撮影' },
  { value: 'event', label: 'イベント・パーティー' },
  { value: 'photo', label: '写真撮影・モデル' },
  { value: 'roleplay', label: 'ロールプレイ・演技' },
  { value: 'game', label: 'ゲーム・競技' },
  { value: 'music', label: '音楽・ダンス' },
  { value: 'other', label: 'その他' }
]

const typeOptions = [
  { value: 'paid', label: '有償' },
  { value: 'volunteer', label: 'ボランティア' },
  { value: 'collaboration', label: 'コラボ' }
]

const contactMethodOptions = [
  { value: 'discord', label: 'Discord' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'vrchat', label: 'VRChat' },
  { value: 'email', label: 'メール' }
]

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
  return !hasErrors.value && 
         formData.value.title && 
         formData.value.category && 
         formData.value.type && 
         formData.value.description && 
         formData.value.startDate && 
         formData.value.contactMethod && 
         formData.value.contactInfo
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

// 終了日時のバリデーション
const validateEndDate = () => {
  if (formData.value.endDate && formData.value.startDate) {
    const start = new Date(formData.value.startDate)
    const end = new Date(formData.value.endDate)
    
    if (end <= start) {
      validateField('endDate', formData.value.endDate, {
        custom: () => false,
        message: '終了日時は開始日時より後に設定してください'
      })
    } else {
      validateField('endDate', formData.value.endDate, {})
    }
  }
}

// 最小人数のバリデーション
const validateMinParticipants = () => {
  if (formData.value.minParticipants && formData.value.maxParticipants) {
    if (formData.value.minParticipants > formData.value.maxParticipants) {
      validateField('minParticipants', formData.value.minParticipants, {
        custom: () => false,
        message: '最小人数は最大人数以下に設定してください'
      })
    } else {
      validateField('minParticipants', formData.value.minParticipants, {})
    }
  }
}

// 連絡先情報のバリデーション
const validateContactInfo = () => {
  const method = formData.value.contactMethod
  const info = formData.value.contactInfo
  
  let rules = { required: true }
  
  switch (method) {
    case 'discord':
      rules = { ...rules, ...commonRules.discord }
      break
    case 'twitter':
      rules = { ...rules, ...commonRules.twitter }
      break
    case 'email':
      rules = { ...rules, ...commonRules.email }
      break
    case 'vrchat':
      rules = { ...rules, ...commonRules.vrchat }
      break
  }
  
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
    showToast.error('画像は最大3枚まで追加できます')
    return
  }
  
  const filesToAdd = files.slice(0, remainingSlots)
  
  filesToAdd.forEach(file => {
    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error(`${file.name} のファイルサイズが5MBを超えています`)
      return
    }
    
    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      showToast.error(`${file.name} は画像ファイルではありません`)
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
    showToast.info(`${remainingSlots}枚のみ追加されました（最大3枚まで）`)
  }
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

// フォーム送信
const handleSubmit = async () => {
  if (!authStore.isAuthenticated) {
    showToast.error('ログインが必要です')
    router.push('/login')
    return
  }

  // 全フィールドのバリデーション
  const validationRules = {
    title: titleRules,
    category: requiredRules,
    type: requiredRules,
    description: descriptionRules,
    startDate: requiredRules,
    maxParticipants: participantsRules,
    contactMethod: requiredRules,
    contactInfo: requiredRules
  }

  if (!validateAll(formData.value, validationRules)) {
    showToast.error('入力内容に誤りがあります')
    return
  }

  submitting.value = true
  
  try {
    await submitPost()
    
    showToast.success(
      isEditing.value ? '募集を更新しました' : '募集を投稿しました'
    )
    
    router.push('/posts')
  } catch (error) {
    console.error('投稿エラー:', error)
    showToast.error('投稿に失敗しました')
  } finally {
    submitting.value = false
  }
}

// 下書き保存
const handleSaveDraft = async () => {
  if (!authStore.isAuthenticated) {
    showToast.error('ログインが必要です')
    return
  }

  saving.value = true
  
  try {
    await saveDraft()
    showToast.success('下書きを保存しました')
  } catch (error) {
    console.error('下書き保存エラー:', error)
    showToast.error('下書き保存に失敗しました')
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

// 画像アップロード処理
const uploadImages = async (postId?: string) => {
  if (selectedImages.value.length === 0) {
    return []
  }
  
  if (!authStore.user?.id) {
    throw new Error('ユーザー情報が見つかりません')
  }
  
  uploadingImages.value = true
  const uploadedUrls = []
  
  try {
    for (const imageData of selectedImages.value) {
      if (imageData.uploaded) {
        // 既にアップロード済み
        uploadedUrls.push(imageData.uploaded.url)
        continue
      }
      
      const result = await uploadPostImage(imageData.file, authStore.user.id, postId)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.data) {
        uploadedUrls.push(result.data.url)
        // アップロード情報をキャッシュ
        imageData.uploaded = result.data
      }
    }
    
    return uploadedUrls
  } finally {
    uploadingImages.value = false
  }
}

// API呼び出し関数
const submitPost = async () => {
  // まず画像をアップロード
  const imageUrls = await uploadImages()
  
  const postData: Partial<Post> = {
    title: formData.value.title,
    category: formData.value.category as PostCategory,
    type: formData.value.type as PostType,
    description: formData.value.description,
    requirements: formData.value.requirements ? [formData.value.requirements] : [],
    payment: formData.value.payment,
    startDate: formData.value.startDate,
    endDate: formData.value.endDate || undefined,
    maxParticipants: formData.value.maxParticipants || 1,
    minParticipants: formData.value.minParticipants || 1,
    contactMethod: formData.value.contactMethod as ContactMethod,
    contactValue: formData.value.contactInfo,
    tags: [],
    images: imageUrls
  }

  if (isEditing.value) {
    // 更新処理（実装予定）
    return new Promise(resolve => setTimeout(resolve, 1000))
  } else {
    // 新規作成処理
    const result = await postsApi.createPost(postData)
    if (result.error) {
      throw new Error(result.error)
    }
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
          type: postData.type,
          description: postData.description,
          requirements: postData.requirements?.join(', ') || '',
          payment: postData.payment || '',
          startDate: postData.startDate || '',
          endDate: postData.endDate || '',
          maxParticipants: postData.maxParticipants || undefined,
          minParticipants: postData.minParticipants || undefined,
          contactMethod: postData.contactMethod,
          contactInfo: postData.contactValue || '',
          additionalNotes: ''
        }
      }
    } catch (error) {
      console.error('投稿データ取得エラー:', error)
      showToast.error('投稿データの取得に失敗しました')
      router.push('/posts')
    }
  }
})
</script>
<template>
  <div class="min-h-screen py-8 relative z-10">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- エラー表示 -->
      <div v-if="loadError" class="mb-6 p-4 bg-red-100 text-red-700 rounded">
        {{ loadError }}
      </div>
      <!-- ヘッダー -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ isEditing ? '募集を編集' : '新規募集投稿' }}
        </h1>
        <div class="flex justify-between items-center">
          <p class="text-gray-600 dark:text-gray-400">
            {{ isEditing ? '募集内容を編集してください' : 'VRChatでのキャスト募集を投稿しましょう' }}
          </p>
        </div>
      </div>

      <!-- フォーム -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- 基本情報 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">基本情報</h2>

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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">詳細情報</h2>

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
                class="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"
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
                class="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"
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
                class="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4"
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

          </div>
        </div>

        <!-- 連絡先情報 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">連絡先情報</h2>

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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">画像</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 募集画像（任意） </label>
              <div
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent="dragOver = true"
                @dragleave="dragOver = false"
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
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

                <p class="text-gray-600 dark:text-gray-400 mb-2">
                  画像をドラッグ&ドロップまたはクリックしてアップロード
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">PNG, JPG, GIF形式をサポート（最大3枚、各5MB）</p>

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
                class="mt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">プレビュー</h2>

          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <PostCard v-if="previewPost" :post="previewPost" :preview="true" />
            <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
              フォームに入力すると投稿のプレビューが表示されます
            </div>
          </div>
        </div>

        <!-- 優先表示オプション -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">表示オプション</h2>
          
          <div class="space-y-4">
            <div class="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                id="priority-display"
                v-model="formData.enablePriority"
                type="checkbox"
                class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded"
              />
              <label for="priority-display" class="flex-1 cursor-pointer">
                <div class="font-medium text-gray-900 dark:text-gray-100">優先表示を有効にする</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  1コインを使用して、投稿を24時間優先表示します。
                  優先表示された投稿は一覧の上部に表示され、より多くの人に見てもらえます。
                </div>
                <div v-if="authStore.profile" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  現在のコイン残高: <span class="font-medium">{{ authStore.profile.coin_balance || 0 }} コイン</span>
                  <button 
                    v-if="(authStore.profile.coin_balance || 0) < 1"
                    type="button"
                    @click="showPurchaseModal = true"
                    class="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
                  >
                    コインを購入
                  </button>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- 募集ステータス管理（編集時のみ） -->
        <div v-if="isEditing && !isDraftMode" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">募集ステータス</h2>
          
          <div class="space-y-4">
            <div>
              <BaseSelect
                v-model="formData.status"
                label="募集ステータス"
                :options="statusOptions"
                @change="handleStatusChange"
              />
            </div>
            
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div v-if="formData.status === 'active'" class="flex items-center text-green-600 dark:text-green-400">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                募集中 - 応募を受け付けています
              </div>
              <div v-else-if="formData.status === 'closed'" class="flex items-center text-red-600 dark:text-red-400">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                募集終了 - 新しい応募は受け付けていません
              </div>
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
          <BaseButton
            type="button"
            variant="outline"
            @click="handleCancel"
            class="w-full sm:w-auto"
            size="lg"
          >
            キャンセル
          </BaseButton>

          <BaseButton
            type="button"
            variant="outline"
            @click="handleSaveDraft"
            :loading="saving"
            class="w-full sm:w-auto"
            size="lg"
          >
            {{ isDraftMode ? '下書き更新' : '下書き保存' }}
          </BaseButton>

          <BaseButton
            v-if="draftId"
            type="button"
            variant="ghost"
            @click="handleClearDraft"
            class="w-full sm:w-auto text-red-600 hover:text-red-700"
            size="lg"
          >
            下書きを削除
          </BaseButton>

          <BaseButton
            type="submit"
            :loading="submitting"
            :disabled="!isFormValid"
            class="w-full sm:w-auto"
            size="lg"
          >
            {{ isEditing && !isDraftMode ? '更新する' : '投稿する' }}
          </BaseButton>
        </div>
      </form>
    </div>
    
    <!-- コイン購入モーダル -->
    <CoinPurchaseModal
      :show="showPurchaseModal"
      @close="showPurchaseModal = false"
      @success="handlePurchaseSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
import CoinPurchaseModal from '@/components/payment/CoinPurchaseModal.vue'
import type { PostCategory, ContactMethod, Post, EventFrequency } from '@/types/post'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const { validate: validateField, validateAll, getFieldError } = useValidation()




// ローカルドラフトクリア（手動下書き保存のみ対応）
const clearDraft = () => {
  // 手動保存の下書きのみクリア
  if (isEditing.value && postId.value) {
    localStorage.removeItem(`draft_${postId.value}`)
  } else {
    localStorage.removeItem('draft_new')
  }
}

// サーバー側の下書き削除
const deleteDraft = async (id: string) => {
  // 下書き削除処理開始
  try {
    const result = await postsApi.deletePost(id)
    // 削除API結果
    if (result.error) {
      console.error('下書き削除エラー:', result.error)
      return false
    }
    if (result.success) {
      // 下書き削除成功
      return true
    }
    return false
  } catch (error) {
    console.error('下書き削除エラー:', error)
    return false
  }
}

// 全ての下書きをクリア（サーバー側のみ）
const clearAllDrafts = async () => {
  // clearAllDrafts 開始
  
  // サーバー側の下書きのみ削除
  if (draftId.value) {
    // サーバー側下書き削除
    await deleteDraft(draftId.value)
    draftId.value = null
  }
  
  // 全ての下書きを検索して削除（投稿完了時は常に実行）
  await deleteAllUserDrafts()
}


// ユーザーの全ての下書きを削除
const deleteAllUserDrafts = async () => {
  if (!authStore.user?.id) {
    // ユーザーIDが見つかりません
    return
  }
  
  // ユーザーの下書き検索開始
  
  try {
    // ユーザーの下書きを全て取得
    const result = await postsApi.getPosts({
      user_id: authStore.user.id,
      status: 'draft',
      limit: 100
    })
    
    // 下書き検索結果
    
    if (result.data && result.data.length > 0) {
      const draftList = []
      for (let i = 0; i < result.data.length; i++) {
        const d = result.data[i]
        draftList.push({ id: d.id, title: d.title })
      }
      // 下書きが見つかりました
      
      let deletedCount = 0
      let failedCount = 0
      
      // 下書きを削除
      const drafts = result.data
      for (let i = 0; i < drafts.length; i++) {
        const draft = drafts[i]
        // 下書き削除試行
        const success = await deleteDraft(draft.id)
        if (success) {
          deletedCount++
        } else {
          failedCount++
        }
      }
      
      // 下書き削除結果
      
      // 削除後に再度検索して確認
      // 削除後の確認検索を実行中
      const verifyResult = await postsApi.getPosts({
        user_id: authStore.user.id,
        status: 'draft',
        limit: 100
      })
      // 削除後の下書き数を確認
      if (verifyResult.data && verifyResult.data.length > 0) {
        const remainingDrafts = []
        for (let i = 0; i < verifyResult.data.length; i++) {
          const d = verifyResult.data[i]
          remainingDrafts.push({ id: d.id, title: d.title })
        }
        // まだ残っている下書きあり
      }
      
      if (deletedCount > 0) {
        toast.success(`${deletedCount}件の下書きを削除しました`)
      }
      if (failedCount > 0) {
        toast.error(`${failedCount}件の下書き削除に失敗しました`)
      }
    } else {
      // 削除対象の下書きが見つかりません
    }
  } catch (error) {
    console.error('下書き一括削除エラー:', error)
    toast.error('下書きの削除中にエラーが発生しました')
  }
}

// 編集モードと下書きモードの判定
const isEditing = computed(() => !!route.params.id)
const postId = computed(() => route.params.id as string)

// 下書きID管理
const draftId = ref<string | null>(null)
const isDraftMode = computed(() => !!draftId.value)

// コイン購入モーダル
const showPurchaseModal = ref(false)

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
  contactMethod: 'twitter' as ContactMethod,
  contactInfo: '',
  deadline: '',
  enablePriority: false, // 優先表示フラグ
  status: 'active' as 'active' | 'closed', // 募集ステータス
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
    eventFrequency: formData.value.eventFrequency as EventFrequency,
    eventSpecificDate: formData.value.eventSpecificDate,
    eventWeekday: formData.value.eventWeekday,
    eventTime: formData.value.eventTime,
    eventWeekOfMonth: formData.value.eventWeekOfMonth,
    images: (() => {
      const previews = []
      for (let i = 0; i < selectedImages.value.length; i++) {
        previews.push(selectedImages.value[i].preview)
      }
      return previews
    })(), // プレビュー画像を追加
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

const statusOptions = [
  { value: 'active', label: '募集中' },
  { value: 'closed', label: '募集終了' },
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


  return basicRequiredFields && eventRequiredFields
})

// 連絡先情報のバリデーション
const validateContactInfo = () => {
  const info = formData.value.contactInfo
  const rules: Record<string, unknown> = { required: true, ...commonRules.twitter }
  validateField('contactInfo', info, rules)
}

// ステータス変更処理
const handleStatusChange = (newStatus: string) => {
  formData.value.status = newStatus as 'active' | 'closed'
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

  for (let i = 0; i < filesToAdd.length; i++) {
    const file = filesToAdd[i]
    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} のファイルサイズが5MBを超えています`)
      continue
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} は画像ファイルではありません`)
      continue
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
  }

  if (files.length > remainingSlots) {
    toast.info(`${remainingSlots}枚のみ追加されました（最大3枚まで）`)
  }
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

// フォーム送信
const handleSubmit = async () => {

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

  // 優先表示が有効でコイン残高が不足している場合
  if (formData.value.enablePriority && authStore.profile) {
    const balance = authStore.profile.coin_balance || 0
    if (balance < 1) {
      toast.error('優先表示にはコインが1枚必要です')
      showPurchaseModal.value = true
      return
    }
  }

  submitting.value = true

  try {
    const result = await submitPost()

    toast.success(isEditing.value ? '募集を更新しました' : '募集を投稿しました')
    
    // 投稿成功時はドラフトをクリア（新規投稿・編集投稿問わず）
    await clearAllDrafts()

    router.push('/posts')
  } catch (error) {
    console.error('投稿エラー:', error)
    toast.error('投稿に失敗しました')
  } finally {
    submitting.value = false
  }
}

// 下書き保存
const handleSaveDraft = async () => {
  if (!authStore.isAuthenticated) {
    toast.error('ログインが必要です')
    return
  }

  // 最小限のバリデーション（タイトルのみ）
  if (!formData.value.title?.trim()) {
    toast.error('タイトルを入力してください')
    return
  }

  saving.value = true

  try {
    
    // 画像をアップロード
    const imageUrls = await uploadImages(draftId.value)

    // 投稿データを準備
    const postData = {
      title: formData.value.title,
      category: formData.value.category || 'other',
      description: formData.value.description,
      requirements: formData.value.requirements ? [formData.value.requirements] : [],
      deadline: formData.value.deadline || undefined,
        contactMethod: 'twitter' as ContactMethod,
      contactValue: formData.value.contactInfo,
      eventFrequency: formData.value.eventFrequency,
      eventSpecificDate: formData.value.eventSpecificDate || undefined,
      eventWeekday: formData.value.eventWeekday,
      eventTime: formData.value.eventTime || undefined,
      eventWeekOfMonth: formData.value.eventWeekOfMonth,
      tags: [],
      images: imageUrls,
    }


    // 下書き保存API呼び出し
    const result = await postsApi.saveDraft(postData, draftId.value)

    if (result.error) {
      throw new Error(result.error)
    }

    if (result.data) {
      draftId.value = result.data.id
      const message = isDraftMode.value ? '下書きを更新しました' : '下書きを保存しました'
      toast.success(message)
    }
  } catch (error) {
    console.error('Draft save error:', error)
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

// 下書きクリア
const handleClearDraft = async () => {
  if (confirm('保存された下書きを削除しますか？この操作は取り消せません。')) {
    await clearAllDrafts()
    toast.success('下書きを削除しました')
    
    // フォームをリセット
    formData.value = {
      title: '',
      category: '' as PostCategory | '',
      description: '',
      requirements: '',
      eventFrequency: '' as EventFrequency | '',
      eventSpecificDate: '',
      eventWeekday: undefined,
      eventTime: '',
      eventWeekOfMonth: undefined,
      contactMethod: 'twitter' as ContactMethod,
      contactInfo: '',
      deadline: '',
      enablePriority: false,
      status: 'active' as 'active' | 'closed',
    }
    
    // プロフィールからTwitterIDを再設定
    loadUserProfile()
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
    for (let i = 0; i < selectedImages.value.length; i++) {
      const imageData = selectedImages.value[i]

      if (imageData.uploaded) {
        // 既にアップロード済み
        uploadedUrls.push(imageData.uploaded.url)
        continue
      }

      if (!imageData.file) {
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
    description: formData.value.description,
    requirements: formData.value.requirements ? [formData.value.requirements] : [],
    deadline: formData.value.deadline || undefined,
    contactMethod: 'twitter' as ContactMethod,
    contactValue: formData.value.contactInfo,
    eventFrequency: formData.value.eventFrequency as EventFrequency,
    eventSpecificDate: formData.value.eventSpecificDate || undefined,
    eventWeekday: formData.value.eventWeekday,
    eventTime: formData.value.eventTime || undefined,
    eventWeekOfMonth: formData.value.eventWeekOfMonth,
    tags: [],
    images: imageUrls,
    enablePriority: formData.value.enablePriority, // 優先表示フラグを追加
    status: formData.value.status, // 募集ステータスを追加
  }
  
  // 送信前の最終チェック
  if (postData.eventFrequency === 'weekly' && (postData.eventWeekday === undefined || !postData.eventTime)) {
    throw new Error('週1回イベントに必要な情報が不足しています')
  }

  if (isEditing.value) {
    // 更新処理
    const result = await postsApi.updatePost(postId.value, postData)
    if (result.error) {
      throw new Error(result.error)
    }
    return result.data
  } else if (isDraftMode.value) {
    // 下書きから公開処理
    // 下書きから公開処理
    const result = await postsApi.updatePost(draftId.value!, { ...postData, status: 'published' })
    if (result.error) {
      throw new Error(result.error)
    }
    // 下書きから公開への移行なので、draftIdをクリアして公開投稿に変換
    // 下書きから公開完了
    draftId.value = null
    return result.data
  } else {
    // 新規作成処理
    const result = await postsApi.createPost(postData)
    if (result.error) {
      throw new Error(result.error)
    }
    
    return result.data
  }
}


const loadPost = async () => {
  if (!isEditing.value) return null

  const result = await postsApi.getPost(postId.value)
  if (result.error) {
    throw new Error(result.error)
  }

  return result.data
}

// プロフィールからTwitterIDを自動入力
const loadUserProfile = () => {
  if (authStore.profile?.twitter_username) {
    formData.value.contactInfo = authStore.profile.twitter_username
  }
}

// コイン購入成功時の処理
const handlePurchaseSuccess = (newBalance: number) => {
  // authストアのプロファイルを更新
  if (authStore.profile) {
    authStore.profile.coin_balance = newBalance
  }
  // または、refreshCoinBalanceを呼び出し
  authStore.refreshCoinBalance()
  toast.success('コインを購入しました')
}

// 編集時のデータ読み込み
onMounted(async () => {
  
  // 新規投稿の場合、プロフィールからTwitterIDを自動入力
  if (!isEditing.value) {
    loadUserProfile()
  }
  
  if (isEditing.value) {
    try {
      const postData = await loadPost()
      if (postData) {
        // 編集対象の投稿データを読み込み
        // eventSpecificDate値を確認
        // eventFrequency値を確認
        formData.value = {
          title: postData.title,
          category: postData.category,
          description: postData.description,
          requirements: postData.requirements?.join(', ') || '',
          eventFrequency: postData.eventFrequency || '',
          eventSpecificDate: (() => {
            if (postData.eventSpecificDate) {
              // UTC時間をローカル時間に変換
              const date = new Date(postData.eventSpecificDate)
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              const converted = `${year}-${month}-${day}T${hours}:${minutes}`
              // 日時変換完了
              return converted
            }
            return ''
          })(),
          eventWeekday: postData.eventWeekday,
          eventTime: postData.eventTime || '',
          eventWeekOfMonth: postData.eventWeekOfMonth,
          contactMethod: postData.contactMethod,
          contactInfo: postData.contactValue || '',
          deadline: postData.deadline || '',
          enablePriority: postData.enablePriority || false,
          status: (postData.status === 'active' || postData.status === 'closed') ? postData.status : 'active',
        }
        
        // 画像データの読み込み
        if (postData.images && postData.images.length > 0) {
          const imageList = []
          for (let i = 0; i < postData.images.length; i++) {
            const url = postData.images[i]
            imageList.push({
              file: null as any, // 既存画像の場合はファイルオブジェクトは無い
              preview: url, // 既存画像のURLをプレビューとして使用
              uploaded: { url, path: '' } // 既にアップロード済みとしてマーク
            })
          }
          selectedImages.value = imageList
        }
        
        // 下書きの場合はdraftIdを設定
        if (postData.status === 'draft') {
          draftId.value = postData.id
          // 下書き編集モード開始
        }
        
        loadError.value = null
      } else {
        loadError.value = '投稿データが見つかりませんでした。URLや権限をご確認ください。'
      }
    } catch (error: unknown) {
      console.error('投稿データ取得エラー:', error)
      loadError.value = '投稿データの取得に失敗しました。しばらくしてから再度お試しください。'
      router.push('/posts')
    }
  }
})
</script>

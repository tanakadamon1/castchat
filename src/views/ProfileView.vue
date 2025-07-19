<template>
  <div class="min-h-screen">
    <!-- ヘッダー -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">プロフィール</h1>
          <BaseButton
            variant="outline"
            @click="isEditing = !isEditing"
          >
            {{ isEditing ? 'キャンセル' : '編集' }}
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- プロフィール情報 -->
      <div v-if="profileData" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div class="flex flex-col md:flex-row gap-6">
          <!-- アバター -->
          <div class="flex flex-col items-center">
            <div class="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4">
              <img
                v-if="profileData.avatarUrl"
                :src="profileData.avatarUrl"
                :alt="profileData.displayName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <User class="w-16 h-16" />
              </div>
            </div>
            
            <BaseButton
              v-if="isEditing"
              size="sm"
              variant="outline"
              @click="triggerFileUpload"
              :disabled="uploadingAvatar"
            >
              {{ uploadingAvatar ? 'アップロード中...' : '画像を変更' }}
            </BaseButton>
            
            <!-- ファイル入力（非表示） -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleAvatarUpload"
              class="hidden"
            />
          </div>

          <!-- 基本情報 -->
          <div class="flex-1 space-y-4">
            <!-- 表示名 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                表示名
              </label>
              <BaseInput
                v-if="isEditing"
                v-model="editData.displayName"
                placeholder="表示名を入力..."
                :error="getFieldError('displayName')"
                @blur="validateField('displayName', editData.displayName, displayNameRules)"
              />
              <p v-else class="text-gray-900 dark:text-gray-100 font-medium">
                {{ profileData.displayName || 'なし' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 連絡先情報 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">連絡先情報</h2>
        
        <div class="max-w-md">
          <!-- Twitter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Twitter/X ID
            </label>
            <BaseInput
              v-if="isEditing"
              v-model="editData.twitterUsername"
              placeholder="@username または username"
              :error="getFieldError('twitterUsername')"
              @blur="validateTwitter"
            />
            <p v-else class="text-gray-900 dark:text-gray-100">
              {{ profileData?.twitterUsername || 'なし' }}
            </p>
          </div>
        </div>
      </div>


        <!-- アクションボタン -->
        <div v-if="isEditing" class="flex flex-col sm:flex-row gap-4">
          <BaseButton
            @click="handleSave"
            :loading="saving"
            :disabled="false"
            class="flex-1"
          >
            保存
          </BaseButton>
          
          <BaseButton
            variant="outline"
            @click="handleCancel"
            class="flex-1"
          >
            キャンセル
          </BaseButton>
        </div>
      </div>
    
      <!-- ローディング表示 -->
      <div v-if="!profileData" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">プロフィールを読み込み中...</p>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useValidation, commonRules } from '@/utils/validation'
import { uploadProfileImage } from '@/lib/imageUpload'
import { User } from 'lucide-vue-next'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { validate: validateField, getFieldError, hasErrors } = useValidation()

// 編集モード
const isEditing = ref(false)
const saving = ref(false)
const uploadingAvatar = ref(false)

// ファイル入力参照
const fileInput = ref<HTMLInputElement>()

// プロフィールデータ（実データを使用）
const profileData = computed(() => {
  if (!authStore.profile) return null
  
  const profile = authStore.profile
  return {
    id: profile.id,
    displayName: profile.display_name || '',
    avatarUrl: profile.avatar_url || '',
    twitterUsername: profile.twitter_username || '',
    createdAt: profile.created_at
  }
})

// 編集用データ
const editData = ref({
  displayName: '',
  twitterUsername: ''
})


// バリデーションルール
const displayNameRules = {
  required: true,
  minLength: 1,
  maxLength: 50,
  message: '表示名は1文字以上50文字以内で入力してください'
}

// フォームの有効性
const isFormValid = computed(() => {
  const hasRequiredFields = editData.value.displayName?.trim()
  // 一時的に簡素化 - hasErrorsチェックを外す
  return hasRequiredFields
})

// バリデーション関数
const validateTwitter = () => {
  if (editData.value.twitterUsername) {
    validateField('twitterUsername', editData.value.twitterUsername, commonRules.twitter)
  }
}


// イベントハンドラー
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!authStore.user?.id) {
    toast.error('ユーザー情報が見つかりません')
    return
  }
  
  uploadingAvatar.value = true
  
  try {
    const result = await uploadProfileImage(file, authStore.user.id)
    
    if (result.error) {
      toast.error(result.error)
      return
    }
    
    if (result.data) {
      // プロフィール画像URLを更新
      await authStore.updateProfile({ avatar_url: result.data.url })
      toast.success('プロフィール画像をアップロードしました')
    }
  } catch (err) {
    console.error('Avatar upload error:', err)
    toast.error('画像のアップロードに失敗しました')
  } finally {
    uploadingAvatar.value = false
    // ファイル入力をリセット
    if (target) {
      target.value = ''
    }
  }
}

const handleSave = async () => {
  if (!isFormValid.value) {
    toast.error('入力内容に誤りがあります')
    return
  }

  saving.value = true
  
  try {
    // 実際のAPIを使用してプロフィールを更新
    await authStore.updateProfile({
      display_name: editData.value.displayName,
      twitter_username: editData.value.twitterUsername
    })
    
    toast.success('プロフィールを更新しました')
    isEditing.value = false
  } catch (err) {
    console.error('プロフィール更新エラー:', err)
    toast.error('プロフィール更新に失敗しました')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  if (!profileData.value) return
  
  // 編集データをリセット
  editData.value = {
    displayName: profileData.value.displayName,
    twitterUsername: profileData.value.twitterUsername
  }
  
  isEditing.value = false
}

// editDataの初期化を監視
const initializeEditData = () => {
  if (profileData.value) {
    editData.value = {
      displayName: profileData.value.displayName,
      twitterUsername: profileData.value.twitterUsername
    }
  }
}

// profileDataの変更を監視
watchEffect(() => {
  initializeEditData()
})

// 初期化
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  // 初期化を試行
  initializeEditData()
})
</script>
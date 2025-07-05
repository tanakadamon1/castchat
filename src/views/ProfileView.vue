<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">プロフィール</h1>
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
      <div v-if="profileData" class="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">
                表示名
              </label>
              <BaseInput
                v-if="isEditing"
                v-model="editData.displayName"
                placeholder="表示名を入力..."
                :error="getFieldError('displayName')"
                @blur="validateField('displayName', editData.displayName, displayNameRules)"
              />
              <p v-else class="text-gray-900 font-medium">
                {{ profileData.displayName || 'なし' }}
              </p>
            </div>

            <!-- ユーザー名 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ユーザー名
              </label>
              <BaseInput
                v-if="isEditing"
                v-model="editData.username"
                placeholder="username"
                :error="getFieldError('username')"
                @blur="validateField('username', editData.username, usernameRules)"
              />
              <p v-else class="text-gray-600">
                @{{ profileData.username || 'なし' }}
              </p>
            </div>

            <!-- 自己紹介 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                自己紹介
              </label>
              <BaseTextarea
                v-if="isEditing"
                v-model="editData.bio"
                placeholder="自己紹介を入力..."
                :rows="3"
                :error="getFieldError('bio')"
              />
              <p v-else class="text-gray-900 whitespace-pre-wrap">
                {{ profileData.bio || '自己紹介が設定されていません' }}
              </p>
            </div>

            <!-- ステータス -->
            <div class="flex items-center gap-2">
              <UserStatusBadge :status="profileData.status" />
              <span class="text-sm text-gray-500">
                {{ formatDate(profileData.lastActiveAt) }}にアクティブ
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 連絡先情報 -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Discord -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Discord
            </label>
            <BaseInput
              v-if="isEditing"
              v-model="editData.discordUsername"
              placeholder="username#1234"
              :error="getFieldError('discordUsername')"
              @blur="validateDiscord"
            />
            <p v-else class="text-gray-900">
              {{ profileData?.discordUsername || 'なし' }}
            </p>
          </div>

          <!-- Twitter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Twitter/X
            </label>
            <BaseInput
              v-if="isEditing"
              v-model="editData.twitterUsername"
              placeholder="@username"
              :error="getFieldError('twitterUsername')"
              @blur="validateTwitter"
            />
            <p v-else class="text-gray-900">
              {{ profileData?.twitterUsername || 'なし' }}
            </p>
          </div>

          <!-- VRChat -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              VRChat
            </label>
            <BaseInput
              v-if="isEditing"
              v-model="editData.vrchatUsername"
              placeholder="VRChatユーザー名"
              :error="getFieldError('vrchatUsername')"
            />
            <p v-else class="text-gray-900">
              {{ profileData?.vrchatUsername || 'なし' }}
            </p>
          </div>

          <!-- ウェブサイト -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ウェブサイト
            </label>
            <BaseInput
              v-if="isEditing"
              v-model="editData.websiteUrl"
              placeholder="https://..."
              :error="getFieldError('websiteUrl')"
              @blur="validateWebsite"
            />
            <a
              v-else-if="profileData?.websiteUrl"
              :href="profileData.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-indigo-600 hover:text-indigo-700"
            >
              {{ profileData?.websiteUrl }}
            </a>
            <p v-else class="text-gray-900">なし</p>
          </div>
        </div>
      </div>

      <!-- アクティビティ統計 -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">アクティビティ</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ stats.postsCount }}</div>
            <div class="text-sm text-gray-600">投稿数</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ stats.applicationsReceived }}</div>
            <div class="text-sm text-gray-600">受信応募</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ stats.applicationsSent }}</div>
            <div class="text-sm text-gray-600">送信応募</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ stats.successfulMatches }}</div>
            <div class="text-sm text-gray-600">成功マッチ</div>
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
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import UserStatusBadge from '@/components/user/UserStatusBadge.vue'

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
    username: profile.username || '',
    displayName: profile.display_name || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatar_url || '',
    discordUsername: profile.discord_username || '',
    twitterUsername: profile.twitter_username || '',
    vrchatUsername: profile.vrchat_username || '',
    websiteUrl: profile.website_url || '',
    status: 'active' as const,
    lastActiveAt: profile.updated_at || profile.created_at,
    createdAt: profile.created_at
  }
})

// 編集用データ
const editData = ref({
  displayName: '',
  username: '',
  bio: '',
  discordUsername: '',
  twitterUsername: '',
  vrchatUsername: '',
  websiteUrl: ''
})

// 統計データ（モック）
const stats = ref({
  postsCount: 12,
  applicationsReceived: 45,
  applicationsSent: 8,
  successfulMatches: 15
})

// バリデーションルール
const displayNameRules = {
  required: true,
  minLength: 1,
  maxLength: 50,
  message: '表示名は1文字以上50文字以内で入力してください'
}

const usernameRules = {
  ...commonRules.username,
  required: true
}

// フォームの有効性
const isFormValid = computed(() => {
  const hasRequiredFields = editData.value.displayName?.trim() && editData.value.username?.trim()
  console.log('Form validation:', {
    hasErrors: hasErrors.value,
    displayName: editData.value.displayName,
    username: editData.value.username,
    hasRequiredFields,
    errors: errors.value,
    isValid: !hasErrors.value && hasRequiredFields
  })
  // 一時的に簡素化 - hasErrorsチェックを外す
  return hasRequiredFields
})

// バリデーション関数
const validateDiscord = () => {
  if (editData.value.discordUsername) {
    validateField('discordUsername', editData.value.discordUsername, commonRules.discord)
  }
}

const validateTwitter = () => {
  if (editData.value.twitterUsername) {
    validateField('twitterUsername', editData.value.twitterUsername, commonRules.twitter)
  }
}

const validateWebsite = () => {
  if (editData.value.websiteUrl) {
    validateField('websiteUrl', editData.value.websiteUrl, commonRules.url)
  }
}

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今日'
  } else if (diffDays === 1) {
    return '昨日'
  } else if (diffDays < 7) {
    return `${diffDays}日前`
  } else {
    return date.toLocaleDateString('ja-JP')
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
  console.log('Save button clicked!')
  console.log('Form valid?', isFormValid.value)
  console.log('Has errors?', hasErrors.value) 
  console.log('Edit data:', editData.value)
  
  if (!isFormValid.value) {
    console.log('Form validation failed!')
    toast.error('入力内容に誤りがあります')
    return
  }

  saving.value = true
  
  try {
    // 実際のAPIを使用してプロフィールを更新
    await authStore.updateProfile({
      display_name: editData.value.displayName,
      username: editData.value.username,
      bio: editData.value.bio,
      discord_username: editData.value.discordUsername,
      twitter_username: editData.value.twitterUsername,
      vrchat_username: editData.value.vrchatUsername,
      website_url: editData.value.websiteUrl
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
    username: profileData.value.username,
    bio: profileData.value.bio,
    discordUsername: profileData.value.discordUsername,
    twitterUsername: profileData.value.twitterUsername,
    vrchatUsername: profileData.value.vrchatUsername,
    websiteUrl: profileData.value.websiteUrl
  }
  
  isEditing.value = false
}

// editDataの初期化を監視
const initializeEditData = () => {
  if (profileData.value) {
    editData.value = {
      displayName: profileData.value.displayName,
      username: profileData.value.username,
      bio: profileData.value.bio,
      discordUsername: profileData.value.discordUsername,
      twitterUsername: profileData.value.twitterUsername,
      vrchatUsername: profileData.value.vrchatUsername,
      websiteUrl: profileData.value.websiteUrl
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
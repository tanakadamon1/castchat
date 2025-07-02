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
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
              @click="handleAvatarUpload"
            >
              画像を変更
            </BaseButton>
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
              {{ profileData.discordUsername || 'なし' }}
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
              {{ profileData.twitterUsername || 'なし' }}
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
              {{ profileData.vrchatUsername || 'なし' }}
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
              v-else-if="profileData.websiteUrl"
              :href="profileData.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-indigo-600 hover:text-indigo-700"
            >
              {{ profileData.websiteUrl }}
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
          :disabled="!isFormValid"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useValidation, commonRules } from '@/utils/validation'
import { User } from 'lucide-vue-next'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import UserStatusBadge from '@/components/user/UserStatusBadge.vue'

const router = useRouter()
const authStore = useAuthStore()
const { success, error, info } = useToast()
const { validate: validateField, getFieldError, hasErrors } = useValidation()

// 編集モード
const isEditing = ref(false)
const saving = ref(false)

// プロフィールデータ（モック）
const profileData = ref({
  id: 'user123',
  username: 'sakura_vr',
  displayName: 'さくら',
  bio: 'VRChatでの配信や写真撮影を楽しんでいます！\n気軽に声をかけてください♪',
  avatarUrl: 'https://via.placeholder.com/128',
  discordUsername: 'sakura#1234',
  twitterUsername: '@sakura_vr',
  vrchatUsername: 'sakura_vrchat',
  websiteUrl: 'https://example.com',
  status: 'active' as const,
  lastActiveAt: '2024-01-30T12:00:00Z',
  createdAt: '2023-06-15T00:00:00Z'
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
  return !hasErrors.value && 
         editData.value.displayName.trim() && 
         editData.value.username.trim()
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
const handleAvatarUpload = () => {
  // TODO: 画像アップロード機能実装
  info('画像アップロード機能は準備中です')
}

const handleSave = async () => {
  if (!isFormValid.value) {
    error('入力内容に誤りがあります')
    return
  }

  saving.value = true
  
  try {
    // TODO: API実装時に置き換え
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // プロフィールデータを更新
    Object.assign(profileData.value, editData.value)
    
    success('プロフィールを更新しました')
    isEditing.value = false
  } catch (err) {
    console.error('プロフィール更新エラー:', err)
    error('プロフィール更新に失敗しました')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
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

// 初期化
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  try {
    // TODO: API実装時にデータ取得
    // 編集データを初期化
    editData.value = {
      displayName: profileData.value.displayName,
      username: profileData.value.username,
      bio: profileData.value.bio,
      discordUsername: profileData.value.discordUsername,
      twitterUsername: profileData.value.twitterUsername,
      vrchatUsername: profileData.value.vrchatUsername,
      websiteUrl: profileData.value.websiteUrl
    }
  } catch (err) {
    console.error('プロフィール取得エラー:', err)
    error('プロフィールの取得に失敗しました')
  }
})
</script>
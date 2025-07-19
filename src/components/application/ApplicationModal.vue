<template>
  <BaseModal :show="true" @close="emit('close')" size="lg">
    <div class="p-6">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">応募申請</h2>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- 投稿情報 -->
      <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{ post.title }}</h3>
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <User class="w-4 h-4 mr-1" />
          <span>{{ post.authorName }}</span>
          <span class="mx-2">•</span>
          <Calendar class="w-4 h-4 mr-1" />
          <span>{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>

      <!-- 応募フォーム -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 応募メッセージ -->
        <div>
          <BaseTextarea
            v-model="formData.message"
            label="応募メッセージ"
            placeholder="応募理由や自己PRを記入してください..."
            :rows="5"
            required
            :error="getFieldError('message')"
            @blur="validateField('message', formData.message, messageRules)"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ formData.message.length }}/500文字
          </p>
        </div>

        <!-- 経験・スキル -->
        <div>
          <BaseTextarea
            v-model="formData.experience"
            label="関連する経験・スキル（任意）"
            placeholder="VRChatでの活動経験、配信経験、特技など..."
            :rows="3"
            :error="getFieldError('experience')"
          />
        </div>

        <!-- 可能な時間帯 -->
        <div>
          <BaseTextarea
            v-model="formData.availability"
            label="参加可能な時間帯（任意）"
            placeholder="平日夜、土日終日など..."
            :rows="2"
            :error="getFieldError('availability')"
          />
        </div>

        <!-- Twitter ID -->
        <div>
          <BaseInput
            v-model="formData.twitterId"
            label="Twitter ID"
            placeholder="@username または username"
            :error="getFieldError('twitterId')"
            @blur="validateField('twitterId', formData.twitterId, twitterIdRules)"
          >
            <template #helper>
              <p class="text-xs text-gray-500 mt-1">
                連絡用のTwitter IDを入力してください（@は省略可能）
              </p>
            </template>
          </BaseInput>
        </div>

        <!-- 注意事項 -->
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex items-start">
            <Info class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <div class="text-sm text-blue-800 dark:text-blue-200">
              <p class="font-medium mb-2">応募時の注意事項</p>
              <ul class="space-y-1 text-xs">
                <li>• 応募後は投稿者からの連絡をお待ちください</li>
                <li>• 応募内容は投稿者にのみ表示されます</li>
                <li>• 不適切な内容の応募は削除される場合があります</li>
              </ul>
              <div class="mt-3 pt-2 border-t border-blue-200 dark:border-blue-800">
                <p class="font-medium mb-1 text-blue-900 dark:text-blue-100">⚠️ 今後のやり取りについて</p>
                <ul class="space-y-1 text-xs">
                  <li>• 応募が承認された場合、今後の詳細なやり取りはTwitterで行います</li>
                  <li>• Twitter IDは正確に入力してください（連絡が取れなくなります）</li>
                  <li>• DM受信設定を確認しておいてください</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <BaseButton
            type="button"
            variant="outline"
            @click="emit('close')"
            class="order-2 sm:order-1"
          >
            キャンセル
          </BaseButton>
          
          <BaseButton
            type="submit"
            :loading="submitting"
            :disabled="!isFormValid"
            class="order-1 sm:order-2 flex-1"
          >
            応募を送信
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script lang="ts">
export default {
  name: 'ApplicationModal'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { X, User, Calendar, Info } from 'lucide-vue-next'
import { useValidation } from '@/utils/validation'
import { useAuthStore } from '@/stores/auth'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { Post } from '@/types/post'

interface Props {
  post: Post
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [applicationData: any]
}>()

const authStore = useAuthStore()
const { validate: validateField, getFieldError, errors } = useValidation()

// フォームデータ
const formData = ref({
  message: '',
  experience: '',
  availability: '',
  twitterId: ''
})

// プロフィールからTwitterIDを自動入力
const loadUserProfile = async () => {
  // authStore.profileがない場合は動的に取得
  if (!authStore.profile && authStore.user?.id) {
    if (authStore.user?.id) {
      await authStore.getUserProfile(authStore.user.id)
    }
  }
  
  if (authStore.profile?.twitter_username) {
    formData.value.twitterId = authStore.profile.twitter_username
  }
}

// ローディング状態
const submitting = ref(false)

// バリデーションルール
const messageRules = {
  required: true,
  minLength: 10,
  maxLength: 500,
  message: 'メッセージは10文字以上500文字以内で入力してください'
}

const twitterIdRules = {
  required: false,
  pattern: /^@?[A-Za-z0-9_]{1,15}$/,
  message: '有効なTwitter IDを入力してください（@は省略可能）'
}

// フォームの有効性チェック
const isFormValid = computed(() => {
  // メッセージが10文字以上かチェック
  const messageValid = formData.value.message.trim().length >= 10
  
  // Twitter IDが入力されている場合は有効かチェック
  const twitterIdValid = !formData.value.twitterId || 
    /^@?[A-Za-z0-9_]{1,15}$/.test(formData.value.twitterId)
  
  // 実際のエラーがあるかチェック（空のエラー配列は無視）
  const actualErrors = Object.values(errors.value).filter(errorArray => errorArray && errorArray.length > 0)
  const hasActualErrors = actualErrors.length > 0
  
  const isValid = !hasActualErrors && messageValid && twitterIdValid
  
  return isValid
})

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// フォーム送信
const handleSubmit = async () => {
  // バリデーション
  if (!validateField('message', formData.value.message, messageRules)) {
    return
  }
  
  if (formData.value.twitterId && !validateField('twitterId', formData.value.twitterId, twitterIdRules)) {
    return
  }

  submitting.value = true
  
  try {
    const applicationData = {
      postId: props.post.id,
      message: formData.value.message.trim(),
      experience: formData.value.experience.trim(),
      availability: formData.value.availability.trim(),
      twitterId: formData.value.twitterId.trim().replace(/^@/, '') // @を除去して保存
    }
    
    emit('submit', applicationData)
  } finally {
    submitting.value = false
  }
}

// 初期化時にプロフィールからTwitterIDを読み込み
onMounted(() => {
  loadUserProfile()
})
</script>
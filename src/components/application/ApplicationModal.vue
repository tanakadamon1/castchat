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
          <span>{{ formatDate(post.startDate || post.createdAt) }}</span>
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

        <!-- 連絡可能な方法 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            連絡可能な方法 <span class="text-red-500">*</span>
          </label>
          <div class="space-y-2">
            <BaseCheckbox
              v-model="formData.contactMethods.discord"
              label="Discord"
            />
            <BaseCheckbox
              v-model="formData.contactMethods.twitter"
              label="Twitter/X"
            />
            <BaseCheckbox
              v-model="formData.contactMethods.vrchat"
              label="VRChat"
            />
            <BaseCheckbox
              v-model="formData.contactMethods.email"
              label="メール"
            />
          </div>
          <p v-if="!hasSelectedContactMethod" class="text-sm text-red-600 mt-1">
            少なくとも1つの連絡方法を選択してください
          </p>
        </div>

        <!-- 注意事項 -->
        <div class="p-4 bg-blue-50 rounded-lg">
          <div class="flex items-start">
            <Info class="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">応募時の注意事項</p>
              <ul class="space-y-1 text-xs">
                <li>• 応募後は投稿者からの連絡をお待ちください</li>
                <li>• 応募内容は投稿者にのみ表示されます</li>
                <li>• 不適切な内容の応募は削除される場合があります</li>
              </ul>
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, User, Calendar, Info } from 'lucide-vue-next'
import { useValidation } from '@/utils/validation'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
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

const { validate: validateField, getFieldError, hasErrors } = useValidation()

// フォームデータ
const formData = ref({
  message: '',
  experience: '',
  availability: '',
  contactMethods: {
    discord: false,
    twitter: false,
    vrchat: false,
    email: false
  }
})

// ローディング状態
const submitting = ref(false)

// バリデーションルール
const messageRules = {
  required: true,
  minLength: 10,
  maxLength: 500,
  message: 'メッセージは10文字以上500文字以内で入力してください'
}

// 連絡方法が選択されているかチェック
const hasSelectedContactMethod = computed(() => {
  const hasContact = Object.values(formData.value.contactMethods).some(selected => selected)
  console.log('Contact methods:', formData.value.contactMethods, 'hasContact:', hasContact)
  return hasContact
})

// フォームの有効性チェック
const isFormValid = computed(() => {
  const isValid = !hasErrors.value && 
         formData.value.message.trim().length >= 10 && 
         hasSelectedContactMethod.value
  
  console.log('Form validation:', {
    hasErrors: hasErrors.value,
    messageLength: formData.value.message.trim().length,
    hasContactMethod: hasSelectedContactMethod.value,
    isValid
  })
  
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
  
  if (!hasSelectedContactMethod.value) {
    return
  }

  submitting.value = true
  
  try {
    const applicationData = {
      postId: props.post.id,
      message: formData.value.message.trim(),
      experience: formData.value.experience.trim(),
      availability: formData.value.availability.trim(),
      contactMethods: Object.entries(formData.value.contactMethods)
        .filter(([_, selected]) => selected)
        .map(([method, _]) => method)
    }
    
    emit('submit', applicationData)
  } finally {
    submitting.value = false
  }
}
</script>
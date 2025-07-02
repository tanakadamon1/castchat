<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          パスワードリセット
        </h1>
        <p class="text-gray-600">
          登録したメールアドレスにリセットリンクを送信します
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- 成功メッセージ -->
        <div v-if="resetSent" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircle class="h-5 w-5 text-green-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-800">
                パスワードリセットのリンクを送信しました。メールを確認してください。
              </p>
            </div>
          </div>
        </div>

        <!-- エラーメッセージ -->
        <div v-if="authStore.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertCircle class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">
                {{ authStore.error }}
              </p>
            </div>
          </div>
        </div>

        <form v-if="!resetSent" @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <BaseInput
              v-model="email"
              type="email"
              label="メールアドレス"
              placeholder="your@email.com"
              required
              :error="getFieldError('email')"
              @blur="validateField('email', email, emailRules)"
              autocomplete="email"
            />
          </div>

          <div>
            <BaseButton
              type="submit"
              :loading="authStore.loading"
              :disabled="!isFormValid"
              class="w-full"
            >
              リセットリンクを送信
            </BaseButton>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <div class="mt-6 text-center">
            <router-link
              to="/login"
              class="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ログインページに戻る
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useValidation, commonRules } from '@/utils/validation'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { validate: validateField, getFieldError, hasErrors } = useValidation()

// フォーム状態
const email = ref('')
const resetSent = ref(false)

// バリデーションルール
const emailRules = {
  required: true,
  ...commonRules.email,
  message: '有効なメールアドレスを入力してください'
}

// フォーム有効性
const isFormValid = computed(() => {
  return !hasErrors.value && email.value.trim() !== ''
})

// パスワードリセット送信
const handleSubmit = async () => {
  if (!validateField('email', email.value, emailRules)) {
    return
  }

  try {
    const result = await authStore.resetPassword(email.value)
    
    if (result.error) {
      console.error('Password reset error:', result.error)
      return
    }
    
    resetSent.value = true
    
    // 5秒後にログインページにリダイレクト
    setTimeout(() => {
      router.push('/login')
    }, 5000)
  } catch (error) {
    console.error('Password reset error:', error)
  }
}
</script>
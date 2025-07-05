<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div v-if="loading" class="space-y-4">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
          ></div>
          <h2 class="text-2xl font-bold text-gray-900">認証中...</h2>
          <p class="text-gray-600">Googleアカウントで認証しています</p>
        </div>

        <div v-else-if="error" class="space-y-4">
          <div class="text-red-500">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">認証エラー</h2>
          <p class="text-gray-600">{{ error }}</p>
          <button
            @click="retryAuth"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            再試行
          </button>
        </div>

        <div v-else class="space-y-4">
          <div class="text-green-500">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">認証完了</h2>
          <p class="text-gray-600">ホーム画面にリダイレクトしています...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(true)
const error = ref<string | null>(null)

const isRecovery = computed(() => route.query.type === 'recovery')

const handleAuthCallback = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('=== Auth callback started ===')
    console.log('Current URL:', window.location.href)
    console.log('URL hash:', window.location.hash)
    console.log('URL search params:', window.location.search)

    // URLパラメータを解析
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    console.log('URL params:', Object.fromEntries(urlParams.entries()))
    console.log('Hash params:', Object.fromEntries(hashParams.entries()))

    // まず現在のセッションをクリア
    console.log('Clearing existing session...')
    await supabase.auth.signOut()

    // 少し待ってからセッションを確認
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Supabaseの認証コールバックを処理
    const { data, error: authError } = await supabase.auth.getSession()

    console.log('Session data:', data)
    console.log('Auth error:', authError)

    if (authError) {
      console.error('Auth error details:', authError)
      throw authError
    }

    if (!data.session) {
      console.error('No session found after OAuth callback')
      throw new Error('セッションが見つかりません。OAuth認証が完了していない可能性があります。')
    }

    console.log('Session found:', {
      user: data.session.user?.id,
      email: data.session.user?.email,
      expiresAt: data.session.expires_at,
    })

    // 認証ストアを初期化
    console.log('Initializing auth store...')
    await authStore.initialize()

    console.log('Auth store state:', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user?.id,
      profile: authStore.profile?.id,
    })

    if (authStore.isAuthenticated) {
      if (isRecovery.value) {
        toast.success('パスワードリセットが完了しました')
        setTimeout(() => {
          router.push('/profile?tab=security')
        }, 1500)
      } else {
        toast.success('ログインしました')
        setTimeout(() => {
          const redirectTo = (route.query.redirect as string) || '/'
          console.log('Redirecting to:', redirectTo)
          router.push(redirectTo)
        }, 1500)
      }
    } else {
      console.error('Auth store not authenticated after initialization')
      throw new Error('認証に失敗しました。認証ストアの初期化に問題があります。')
    }
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err instanceof Error ? err.message : '認証処理でエラーが発生しました'
    toast.error('認証に失敗しました')
  } finally {
    loading.value = false
  }
}

const retryAuth = () => {
  router.push('/login')
}

onMounted(() => {
  handleAuthCallback()
})
</script>

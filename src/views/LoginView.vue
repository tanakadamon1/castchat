<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          VRChatキャスト募集掲示板
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">Googleアカウントでログインしてください</p>
      </div>

      <div class="mt-8 space-y-6">
        <button
          @click="handleGoogleSignIn"
          :disabled="authStore.loading"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </span>
          {{ authStore.loading ? 'サインイン中...' : 'Googleでサインイン' }}
        </button>

        <!-- セッションクリアボタン -->
        <button
          @click="handleClearSession"
          :disabled="authStore.loading"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          セッションをクリアして再ログイン
        </button>

        <!-- デバッグ情報表示ボタン -->
        <button
          @click="showDebugInfo = !showDebugInfo"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ showDebugInfo ? 'デバッグ情報を隠す' : 'デバッグ情報を表示' }}
        </button>
      </div>

      <!-- デバッグ情報 -->
      <div v-if="showDebugInfo" class="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
        <h3 class="font-bold mb-2">デバッグ情報:</h3>
        <div class="space-y-1">
          <p>
            <strong>認証状態:</strong>
            {{ authStore.isAuthenticated ? 'ログイン済み' : '未ログイン' }}
          </p>
          <p><strong>ユーザーID:</strong> {{ authStore.user?.id || 'なし' }}</p>
          <p><strong>プロフィールID:</strong> {{ authStore.profile?.id || 'なし' }}</p>
          <p><strong>ローディング:</strong> {{ authStore.loading ? 'はい' : 'いいえ' }}</p>
          <p><strong>エラー:</strong> {{ authStore.error || 'なし' }}</p>
          <p><strong>現在のURL:</strong> {{ debugInfo.currentUrl }}</p>
          <p><strong>URLパラメータ:</strong> {{ debugInfo.urlParams }}</p>
          <p><strong>ハッシュ:</strong> {{ debugInfo.hash }}</p>
        </div>
      </div>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          初めての方も上記ボタンからログインできます
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showDebugInfo = ref(false)

// デバッグ情報用のcomputedプロパティ
const debugInfo = computed(() => ({
  currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
  urlParams: typeof window !== 'undefined' ? window.location.search || 'なし' : 'N/A',
  hash: typeof window !== 'undefined' ? window.location.hash || 'なし' : 'N/A',
}))

const handleGoogleSignIn = async () => {
  console.log('=== Google Sign-In Started ===')
  console.log('Button clicked! Auth store loading:', authStore.loading)
  console.log('Current auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user?.id,
    profile: authStore.profile?.id,
  })
  console.log('Current URL:', window.location.href)
  console.log('URL params:', window.location.search)
  console.log('Hash:', window.location.hash)

  try {
    console.log('Calling authStore.signInWithGoogle()...')
    const result = await authStore.signInWithGoogle()
    console.log('Sign-in result:', result)
    console.log('=== Google Sign-In Completed ===')
    // OAuth redirect will handle navigation
  } catch (error) {
    console.error('=== Google Sign-In Failed ===')
    console.error('Login failed:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
    })
    // Handle error (show toast, etc.)
  }
}

const handleClearSession = async () => {
  try {
    console.log('Clearing session...')
    await authStore.forceSignOut()
    console.log('Session cleared successfully')
    // ページをリロードして完全にリセット
    window.location.reload()
  } catch (error) {
    console.error('Failed to clear session:', error)
  }
}
</script>

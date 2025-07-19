<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          castChat
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          VRChatキャスト募集プラットフォーム
        </p>
        
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                メンテナンス中
              </h3>
              <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>現在システムのアップデート中です。しばらくお待ちください。</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <button
            @click="reload"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            ページを再読み込み
          </button>
          
          <div class="text-xs text-gray-500 dark:text-gray-400">
            問題が続く場合は、ブラウザのキャッシュをクリアしてください
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const reload = () => {
  window.location.reload()
}
</script>
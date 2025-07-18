<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <img 
          src="/favcon.png" 
          alt="castChat" 
          class="w-20 h-20 mx-auto mb-4"
        />
        <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          ページが見つかりません
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
      </div>
      
      <div class="space-y-4">
        <router-link
          to="/"
          class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          ホームに戻る
        </router-link>
        
        <div class="flex justify-center space-x-4">
          <router-link
            to="/posts"
            class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            募集一覧
          </router-link>
          <span class="text-gray-400">•</span>
          <router-link
            to="/posts/create"
            class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            募集投稿
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404ページのメタデータ
import { useHead } from '@vueuse/head'

useHead({
  title: '404 - ページが見つかりません | castChat',
  meta: [
    {
      name: 'description',
      content: 'お探しのページは存在しません。castChatでVRChatキャストを探してみましょう。'
    }
  ]
})
</script>
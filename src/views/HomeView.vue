<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const authStore = useAuthStore()
</script>

<template>
  <div class="bg-white">
    <!-- Hero Section -->
    <div class="relative isolate px-6 pt-14 lg:px-8">
      <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      
      <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            castChat
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            VRChatでのキャスト募集・応募を簡単に。クリエイターとキャストをつなぐプラットフォームです。
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <BaseButton
              as="router-link"
              to="/posts"
              variant="primary"
              size="lg"
              aria-label="キャスト募集一覧ページを開く"
            >
              募集一覧を見る
            </BaseButton>
            <BaseButton
              v-if="!authStore.isAuthenticated"
              as="router-link"
              to="/register"
              variant="ghost"
              size="lg"
              aria-label="新規アカウント登録ページへ移動"
              class="text-gray-900 dark:text-gray-100"
            >
              新規登録 <span aria-hidden="true">→</span>
            </BaseButton>
            <BaseButton
              v-else
              as="router-link"
              to="/posts/create"
              variant="ghost"
              size="lg"
              aria-label="新しい募集投稿作成ページへ移動"
              class="text-gray-900 dark:text-gray-100"
            >
              募集を投稿 <span aria-hidden="true">→</span>
            </BaseButton>
          </div>
        </div>
      </div>
      
      <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-indigo-600">簡単・便利</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            キャスト募集をもっと簡単に
          </p>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            VRChatでの動画制作、配信、イベント参加などのキャスト募集を効率的に行えます。
          </p>
        </div>
        
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                安心・安全
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600">
                Googleアカウント認証により、安心してご利用いただけます。
              </dd>
            </div>
            
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                高速マッチング
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600">
                条件に合うキャストを素早く見つけることができます。
              </dd>
            </div>
            
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                コミュニティ
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600">
                VRChatコミュニティの活性化に貢献します。
              </dd>
            </div>
            
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                モバイル対応
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600">
                スマートフォンからでも簡単に利用できます。
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

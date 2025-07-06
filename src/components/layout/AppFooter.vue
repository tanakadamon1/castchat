<template>
  <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-2 mb-4">
            <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">VR</span>
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">キャスト募集</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 transition-colors duration-200">
            VRChatでのキャスト募集・応募を簡単に。クリエイターとキャストをつなぐプラットフォームです。
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-gray-500">
              <span class="sr-only">Twitter</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-500">
              <span class="sr-only">Discord</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0188 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
            クイックリンク
          </h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/posts" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm">
                募集一覧
              </router-link>
            </li>
            <li>
              <router-link to="/posts/create" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm">
                募集投稿
              </router-link>
            </li>
            <li>
              <router-link to="/profile" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm">
                プロフィール
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
            サポート
          </h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm">
                ヘルプセンター
              </a>
            </li>
            <li>
              <router-link to="/terms-of-service" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm">
                利用規約
              </router-link>
            </li>
            <li>
              <router-link to="/privacy-policy" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm">
                プライバシーポリシー
              </router-link>
            </li>
            <li>
              <router-link to="/commercial-transaction" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm">
                特定商取引法に基づく表記
              </router-link>
            </li>
            <li>
              <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm">
                お問い合わせ
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <p class="text-gray-400 dark:text-gray-500 text-sm">
            © 2024 VRChatキャスト募集掲示板. All rights reserved.
          </p>
          <div class="flex space-x-6">
            <router-link to="/privacy-policy" class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 text-sm">
              プライバシー
            </router-link>
            <router-link to="/terms-of-service" class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 text-sm">
              利用規約
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component - no additional logic needed for now
</script>
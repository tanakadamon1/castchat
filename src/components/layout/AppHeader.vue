<template>
  <header class="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300 backdrop-blur-sm relative z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link 
            to="/" 
            class="flex items-center space-x-3 text-xl font-bold text-gray-900 dark:text-white transition-all duration-200 hover:scale-105"
          >
            <img 
              src="/favcon.png" 
              alt="Cast Chat" 
              class="w-10 h-10 object-contain"
            />
            <div class="flex flex-col">
              <span class="text-lg leading-none font-bold">castChat</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">VRChatキャスト募集</span>
            </div>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-2">
          <router-link 
            to="/posts" 
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            active-class="text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm"
            @click="handleNavClick('/posts')"
          >
            募集一覧
          </router-link>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/my-posts" 
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            active-class="text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm"
            @click="handleNavClick('/my-posts')"
          >
            マイ投稿
          </router-link>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/posts/create" 
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            active-class="text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm"
            @click="handleNavClick('/posts/create')"
          >
            募集投稿
          </router-link>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/applications" 
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            active-class="text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm"
            @click="handleNavClick('/applications')"
          >
            応募管理
          </router-link>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/coins" 
            class="relative text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
            active-class="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 shadow-sm"
            @click="handleNavClick('/coins')"
          >
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
              </svg>
              <span>コイン</span>
              <span class="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-1.5 py-0.5 rounded-full">
                {{ authStore.profile?.coin_balance ?? 0 }}
              </span>
            </div>
          </router-link>
        </nav>

        <!-- User menu -->
        <div class="flex items-center space-x-4">
          <!-- Dark Mode Toggle -->
          <DarkModeToggle :compact="true" />
          <template v-if="authStore.isAuthenticated">
            <!-- User dropdown -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <img
                  class="h-8 w-8 rounded-full"
                  :src="authStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || '/default-avatar.png'"
                  :alt="authStore.profile?.display_name || authStore.user?.user_metadata?.full_name || 'ユーザー'"
                />
                <span class="hidden md:block text-gray-700 dark:text-gray-300 transition-colors duration-200">
                  {{ authStore.profile?.display_name || authStore.user?.user_metadata?.full_name || 'ユーザー' }}
                </span>
              </button>

              <!-- Dropdown menu -->
              <div
                v-if="showUserMenu"
                @click="showUserMenu = false"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none z-[60] transition-colors duration-200"
              >
                <div class="py-1">
                  <router-link
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    @click="handleNavClick('/profile')"
                  >
                    プロフィール
                  </router-link>
                  <router-link
                    to="/my-posts"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    @click="handleNavClick('/my-posts')"
                  >
                    マイ投稿
                  </router-link>
                  <router-link
                    to="/applications"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    @click="handleNavClick('/applications')"
                  >
                    応募管理
                  </router-link>
                  <router-link
                    to="/coins"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    @click="handleNavClick('/coins')"
                  >
                    <div class="flex items-center justify-between">
                      <span>コイン購入</span>
                      <span class="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full">
                        {{ authStore.profile?.coin_balance ?? 0 }}
                      </span>
                    </div>
                  </router-link>
                  <button
                    @click="handleSignOut"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link
              to="/login"
              class="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              ログイン
            </router-link>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 p-2 transition-colors duration-200"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="showMobileMenu" class="md:hidden relative z-[60]">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <router-link
            to="/posts"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            @click="handleNavClick('/posts')"
          >
            募集一覧
          </router-link>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/my-posts"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            @click="handleNavClick('/my-posts')"
          >
            マイ投稿
          </router-link>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/posts/create"
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            @click="handleNavClick('/posts/create')"
          >
            募集投稿
          </router-link>
          
          <template v-if="!authStore.isAuthenticated">
            <router-link
              to="/login"
              class="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              @click="showMobileMenu = false"
            >
              ログイン
            </router-link>
          </template>
          
          <!-- Dark Mode Toggle in Mobile Menu -->
          <div class="px-3 py-2">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import DarkModeToggle from '@/components/ui/DarkModeToggle.vue'

const authStore = useAuthStore()
const router = useRouter()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const handleNavClick = (path?: string) => {
  // Close mobile menu if open
  showMobileMenu.value = false
  showUserMenu.value = false
}

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Sign out failed:', error)
  }
}
</script>
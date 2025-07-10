<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link 
            to="/" 
            class="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200"
          >
            <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">VR</span>
            </div>
            <span>キャスト募集</span>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-8">
          <router-link 
            to="/posts" 
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900 dark:text-indigo-300"
            @click="handleNavClick('/posts')"
          >
            募集一覧
          </router-link>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/my-posts" 
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900 dark:text-indigo-300"
            @click="handleNavClick('/my-posts')"
          >
            マイ投稿
          </router-link>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/posts/create" 
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900 dark:text-indigo-300"
            @click="handleNavClick('/posts/create')"
          >
            募集投稿
          </router-link>
          <router-link 
            to="/demo" 
            class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            active-class="text-indigo-600 bg-indigo-50 dark:bg-indigo-900 dark:text-indigo-300"
            @click="handleNavClick('/demo')"
          >
            Demo
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
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none z-50 transition-colors duration-200"
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
                      <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {{ coinBalance ?? 0 }}
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
      <div v-if="showMobileMenu" class="md:hidden">
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
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { CoinApi } from '@/lib/coinApi'
import DarkModeToggle from '@/components/ui/DarkModeToggle.vue'

const authStore = useAuthStore()
const router = useRouter()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const coinBalance = ref<number | null>(null)

// Load coin balance when authenticated
const loadCoinBalance = async () => {
  if (authStore.isAuthenticated) {
    try {
      coinBalance.value = await CoinApi.getCoinBalance()
    } catch (error) {
      console.error('Failed to load coin balance:', error)
      coinBalance.value = 0
    }
  }
}

onMounted(() => {
  loadCoinBalance()
})

// Reload balance when auth state changes
authStore.$subscribe(() => {
  if (authStore.isAuthenticated) {
    loadCoinBalance()
  } else {
    coinBalance.value = null
  }
})

const handleNavClick = (path: string) => {
  const clickId = Date.now() + Math.random()
  console.log(`[CLICK-${clickId}] Navigation link clicked: ${path}`)
  console.log(`[CLICK-${clickId}] Current route: ${router.currentRoute.value.path}`)
  console.log(`[CLICK-${clickId}] Auth state:`, {
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.loading,
    isInitializing: authStore.initializing
  })
  
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
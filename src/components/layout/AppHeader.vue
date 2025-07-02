<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link 
            to="/" 
            class="flex items-center space-x-2 text-xl font-bold text-gray-900"
          >
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">VR</span>
            </div>
            <span>キャスト募集</span>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-8">
          <router-link 
            to="/posts" 
            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-indigo-600 bg-indigo-50"
          >
            募集一覧
          </router-link>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/posts/create" 
            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-indigo-600 bg-indigo-50"
          >
            募集投稿
          </router-link>
          <router-link 
            to="/demo" 
            class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-indigo-600 bg-indigo-50"
          >
            Demo
          </router-link>
        </nav>

        <!-- User menu -->
        <div class="flex items-center space-x-4">
          <template v-if="authStore.isAuthenticated">
            <!-- User dropdown -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <img
                  class="h-8 w-8 rounded-full"
                  :src="authStore.user?.user_metadata?.avatar_url || '/default-avatar.png'"
                  :alt="authStore.user?.user_metadata?.full_name || 'ユーザー'"
                />
                <span class="hidden md:block text-gray-700">
                  {{ authStore.user?.user_metadata?.full_name || 'ユーザー' }}
                </span>
              </button>

              <!-- Dropdown menu -->
              <div
                v-if="showUserMenu"
                @click="showUserMenu = false"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              >
                <div class="py-1">
                  <router-link
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    プロフィール
                  </router-link>
                  <router-link
                    to="/applications"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    応募管理
                  </router-link>
                  <button
                    @click="handleSignOut"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              ログイン
            </router-link>
            <router-link
              to="/register"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              新規登録
            </router-link>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 p-2"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="showMobileMenu" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <router-link
            to="/posts"
            class="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            @click="showMobileMenu = false"
          >
            募集一覧
          </router-link>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/posts/create"
            class="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            @click="showMobileMenu = false"
          >
            募集投稿
          </router-link>
          
          <template v-if="!authStore.isAuthenticated">
            <router-link
              to="/login"
              class="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              @click="showMobileMenu = false"
            >
              ログイン
            </router-link>
            <router-link
              to="/register"
              class="bg-indigo-600 hover:bg-indigo-700 text-white block px-3 py-2 rounded-md text-base font-medium"
              @click="showMobileMenu = false"
            >
              新規登録
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Sign out failed:', error)
  }
}
</script>
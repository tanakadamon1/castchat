import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/PostsView.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallbackView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('../views/PostsView.vue'),
    },
    {
      path: '/posts/:id',
      name: 'post-detail',
      component: () => import('../views/PostDetailView.vue'),
    },
    {
      path: '/posts/:id/edit',
      name: 'post-edit',
      component: () => import('../views/CreatePostView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/posts/create',
      name: 'post-create',
      component: () => import('../views/CreatePostView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-posts',
      name: 'my-posts',
      component: () => import('../views/MyPostsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/applications',
      name: 'applications',
      component: () => import('../views/ApplicationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/demo',
      name: 'demo',
      component: () => import('../views/ComponentDemoView.vue'),
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import('../views/PrivacyPolicyView.vue'),
    },
    {
      path: '/terms-of-service',
      name: 'terms-of-service',
      component: () => import('../views/TermsOfServiceView.vue'),
    },
    {
      path: '/commercial-transaction',
      name: 'commercial-transaction',
      component: () => import('../views/CommercialTransactionView.vue'),
    },
  ],
})

// ナビゲーションガード
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const navigationId = Date.now() + Math.random()
  console.log(`[NAV-${navigationId}] Starting navigation from ${from.path} to ${to.path}`)

  try {
    // 認証が必要なルートかチェック
    if (to.meta.requiresAuth) {
      console.log(`[NAV-${navigationId}] Protected route detected`)
      console.log(`[NAV-${navigationId}] Auth state:`, {
        hasUser: !!authStore.user,
        isAuthenticated: authStore.isAuthenticated,
        isLoading: authStore.loading,
        isInitializing: authStore.initializing
      })

      // 認証ストアが初期化中の場合は短時間だけ待機
      if (authStore.initializing) {
        console.log(`[NAV-${navigationId}] Auth store is initializing, waiting briefly...`)
        await new Promise(resolve => setTimeout(resolve, 500)) // 500msだけ待機
      }

      // 認証ストアが初期化されていない場合は初期化
      if (!authStore.user && !authStore.loading && !authStore.initializing) {
        console.log(`[NAV-${navigationId}] Initializing auth store for protected route`)
        await authStore.initialize()
        console.log(`[NAV-${navigationId}] Auth initialization completed`)
      }

      // 初期化後も認証されていない場合はログインページにリダイレクト
      if (!authStore.isAuthenticated) {
        console.log(`[NAV-${navigationId}] User not authenticated, redirecting to login`)
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
      }

      console.log(`[NAV-${navigationId}] User authenticated, proceeding to protected route`)
    }

    // 既にログインしている場合はログインページからリダイレクト
    if (to.name === 'login' && authStore.isAuthenticated) {
      console.log(`[NAV-${navigationId}] User already authenticated, redirecting to home`)
      next({ name: 'home' })
      return
    }

    console.log(`[NAV-${navigationId}] Navigation allowed to: ${to.path}`)
    next()
  } catch (error) {
    console.error(`[NAV-${navigationId}] Navigation guard error:`, error)
    console.error(`[NAV-${navigationId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    // エラーが発生した場合は通常のナビゲーションを許可
    console.log(`[NAV-${navigationId}] Allowing navigation despite error`)
    next()
  }
})

export default router

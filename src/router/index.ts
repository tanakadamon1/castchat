import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // ブラウザの戻る/進むボタンを使用した場合は、前回のスクロール位置を復元
    if (savedPosition) {
      return savedPosition
    }
    // ハッシュ（#section など）がある場合は、その要素にスクロール
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    // それ以外の場合は、ページの最上部にスクロール
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/PostsView.vue'),
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
      path: '/coins',
      name: 'coin-history',
      component: () => import('../views/CoinHistoryView.vue'),
      meta: { requiresAuth: true },
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
    {
      path: '/users/:id',
      name: 'user-profile',
      redirect: to => {
        // ユーザープロファイルページは現在プロファイルページにリダイレクト
        return { name: 'profile' }
      },
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// ナビゲーションガード
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const navigationId = Date.now() + Math.random()
  
  // Router navigation guard
  
  // ApplicationsViewへのナビゲーション
  if (to.path === '/applications') {
    // 特別なチェックは不要
  }

  try {
    // 認証が必要なルートかチェック
    if (to.meta.requiresAuth) {
      // 認証ストアが初期化中の場合は短時間だけ待機
      if (authStore.initializing) {
        await new Promise(resolve => setTimeout(resolve, 500)) // 500msだけ待機
      }

      // 認証ストアが初期化されていない場合は初期化
      if (!authStore.user && !authStore.loading && !authStore.initializing) {
        await authStore.initialize()
      }

      // 初期化後も認証されていない場合はログインページにリダイレクト
      if (!authStore.isAuthenticated) {
        // User not authenticated, redirecting to login
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
      }
    }

    // 既にログインしている場合はログインページからリダイレクト
    if (to.name === 'login' && authStore.isAuthenticated) {
      // User already authenticated, redirecting from login
      next({ name: 'home' })
      return
    }

    // Navigation allowed, calling next()
    next()
  } catch (error) {
    console.error(`[NAV-${navigationId}] Navigation guard error:`, error)
    console.error(`[NAV-${navigationId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    // エラーが発生した場合は通常のナビゲーションを許可
    next()
  }
})

export default router

# VRChatキャスト募集掲示板 デザインハンドオフ資料

## 概要

このドキュメントは、デザインチームからフロントエンド開発チームへのデザインハンドオフ資料です。実装に必要な詳細仕様、アセット、ガイドラインをまとめています。

## デザイン成果物一覧

### 1. 基盤設計
- ✅ **ユーザーペルソナ** (`design/user-personas.md`)
- ✅ **サイトマップ** (`design/sitemap.md`)
- ✅ **ワイヤーフレーム** (`design/wireframes.md`, `design/wireframes-additional.md`)

### 2. デザインシステム
- ✅ **デザインシステム** (`design/design-system.md`)
  - カラーパレット
  - タイポグラフィ
  - コンポーネントライブラリ
  - スペーシング・グリッドシステム

### 3. UIデザイン仕様
- ✅ **デスクトップ版** (`design/ui-design-desktop.md`)
- ✅ **モバイル版** (`design/ui-design-mobile.md`)
- ✅ **追加画面** (`design/ui-design-additional-screens.md`)

## 実装優先順位

### Phase 1: 必須画面（MVP）
1. **ログイン・会員登録画面** - `LoginView.vue`, `RegisterView.vue`
2. **募集一覧画面** - `PostsView.vue`
3. **募集詳細画面** - `PostDetailView.vue`
4. **募集投稿・編集画面** - `CreatePostView.vue`
5. **プロフィール画面** - `ProfileView.vue`

### Phase 2: 拡張機能画面
6. **応募管理画面** - `ApplicationsView.vue`
7. **応募履歴画面** - `ApplicationHistoryView.vue`
8. **通知画面** - `NotificationsView.vue`
9. **お気に入り画面** - `FavoritesView.vue`
10. **設定画面** - `SettingsView.vue`
11. **ヘルプ・FAQ画面** - `HelpView.vue`
12. **404エラー画面** - `ErrorView.vue`

## デザインシステム実装ガイド

### カラーパレット（CSS Variables）
```css
:root {
  /* Primary Colors */
  --color-primary: #3B82F6;
  --color-primary-light: #60A5FA;
  --color-primary-dark: #1D4ED8;
  
  /* Secondary Colors */
  --color-secondary: #A855F7;
  --color-secondary-light: #C084FC;
  --color-secondary-dark: #7C3AED;
  
  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #06B6D4;
  
  /* Neutral Colors */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;
  
  /* Background Colors */
  --color-background: #FFFFFF;
  --color-background-alt: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F3F4F6;
}
```

### タイポグラフィ（Tailwind Classes）
```css
/* 見出し */
.heading-1 { @apply text-4xl font-bold leading-tight text-gray-900; }
.heading-2 { @apply text-3xl font-bold leading-tight text-gray-900; }
.heading-3 { @apply text-2xl font-semibold leading-tight text-gray-900; }
.heading-4 { @apply text-xl font-semibold leading-snug text-gray-900; }
.heading-5 { @apply text-lg font-medium leading-snug text-gray-900; }
.heading-6 { @apply text-base font-medium leading-normal text-gray-900; }

/* 本文 */
.body-large { @apply text-lg leading-relaxed text-gray-700; }
.body-medium { @apply text-base leading-relaxed text-gray-700; }
.body-small { @apply text-sm leading-relaxed text-gray-600; }

/* キャプション */
.caption { @apply text-xs leading-normal text-gray-500; }
```

### コンポーネント実装ガイド

#### BaseButton
```vue
<!-- 実装例 -->
<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const disabled = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${disabled}`
})
</script>
```

#### BaseInput
```vue
<!-- 実装例 -->
<template>
  <div class="space-y-1">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="inputClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id?: string
  type?: string
  label?: string
  modelValue?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClasses = computed(() => {
  const base = 'block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors'
  const normal = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  const error = 'border-red-300 focus:border-red-500 focus:ring-red-500'
  const disabled = 'bg-gray-50 text-gray-500 cursor-not-allowed'
  
  return `${base} ${props.error ? error : normal} ${props.disabled ? disabled : ''}`
})
</script>
```

## レスポンシブ実装ガイド

### ブレイクポイント戦略
```css
/* モバイルファースト */
/* 320px-639px: モバイル小 */
/* 640px-767px: モバイル大 */
/* 768px-1023px: タブレット */
/* 1024px以上: デスクトップ */

/* Tailwind CSS classes */
.responsive-grid {
  @apply grid grid-cols-1 gap-4;
  @apply sm:grid-cols-2 sm:gap-6;
  @apply md:grid-cols-3;
  @apply lg:grid-cols-4 lg:gap-8;
}
```

### 重要な実装ポイント

#### 1. タッチターゲットサイズ
```css
/* モバイルでのタッチターゲットは最小44px */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}
```

#### 2. セーフエリア対応
```css
/* iOS SafeAreaに対応 */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

#### 3. フォーカス管理
```css
/* キーボードナビゲーション対応 */
.focus-visible {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}
```

## アクセシビリティ要件

### 必須実装項目
1. **セマンティックHTML**
   - 適切な見出し階層（h1, h2, h3...）
   - ランドマーク要素（main, nav, aside, footer）
   - フォームラベル関連付け

2. **キーボードナビゲーション**
   - Tab順序の最適化
   - フォーカスの可視化
   - Escapeキーでモーダル閉じる

3. **スクリーンリーダー対応**
   - alt属性の適切な設定
   - aria-label, aria-describedby の活用
   - 状態変化の通知（aria-live）

4. **カラーコントラスト**
   - WCAG 2.1 AA準拠（4.5:1以上）
   - カラーのみに依存しない情報伝達

### 実装例
```vue
<!-- アクセシブルなボタン -->
<button
  :aria-label="isLiked ? 'お気に入りから削除' : 'お気に入りに追加'"
  :aria-pressed="isLiked"
  @click="toggleLike"
>
  <HeartIcon :filled="isLiked" />
  <span class="sr-only">{{ isLiked ? '削除' : '追加' }}</span>
</button>

<!-- アクセシブルなフォーム -->
<div>
  <label for="email" class="block text-sm font-medium">
    メールアドレス
    <span class="text-red-500">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-describedby="email-error"
    :aria-invalid="hasError"
  />
  <div id="email-error" role="alert" v-if="error">
    {{ error }}
  </div>
</div>
```

## アニメーション・インタラクション仕様

### 基本トランジション
```css
/* 標準的なトランジション */
.transition-default {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-slow {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-fast {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### ホバーエフェクト
```css
/* カードのホバーエフェクト */
.card-hover {
  @apply transform transition-transform duration-200;
}

.card-hover:hover {
  @apply -translate-y-1 shadow-lg;
}

/* ボタンのホバーエフェクト */
.button-hover:hover {
  @apply scale-105 shadow-md;
}
```

### ローディング状態
```vue
<!-- ローディングスピナー -->
<template>
  <div class="flex items-center justify-center p-4">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span class="ml-2 text-gray-600">{{ message }}</span>
  </div>
</template>
```

## アセット・画像ガイド

### 画像仕様
- **アバター画像**: 正方形、最小256x256px、最大1024x1024px
- **ロゴ**: SVG形式推奨、複数サイズ対応
- **アイコン**: 24x24px, 32x32px, 48x48pxのSVG
- **OGP画像**: 1200x630px

### アイコンライブラリ
推奨: Heroicons（MIT License）
```bash
npm install @heroicons/vue
```

使用例:
```vue
<script setup>
import { HeartIcon, UserIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <HeartIcon class="w-5 h-5 text-red-500" />
  <UserIcon class="w-6 h-6 text-gray-600" />
</template>
```

## パフォーマンス考慮事項

### 画像最適化
```vue
<!-- レスポンシブ画像 -->
<picture>
  <source 
    media="(max-width: 768px)" 
    srcset="/images/mobile-hero.webp"
    type="image/webp"
  />
  <source 
    srcset="/images/desktop-hero.webp"
    type="image/webp"
  />
  <img 
    src="/images/desktop-hero.jpg" 
    alt="VRChatキャスト募集掲示板"
    loading="lazy"
  />
</picture>
```

### コンポーネント遅延読み込み
```typescript
// router/index.ts
const routes = [
  {
    path: '/profile',
    component: () => import('@/views/ProfileView.vue')
  }
]
```

## 実装チェックリスト

### デザインシステム
- [ ] CSS変数の設定
- [ ] Tailwind CSS設定ファイル
- [ ] 基本コンポーネント実装
- [ ] タイポグラフィクラス定義

### レスポンシブ対応
- [ ] モバイルファーストCSS
- [ ] ブレイクポイント対応
- [ ] タッチターゲットサイズ
- [ ] セーフエリア対応

### アクセシビリティ
- [ ] セマンティックHTML
- [ ] キーボードナビゲーション
- [ ] フォーカス管理
- [ ] スクリーンリーダー対応
- [ ] カラーコントラスト確認

### パフォーマンス
- [ ] 画像最適化
- [ ] 遅延読み込み
- [ ] バンドルサイズ最適化
- [ ] キャッシュ戦略

## 今後の拡張予定

### Phase 2 機能
- ダークモード対応
- アニメーション強化
- カスタムテーマ機能
- PWA対応

### デザインシステム進化
- より詳細なコンポーネントバリエーション
- アニメーションライブラリ統合
- デザイントークン管理
- Storybook導入

---

## 連絡・質問について

実装中に質問や不明点がある場合は、以下の方法で連絡してください：

1. **GitHub Issues**: 技術的な質問・バグ報告
2. **Discord/Slack**: リアルタイムでの相談
3. **定期会議**: 週次レビューでの詳細確認

デザインの意図や詳細仕様について、適宜コミュニケーションを取りながら進めてください。
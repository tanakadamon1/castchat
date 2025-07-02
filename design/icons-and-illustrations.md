# アイコン・イラスト素材仕様書

## 素材概要

VRChatキャスト募集掲示板で使用するアイコン・イラスト素材の仕様と実装ガイドです。一貫性のあるビジュアル言語と、ユーザーの理解を助ける分かりやすい表現を重視しています。

## アイコンシステム

### 基本仕様
- **スタイル**: Outline style（線幅2px）
- **サイズ**: 16px, 20px, 24px, 32px, 48px
- **カラー**: 単色（CSS variablesで制御）
- **形状**: 丸角処理（radius: 2px）

### アイコンライブラリ
**基本ライブラリ**: Heroicons v2（MIT License）  
**カスタムアイコン**: VRChat特有の機能用

### 1. ナビゲーションアイコン

#### 1.1 メインナビゲーション
```svg
<!-- ホーム -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
</svg>

<!-- 募集一覧 -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
</svg>

<!-- 投稿作成 -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 4v16m8-8H4"/>
</svg>

<!-- プロフィール -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
</svg>
```

#### 1.2 アクションアイコン
```svg
<!-- お気に入り（空） -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
</svg>

<!-- お気に入り（塗り） -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="2">
  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
</svg>

<!-- シェア -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
</svg>

<!-- 編集 -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
</svg>

<!-- 削除 -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
</svg>
```

### 2. ステータスアイコン

#### 2.1 応募ステータス
```svg
<!-- 承認待ち -->
<svg width="20" height="20" viewBox="0 0 20 20" fill="#F59E0B">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
</svg>

<!-- 承認済み -->
<svg width="20" height="20" viewBox="0 0 20 20" fill="#10B981">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
</svg>

<!-- 拒否 -->
<svg width="20" height="20" viewBox="0 0 20 20" fill="#EF4444">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
</svg>
```

#### 2.2 投稿ステータス
```svg
<!-- 募集中 -->
<svg width="16" height="16" viewBox="0 0 16 16" fill="#10B981">
  <circle cx="8" cy="8" r="8"/>
</svg>

<!-- 募集終了 -->
<svg width="16" height="16" viewBox="0 0 16 16" fill="#6B7280">
  <circle cx="8" cy="8" r="8"/>
</svg>

<!-- 下書き -->
<svg width="16" height="16" viewBox="0 0 16 16" fill="#F59E0B">
  <circle cx="8" cy="8" r="8"/>
</svg>
```

### 3. カテゴリアイコン

#### 3.1 募集カテゴリ
```svg
<!-- 声優 -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2Z"/>
  <path d="M19 7V17C19 17.6 19.4 18 20 18S21 17.6 21 17V7C21 6.4 20.6 6 20 6S19 6.4 19 7Z"/>
  <path d="M6 17V19C6 21.2 7.8 23 10 23H14C16.2 23 18 21.2 18 19V17"/>
  <path d="M12 23V28"/>
  <path d="M8 28H16"/>
</svg>

<!-- モデル -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4Z"/>
  <path d="M16 14C20.4 14 24 17.6 24 22V26C24 27.1 23.1 28 22 28H10C8.9 28 8 27.1 8 26V22C8 17.6 11.6 14 16 14Z"/>
  <path d="M20 16L22 14"/>
  <path d="M12 16L10 14"/>
</svg>

<!-- ダンス -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M16 6C17.1 6 18 6.9 18 8C18 9.1 17.1 10 16 10C14.9 10 14 9.1 14 8C14 6.9 14.9 6 16 6Z"/>
  <path d="M14 12L18 16L20 14L18 18L22 22"/>
  <path d="M18 16L14 20L10 18L12 22L8 26"/>
  <path d="M20 22L22 26"/>
  <path d="M12 22L10 26"/>
</svg>

<!-- 配信 -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M22 8H10C8.9 8 8 8.9 8 10V22C8 23.1 8.9 24 10 24H22C23.1 24 24 23.1 24 22V10C24 8.9 23.1 8 22 8Z"/>
  <path d="M14 14L18 16L14 18V14Z"/>
  <path d="M26 12V20"/>
  <path d="M6 12V20"/>
</svg>
```

### 4. VRChat専用アイコン

#### 4.1 VRChatワールド関連
```svg
<!-- VRChatワールド -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945"/>
  <path d="M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064"/>
  <path d="M15 20.488V18a2 2 0 012-2h3.064"/>
  <circle cx="12" cy="12" r="10"/>
</svg>

<!-- アバター -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
  <path d="M12 14v7"/>
  <path d="M16 18h4"/>
  <path d="M8 18H4"/>
</svg>
```

## イラスト素材

### 1. 空状態イラスト

#### 1.1 募集なし状態
```svg
<!-- 募集がない状態のイラスト -->
<svg width="200" height="160" viewBox="0 0 200 160" fill="none">
  <!-- 背景の波 -->
  <path d="M0 120 Q50 100 100 120 T200 120 V160 H0 Z" fill="#F3F4F6" opacity="0.5"/>
  
  <!-- メインキャラクター（シンプルなVRアバター風） -->
  <circle cx="100" cy="60" r="25" fill="#E5E7EB"/>
  <circle cx="92" cy="55" r="3" fill="#6B7280"/>
  <circle cx="108" cy="55" r="3" fill="#6B7280"/>
  <path d="M95 65 Q100 70 105 65" stroke="#6B7280" stroke-width="2" fill="none"/>
  
  <!-- 体 -->
  <rect x="85" y="85" width="30" height="40" rx="15" fill="#E5E7EB"/>
  
  <!-- 腕 -->
  <circle cx="75" cy="95" r="8" fill="#E5E7EB"/>
  <circle cx="125" cy="95" r="8" fill="#E5E7EB"/>
  
  <!-- 疑問符 -->
  <circle cx="130" cy="40" r="20" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="2"/>
  <text x="130" y="48" text-anchor="middle" font-size="16" fill="#6B7280">?</text>
  
  <!-- 装飾要素 -->
  <circle cx="50" cy="30" r="3" fill="#E5E7EB" opacity="0.6"/>
  <circle cx="160" cy="25" r="2" fill="#E5E7EB" opacity="0.6"/>
  <circle cx="40" cy="140" r="4" fill="#E5E7EB" opacity="0.4"/>
</svg>
```

#### 1.2 応募なし状態
```svg
<!-- 応募がない状態のイラスト -->
<svg width="200" height="160" viewBox="0 0 200 160" fill="none">
  <!-- 背景 -->
  <rect x="60" y="40" width="80" height="60" rx="8" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="2"/>
  
  <!-- 書類のライン -->
  <line x1="70" y1="55" x2="130" y2="55" stroke="#D1D5DB" stroke-width="2"/>
  <line x1="70" y1="65" x2="120" y2="65" stroke="#D1D5DB" stroke-width="2"/>
  <line x1="70" y1="75" x2="125" y2="75" stroke="#D1D5DB" stroke-width="2"/>
  <line x1="70" y1="85" x2="110" y2="85" stroke="#D1D5DB" stroke-width="2"/>
  
  <!-- メールボックス -->
  <path d="M40 110 H160 V140 Q160 145 155 145 H45 Q40 145 40 140 Z" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="2"/>
  <path d="M40 110 L100 125 L160 110" stroke="#D1D5DB" stroke-width="2" fill="none"/>
  
  <!-- 空の状態を表す装飾 -->
  <circle cx="170" cy="50" r="15" fill="#F3F4F6" opacity="0.8"/>
  <path d="M165 45 L175 55 M175 45 L165 55" stroke="#9CA3AF" stroke-width="2"/>
</svg>
```

#### 1.3 通知なし状態
```svg
<!-- 通知がない状態のイラスト -->
<svg width="200" height="160" viewBox="0 0 200 160" fill="none">
  <!-- ベル -->
  <path d="M100 30 C85 30 80 45 80 55 C80 65 75 70 75 80 H125 C125 70 120 65 120 55 C120 45 115 30 100 30 Z" fill="#E5E7EB"/>
  <path d="M95 80 C95 85 97.5 87.5 100 87.5 C102.5 87.5 105 85 105 80" fill="#E5E7EB"/>
  
  <!-- ベルの装飾ライン -->
  <path d="M85 55 Q100 50 115 55" stroke="#D1D5DB" stroke-width="1" fill="none"/>
  
  <!-- 静寂を表す波線 -->
  <path d="M130 40 Q135 35 140 40 Q145 45 150 40" stroke="#D1D5DB" stroke-width="2" fill="none" opacity="0.5"/>
  <path d="M130 50 Q135 45 140 50 Q145 55 150 50" stroke="#D1D5DB" stroke-width="2" fill="none" opacity="0.3"/>
  
  <!-- 平和な雲 -->
  <ellipse cx="50" cy="45" rx="15" ry="8" fill="#F3F4F6" opacity="0.6"/>
  <ellipse cx="45" cy="50" rx="12" ry="6" fill="#F3F4F6" opacity="0.4"/>
</svg>
```

### 2. ローディング状態イラスト

#### 2.1 VRアバターローディング
```svg
<!-- VRアバター読み込み中 -->
<svg width="120" height="120" viewBox="0 0 120 120" fill="none">
  <!-- 回転するリング -->
  <circle cx="60" cy="60" r="40" stroke="#E5E7EB" stroke-width="6" fill="none"/>
  <circle cx="60" cy="60" r="40" stroke="#3B82F6" stroke-width="6" fill="none" 
          stroke-dasharray="60 200" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" 
                      values="0 60 60;360 60 60" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  
  <!-- 中央のアバターシルエット -->
  <circle cx="60" cy="45" r="12" fill="#D1D5DB" opacity="0.6"/>
  <rect x="50" y="57" width="20" height="25" rx="10" fill="#D1D5DB" opacity="0.6"/>
  
  <!-- 点滅するドット -->
  <circle cx="30" cy="30" r="3" fill="#3B82F6" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="90" cy="30" r="3" fill="#3B82F6" opacity="0.6">
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1s" begin="0.2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="90" cy="90" r="3" fill="#3B82F6" opacity="0.4">
    <animate attributeName="opacity" values="0.4;0.2;0.4" dur="1s" begin="0.4s" repeatCount="indefinite"/>
  </circle>
</svg>
```

### 3. エラー状態イラスト

#### 3.1 404エラー
```svg
<!-- 404エラーページ用イラスト -->
<svg width="300" height="200" viewBox="0 0 300 200" fill="none">
  <!-- 背景の山 -->
  <path d="M0 150 L50 100 L100 130 L150 80 L200 110 L250 70 L300 100 V200 H0 Z" fill="#F3F4F6"/>
  
  <!-- 404の数字（大きく） -->
  <text x="150" y="80" text-anchor="middle" font-size="48" font-weight="bold" fill="#D1D5DB">404</text>
  
  <!-- 迷子のアバター -->
  <circle cx="80" cy="130" r="15" fill="#E5E7EB"/>
  <circle cx="75" cy="125" r="2" fill="#6B7280"/>
  <circle cx="85" cy="125" r="2" fill="#6B7280"/>
  <path d="M78 135 Q80 138 82 135" stroke="#6B7280" stroke-width="1" fill="none"/>
  <rect x="70" y="145" width="20" height="25" rx="10" fill="#E5E7EB"/>
  
  <!-- 困惑を表す記号 -->
  <path d="M100 110 Q105 105 110 110 Q105 115 100 110" stroke="#9CA3AF" stroke-width="2" fill="none"/>
  <circle cx="105" cy="120" r="1" fill="#9CA3AF"/>
  
  <!-- 道標（間違った方向） -->
  <rect x="200" y="120" width="4" height="40" fill="#6B7280"/>
  <path d="M190 125 L204 125 L200 120 L190 125" fill="#6B7280"/>
  <path d="M210 135 L204 135 L208 130 L210 135" fill="#6B7280"/>
</svg>
```

## 実装ガイドライン

### 1. アイコンコンポーネント化

#### Vue.js実装例
```vue
<!-- BaseIcon.vue -->
<template>
  <svg
    :width="size"
    :height="size"
    :class="iconClasses"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="stroke"
    :stroke-width="strokeWidth"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number | string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  stroke?: string
  strokeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  variant: 'default',
  stroke: 'currentColor',
  strokeWidth: 2
})

const iconClasses = computed(() => {
  const variants = {
    default: 'text-gray-600',
    primary: 'text-blue-600',
    secondary: 'text-purple-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }
  
  return variants[props.variant]
})
</script>
```

#### 使用例
```vue
<template>
  <!-- ホームアイコン -->
  <BaseIcon variant="primary">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </BaseIcon>
  
  <!-- ステータスアイコン -->
  <BaseIcon :size="20" variant="success">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
  </BaseIcon>
</template>
```

### 2. イラストコンポーネント化

#### 空状態イラスト
```vue
<!-- EmptyStateIllustration.vue -->
<template>
  <div class="empty-state-illustration">
    <svg :width="width" :height="height" viewBox="0 0 200 160" fill="none">
      <slot />
    </svg>
    
    <div class="empty-state-content">
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-message">{{ message }}</p>
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  message: string
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 200,
  height: 160
})
</script>

<style scoped>
.empty-state-illustration {
  text-align: center;
  padding: 40px 20px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 16px 0 8px 0;
}

.empty-state-message {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 20px 0;
}
</style>
```

### 3. アクセシビリティ対応

#### アイコンのアクセシビリティ
```vue
<!-- 装飾的アイコン -->
<BaseIcon aria-hidden="true">
  <path d="..."/>
</BaseIcon>

<!-- 意味のあるアイコン -->
<BaseIcon :aria-label="iconLabel" role="img">
  <path d="..."/>
</BaseIcon>

<!-- ボタン内のアイコン -->
<button :aria-label="buttonLabel">
  <BaseIcon aria-hidden="true">
    <path d="..."/>
  </BaseIcon>
  <span class="sr-only">{{ buttonLabel }}</span>
</button>
```

### 4. パフォーマンス最適化

#### SVGスプライト利用
```vue
<!-- アイコンスプライト -->
<svg style="display: none;">
  <defs>
    <symbol id="icon-home" viewBox="0 0 24 24">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </symbol>
  </defs>
</svg>

<!-- アイコン使用 -->
<svg class="icon">
  <use href="#icon-home" />
</svg>
```

## ファイル構成

```
/src/assets/
├── icons/
│   ├── navigation/
│   │   ├── home.svg
│   │   ├── posts.svg
│   │   └── profile.svg
│   ├── actions/
│   │   ├── heart.svg
│   │   ├── share.svg
│   │   └── edit.svg
│   ├── status/
│   │   ├── approved.svg
│   │   ├── pending.svg
│   │   └── rejected.svg
│   └── categories/
│       ├── voice-actor.svg
│       ├── model.svg
│       └── dance.svg
├── illustrations/
│   ├── empty-states/
│   │   ├── no-posts.svg
│   │   ├── no-applications.svg
│   │   └── no-notifications.svg
│   ├── loading/
│   │   └── avatar-loading.svg
│   └── errors/
│       └── 404.svg
└── sprites/
    └── icons-sprite.svg
```

このアイコン・イラスト素材により、ユーザーが直感的に操作でき、VRChatコミュニティに親しみやすいビジュアル体験を提供できます。
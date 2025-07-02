# VRChatキャスト募集掲示板 タイポグラフィ定義

## タイポグラフィ概要

VRChatキャスト募集掲示板のタイポグラフィシステムは、可読性と美観を両立し、
日本語と英語の混在環境で最適な表示を実現します。

## フォントファミリー

### プライマリフォント（Sans-serif）
```
font-family: 'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif, 
             'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
```

**選択理由:**
- **Inter**: 高い可読性、豊富なウェイト、デジタル環境に最適化
- **Noto Sans JP**: 日本語に特化、美しいかな・漢字、Googleフォント
- システムフォント: フォールバック、パフォーマンス向上

### セカンダリフォント（Monospace）
```
font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 
             'Roboto Mono', 'Source Code Pro', monospace;
```

**使用用途:**
- コード表示、ユーザーID、技術的な内容
- 数値データ、統計情報

## タイプスケール

### 基本設定
```
Base Font Size: 16px (1rem)
Base Line Height: 1.5 (24px)
Scale Ratio: 1.250 (Major Third)
```

### フォントサイズ定義

#### Display Scale (特大見出し)
```
Display Large:   48px (3rem)    | Line Height: 1.1 (52.8px) | Letter Spacing: -0.02em
Display Medium:  40px (2.5rem)  | Line Height: 1.1 (44px)   | Letter Spacing: -0.01em
Display Small:   36px (2.25rem) | Line Height: 1.2 (43.2px) | Letter Spacing: -0.01em
```

#### Headline Scale (見出し)
```
Headline Large:  32px (2rem)    | Line Height: 1.25 (40px)  | Letter Spacing: 0
Headline Medium: 28px (1.75rem) | Line Height: 1.3 (36.4px) | Letter Spacing: 0
Headline Small:  24px (1.5rem)  | Line Height: 1.33 (32px)  | Letter Spacing: 0
```

#### Title Scale (タイトル)
```
Title Large:     22px (1.375rem) | Line Height: 1.36 (30px) | Letter Spacing: 0
Title Medium:    20px (1.25rem)  | Line Height: 1.4 (28px)  | Letter Spacing: 0
Title Small:     18px (1.125rem) | Line Height: 1.44 (26px) | Letter Spacing: 0
```

#### Body Scale (本文)
```
Body Large:      18px (1.125rem) | Line Height: 1.56 (28px) | Letter Spacing: 0
Body Medium:     16px (1rem)     | Line Height: 1.5 (24px)  | Letter Spacing: 0
Body Small:      14px (0.875rem) | Line Height: 1.43 (20px) | Letter Spacing: 0
```

#### Label Scale (ラベル)
```
Label Large:     16px (1rem)     | Line Height: 1.5 (24px)  | Letter Spacing: 0.01em
Label Medium:    14px (0.875rem) | Line Height: 1.43 (20px) | Letter Spacing: 0.01em
Label Small:     12px (0.75rem)  | Line Height: 1.33 (16px) | Letter Spacing: 0.02em
```

## フォントウェイト

### ウェイト定義
```
Thin:         100
ExtraLight:   200
Light:        300
Regular:      400 ← Base Weight
Medium:       500
SemiBold:     600
Bold:         700
ExtraBold:    800
Black:        900
```

### 使用ガイドライン
```
・Regular (400): 一般的な本文、説明文
・Medium (500): 重要な情報、ナビゲーション
・SemiBold (600): 小見出し、強調テキスト
・Bold (700): 見出し、CTAボタン
・ExtraBold (800): 特別な強調、ブランド要素
```

## タイポグラフィクラス定義

### Display Classes
```css
.display-large {
  font-size: 3rem;          /* 48px */
  line-height: 1.1;         /* 52.8px */
  font-weight: 700;         /* Bold */
  letter-spacing: -0.02em;
}

.display-medium {
  font-size: 2.5rem;        /* 40px */
  line-height: 1.1;         /* 44px */
  font-weight: 700;         /* Bold */
  letter-spacing: -0.01em;
}

.display-small {
  font-size: 2.25rem;       /* 36px */
  line-height: 1.2;         /* 43.2px */
  font-weight: 700;         /* Bold */
  letter-spacing: -0.01em;
}
```

### Headline Classes
```css
.headline-large {
  font-size: 2rem;          /* 32px */
  line-height: 1.25;        /* 40px */
  font-weight: 600;         /* SemiBold */
  letter-spacing: 0;
}

.headline-medium {
  font-size: 1.75rem;       /* 28px */
  line-height: 1.3;         /* 36.4px */
  font-weight: 600;         /* SemiBold */
  letter-spacing: 0;
}

.headline-small {
  font-size: 1.5rem;        /* 24px */
  line-height: 1.33;        /* 32px */
  font-weight: 600;         /* SemiBold */
  letter-spacing: 0;
}
```

### Title Classes
```css
.title-large {
  font-size: 1.375rem;      /* 22px */
  line-height: 1.36;        /* 30px */
  font-weight: 600;         /* SemiBold */
  letter-spacing: 0;
}

.title-medium {
  font-size: 1.25rem;       /* 20px */
  line-height: 1.4;         /* 28px */
  font-weight: 500;         /* Medium */
  letter-spacing: 0;
}

.title-small {
  font-size: 1.125rem;      /* 18px */
  line-height: 1.44;        /* 26px */
  font-weight: 500;         /* Medium */
  letter-spacing: 0;
}
```

### Body Classes
```css
.body-large {
  font-size: 1.125rem;      /* 18px */
  line-height: 1.56;        /* 28px */
  font-weight: 400;         /* Regular */
  letter-spacing: 0;
}

.body-medium {
  font-size: 1rem;          /* 16px */
  line-height: 1.5;         /* 24px */
  font-weight: 400;         /* Regular */
  letter-spacing: 0;
}

.body-small {
  font-size: 0.875rem;      /* 14px */
  line-height: 1.43;        /* 20px */
  font-weight: 400;         /* Regular */
  letter-spacing: 0;
}
```

### Label Classes
```css
.label-large {
  font-size: 1rem;          /* 16px */
  line-height: 1.5;         /* 24px */
  font-weight: 500;         /* Medium */
  letter-spacing: 0.01em;
}

.label-medium {
  font-size: 0.875rem;      /* 14px */
  line-height: 1.43;        /* 20px */
  font-weight: 500;         /* Medium */
  letter-spacing: 0.01em;
}

.label-small {
  font-size: 0.75rem;       /* 12px */
  line-height: 1.33;        /* 16px */
  font-weight: 500;         /* Medium */
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
```

## セマンティック用途別タイポグラフィ

### ページ構造
```css
/* メインページタイトル */
.page-title {
  @apply headline-large;
  color: var(--color-gray-900);
  margin-bottom: 1.5rem;
}

/* セクションタイトル */
.section-title {
  @apply headline-medium;
  color: var(--color-gray-900);
  margin-bottom: 1rem;
}

/* サブセクションタイトル */
.subsection-title {
  @apply title-large;
  color: var(--color-gray-800);
  margin-bottom: 0.75rem;
}
```

### ナビゲーション
```css
/* メインナビゲーション */
.nav-link {
  @apply label-medium;
  color: var(--color-gray-700);
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--color-primary-600);
}

.nav-link.active {
  color: var(--color-primary-600);
  font-weight: 600;
}
```

### コンテンツ
```css
/* カードタイトル */
.card-title {
  @apply title-medium;
  color: var(--color-gray-900);
  margin-bottom: 0.5rem;
}

/* カード説明文 */
.card-description {
  @apply body-small;
  color: var(--color-gray-600);
  margin-bottom: 1rem;
}

/* メタ情報 */
.meta-text {
  @apply label-small;
  color: var(--color-gray-500);
}
```

### フォーム
```css
/* フォームラベル */
.form-label {
  @apply label-medium;
  color: var(--color-gray-700);
  margin-bottom: 0.25rem;
  display: block;
}

/* 必須マーク */
.form-required {
  color: var(--color-error-500);
  margin-left: 0.25rem;
}

/* ヘルプテキスト */
.form-help {
  @apply body-small;
  color: var(--color-gray-500);
  margin-top: 0.25rem;
}

/* エラーメッセージ */
.form-error {
  @apply body-small;
  color: var(--color-error-600);
  margin-top: 0.25rem;
}
```

### ボタン
```css
/* プライマリボタン */
.btn-primary {
  @apply label-medium;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* セカンダリボタン */
.btn-secondary {
  @apply label-medium;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* テキストボタン */
.btn-text {
  @apply label-medium;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

## レスポンシブタイポグラフィ

### ブレークポイント別調整

#### Mobile (< 768px)
```css
@media (max-width: 767px) {
  .display-large {
    font-size: 2.5rem;       /* 40px */
    line-height: 1.1;
  }
  
  .display-medium {
    font-size: 2.25rem;      /* 36px */
    line-height: 1.1;
  }
  
  .headline-large {
    font-size: 1.75rem;      /* 28px */
    line-height: 1.3;
  }
  
  .headline-medium {
    font-size: 1.5rem;       /* 24px */
    line-height: 1.33;
  }
}
```

#### Tablet (768px - 1023px)
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .display-large {
    font-size: 2.75rem;      /* 44px */
    line-height: 1.1;
  }
}
```

## 日本語タイポグラフィ特別考慮

### 日本語フォント設定
```css
.jp-text {
  font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
  font-feature-settings: 'palt' 1; /* プロポーショナル文字詰め */
  line-height: 1.7; /* 日本語に最適化された行間 */
}

.jp-heading {
  font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
  font-feature-settings: 'palt' 1;
  line-height: 1.4; /* 見出し用行間 */
  letter-spacing: 0.05em; /* 可読性向上のための文字間隔 */
}
```

### 縦書き対応（将来用）
```css
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-feature-settings: 'vpal' 1;
}
```

## アクセシビリティ配慮

### 最小フォントサイズ
```
・最小読み取り可能サイズ: 14px
・推奨最小サイズ: 16px
・ボタン内テキスト最小: 16px
```

### コントラスト比
```
・通常テキスト: 4.5:1 以上
・大きなテキスト (18px+): 3:1 以上
・ボタンテキスト: 4.5:1 以上
```

### dyslexia対応
```css
.dyslexia-friendly {
  font-family: 'OpenDyslexic', 'Arial', sans-serif;
  letter-spacing: 0.12em;
  word-spacing: 0.16em;
  line-height: 1.8;
}
```

## CSS Variables定義

```css
:root {
  /* Font Families */
  --font-family-primary: 'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'SF Mono', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.375rem;    /* 22px */
  --text-3xl: 1.5rem;      /* 24px */
  --text-4xl: 1.75rem;     /* 28px */
  --text-5xl: 2rem;        /* 32px */
  --text-6xl: 2.25rem;     /* 36px */
  --text-7xl: 2.5rem;      /* 40px */
  --text-8xl: 3rem;        /* 48px */
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Font Weights */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
  
  /* Letter Spacing */
  --tracking-tighter: -0.02em;
  --tracking-tight: -0.01em;
  --tracking-normal: 0;
  --tracking-wide: 0.01em;
  --tracking-wider: 0.02em;
  --tracking-widest: 0.1em;
}
```

## 実装例

### HTML構造例
```html
<!-- ページタイトル -->
<h1 class="display-medium">VRChatキャスト募集</h1>

<!-- セクションタイトル -->
<h2 class="headline-large">最新の募集</h2>

<!-- カードタイトル -->
<h3 class="title-medium">音楽ライブイベント司会者募集</h3>

<!-- 本文 -->
<p class="body-medium">VRChatで開催される音楽ライブイベントの司会者を募集しています。</p>

<!-- メタ情報 -->
<span class="label-small">投稿日: 2024/01/15</span>
```

### Tailwind CSS設定例
```javascript
module.exports = {
  theme: {
    fontFamily: {
      'sans': ['Inter', 'Noto Sans JP', 'sans-serif'],
      'mono': ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1.33' }],
      'sm': ['0.875rem', { lineHeight: '1.43' }],
      'base': ['1rem', { lineHeight: '1.5' }],
      'lg': ['1.125rem', { lineHeight: '1.56' }],
      'xl': ['1.25rem', { lineHeight: '1.4' }],
      '2xl': ['1.375rem', { lineHeight: '1.36' }],
      '3xl': ['1.5rem', { lineHeight: '1.33' }],
      '4xl': ['1.75rem', { lineHeight: '1.3' }],
      '5xl': ['2rem', { lineHeight: '1.25' }],
      '6xl': ['2.25rem', { lineHeight: '1.2' }],
      '7xl': ['2.5rem', { lineHeight: '1.1' }],
      '8xl': ['3rem', { lineHeight: '1.1' }],
    },
    fontWeight: {
      'thin': '100',
      'light': '300',
      'normal': '400',
      'medium': '500',
      'semibold': '600',
      'bold': '700',
      'extrabold': '800',
      'black': '900',
    }
  }
}
```
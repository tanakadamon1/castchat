# VRChatキャスト募集掲示板 デザインシステム

## デザインシステム概要

### ブランドアイデンティティ
- **ミッション**: VRChatコミュニティのキャスト募集を効率化し、信頼できるマッチングを提供する
- **ビジョン**: VRChatクリエイター同士を繋ぐ、安心・安全なプラットフォーム
- **価値観**: 信頼性、効率性、コミュニティ重視、創造性

### デザイン原則

#### 1. 信頼性（Trustworthy）
- 明確で一貫した情報表示
- ユーザーの実績と評価の透明性
- セキュリティを意識したUIデザイン

#### 2. 効率性（Efficient）
- 直感的なナビゲーション
- 素早い情報アクセス
- シンプルなフォームデザイン

#### 3. 親しみやすさ（Approachable）
- VRChatコミュニティに馴染むデザイン
- 温かみのあるカラーパレット
- フレンドリーなトーン

#### 4. 包括性（Inclusive）
- アクセシビリティ対応
- 多様なデバイスでの利用
- 異なるスキルレベルのユーザーに対応

## カラーシステム

### プライマリーカラー
```
・Primary Blue: #3B82F6
  - 用途: メインCTA、重要なリンク、アクティブ状態
  - RGB: (59, 130, 246)
  - HSB: (217°, 76%, 96%)

・Primary Blue Light: #60A5FA
  - 用途: ホバー状態、セカンダリアクション

・Primary Blue Dark: #1D4ED8
  - 用途: プレス状態、強調表示
```

### セカンダリーカラー
```
・Purple: #8B5CF6
  - 用途: 特別な機能、プレミアム要素
  - VRChatらしい幻想的な印象

・Teal: #14B8A6
  - 用途: 成功状態、ポジティブなアクション
  - 信頼性を表現
```

### システムカラー
```
・Success: #10B981 (緑)
  - 成功メッセージ、完了状態

・Warning: #F59E0B (オレンジ)
  - 注意喚起、警告メッセージ

・Error: #EF4444 (赤)
  - エラーメッセージ、削除アクション

・Info: #3B82F6 (青)
  - 情報メッセージ、ヒント
```

### ニュートラルカラー
```
・Gray 900: #111827 (ダークテキスト)
・Gray 700: #374151 (セカンダリテキスト)
・Gray 500: #6B7280 (プレースホルダー)
・Gray 300: #D1D5DB (ボーダー)
・Gray 100: #F3F4F6 (背景)
・Gray 50: #F9FAFB (薄い背景)
・White: #FFFFFF (メイン背景)
```

## タイポグラフィ

### フォントファミリー
```
・Primary: 'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif
・Monospace: 'JetBrains Mono', 'SFMono-Regular', monospace
```

### フォントサイズスケール
```
・Text XS: 12px / Line Height: 16px
・Text SM: 14px / Line Height: 20px
・Text Base: 16px / Line Height: 24px (基準サイズ)
・Text LG: 18px / Line Height: 28px
・Text XL: 20px / Line Height: 28px
・Text 2XL: 24px / Line Height: 32px
・Text 3XL: 30px / Line Height: 36px
・Text 4XL: 36px / Line Height: 40px
```

### 見出しシステム
```
・H1: Text 4XL, Font Weight 700 (Bold)
  - ページタイトル、メインヘッダー

・H2: Text 3XL, Font Weight 600 (SemiBold)
  - セクションタイトル

・H3: Text 2XL, Font Weight 600 (SemiBold)
  - サブセクションタイトル

・H4: Text XL, Font Weight 600 (SemiBold)
  - カードタイトル、小見出し

・H5: Text LG, Font Weight 600 (SemiBold)
  - フォームラベル、項目名

・H6: Text Base, Font Weight 600 (SemiBold)
  - 細かい分類、タグ
```

### 本文テキスト
```
・Body Large: Text LG, Font Weight 400 (Regular)
  - 重要な説明文

・Body: Text Base, Font Weight 400 (Regular)
  - 一般的な本文

・Body Small: Text SM, Font Weight 400 (Regular)
  - 補足説明、メタ情報

・Caption: Text XS, Font Weight 400 (Regular)
  - キャプション、注釈
```

## スペーシングシステム

### 基本単位
```
・Base Unit: 4px
・Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
```

### 使用ガイドライン
```
・4px (1): 細かい調整
・8px (2): 関連要素間の間隔
・12px (3): フォーム内要素間
・16px (4): セクション内要素間
・24px (6): セクション間の間隔
・32px (8): 大きなセクション間
・48px (12): ページ内の大きな区切り
・64px (16): メジャーセクション間
```

## コンポーネントライブラリ

### ボタン

#### プライマリボタン
```
・背景色: Primary Blue (#3B82F6)
・テキスト色: White
・パディング: 12px 24px
・ボーダー半径: 8px
・フォント: Text Base, Font Weight 600
・ホバー: Primary Blue Light (#60A5FA)
・フォーカス: 2px outline Primary Blue
```

#### セカンダリボタン
```
・背景色: White
・テキスト色: Primary Blue
・ボーダー: 1px solid Primary Blue
・パディング: 12px 24px
・ボーダー半径: 8px
・ホバー: Gray 50 背景
```

#### テキストボタン
```
・背景色: Transparent
・テキスト色: Primary Blue
・パディング: 8px 16px
・ホバー: Gray 100 背景
```

### フォーム要素

#### インプットフィールド
```
・ボーダー: 1px solid Gray 300
・背景色: White
・パディング: 12px 16px
・ボーダー半径: 8px
・フォーカス: 2px outline Primary Blue
・エラー: ボーダー色 Error Red
```

#### セレクトボックス
```
・同上 + ドロップダウンアイコン
・オプション: White背景, Gray 900テキスト
・ホバー: Gray 50背景
```

### カード

#### 基本カード
```
・背景色: White
・ボーダー: 1px solid Gray 200
・ボーダー半径: 12px
・パディング: 24px
・シャドウ: 0 1px 3px rgba(0,0,0,0.1)
```

#### 募集カード
```
・同上 + 
・ヘッダー画像エリア
・アクションボタンエリア
・メタ情報（日時、報酬等）
・ホバー効果: シャドウ強化
```

### ナビゲーション

#### メインナビゲーション
```
・背景色: White
・ボーダー下: 1px solid Gray 200
・高さ: 64px
・ロゴ + メニュー項目 + ユーザーメニュー
```

#### フッター
```
・背景色: Gray 900
・テキスト色: Gray 300
・パディング: 48px 0
・リンク色: Gray 400
・リンクホバー: White
```

## レイアウトシステム

### グリッドシステム
```
・コンテナ最大幅: 1200px
・ガター: 24px
・ブレークポイント:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
```

### レスポンシブ原則
```
・モバイルファースト設計
・12カラムグリッド（デスクトップ）
・6カラムグリッド（タブレット）
・2カラムグリッド（モバイル）
```

## アイコンシステム

### アイコンライブラリ
```
・使用ライブラリ: Heroicons
・サイズ: 16px, 20px, 24px, 32px
・ストローク幅: 1.5px
・色: 親要素のテキスト色を継承
```

### 主要アイコン
```
・検索: MagnifyingGlassIcon
・ユーザー: UserIcon
・設定: CogIcon
・通知: BellIcon
・お気に入り: HeartIcon
・シェア: ShareIcon
・編集: PencilIcon
・削除: TrashIcon
```

## アニメーション・インタラクション

### トランジション
```
・Duration: 200ms (高速), 300ms (標準), 500ms (ゆっくり)
・Easing: ease-in-out (標準), ease-out (登場), ease-in (退場)
```

### ホバー効果
```
・ボタン: 色変化 + 軽微なスケール
・カード: シャドウ強化 + 軽微な上昇
・リンク: アンダーライン表示
```

### フォーカス状態
```
・全インタラクティブ要素にフォーカスリング
・色: Primary Blue
・幅: 2px
・スタイル: solid outline
```

## 実装ガイドライン

### CSS Variables
```css
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-primary-light: #60A5FA;
  --color-primary-dark: #1D4ED8;
  
  /* Typography */
  --font-size-base: 16px;
  --line-height-base: 1.5;
  
  /* Spacing */
  --spacing-unit: 4px;
  --spacing-xs: calc(var(--spacing-unit) * 1);
  --spacing-sm: calc(var(--spacing-unit) * 2);
  --spacing-md: calc(var(--spacing-unit) * 4);
  --spacing-lg: calc(var(--spacing-unit) * 6);
  --spacing-xl: calc(var(--spacing-unit) * 8);
}
```

### Tailwind CSS設定
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  }
}
```
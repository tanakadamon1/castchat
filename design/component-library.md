# VRChatキャスト募集掲示板 コンポーネントライブラリ設計

## コンポーネントライブラリ概要

このコンポーネントライブラリは、VRChatキャスト募集掲示板で使用する再利用可能なUIコンポーネントの設計仕様を定義します。各コンポーネントは、確立されたデザインシステムに基づいて統一性を保ちながら、柔軟性と拡張性を持たせています。

## 基本コンポーネント

### 1. Button（ボタン）

#### 1.1 Primary Button
```
用途: メインアクション、CTAボタン
サイズ: Large (48px), Medium (40px), Small (32px)
状態: Default, Hover, Active, Disabled, Loading

基本スタイル:
- 背景色: Primary Blue 500
- テキスト色: White
- パディング: 12px 24px (Medium)
- ボーダー半径: 8px
- フォント: Label Medium, Font Weight 600
- トランジション: 200ms ease

状態変化:
- Hover: 背景色 → Primary Blue 400
- Active: 背景色 → Primary Blue 600
- Disabled: 背景色 → Gray 300, テキスト色 → Gray 500
- Loading: スピナー表示 + Disabled状態
```

#### 1.2 Secondary Button
```
用途: セカンダリアクション、キャンセルボタン
基本スタイル:
- 背景色: White
- テキスト色: Primary Blue 500
- ボーダー: 1px solid Primary Blue 500
- その他: Primary Buttonと同様

状態変化:
- Hover: 背景色 → Primary Blue 50
- Active: 背景色 → Primary Blue 100
```

#### 1.3 Danger Button
```
用途: 削除、危険なアクション
基本スタイル:
- 背景色: Error 500
- テキスト色: White
- その他: Primary Buttonと同様

状態変化:
- Hover: 背景色 → Error 400
- Active: 背景色 → Error 600
```

#### 1.4 Text Button
```
用途: 軽いアクション、リンク
基本スタイル:
- 背景色: Transparent
- テキスト色: Primary Blue 500
- パディング: 8px 16px
- text-decoration: underline (hover時)
```

### 2. Input（入力フィールド）

#### 2.1 Text Input
```
用途: テキスト入力
サイズ: Large (48px), Medium (40px), Small (32px)
状態: Default, Focus, Error, Disabled

基本スタイル:
- ボーダー: 1px solid Gray 300
- 背景色: White
- パディング: 12px 16px (Medium)
- ボーダー半径: 8px
- フォント: Body Medium

状態変化:
- Focus: ボーダー色 → Primary Blue 500, Outline: 2px Primary Blue
- Error: ボーダー色 → Error 500
- Disabled: 背景色 → Gray 100, テキスト色 → Gray 400
```

#### 2.2 Textarea
```
用途: 長文入力
基本スタイル: Text Inputと同様
最小高さ: 96px
リサイズ: vertical
```

#### 2.3 Select
```
用途: 選択肢から選択
基本スタイル: Text Inputと同様
アイコン: ChevronDownIcon (右側)
```

#### 2.4 Checkbox
```
用途: 複数選択
サイズ: 20px × 20px
基本スタイル:
- ボーダー: 2px solid Gray 300
- ボーダー半径: 4px
- チェック色: Primary Blue 500
```

#### 2.5 Radio Button
```
用途: 単一選択
サイズ: 20px × 20px
基本スタイル:
- ボーダー: 2px solid Gray 300
- ボーダー半径: 50%
- 選択色: Primary Blue 500
```

### 3. Card（カード）

#### 3.1 Basic Card
```
用途: 基本的なコンテンツ表示
基本スタイル:
- 背景色: White
- ボーダー: 1px solid Gray 200
- ボーダー半径: 12px
- パディング: 24px
- シャドウ: 0 1px 3px rgba(0,0,0,0.1)
```

#### 3.2 Job Card（募集カード）
```
用途: 募集一覧での募集表示
構成要素:
- ヘッダー画像 (16:9 比率)
- タイトル (Title Medium)
- メタ情報 (カテゴリ、報酬、日時)
- 主催者情報
- アクションボタン (お気に入り、詳細)

レスポンシブ:
- Desktop: 3カラムグリッド
- Tablet: 2カラムグリッド
- Mobile: 1カラムグリッド
```

#### 3.3 Profile Card（プロフィールカード）
```
用途: ユーザープロフィール表示
構成要素:
- アバター画像 (64px)
- ユーザー名
- 評価 (星評価)
- スキルタグ
- 実績統計
```

### 4. Navigation（ナビゲーション）

#### 4.1 Header Navigation
```
構成要素:
- ロゴ (左端)
- メインナビゲーション (中央)
- 検索バー
- ユーザーメニュー (右端)

レスポンシブ:
- Desktop: 全要素表示
- Tablet: 検索バーを別行に配置
- Mobile: ハンバーガーメニュー
```

#### 4.2 Breadcrumb
```
用途: 現在位置の表示
スタイル:
- セパレーター: ChevronRightIcon
- アクティブページ: Bold
- リンク色: Primary Blue 500
```

#### 4.3 Pagination
```
用途: ページ分割ナビゲーション
構成要素:
- 前へ/次へボタン
- ページ番号
- 省略表示 (...)
- 総ページ数表示
```

#### 4.4 Tab Navigation
```
用途: タブ切り替え
スタイル:
- アクティブタブ: ボーダー下線 Primary Blue 500
- 非アクティブタブ: Gray 600
- ホバー: Gray 800
```

### 5. Feedback（フィードバック）

#### 5.1 Alert
```
種類: Success, Warning, Error, Info
構成要素:
- アイコン (左端)
- メッセージテキスト
- 閉じるボタン (右端)

Success:
- 背景色: Success 50
- ボーダー: Success 200
- アイコン色: Success 500

Warning:
- 背景色: Warning 50
- ボーダー: Warning 200
- アイコン色: Warning 500

Error:
- 背景色: Error 50
- ボーダー: Error 200
- アイコン色: Error 500

Info:
- 背景色: Primary 50
- ボーダー: Primary 200
- アイコン色: Primary 500
```

#### 5.2 Toast
```
用途: 一時的な通知
配置: 画面右上、固定位置
自動消去: 4秒後
スタイル: Alertと同様のカラーシステム
アニメーション: スライドイン/フェードアウト
```

#### 5.3 Loading Spinner
```
サイズ: Small (16px), Medium (24px), Large (32px)
色: Primary Blue 500
アニメーション: 360度回転、1秒間隔
```

#### 5.4 Progress Bar
```
用途: プロセス進行表示
高さ: 8px
背景色: Gray 200
進行色: Primary Blue 500
ボーダー半径: 4px
```

### 6. Data Display（データ表示）

#### 6.1 Avatar
```
サイズ: XS (24px), SM (32px), MD (48px), LG (64px), XL (96px)
形状: 円形
フォールバック: ユーザー名の頭文字
ボーダー: オプション（重要なユーザーに使用）
```

#### 6.2 Badge
```
用途: ステータス、カテゴリ表示
サイズ: Small, Medium
形状: 角丸（pill shape）

Success:
- 背景色: Success 100
- テキスト色: Success 700

Warning:
- 背景色: Warning 100
- テキスト色: Warning 700

Error:
- 背景色: Error 100
- テキスト色: Error 700

Info:
- 背景色: Primary 100
- テキスト色: Primary 700
```

#### 6.3 Rating（星評価）
```
サイズ: Small (16px), Medium (20px), Large (24px)
満点: 5星
表示: 塗りつぶし星 + 空星
色: Warning 400 (星色)
数値表示: オプション
```

#### 6.4 Tag
```
用途: スキル、カテゴリタグ
基本スタイル:
- 背景色: Gray 100
- テキスト色: Gray 700
- パディング: 4px 8px
- ボーダー半径: 6px
- フォント: Label Small

選択状態:
- 背景色: Primary 100
- テキスト色: Primary 700
```

### 7. Layout（レイアウト）

#### 7.1 Container
```
最大幅: 1200px
中央寄せ: margin 0 auto
パディング: 0 24px (Desktop), 0 16px (Mobile)
```

#### 7.2 Grid System
```
カラム数: 12 (Desktop), 6 (Tablet), 2 (Mobile)
ガター: 24px
レスポンシブブレークポイント:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
```

#### 7.3 Stack
```
用途: 垂直方向の要素配置
間隔: 8px, 16px, 24px, 32px, 48px
```

### 8. Modal & Overlay（モーダル・オーバーレイ）

#### 8.1 Modal
```
背景オーバーレイ: rgba(0,0,0,0.5)
モーダル背景: White
最大幅: 600px (Large), 400px (Medium), 320px (Small)
ボーダー半径: 12px
パディング: 24px
シャドウ: 0 20px 25px rgba(0,0,0,0.1)

構成要素:
- ヘッダー (タイトル + 閉じるボタン)
- ボディ (コンテンツ)
- フッター (アクションボタン)
```

#### 8.2 Dropdown
```
用途: メニュー、オプション表示
背景: White
ボーダー: 1px solid Gray 200
ボーダー半径: 8px
シャドウ: 0 4px 6px rgba(0,0,0,0.1)
アニメーション: フェードイン
```

#### 8.3 Tooltip
```
用途: 補足説明
背景: Gray 900
テキスト色: White
パディング: 8px 12px
ボーダー半径: 6px
フォント: Body Small
アニメーション: フェードイン
矢印: CSS triangle
```

## 特殊コンポーネント

### 9. Job Specific Components（募集特化コンポーネント）

#### 9.1 Job Filter Panel
```
用途: 募集検索・フィルター
構成要素:
- カテゴリ選択
- 日時範囲
- 報酬範囲
- 場所選択
- キーワード検索
- フィルター結果数表示
```

#### 9.2 Application Status
```
用途: 応募ステータス表示
ステータス:
- 応募中: Primary Blue
- 選考中: Warning Orange
- 採用: Success Green
- 不採用: Error Red
- 取り下げ: Gray
```

#### 9.3 Skill Tags
```
用途: スキル表示・選択
カテゴリ別色分け:
- 司会・MC: Purple 100
- 技術系: Teal 100
- 創作系: Pink 100
- サポート系: Blue 100
```

### 10. Form Components（フォーム特化）

#### 10.1 Form Field
```
構成要素:
- ラベル (必須マーク含む)
- 入力フィールド
- ヘルプテキスト
- エラーメッセージ
- 文字数カウンター (オプション)
```

#### 10.2 File Upload
```
用途: 画像アップロード
表示: ドラッグ&ドロップエリア
プレビュー: サムネイル表示
制限表示: ファイルサイズ、形式
プログレス: アップロード進行表示
```

#### 10.3 Rich Text Editor
```
用途: 募集詳細入力
機能: 基本的なフォーマット (Bold, Italic, Link)
プレビュー: リアルタイム表示
文字数制限: 表示・警告
```

## アクセシビリティ仕様

### キーボードナビゲーション
- Tab順序の適切な設定
- Enter/Spaceキーでのアクション実行
- Escキーでのモーダル・ドロップダウン閉じる

### スクリーンリーダー対応
- aria-label の適切な設定
- role属性の使用
- ライブリージョンでの動的コンテンツ通知

### フォーカス管理
- 視覚的フォーカスインジケーター
- フォーカストラップ（モーダル内）
- 適切なフォーカス移動

### カラーアクセシビリティ
- 最小コントラスト比 4.5:1 以上
- 色のみに依存しない情報伝達
- カラーブラインド対応

## 実装ガイドライン

### Vue.js コンポーネント構造
```javascript
// 基本コンポーネント構造
export default {
  name: 'ComponentName',
  props: {
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click', 'change'],
  computed: {
    classes() {
      return [
        'component-base',
        `component--${this.size}`,
        `component--${this.variant}`,
        { 'component--disabled': this.disabled }
      ]
    }
  }
}
```

### CSS クラス命名規則
```css
/* BEM記法を使用 */
.component {} /* Block */
.component__element {} /* Element */
.component--modifier {} /* Modifier */
.component__element--modifier {} /* Element + Modifier */

/* 例 */
.button {}
.button__icon {}
.button--primary {}
.button--large {}
.button__icon--left {}
```

### Tailwind CSS カスタマイズ
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // コンポーネント用のカスタムクラス
      components: {
        '.btn': {
          '@apply px-4 py-2 rounded-lg font-medium transition-colors duration-200': {},
        },
        '.btn-primary': {
          '@apply bg-primary-500 text-white hover:bg-primary-400': {},
        },
        '.card': {
          '@apply bg-white border border-gray-200 rounded-xl p-6 shadow-sm': {},
        }
      }
    }
  }
}
```

このコンポーネントライブラリ設計により、一貫性のあるUIを効率的に構築し、開発者間での実装統一を図ることができます。
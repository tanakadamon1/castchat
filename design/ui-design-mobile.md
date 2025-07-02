# VRChatキャスト募集掲示板 UIデザイン詳細仕様（モバイル版）

## モバイルUIデザイン概要

モバイル版（768px未満）では、限られた画面幅での最適な表示とタッチ操作に重点を置いたデザインを採用します。スクロール中心のレイアウトと、指で操作しやすいUIサイズを基準とします。

## 画面別モバイルUIデザイン詳細

### 1. ログイン・会員登録画面（モバイル）

#### レイアウト構成
```
┌─────────────────────────────────┐
│           Header (56px)         │
├─────────────────────────────────┤
│                                 │
│         Hero Section            │
│           (280px)               │
│                                 │
│    [CastChat Logo - 120px]      │
│    VRChatキャスト募集           │
│    掲示板                       │
│    安心・簡単・効率的           │
│                                 │
├─────────────────────────────────┤
│                                 │
│      Login Card (Full)          │
│                                 │
│  [Google Logo] Googleでログイン  │
│                                 │
│  ──────── または ────────        │
│                                 │
│  メールアドレス                 │
│  [_________________________]   │
│                                 │
│  パスワード                     │
│  [_________________________]   │
│                                 │
│       [ログイン]                │
│                                 │
│  パスワードを忘れた方はこちら   │
│                                 │
│  アカウントをお持ちでない方     │
│       [新規会員登録]            │
│                                 │
└─────────────────────────────────┘
```

#### モバイル専用スタイル
```css
/* モバイルヘッダー */
.mobile-header {
  height: 56px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.mobile-logo {
  font-size: 20px;
  font-weight: 700;
  color: #3B82F6;
}

/* モバイルHeroセクション */
.mobile-hero {
  background: linear-gradient(135deg, #3B82F6 0%, #A855F7 100%);
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.mobile-hero-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
}

.mobile-hero-subtitle {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 4px;
}

.mobile-hero-description {
  font-size: 14px;
  opacity: 0.8;
}

/* モバイルLoginカード */
.mobile-login-card {
  background: white;
  padding: 24px 20px;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}

.mobile-google-btn {
  width: 100%;
  padding: 18px 24px;
  font-size: 16px;
  border-radius: 12px;
  min-height: 56px; /* タッチ最適化 */
  margin-bottom: 24px;
}

.mobile-form-input {
  width: 100%;
  padding: 18px 16px;
  font-size: 16px; /* iOS zoomを防ぐ */
  border-radius: 12px;
  min-height: 56px;
  box-sizing: border-box;
}

.mobile-primary-button {
  width: 100%;
  padding: 18px 24px;
  font-size: 16px;
  min-height: 56px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.mobile-link {
  font-size: 14px;
  text-align: center;
  display: block;
  padding: 12px;
  margin: 8px 0;
}
```

### 2. 募集一覧画面（モバイル）

#### レイアウト構成
```
┌─────────────────────────────────┐
│        Mobile Header            │
│  [☰] CastChat        [Profile]  │
├─────────────────────────────────┤
│                                 │
│        Search Section           │
│                                 │
│  [Search Input_______________🔍] │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌───┐  │
│  │カテ │ │報酬 │ │日程 │ │⚙️│  │
│  │ゴリ │ │    │ │    │ │  │  │
│  └─────┘ └─────┘ └─────┘ └───┘  │
│                                 │
├─────────────────────────────────┤
│                                 │
│  123件の募集     [List][Grid]   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐ │
│  │        Card 1               │ │
│  │  [Image]                    │ │
│  │  タイトル              [♡] │ │
│  │  カテゴリ・報酬             │ │
│  │  日時・場所                 │ │
│  │  主催者 ★4.8               │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │        Card 2               │ │
│  │  [Image]                    │ │
│  │  タイトル              [♡] │ │
│  │  カテゴリ・報酬             │ │
│  │  日時・場所                 │ │
│  │  主催者 ★4.9               │ │
│  └─────────────────────────────┘ │
│                                 │
│         [Load More]             │
│                                 │
├─────────────────────────────────┤
│        Bottom Navigation        │
│  [🏠] [📋] [➕] [💬] [👤]      │
└─────────────────────────────────┘
```

#### モバイル専用スタイル
```css
/* モバイルナビゲーション */
.mobile-nav {
  height: 56px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.mobile-nav-menu {
  width: 24px;
  height: 24px;
  color: #374151;
  cursor: pointer;
}

.mobile-nav-logo {
  font-size: 18px;
  font-weight: 700;
  color: #3B82F6;
}

.mobile-nav-profile {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E5E7EB;
}

/* モバイル検索セクション */
.mobile-search-section {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.mobile-search-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  margin-bottom: 16px;
  background: #F9FAFB;
}

.mobile-filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mobile-filter-chips::-webkit-scrollbar {
  display: none;
}

.mobile-filter-chip {
  flex-shrink: 0;
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.mobile-filter-chip.active {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

/* モバイル募集カード */
.mobile-job-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  margin: 0 16px 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.mobile-job-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mobile-job-card-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  position: relative;
}

.mobile-job-card-favorite {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mobile-job-card-content {
  padding: 16px;
}

.mobile-job-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mobile-job-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.mobile-job-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.mobile-job-card-info {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.4;
  margin-bottom: 12px;
}

.mobile-job-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #F3F4F6;
  padding-top: 12px;
}

.mobile-job-author {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.mobile-job-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E5E7EB;
  flex-shrink: 0;
}

.mobile-job-author-info {
  flex: 1;
  min-width: 0;
}

.mobile-job-author-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-job-author-rating {
  font-size: 12px;
  color: #6B7280;
}

.mobile-job-stats {
  font-size: 11px;
  color: #6B7280;
  text-align: right;
  flex-shrink: 0;
}

/* ボトムナビゲーション */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 48px;
}

.mobile-bottom-nav-icon {
  width: 24px;
  height: 24px;
  color: #9CA3AF;
}

.mobile-bottom-nav-item.active .mobile-bottom-nav-icon {
  color: #3B82F6;
}

.mobile-bottom-nav-label {
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 500;
}

.mobile-bottom-nav-item.active .mobile-bottom-nav-label {
  color: #3B82F6;
}

.mobile-bottom-nav-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: #EF4444;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 3. 募集詳細画面（モバイル）

#### レイアウト構成
```
┌─────────────────────────────────┐
│        Mobile Header            │
│  [←] 詳細              [⋮]     │
├─────────────────────────────────┤
│                                 │
│      Hero Image                 │
│        (375×200)                │
│                                 │
├─────────────────────────────────┤
│                                 │
│  [♡] [Share] [Report]           │
│                                 │
│  # 音楽ライブイベント            │
│    司会者募集                   │
│                                 │
│  ┌─────────────────────────────┐ │
│  │      基本情報               │ │
│  │                             │ │
│  │ 📅 2024/03/15 20:00-22:00   │ │
│  │ 📍 VRChat Spring Garden     │ │
│  │ 💰 1,000円/人               │ │
│  │ 👥 8名募集                  │ │
│  │ ⏰ 締切: 2024/03/10         │ │
│  └─────────────────────────────┘ │
│                                 │
│  ## 募集内容                   │
│  VRChatで音楽ライブイベント...   │
│                                 │
│  ## 応募条件                   │
│  ・VRChat利用歴1年以上...       │
│                                 │
│  ## その他・注意事項            │
│  詳細は応募後にお伝えします...  │
│                                 │
│  ┌─────────────────────────────┐ │
│  │      主催者情報             │ │
│  │                             │ │
│  │  [Avatar] @eventmaster      │ │
│  │          ★4.8 (124件)      │ │
│  │          50回のイベント開催 │ │
│  │                             │ │
│  │  [プロフィールを見る]       │ │
│  └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│          Fixed Bottom           │
│                                 │
│        [応募する]               │
│      1,000円/人 8名募集         │
└─────────────────────────────────┘
```

#### モバイル詳細画面スタイル
```css
/* モバイル詳細ヘッダー */
.mobile-detail-header {
  height: 56px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.mobile-back-btn {
  width: 24px;
  height: 24px;
  color: #374151;
  cursor: pointer;
}

.mobile-detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  flex: 1;
  text-align: center;
  margin: 0 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-detail-menu {
  width: 24px;
  height: 24px;
  color: #374151;
  cursor: pointer;
}

/* モバイル詳細コンテンツ */
.mobile-detail-content {
  padding-bottom: 120px; /* Fixed bottomのためのスペース */
}

.mobile-detail-hero {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  object-fit: cover;
}

.mobile-detail-body {
  padding: 16px;
}

.mobile-detail-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.mobile-detail-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.mobile-detail-main-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  margin-bottom: 20px;
}

.mobile-basic-info-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.mobile-basic-info-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.mobile-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.mobile-info-icon {
  width: 16px;
  height: 16px;
  color: #6B7280;
  flex-shrink: 0;
}

.mobile-section {
  margin-bottom: 24px;
}

.mobile-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.mobile-section-content {
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
}

.mobile-organizer-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.mobile-organizer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mobile-organizer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #E5E7EB;
}

.mobile-organizer-info {
  flex: 1;
  min-width: 0;
}

.mobile-organizer-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-organizer-rating {
  font-size: 13px;
  color: #6B7280;
  margin-top: 2px;
}

.mobile-organizer-stats {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 12px;
}

.mobile-organizer-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

/* Fixed底部应用按钮 */
.mobile-apply-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #E5E7EB;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 50;
}

.mobile-apply-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.mobile-apply-price {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.mobile-apply-count {
  font-size: 14px;
  color: #6B7280;
}

.mobile-apply-btn {
  width: 100%;
  background: #3B82F6;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  min-height: 56px;
}

.mobile-apply-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.mobile-apply-btn:not(:disabled):active {
  background: #2563EB;
  transform: scale(0.98);
}
```

### 4. 募集投稿・編集画面（モバイル）

#### レイアウト構成
```
┌─────────────────────────────────┐
│        Mobile Header            │
│  [×] 新規投稿           [保存]  │
├─────────────────────────────────┤
│                                 │
│  ## 基本情報                   │
│                                 │
│  募集タイトル *                 │
│  [________________________]   │
│                                 │
│  カテゴリ *                     │
│  [ライブイベント ▼]            │
│                                 │
│  開催日時 *                     │
│  [____/____/____]              │
│  [__:__] ～ [__:__]            │
│                                 │
│  募集人数 *                     │
│  [___]名                       │
│                                 │
│  報酬                          │
│  ○無償 ○有償                  │
│  [_______]円                   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  ## 詳細情報                   │
│                                 │
│  募集内容 *                     │
│  [Rich Text Editor]             │
│                                 │
│  応募条件                       │
│  [Text Area]                   │
│                                 │
│  その他・注意事項               │
│  [Text Area]                   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  ## 画像                       │
│                                 │
│  [+ 画像をアップロード]         │
│                                 │
│  [Thumbnail 1] [Thumbnail 2]    │
│                                 │
├─────────────────────────────────┤
│        Fixed Bottom             │
│                                 │
│   [下書き保存]  [プレビュー]    │
│          [公開する]             │
└─────────────────────────────────┘
```

#### モバイルフォームスタイル
```css
/* モバイルフォームヘッダー */
.mobile-form-header {
  height: 56px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.mobile-form-close {
  width: 24px;
  height: 24px;
  color: #374151;
  cursor: pointer;
}

.mobile-form-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.mobile-form-save {
  color: #3B82F6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* モバイルフォームコンテンツ */
.mobile-form-content {
  padding: 16px;
  padding-bottom: 120px;
}

.mobile-form-section {
  margin-bottom: 32px;
}

.mobile-form-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.mobile-form-group {
  margin-bottom: 20px;
}

.mobile-form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  display: block;
}

.mobile-form-input,
.mobile-form-textarea,
.mobile-form-select {
  width: 100%;
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.mobile-form-input:focus,
.mobile-form-textarea:focus,
.mobile-form-select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.mobile-form-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

.mobile-datetime-group {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: end;
}

.mobile-datetime-separator {
  font-size: 14px;
  color: #6B7280;
  text-align: center;
  padding-bottom: 16px;
}

.mobile-radio-group {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.mobile-radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-radio-input {
  width: 20px;
  height: 20px;
  accent-color: #3B82F6;
}

.mobile-rich-editor {
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.mobile-editor-toolbar {
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  padding: 8px 12px;
  display: flex;
  gap: 4px;
  overflow-x: auto;
}

.mobile-editor-btn {
  padding: 8px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-editor-content {
  padding: 16px;
  min-height: 120px;
  font-size: 15px;
  line-height: 1.5;
}

.mobile-image-upload {
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
}

.mobile-image-upload:active {
  border-color: #3B82F6;
  background: #F8FAFF;
}

.mobile-upload-icon {
  width: 40px;
  height: 40px;
  color: #9CA3AF;
  margin: 0 auto 12px;
}

.mobile-upload-text {
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.mobile-upload-help {
  font-size: 12px;
  color: #6B7280;
}

.mobile-thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.mobile-thumbnail {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #F3F4F6;
  position: relative;
}

.mobile-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-thumbnail-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* モバイルフォーム底部操作 */
.mobile-form-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #E5E7EB;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 50;
}

.mobile-form-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.mobile-form-secondary-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
}

.mobile-form-primary-btn {
  width: 100%;
  background: #3B82F6;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  min-height: 56px;
}

.mobile-form-primary-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}
```

### 5. プロフィール画面（モバイル）

#### レイアウト構成
```
┌─────────────────────────────────┐
│        Mobile Header            │
│  [←] プロフィール       [⚙️]   │
├─────────────────────────────────┤
│                                 │
│      Profile Header             │
│                                 │
│     [Large Avatar - 80px]       │
│     @username                   │
│     VRChatキャスト・司会業      │
│     ★★★★★ 4.8 (85件)         │
│                                 │
│   [Edit] [Message] [Follow]     │
│                                 │
├─────────────────────────────────┤
│                                 │
│      Stats Cards                │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌───┐ │
│  │127  │ │23   │ │85   │ │78%│ │
│  │参加 │ │主催 │ │評価 │ │率 │ │
│  └─────┘ └─────┘ └─────┘ └───┘ │
│                                 │
├─────────────────────────────────┤
│                                 │
│        Profile Tabs             │
│                                 │
│ [概要] [実績] [レビュー] [投稿] │
│                                 │
│ ## 基本情報                    │
│ ・VRChat歴: 3年                │
│ ・主な活動時間: 平日夜・週末   │
│ ・得意分野: ライブイベント司会 │
│                                │
│ ## スキル・経験                │
│ ☑ 司会・MC   ☑ イベント進行   │
│ ☑ 撮影会     ☑ VTuberコラボ    │
│                                │
│ ## プロフィール                │
│ VRChatでライブイベントの...    │
│                                │
│ ## 最近のレビュー              │
│ ★★★★★ "とても丁寧で..."     │
│ ★★★★★ "司会が上手で..."     │
│                                │
└─────────────────────────────────┘
```

#### モバイルプロフィールスタイル
```css
/* モバイルプロフィールヘッダー */
.mobile-profile-header {
  background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
  padding: 24px 16px;
  text-align: center;
  border-bottom: 1px solid #E5E7EB;
}

.mobile-profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #E5E7EB;
  margin: 0 auto 16px;
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mobile-profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.mobile-profile-role {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

.mobile-profile-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 16px;
}

.mobile-profile-stars {
  display: flex;
  gap: 1px;
}

.mobile-profile-star {
  width: 16px;
  height: 16px;
  color: #F59E0B;
}

.mobile-profile-rating-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.mobile-profile-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.mobile-profile-action-btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mobile-profile-action-btn--primary {
  background: #3B82F6;
  color: white;
  border: 1px solid #3B82F6;
}

.mobile-profile-action-btn--secondary {
  background: white;
  color: #374151;
  border: 1px solid #E5E7EB;
}

/* モバイル統計カード */
.mobile-stats-section {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.mobile-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.mobile-stat-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}

.mobile-stat-number {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
}

.mobile-stat-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 500;
}

/* モバイルタブシステム */
.mobile-profile-content {
  background: white;
}

.mobile-tab-list {
  display: flex;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mobile-tab-list::-webkit-scrollbar {
  display: none;
}

.mobile-tab {
  flex-shrink: 0;
  padding: 16px 20px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.mobile-tab.active {
  color: #3B82F6;
}

.mobile-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 2px;
  background: #3B82F6;
  border-radius: 1px;
}

.mobile-tab-content {
  padding: 16px;
}

.mobile-profile-section {
  margin-bottom: 24px;
}

.mobile-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.mobile-basic-info {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}

.mobile-basic-info-item {
  margin-bottom: 8px;
}

.mobile-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mobile-skill-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.mobile-skill-tag--checked {
  background: #EFF6FF;
  color: #1D4ED8;
}

.mobile-skill-tag--unchecked {
  background: #F9FAFB;
  color: #6B7280;
}

.mobile-profile-description {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.mobile-reviews {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-review-item {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
}

.mobile-review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mobile-review-rating {
  display: flex;
  gap: 1px;
}

.mobile-review-star {
  width: 12px;
  height: 12px;
  color: #F59E0B;
}

.mobile-review-date {
  font-size: 11px;
  color: #6B7280;
}

.mobile-review-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
  margin-bottom: 8px;
}

.mobile-review-author {
  font-size: 11px;
  color: #6B7280;
}
```

### 共通モバイル機能

#### スワイプジェスチャー対応
```css
/* スワイプ対応 */
.mobile-swipeable {
  touch-action: pan-y;
  user-select: none;
}

.mobile-swipe-indicator {
  width: 32px;
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  margin: 8px auto;
}

/* プルトゥリフレッシュ */
.mobile-pull-refresh {
  padding: 20px;
  text-align: center;
  color: #6B7280;
  font-size: 14px;
}

.mobile-pull-refresh-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### レスポンシブ調整
```css
/* Safe Area対応 */
.mobile-safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.mobile-safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* フォント調整 */
@media (max-width: 320px) {
  .mobile-hero-title {
    font-size: 24px;
  }
  
  .mobile-detail-main-title {
    font-size: 20px;
  }
}

/* ランドスケープ対応 */
@media (orientation: landscape) and (max-height: 500px) {
  .mobile-hero {
    padding: 20px;
  }
  
  .mobile-hero-title {
    font-size: 24px;
  }
}
```

このモバイルUIデザイン仕様により、タッチデバイスでの操作性とユーザビリティを最大化したモバイルファーストのデザインを実現できます。
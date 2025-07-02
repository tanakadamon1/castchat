# VRChatキャスト募集掲示板 UIデザイン詳細仕様（デスクトップ版）

## UIデザイン概要

このドキュメントでは、ワイヤーフレームとデザインシステムに基づいた詳細なUIデザイン仕様を定義します。デスクトップ版（1024px以上）での表示を基準とした精密なレイアウト、スタイリング、インタラクション仕様を記載します。

## 画面別UIデザイン詳細

### 1. ログイン・会員登録画面

#### レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│                      Fixed Header (64px)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Hero Section                       │   │
│  │                    (400px)                          │   │
│  │                                                     │   │
│  │    [CastChat Logo - 180px width]                    │   │
│  │    VRChatキャスト募集掲示板                          │   │
│  │    安心・簡単・効率的なマッチング                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Login Card (480px width)              │   │
│  │                                                     │   │
│  │    [Google Logo] Googleでログイン                    │   │
│  │                                                     │   │
│  │    ─────────── または ───────────                   │   │
│  │                                                     │   │
│  │    メールアドレス                                   │   │
│  │    [Input Field - 416px width]                      │   │
│  │                                                     │   │
│  │    パスワード                                       │   │
│  │    [Input Field - 416px width]                      │   │
│  │                                                     │   │
│  │         [Login Button - 416px width]                │   │
│  │                                                     │   │
│  │    パスワードを忘れた方はこちら                     │   │
│  │                                                     │   │
│  │    アカウントをお持ちでない方                       │   │
│  │         [Register Button - 416px width]             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### スタイル詳細

**Hero Section**
```css
background: linear-gradient(135deg, #3B82F6 0%, #A855F7 100%);
padding: 80px 0;
text-align: center;
color: white;

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 24px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 8px;
}

.hero-description {
  font-size: 18px;
  font-weight: 400;
  opacity: 0.8;
}
```

**Login Card**
```css
background: white;
border-radius: 16px;
padding: 48px;
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
max-width: 480px;
margin: -120px auto 80px;
position: relative;
z-index: 10;

.google-login-btn {
  background: white;
  border: 2px solid #E5E7EB;
  color: #374151;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  margin-bottom: 32px;
}

.google-login-btn:hover {
  border-color: #D1D5DB;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.divider {
  position: relative;
  text-align: center;
  margin: 32px 0;
  color: #6B7280;
  font-size: 14px;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #E5E7EB;
  z-index: 1;
}

.divider span {
  background: white;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}
```

**Form Elements**
```css
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.primary-button {
  width: 100%;
  background: #3B82F6;
  color: white;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
}

.primary-button:hover {
  background: #2563EB;
  transform: translateY(-1px);
  box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
}
```

### 2. 募集一覧画面

#### レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│                     Header (64px)                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                Search Section (120px)                   │ │
│ │                                                         │ │
│ │  [Search Input - 400px] [Filter Dropdown] [Sort Dropdown] │
│ │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │ │
│ │  │カテゴリ │ │ 報酬    │ │ 日程    │ │ 場所    │       │ │
│ │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                 Results Header                          │ │
│ │  123件の募集が見つかりました          [View Toggle]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    Cards Grid                           │ │
│ │                                                         │ │
│ │  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │ │
│ │  │Card 1   │ │Card 2   │ │Card 3   │                   │ │
│ │  │         │ │         │ │         │                   │ │
│ │  └─────────┘ └─────────┘ └─────────┘                   │ │
│ │                                                         │ │
│ │  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │ │
│ │  │Card 4   │ │Card 5   │ │Card 6   │                   │ │
│ │  │         │ │         │ │         │                   │ │
│ │  └─────────┘ └─────────┘ └─────────┘                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                      [Pagination]                          │
└─────────────────────────────────────────────────────────────┘
```

#### 募集カード詳細デザイン
```css
.job-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
  height: 420px;
  position: relative;
}

.job-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.job-card-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  position: relative;
}

.job-card-favorite {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.job-card-content {
  padding: 24px;
}

.job-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.job-card-badge {
  background: #F3F4F6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.job-card-badge--category {
  background: #EFF6FF;
  color: #1D4ED8;
}

.job-card-badge--reward {
  background: #F0FDF4;
  color: #166534;
}

.job-card-description {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #F3F4F6;
  padding-top: 16px;
}

.job-card-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.job-card-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E5E7EB;
}

.job-card-author-info {
  font-size: 14px;
}

.job-card-author-name {
  font-weight: 500;
  color: #111827;
}

.job-card-author-rating {
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.job-card-stats {
  font-size: 12px;
  color: #6B7280;
  text-align: right;
}
```

### 3. 募集詳細画面

#### レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│                     Header (64px)                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                Breadcrumb (48px)                        │ │
│ │  ホーム > 募集一覧 > 音楽ライブイベント司会者募集       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────┐ ┌─────────────────────┐   │
│ │          Main Content         │ │      Sidebar        │   │
│ │                               │ │                     │   │
│ │  ┌─────────────────────────┐  │ │ ┌─────────────────┐ │   │
│ │  │     Hero Image          │  │ │ │   Apply Card    │ │   │
│ │  │      (600×300)          │  │ │ │                 │ │   │
│ │  └─────────────────────────┘  │ │ │  [応募する]     │ │   │
│ │                               │ │ │                 │ │   │
│ │  [♡] [Share] [Report]         │ │ │  基本情報       │ │   │
│ │                               │ │ │  ・日時         │ │   │
│ │  # タイトル                   │ │ │  ・場所         │ │   │
│ │                               │ │ │  ・報酬         │ │   │
│ │  ## 基本情報                  │ │ │  ・募集人数     │ │   │
│ │  ・カテゴリ                   │ │ │                 │ │   │
│ │  ・日時                       │ │ │  主催者情報     │ │   │
│ │  ・場所                       │ │ │  [Avatar]       │ │   │
│ │  ・募集人数                   │ │ │  @username      │ │   │
│ │  ・報酬                       │ │ │  ★4.8 (124件)  │ │   │
│ │  ・応募締切                   │ │ │                 │ │   │
│ │                               │ │ └─────────────────┘ │   │
│ │  ## 募集内容                  │ │                     │   │
│ │  詳細説明テキスト...          │ │ ┌─────────────────┐ │   │
│ │                               │ │ │  Related Posts  │ │   │
│ │  ## 応募条件                  │ │ │                 │ │   │
│ │  条件リスト...                │ │ │  [Card 1]       │ │   │
│ │                               │ │ │  [Card 2]       │ │   │
│ │  ## その他・注意事項          │ │ │  [Card 3]       │ │   │
│ │  注意事項...                  │ │ │                 │ │   │
│ │                               │ │ └─────────────────┘ │   │
│ └───────────────────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 詳細ページスタイル
```css
.post-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 48px;
  margin-top: 32px;
}

.post-detail-main {
  min-width: 0;
}

.post-hero-image {
  width: 100%;
  height: 300px;
  border-radius: 16px;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  margin-bottom: 24px;
  object-fit: cover;
}

.post-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.post-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-action-btn:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}

.post-action-btn--favorited {
  background: #FEF2F2;
  border-color: #EF4444;
  color: #EF4444;
}

.post-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  line-height: 1.25;
  margin-bottom: 32px;
}

.post-section {
  margin-bottom: 40px;
}

.post-section-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-basic-info {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
}

.post-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.post-info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.post-info-icon {
  width: 20px;
  height: 20px;
  color: #6B7280;
  margin-top: 2px;
}

.post-info-content {
  flex: 1;
}

.post-info-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 4px;
}

.post-info-value {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

.post-content {
  font-size: 16px;
  line-height: 1.7;
  color: #374151;
}

.post-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 24px 0 12px;
}

.post-content ul, .post-content ol {
  margin: 16px 0;
  padding-left: 24px;
}

.post-content li {
  margin-bottom: 8px;
}
```

#### サイドバー要素
```css
.post-sidebar {
  position: sticky;
  top: 88px;
  height: fit-content;
}

.apply-card {
  background: white;
  border: 2px solid #3B82F6;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.apply-button {
  width: 100%;
  background: #3B82F6;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s ease;
}

.apply-button:hover {
  background: #2563EB;
  transform: translateY(-1px);
  box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
}

.apply-button:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.quick-info {
  border-top: 1px solid #E5E7EB;
  padding-top: 24px;
}

.quick-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F3F4F6;
}

.quick-info-label {
  font-size: 14px;
  color: #6B7280;
}

.quick-info-value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.organizer-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.organizer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.organizer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #E5E7EB;
}

.organizer-info {
  flex: 1;
}

.organizer-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.organizer-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6B7280;
}

.organizer-stats {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 16px;
}

.organizer-actions {
  display: flex;
  gap: 8px;
}

.organizer-action-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.organizer-action-btn:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}
```

### 4. 募集投稿・編集画面

#### レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│                     Header (64px)                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              Page Header (80px)                         │ │
│ │  ← マイページに戻る      [下書き保存] [プレビュー]      │ │
│ │  # 新規募集投稿                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────┐ ┌─────────────────────┐   │
│ │          Form Main            │ │     Preview         │   │
│ │                               │ │                     │   │
│ │ ## 基本情報                   │ │ ┌─────────────────┐ │   │
│ │ ┌─────────────────────────────┐ │ │ Live Preview    │ │   │
│ │ │ 募集タイトル *              │ │ │                 │ │   │
│ │ │ [________________]          │ │ │ [画像]          │ │   │
│ │ │                             │ │ │                 │ │   │
│ │ │ カテゴリ *                  │ │ │ タイトル        │ │   │
│ │ │ [ライブイベント ▼]         │ │ │ カテゴリ・報酬  │ │   │
│ │ │                             │ │ │ 日時・場所      │ │   │
│ │ │ 開催日時 *                  │ │ │ 詳細...         │ │   │
│ │ │ [____/____/____]            │ │ │                 │ │   │
│ │ │ [__:__] ～ [__:__]          │ │ │                 │ │   │
│ │ │                             │ │ └─────────────────┘ │   │
│ │ │ 募集人数 *                  │ │                     │   │
│ │ │ [___]名                     │ │ ┌─────────────────┐ │   │
│ │ │                             │ │ │   Tips          │ │   │
│ │ │ 報酬                        │ │ │                 │ │   │
│ │ │ ○無償 ○有償                │ │ │ 💡 良い募集の   │ │   │
│ │ │ [_______]円                 │ │ │   ポイント      │ │   │
│ │ └─────────────────────────────┘ │ │                 │ │   │
│ │                               │ │ ・明確なタイトル│ │   │
│ │ ## 詳細情報                   │ │ ・詳細な説明    │ │   │
│ │ ┌─────────────────────────────┐ │ │ ・条件の明記    │ │   │
│ │ │ 募集内容 *                  │ │ │                 │ │   │
│ │ │ [Rich Text Editor]          │ │ └─────────────────┘ │   │
│ │ │                             │ │                     │   │
│ │ │ 応募条件                    │ │                     │   │
│ │ │ [Text Area]                 │ │                     │   │
│ │ │                             │ │                     │   │
│ │ │ その他・注意事項            │ │                     │   │
│ │ │ [Text Area]                 │ │                     │   │
│ │ └─────────────────────────────┘ │                     │   │
│ │                               │                     │   │
│ │ ## 画像                       │                     │   │
│ │ ┌─────────────────────────────┐ │                     │   │
│ │ │ [+ 画像をアップロード]      │ │                     │   │
│ │ │                             │ │                     │   │
│ │ │ [Thumbnail 1] [Thumbnail 2] │ │                     │   │
│ │ └─────────────────────────────┘ │                     │   │
│ │                               │                     │   │
│ │        [キャンセル] [公開する] │                     │   │
│ └───────────────────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### フォームスタイル詳細
```css
.post-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 48px;
  margin-top: 32px;
}

.form-section {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.form-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-required {
  color: #EF4444;
  font-size: 12px;
}

.form-input, .form-textarea, .form-select {
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

.form-help {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
}

.form-error {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}

.datetime-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: end;
}

.datetime-separator {
  font-size: 14px;
  color: #6B7280;
  padding-bottom: 16px;
}

.radio-group {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-input {
  width: 20px;
  height: 20px;
  accent-color: #3B82F6;
}

.radio-label {
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.rich-editor {
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.rich-editor-toolbar {
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
}

.rich-editor-btn {
  padding: 6px 8px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rich-editor-btn:hover {
  background: #F3F4F6;
}

.rich-editor-btn.active {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

.rich-editor-content {
  padding: 16px;
  min-height: 200px;
  font-size: 16px;
  line-height: 1.6;
}

.image-upload-area {
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.image-upload-area:hover {
  border-color: #3B82F6;
  background: #F8FAFF;
}

.image-upload-area.dragover {
  border-color: #3B82F6;
  background: #EFF6FF;
}

.image-upload-icon {
  width: 48px;
  height: 48px;
  color: #9CA3AF;
  margin: 0 auto 16px;
}

.image-upload-text {
  font-size: 16px;
  color: #374151;
  margin-bottom: 8px;
}

.image-upload-help {
  font-size: 14px;
  color: #6B7280;
}

.image-thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.image-thumbnail {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #F3F4F6;
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-thumbnail-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 32px;
  border-top: 1px solid #E5E7EB;
}

.form-action-btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-action-btn--secondary {
  background: white;
  color: #374151;
  border: 2px solid #E5E7EB;
}

.form-action-btn--secondary:hover {
  border-color: #D1D5DB;
}

.form-action-btn--primary {
  background: #3B82F6;
  color: white;
  border: 2px solid #3B82F6;
}

.form-action-btn--primary:hover {
  background: #2563EB;
  border-color: #2563EB;
}
```

### 5. プロフィール画面

#### レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│                     Header (64px)                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              Profile Header (200px)                     │ │
│ │                                                         │ │
│ │     [Large Avatar - 120px]        [Edit Profile]       │ │
│ │                                                         │ │
│ │     @username                     [Message] [Follow]    │ │
│ │     VRChatキャスト・司会業                              │ │
│ │     ★★★★★ 4.8 (85件のレビュー)                        │ │
│ │                                                         │ │
│ │     📍 日本  🕒 平日夜・週末  🎭 ライブイベント        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────┐ ┌─────────────────────┐   │
│ │          Profile Tabs         │ │      Sidebar        │   │
│ │                               │ │                     │   │
│ │ [概要] [実績] [レビュー] [投稿] │ │ ┌─────────────────┐ │   │
│ │                               │ │ │   Statistics    │ │   │
│ │ ## 基本情報                   │ │ │                 │ │   │
│ │ ・VRChat歴: 3年               │ │ │ 参加イベント    │ │   │
│ │ ・主な活動時間: 平日夜・週末  │ │ │      127回      │ │   │
│ │ ・得意分野: ライブイベント司会│ │ │                 │ │   │
│ │ ・対応言語: 日本語、英語      │ │ │ 主催イベント    │ │   │
│ │                               │ │ │      23回       │ │   │
│ │ ## スキル・経験               │ │ │                 │ │   │
│ │ ☑ 司会・MC   ☑ イベント進行  │ │ │ 獲得評価数      │ │   │
│ │ ☑ 撮影会     ☑ VTuberコラボ   │ │ │      85件       │ │   │
│ │ □ ワールド制作 □ アバター制作│ │ │                 │ │   │
│ │                               │ │ │ リピート率      │ │   │
│ │ ## プロフィール               │ │ │      78%        │ │   │
│ │ VRChatでライブイベントの司会..│ │ │                 │ │   │
│ │                               │ │ └─────────────────┘ │   │
│ │ ## 最近のレビュー             │ │                     │   │
│ │ ★★★★★ "とても丁寧で..."    │ │ ┌─────────────────┐ │   │
│ │ ★★★★★ "司会が上手で..."    │ │ │    Badges       │ │   │
│ │                               │ │ │                 │ │   │
│ │ ## ポートフォリオ             │ │ │ 🏆 Top Rated    │ │   │
│ │ [Image1] [Image2] [Image3]    │ │ │ 🎭 MC Master    │ │   │
│ │                               │ │ │ 🔥 Popular      │ │   │
│ └───────────────────────────────┘ │ │ ⚡ Quick Reply  │ │   │
│                                   │ │                 │ │   │
│                                   │ └─────────────────┘ │   │
│                                   └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### プロフィールヘッダースタイル
```css
.profile-header {
  background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  padding: 48px;
  margin-bottom: 32px;
  position: relative;
}

.profile-header-content {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #E5E7EB;
  border: 4px solid white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.profile-avatar-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #10B981;
  border: 3px solid white;
  border-radius: 50%;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-actions {
  display: flex;
  gap: 12px;
  align-self: flex-start;
}

.profile-action-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-action-btn--primary {
  background: #3B82F6;
  color: white;
  border: 2px solid #3B82F6;
}

.profile-action-btn--primary:hover {
  background: #2563EB;
  border-color: #2563EB;
}

.profile-action-btn--secondary {
  background: white;
  color: #374151;
  border: 2px solid #E5E7EB;
}

.profile-action-btn--secondary:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.profile-role {
  font-size: 18px;
  color: #6B7280;
  margin-bottom: 12px;
}

.profile-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.profile-stars {
  display: flex;
  gap: 2px;
}

.profile-star {
  width: 20px;
  height: 20px;
  color: #F59E0B;
}

.profile-rating-text {
  font-size: 16px;
  color: #374151;
  font-weight: 500;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.profile-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
}

.profile-meta-icon {
  width: 16px;
  height: 16px;
}
```

#### タブシステム
```css
.profile-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
}

.profile-tabs {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
}

.profile-tab-list {
  display: flex;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.profile-tab {
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.profile-tab:hover {
  color: #374151;
  background: rgba(59, 130, 246, 0.05);
}

.profile-tab.active {
  color: #3B82F6;
  background: white;
}

.profile-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #3B82F6;
}

.profile-tab-content {
  padding: 32px;
}

.profile-section {
  margin-bottom: 40px;
}

.profile-section:last-child {
  margin-bottom: 0;
}

.profile-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-basic-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.profile-info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.profile-info-label {
  font-size: 14px;
  color: #6B7280;
  min-width: 80px;
  font-weight: 500;
}

.profile-info-value {
  font-size: 14px;
  color: #111827;
  flex: 1;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.skill-tag--checked {
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
}

.skill-tag--unchecked {
  background: #F9FAFB;
  color: #6B7280;
  border: 1px solid #E5E7EB;
}

.skill-tag-icon {
  width: 16px;
  height: 16px;
}

.profile-description {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 20px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-star {
  width: 16px;
  height: 16px;
  color: #F59E0B;
}

.review-date {
  font-size: 12px;
  color: #6B7280;
}

.review-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 12px;
}

.review-author {
  font-size: 12px;
  color: #6B7280;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.portfolio-item {
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  background: #F3F4F6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.portfolio-item:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.portfolio-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

このUIデザイン仕様により、ワイヤーフレームをベースとした統一性のある美しいインターフェースを実現できます。
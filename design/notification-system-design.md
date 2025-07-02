# 通知システム UIデザイン仕様書

## 通知システム概要

VRChatキャスト募集掲示板の通知システムは、ユーザーの重要なアクションや更新を適切なタイミングで伝える仕組みです。リアルタイム性と使いやすさを重視したデザインを採用します。

## 通知の種類と優先度

### 1. 通知タイプ分類

#### 高優先度通知
- **応募受信**: 自分の投稿に新しい応募があった
- **応募承認**: 自分の応募が承認された
- **応募拒否**: 自分の応募が拒否された

#### 中優先度通知
- **応募取り下げ**: 応募者が応募を取り下げた
- **メッセージ受信**: 直接メッセージが届いた
- **締切間近**: 応募締切が近い投稿の通知

#### 低優先度通知
- **システム更新**: メンテナンス情報
- **機能追加**: 新機能のお知らせ
- **プロモーション**: キャンペーン情報

### 2. 通知表示戦略

#### リアルタイム通知
```css
/* リアルタイム通知ポップアップ */
.realtime-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 360px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 10000;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.realtime-notification-content {
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.realtime-notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.realtime-notification-icon.success {
  background: #ECFDF5;
  color: #065F46;
}

.realtime-notification-icon.info {
  background: #DBEAFE;
  color: #1E40AF;
}

.realtime-notification-icon.warning {
  background: #FFFBEB;
  color: #92400E;
}

.realtime-notification-text {
  flex: 1;
  min-width: 0;
}

.realtime-notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.realtime-notification-message {
  font-size: 13px;
  color: #6B7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.realtime-notification-actions {
  display: flex;
  gap: 8px;
}

.realtime-notification-action {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.realtime-notification-action.primary {
  background: #3B82F6;
  color: white;
}

.realtime-notification-action.primary:hover {
  background: #1D4ED8;
}

.realtime-notification-action.secondary {
  background: #F3F4F6;
  color: #6B7280;
}

.realtime-notification-action.secondary:hover {
  background: #E5E7EB;
}

.realtime-notification-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #9CA3AF;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.realtime-notification-close:hover {
  background: #F3F4F6;
  color: #6B7280;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .realtime-notification {
    right: 16px;
    left: 16px;
    width: auto;
    top: 70px;
  }
}
```

## ヘッダー通知ドロップダウン

### デザイン仕様
```css
/* ヘッダー通知ベル */
.notification-bell {
  position: relative;
  padding: 8px;
  border-radius: 8px;
  background: white;
  border: 1px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-bell:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.notification-bell:focus {
  outline: none;
  ring: 2px solid #3B82F6;
  ring-offset: 2px;
}

.notification-bell-icon {
  width: 20px;
  height: 20px;
  color: #6B7280;
}

.notification-bell.has-unread .notification-bell-icon {
  color: #3B82F6;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  background: #EF4444;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  animation: notificationPulse 2s infinite;
}

@keyframes notificationPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 9+ 表示 */
.notification-badge.many {
  font-size: 10px;
  padding: 0 4px;
}

/* ドロップダウンコンテンツ */
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 500px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  overflow: hidden;
  animation: dropdownSlideIn 0.2s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.notification-dropdown-header {
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F9FAFB;
}

.notification-dropdown-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.notification-dropdown-actions {
  display: flex;
  gap: 12px;
}

.mark-all-read {
  font-size: 12px;
  color: #3B82F6;
  text-decoration: none;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.mark-all-read:hover {
  background: #DBEAFE;
  text-decoration: none;
}

.notification-settings {
  width: 20px;
  height: 20px;
  color: #6B7280;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px;
  transition: all 0.2s ease;
}

.notification-settings:hover {
  background: #E5E7EB;
  color: #374151;
}
```

## 通知一覧画面

### レイアウト構成
```css
/* 通知一覧メインコンテナ */
.notifications-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #E5E7EB;
}

.notifications-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.notifications-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6B7280;
}

.notifications-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notifications-stat-number {
  font-weight: 600;
  color: #111827;
}

/* フィルターバー */
.notifications-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  min-width: 60px;
}

.filter-buttons {
  display: flex;
  gap: 4px;
}

.filter-button {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #D1D5DB;
  background: white;
  color: #6B7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-button:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}

.filter-button.active {
  background: #3B82F6;
  border-color: #3B82F6;
  color: white;
}

.filter-button .count {
  margin-left: 4px;
  opacity: 0.7;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .notifications-page {
    padding: 16px;
  }
  
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .notifications-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .notifications-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .filter-buttons {
    flex-wrap: wrap;
  }
}
```

## 通知内容のビジュアルデザイン

### 応募関連通知
```css
/* 応募受信通知 */
.notification-application-received {
  background: linear-gradient(135deg, #DBEAFE 0%, #F0F9FF 100%);
  border-left: 4px solid #3B82F6;
}

.notification-application-received .notification-icon {
  background: #DBEAFE;
  color: #1E40AF;
}

.notification-application-received .notification-icon::before {
  content: '📝';
  font-size: 16px;
}

/* 応募承認通知 */
.notification-application-approved {
  background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%);
  border-left: 4px solid #10B981;
}

.notification-application-approved .notification-icon {
  background: #ECFDF5;
  color: #065F46;
}

.notification-application-approved .notification-icon::before {
  content: '✅';
  font-size: 16px;
}

/* 応募拒否通知 */
.notification-application-rejected {
  background: linear-gradient(135deg, #FEF2F2 0%, #FFFBFB 100%);
  border-left: 4px solid #EF4444;
}

.notification-application-rejected .notification-icon {
  background: #FEF2F2;
  color: #991B1B;
}

.notification-application-rejected .notification-icon::before {
  content: '❌';
  font-size: 16px;
}
```

### システム通知
```css
/* システム更新通知 */
.notification-system {
  background: linear-gradient(135deg, #F3F4F6 0%, #F9FAFB 100%);
  border-left: 4px solid #6B7280;
}

.notification-system .notification-icon {
  background: #F3F4F6;
  color: #374151;
}

.notification-system .notification-icon::before {
  content: 'ℹ️';
  font-size: 16px;
}

/* メンテナンス通知 */
.notification-maintenance {
  background: linear-gradient(135deg, #FFFBEB 0%, #FEFCF0 100%);
  border-left: 4px solid #F59E0B;
}

.notification-maintenance .notification-icon {
  background: #FFFBEB;
  color: #92400E;
}

.notification-maintenance .notification-icon::before {
  content: '🔧';
  font-size: 16px;
}
```

## 空状態デザイン

### 通知なし状態
```css
.notifications-empty {
  text-align: center;
  padding: 80px 20px;
  background: #F9FAFB;
  border-radius: 12px;
  border: 2px dashed #D1D5DB;
}

.notifications-empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.notifications-empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.notifications-empty-subtitle {
  font-size: 16px;
  color: #6B7280;
  margin: 0 0 24px 0;
}

.notifications-empty-action {
  padding: 12px 24px;
  background: #3B82F6;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.notifications-empty-action:hover {
  background: #1D4ED8;
  text-decoration: none;
}
```

## 通知設定画面

### 設定UI
```css
.notification-settings-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.notification-settings-section {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.notification-settings-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.notification-setting-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #F3F4F6;
}

.notification-setting-item:last-child {
  border-bottom: none;
}

.notification-setting-info {
  flex: 1;
  margin-right: 16px;
}

.notification-setting-label {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
}

.notification-setting-description {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
  line-height: 1.4;
}

.notification-toggle {
  width: 44px;
  height: 24px;
  background: #D1D5DB;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.notification-toggle.enabled {
  background: #3B82F6;
}

.notification-toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification-toggle.enabled::before {
  transform: translateX(20px);
}
```

## アクセシビリティ対応

### ARIA属性とスクリーンリーダー対応
```vue
<!-- 通知ベル -->
<button
  class="notification-bell"
  :class="{ 'has-unread': unreadCount > 0 }"
  :aria-label="`通知 ${unreadCount > 0 ? `${unreadCount}件の未読通知があります` : '未読通知はありません'}`"
  :aria-expanded="isDropdownOpen"
  aria-haspopup="true"
  @click="toggleDropdown"
>
  <BellIcon class="notification-bell-icon" />
  <span v-if="unreadCount > 0" class="notification-badge" :aria-label="`${unreadCount}件の未読通知`">
    {{ unreadCount > 9 ? '9+' : unreadCount }}
  </span>
</button>

<!-- 通知アイテム -->
<div
  class="notification-item"
  :class="{ unread: !notification.read }"
  role="button"
  tabindex="0"
  :aria-label="`通知: ${notification.title}. ${notification.read ? '既読' : '未読'}`"
  @click="handleClick"
  @keydown.enter="handleClick"
  @keydown.space.prevent="handleClick"
>
  <!-- 通知内容 -->
</div>

<!-- 通知設定トグル -->
<button
  class="notification-toggle"
  :class="{ enabled: setting.enabled }"
  role="switch"
  :aria-checked="setting.enabled"
  :aria-labelledby="`setting-${setting.id}-label`"
  @click="toggleSetting(setting.id)"
>
  <span class="sr-only">
    {{ setting.enabled ? '無効にする' : '有効にする' }}
  </span>
</button>
```

## 実装上の注意点

### パフォーマンス最適化
1. **仮想スクロール**: 大量の通知がある場合の対応
2. **遅延読み込み**: 画像やアバターの最適化
3. **リアルタイム接続**: WebSocketの効率的な使用

### ユーザビリティ
1. **通知の自動消去**: 一定時間後の自動非表示
2. **グルーピング**: 同種の通知のまとめ表示
3. **優先度順表示**: 重要度に応じたソート

### データ管理
1. **ローカルストレージ**: 設定の永続化
2. **同期処理**: 複数タブ間での状態同期
3. **オフライン対応**: ネットワーク切断時の挙動

この通知システムデザインにより、ユーザーは重要な情報を見逃すことなく、快適にアプリケーションを利用できます。
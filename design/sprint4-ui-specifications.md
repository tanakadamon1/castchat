# Sprint 4 UI仕様書 - 新規コンポーネント設計

## 新規コンポーネント設計

### 1. UserStatusBadge.vue

#### 概要
ユーザーのオンライン状態やプロフィール信頼度を表示するバッジコンポーネント

#### デザイン仕様

##### ビジュアルデザイン
```css
/* UserStatusBadge スタイル */
.user-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* オンライン状態 */
.status-online {
  background: #ECFDF5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.status-online::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
}

/* オフライン状態 */
.status-offline {
  background: #F3F4F6;
  color: #6B7280;
  border: 1px solid #D1D5DB;
}

.status-offline::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9CA3AF;
}

/* 退席中状態 */
.status-away {
  background: #FFFBEB;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.status-away::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F59E0B;
}

/* 認証済みユーザー */
.status-verified {
  background: #DBEAFE;
  color: #1E40AF;
  border: 1px solid #93C5FD;
}

.status-verified::before {
  content: '✓';
  font-size: 8px;
  font-weight: 700;
}

/* プレミアムユーザー */
.status-premium {
  background: linear-gradient(135deg, #A855F7, #EC4899);
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(168, 85, 247, 0.3);
}

.status-premium::before {
  content: '⭐';
  font-size: 8px;
}
```

##### 使用例
```vue
<!-- オンライン状態 -->
<UserStatusBadge status="online" />
<!-- 表示: 🟢 ONLINE -->

<!-- 認証済み -->
<UserStatusBadge status="verified" />
<!-- 表示: ✓ VERIFIED -->

<!-- プレミアムユーザー -->
<UserStatusBadge status="premium" />
<!-- 表示: ⭐ PREMIUM -->
```

##### レスポンシブ対応
```css
/* モバイル対応 */
@media (max-width: 768px) {
  .user-status-badge {
    font-size: 10px;
    padding: 1px 6px;
  }
  
  .user-status-badge::before {
    width: 4px;
    height: 4px;
  }
}
```

### 2. 通知UIコンポーネント群

#### 2.1 NotificationDropdown.vue

##### 概要
ヘッダーに配置される通知ドロップダウン

##### デザイン仕様
```css
/* NotificationDropdown */
.notification-dropdown {
  position: relative;
  display: inline-block;
}

.notification-trigger {
  position: relative;
  padding: 8px;
  border-radius: 8px;
  background: white;
  border: 1px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-trigger:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
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
}

.notification-dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 480px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  overflow: hidden;
}

.notification-header {
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: between;
}

.notification-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.mark-all-read {
  font-size: 12px;
  color: #3B82F6;
  text-decoration: none;
  font-weight: 500;
}

.mark-all-read:hover {
  text-decoration: underline;
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-footer {
  padding: 12px 20px;
  border-top: 1px solid #E5E7EB;
  text-align: center;
}

.view-all-link {
  font-size: 14px;
  color: #3B82F6;
  text-decoration: none;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .notification-dropdown-content {
    width: 320px;
    max-height: 400px;
  }
}
```

#### 2.2 NotificationItem.vue

##### 概要
個別の通知アイテム

##### デザイン仕様
```css
/* NotificationItem */
.notification-item {
  padding: 16px 20px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background: #F9FAFB;
}

.notification-item.unread {
  background: #F0F9FF;
  border-left: 3px solid #3B82F6;
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 16px;
  width: 8px;
  height: 8px;
  background: #3B82F6;
  border-radius: 50%;
  transform: translateY(-50%);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.application {
  background: #DBEAFE;
  color: #1E40AF;
}

.notification-icon.system {
  background: #F3F4F6;
  color: #6B7280;
}

.notification-icon.message {
  background: #ECFDF5;
  color: #065F46;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.notification-message {
  font-size: 13px;
  color: #6B7280;
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 11px;
  color: #9CA3AF;
  font-weight: 500;
}

/* 通知タイプ別アイコン */
.notification-icon.application::before {
  content: '📝';
  font-size: 14px;
}

.notification-icon.system::before {
  content: 'ℹ️';
  font-size: 14px;
}

.notification-icon.message::before {
  content: '💬';
  font-size: 14px;
}

.notification-icon.success::before {
  content: '✅';
  font-size: 14px;
}

.notification-icon.warning::before {
  content: '⚠️';
  font-size: 14px;
}
```

#### 2.3 NotificationList.vue

##### 概要
通知画面での全通知一覧

##### デザイン仕様
```css
/* NotificationList */
.notification-list-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.notification-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #E5E7EB;
}

.notification-list-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.notification-actions {
  display: flex;
  gap: 12px;
}

.notification-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-button {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #D1D5DB;
  background: white;
  color: #6B7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
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

.notification-empty {
  text-align: center;
  padding: 60px 20px;
}

.notification-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.notification-empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #6B7280;
  margin: 0 0 8px 0;
}

.notification-empty-message {
  font-size: 14px;
  color: #9CA3AF;
  margin: 0;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .notification-list-container {
    padding: 16px;
  }
  
  .notification-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .notification-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .notification-filter {
    flex-wrap: wrap;
  }
}
```

### 3. アプリケーション管理画面の詳細デザイン

#### ApplicationStatusCard.vue

##### 概要
応募ステータスを視覚的に表示するカード

##### デザイン仕様
```css
/* ApplicationStatusCard */
.application-status-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  position: relative;
}

.application-status-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.application-status-card.pending {
  border-left: 4px solid #F59E0B;
  background: linear-gradient(to right, #FFFBEB 0%, white 100%);
}

.application-status-card.approved {
  border-left: 4px solid #10B981;
  background: linear-gradient(to right, #ECFDF5 0%, white 100%);
}

.application-status-card.rejected {
  border-left: 4px solid #EF4444;
  background: linear-gradient(to right, #FEF2F2 0%, white 100%);
}

.application-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.applicant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6B7280;
}

.applicant-details h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.applicant-details p {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.application-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #FEF3C7;
  color: #92400E;
}

.status-approved {
  background: #D1FAE5;
  color: #065F46;
}

.status-rejected {
  background: #FEE2E2;
  color: #991B1B;
}

.application-message {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}

.application-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 16px;
}

.application-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .application-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .application-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .application-actions {
    justify-content: stretch;
  }
  
  .application-actions button {
    flex: 1;
  }
}
```

## 実装ガイドライン

### コンポーネント構造
```
src/components/
├── ui/
│   ├── UserStatusBadge.vue      # 新規作成
│   └── ApplicationStatusCard.vue # 新規作成
├── notification/
│   ├── NotificationDropdown.vue  # 新規作成
│   ├── NotificationItem.vue      # 新規作成
│   └── NotificationList.vue      # 新規作成
```

### props インターフェース定義
```typescript
// UserStatusBadge.vue
interface UserStatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'verified' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

// NotificationItem.vue
interface NotificationItemProps {
  notification: {
    id: string
    type: 'application' | 'system' | 'message' | 'success' | 'warning'
    title: string
    message: string
    time: string
    read: boolean
    actionUrl?: string
  }
  compact?: boolean
}

// ApplicationStatusCard.vue
interface ApplicationStatusCardProps {
  application: {
    id: string
    applicantName: string
    applicantAvatar?: string
    applicationMessage: string
    status: 'pending' | 'approved' | 'rejected'
    submittedAt: string
    postTitle: string
  }
  showActions?: boolean
}
```

### アクセシビリティ対応
```vue
<!-- UserStatusBadge例 -->
<span 
  class="user-status-badge"
  :class="statusClasses"
  :aria-label="`ユーザーステータス: ${statusLabel}`"
  role="status"
>
  {{ statusLabel }}
</span>

<!-- NotificationItem例 -->
<div 
  class="notification-item"
  :class="{ unread: !notification.read }"
  :aria-label="`通知: ${notification.title}`"
  role="button"
  tabindex="0"
  @click="handleClick"
  @keydown.enter="handleClick"
  @keydown.space.prevent="handleClick"
>
  <!-- 通知内容 -->
</div>
```

### アニメーション仕様
```css
/* フェードイン */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.notification-dropdown-content {
  animation: fadeIn 0.2s ease-out;
}

/* ステータス変更アニメーション */
.application-status-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.application-status-card.status-changing {
  transform: scale(0.98);
  opacity: 0.8;
}

/* バッジ表示アニメーション */
.notification-badge {
  animation: pulseIn 0.3s ease-out;
}

@keyframes pulseIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

これらの新規コンポーネントにより、アプリケーションの応募管理機能と通知システムが視覚的に分かりやすく、使いやすいインターフェースとなります。
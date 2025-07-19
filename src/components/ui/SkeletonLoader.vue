<template>
  <div
    :class="containerClasses"
    :aria-label="ariaLabel"
    role="status"
    aria-live="polite"
  >
    <!-- カスタムスケルトン -->
    <slot v-if="$slots.default" />
    
    <!-- プリセットスケルトン -->
    <template v-else>
      <!-- PostCard Skeleton -->
      <div v-if="type === 'post-card'" class="skeleton-post-card">
        <div class="skeleton-post-header">
          <div class="skeleton-avatar" />
          <div class="skeleton-post-info">
            <div class="skeleton-line skeleton-title" />
            <div class="skeleton-line skeleton-subtitle" />
          </div>
          <div class="skeleton-badge" />
        </div>
        
        <div class="skeleton-post-content">
          <div class="skeleton-line skeleton-content-line" />
          <div class="skeleton-line skeleton-content-line short" />
          <div class="skeleton-line skeleton-content-line medium" />
        </div>
        
        <div class="skeleton-post-footer">
          <div class="skeleton-tag" />
          <div class="skeleton-tag" />
          <div class="skeleton-tag" />
          <div class="skeleton-spacer" />
          <div class="skeleton-action-btn" />
          <div class="skeleton-action-btn" />
        </div>
      </div>
      
      <!-- UserProfile Skeleton -->
      <div v-else-if="type === 'user-profile'" class="skeleton-user-profile">
        <div class="skeleton-profile-header">
          <div class="skeleton-large-avatar" />
          <div class="skeleton-profile-info">
            <div class="skeleton-line skeleton-name" />
            <div class="skeleton-line skeleton-bio" />
            <div class="skeleton-line skeleton-bio short" />
          </div>
        </div>
        
        <div class="skeleton-profile-stats">
          <div class="skeleton-stat">
            <div class="skeleton-stat-number" />
            <div class="skeleton-stat-label" />
          </div>
          <div class="skeleton-stat">
            <div class="skeleton-stat-number" />
            <div class="skeleton-stat-label" />
          </div>
          <div class="skeleton-stat">
            <div class="skeleton-stat-number" />
            <div class="skeleton-stat-label" />
          </div>
        </div>
      </div>
      
      <!-- MessageList Skeleton -->
      <div v-else-if="type === 'message-list'" class="skeleton-message-list">
        <div
          v-for="i in messageCount"
          :key="i"
          class="skeleton-message"
          :class="{ 'message-own': i % 3 === 0 }"
        >
          <div v-if="i % 3 !== 0" class="skeleton-message-avatar" />
          <div class="skeleton-message-bubble" :class="{ 'bubble-own': i % 3 === 0 }">
            <div class="skeleton-line skeleton-message-text" :class="getMessageTextClass(i)" />
            <div v-if="i % 4 === 0" class="skeleton-line skeleton-message-text short" />
          </div>
        </div>
      </div>
      
      <!-- ApplicationCard Skeleton -->
      <div v-else-if="type === 'application-card'" class="skeleton-application-card">
        <div class="skeleton-app-header">
          <div class="skeleton-avatar" />
          <div class="skeleton-app-info">
            <div class="skeleton-line skeleton-applicant-name" />
            <div class="skeleton-line skeleton-app-date" />
          </div>
          <div class="skeleton-status-badge" />
        </div>
        
        <div class="skeleton-app-content">
          <div class="skeleton-line skeleton-app-message" />
          <div class="skeleton-line skeleton-app-message medium" />
          <div class="skeleton-line skeleton-app-message short" />
        </div>
        
        <div class="skeleton-app-actions">
          <div class="skeleton-action-btn primary" />
          <div class="skeleton-action-btn secondary" />
        </div>
      </div>
      
      <!-- NotificationItem Skeleton -->
      <div v-else-if="type === 'notification-item'" class="skeleton-notification-item">
        <div class="skeleton-notification-icon" />
        <div class="skeleton-notification-content">
          <div class="skeleton-line skeleton-notification-title" />
          <div class="skeleton-line skeleton-notification-message" />
          <div class="skeleton-line skeleton-notification-time" />
        </div>
        <div class="skeleton-notification-actions">
          <div class="skeleton-small-btn" />
        </div>
      </div>
      
      <!-- List Skeleton -->
      <div v-else-if="type === 'list'" class="skeleton-list">
        <div
          v-for="i in count"
          :key="i"
          class="skeleton-list-item"
        >
          <div v-if="showAvatar" class="skeleton-avatar" />
          <div class="skeleton-list-content">
            <div class="skeleton-line skeleton-list-title" />
            <div class="skeleton-line skeleton-list-subtitle" />
          </div>
          <div v-if="showActions" class="skeleton-action-btn" />
        </div>
      </div>
      
      <!-- 基本的な線 -->
      <div v-else class="skeleton-basic">
        <div
          v-for="i in count"
          :key="i"
          class="skeleton-line"
          :class="getBasicLineClass(i)"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SkeletonLoader'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'post-card' | 'user-profile' | 'message-list' | 'application-card' | 'notification-item' | 'list' | 'basic'
  count?: number
  messageCount?: number
  showAvatar?: boolean
  showActions?: boolean
  loading?: boolean
  ariaLabel?: string
  variant?: 'light' | 'dark'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'basic',
  count: 3,
  messageCount: 5,
  showAvatar: true,
  showActions: true,
  loading: true,
  ariaLabel: '読み込み中...',
  variant: 'light',
  animated: true
})

// Computed
const containerClasses = computed(() => {
  const baseClasses = 'skeleton-container'
  const variantClass = `skeleton-${props.variant}`
  const animatedClass = props.animated ? 'skeleton-animated' : ''
  
  return `${baseClasses} ${variantClass} ${animatedClass}`.trim()
})

// Methods
const getBasicLineClass = (index: number): string => {
  const variations = ['', 'medium', 'short', 'long']
  return variations[index % variations.length]
}

const getMessageTextClass = (index: number): string => {
  const variations = ['', 'medium', 'short', 'long']
  return variations[index % variations.length]
}
</script>

<style scoped>
/* ベーススタイル */
.skeleton-container {
  animation-duration: 1.5s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.skeleton-animated {
  animation-name: skeleton-pulse;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 基本要素 */
.skeleton-line,
.skeleton-avatar,
.skeleton-badge,
.skeleton-action-btn,
.skeleton-tag,
.skeleton-large-avatar,
.skeleton-notification-icon,
.skeleton-small-btn,
.skeleton-stat-number,
.skeleton-stat-label,
.skeleton-status-badge {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* ダークモード */
.skeleton-dark .skeleton-line,
.skeleton-dark .skeleton-avatar,
.skeleton-dark .skeleton-badge,
.skeleton-dark .skeleton-action-btn,
.skeleton-dark .skeleton-tag,
.skeleton-dark .skeleton-large-avatar,
.skeleton-dark .skeleton-notification-icon,
.skeleton-dark .skeleton-small-btn,
.skeleton-dark .skeleton-stat-number,
.skeleton-dark .skeleton-stat-label,
.skeleton-dark .skeleton-status-badge {
  background: linear-gradient(
    90deg,
    #2d3748 25%,
    #4a5568 50%,
    #2d3748 75%
  );
}

/* 基本的な線 */
.skeleton-line {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.medium {
  width: 80%;
}

.skeleton-line.long {
  width: 95%;
}

/* PostCard Skeleton */
.skeleton-post-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.skeleton-post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-post-info {
  flex: 1;
}

.skeleton-title {
  height: 20px;
  width: 60%;
  margin-bottom: 8px;
}

.skeleton-subtitle {
  height: 14px;
  width: 40%;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  border-radius: 12px;
}

.skeleton-post-content {
  margin-bottom: 16px;
}

.skeleton-content-line {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-post-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-tag {
  width: 60px;
  height: 20px;
  border-radius: 10px;
}

.skeleton-spacer {
  flex: 1;
}

.skeleton-action-btn {
  width: 80px;
  height: 32px;
  border-radius: 6px;
}

.skeleton-action-btn.primary {
  width: 100px;
}

.skeleton-action-btn.secondary {
  width: 80px;
}

/* UserProfile Skeleton */
.skeleton-user-profile {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.skeleton-profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.skeleton-large-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-profile-info {
  flex: 1;
}

.skeleton-name {
  height: 24px;
  width: 200px;
  margin-bottom: 12px;
}

.skeleton-bio {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-profile-stats {
  display: flex;
  gap: 32px;
}

.skeleton-stat {
  text-align: center;
}

.skeleton-stat-number {
  width: 40px;
  height: 20px;
  margin: 0 auto 8px;
}

.skeleton-stat-label {
  width: 60px;
  height: 14px;
  margin: 0 auto;
}

/* MessageList Skeleton */
.skeleton-message-list {
  padding: 16px;
}

.skeleton-message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}

.skeleton-message.message-own {
  justify-content: flex-end;
}

.skeleton-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 18px;
  background: #f1f5f9;
}

.skeleton-message-bubble.bubble-own {
  background: #dbeafe;
}

.skeleton-message-text {
  height: 16px;
  background: transparent;
  position: relative;
  overflow: hidden;
}

.skeleton-message-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    #cbd5e1 25%,
    #94a3b8 50%,
    #cbd5e1 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 2px;
}

/* ApplicationCard Skeleton */
.skeleton-application-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.skeleton-app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.skeleton-app-info {
  flex: 1;
}

.skeleton-applicant-name {
  height: 18px;
  width: 120px;
  margin-bottom: 6px;
}

.skeleton-app-date {
  height: 14px;
  width: 100px;
}

.skeleton-status-badge {
  width: 70px;
  height: 20px;
  border-radius: 10px;
}

.skeleton-app-content {
  margin-bottom: 16px;
}

.skeleton-app-message {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-app-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* NotificationItem Skeleton */
.skeleton-notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.skeleton-notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-notification-content {
  flex: 1;
}

.skeleton-notification-title {
  height: 16px;
  width: 200px;
  margin-bottom: 6px;
}

.skeleton-notification-message {
  height: 14px;
  width: 300px;
  margin-bottom: 6px;
}

.skeleton-notification-time {
  height: 12px;
  width: 80px;
}

.skeleton-notification-actions {
  flex-shrink: 0;
}

.skeleton-small-btn {
  width: 60px;
  height: 28px;
  border-radius: 4px;
}

/* List Skeleton */
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.skeleton-list-content {
  flex: 1;
}

.skeleton-list-title {
  height: 18px;
  width: 200px;
  margin-bottom: 6px;
}

.skeleton-list-subtitle {
  height: 14px;
  width: 150px;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .skeleton-post-card,
  .skeleton-application-card {
    padding: 16px;
  }
  
  .skeleton-profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .skeleton-profile-stats {
    justify-content: center;
  }
  
  .skeleton-message-bubble {
    max-width: 85%;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .skeleton-animated,
  .skeleton-line,
  .skeleton-avatar,
  .skeleton-badge,
  .skeleton-action-btn,
  .skeleton-tag,
  .skeleton-large-avatar,
  .skeleton-notification-icon,
  .skeleton-small-btn,
  .skeleton-stat-number,
  .skeleton-stat-label,
  .skeleton-status-badge {
    animation: none;
  }
}
</style>
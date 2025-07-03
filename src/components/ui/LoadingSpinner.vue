<template>
  <div :class="containerClasses">
    <!-- スピナー本体 -->
    <div :class="spinnerClasses">
      <svg
        class="animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        :aria-label="message || 'ローディング中'"
        role="status"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
    
    <!-- メッセージ -->
    <p
      v-if="message"
      :class="messageClasses"
      aria-live="polite"
    >
      {{ message }}
    </p>
    
    <!-- 進捗表示 -->
    <div
      v-if="showProgress && (progress !== null || estimatedTime)"
      class="progress-container"
    >
      <!-- 進捗バー -->
      <div v-if="progress !== null" class="progress-bar-container">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
          />
        </div>
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </div>
      
      <!-- 推定時間 -->
      <p v-if="estimatedTime" class="estimated-time">
        あと約{{ estimatedTime }}
      </p>
    </div>
    
    <!-- 詳細な状態表示 -->
    <div
      v-if="showDetails && steps.length > 0"
      class="loading-steps"
    >
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="loading-step"
        :class="{
          'step-completed': index < currentStep,
          'step-current': index === currentStep,
          'step-pending': index > currentStep
        }"
      >
        <div class="step-indicator">
          <Check v-if="index < currentStep" class="w-4 h-4" />
          <div v-else-if="index === currentStep" class="step-spinner">
            <div class="mini-spinner" />
          </div>
          <div v-else class="step-dot" />
        </div>
        <span class="step-text">{{ step }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  centered?: boolean
  fullScreen?: boolean
  showProgress?: boolean
  progress?: number | null
  estimatedTime?: string
  showDetails?: boolean
  steps?: string[]
  currentStep?: number
  variant?: 'default' | 'success' | 'warning' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  centered: true,
  fullScreen: false,
  showProgress: false,
  progress: null,
  showDetails: false,
  steps: () => [],
  currentStep: 0,
  variant: 'default'
})

const containerClasses = computed(() => {
  const baseClasses = 'flex flex-col items-center'
  
  if (props.fullScreen) {
    return `${baseClasses} fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 justify-center`
  }
  
  if (props.centered) {
    return `${baseClasses} justify-center py-8`
  }
  
  return `${baseClasses} space-y-3`
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  const variantClasses = {
    default: 'text-indigo-500',
    success: 'text-emerald-500',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }
  
  return `${variantClasses[props.variant]} ${sizeClasses[props.size]}`
})

const messageClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const variantClasses = {
    default: 'text-gray-700',
    success: 'text-emerald-700',
    warning: 'text-yellow-700',
    error: 'text-red-700'
  }
  
  return `${variantClasses[props.variant]} ${sizeClasses[props.size]} mt-2 font-medium`
})
</script>

<style scoped>
/* 進捗バー */
.progress-container {
  width: 100%;
  max-width: 300px;
  margin-top: 16px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #4f46e5);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  min-width: 35px;
  text-align: right;
}

.estimated-time {
  font-size: 13px;
  color: #6B7280;
  text-align: center;
  margin: 8px 0 0 0;
}

/* ステップ表示 */
.loading-steps {
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-left: 2px solid transparent;
  padding-left: 16px;
  margin-left: 12px;
}

.step-completed {
  border-left-color: #10b981;
}

.step-current {
  border-left-color: #6366f1;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.05), transparent);
  border-radius: 0 8px 8px 0;
}

.step-pending {
  border-left-color: #E5E7EB;
}

.step-indicator {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-completed .step-indicator {
  background: #10b981;
  color: white;
  border-radius: 50%;
}

.step-current .step-indicator {
  background: #6366f1;
  border-radius: 50%;
}

.step-spinner {
  width: 16px;
  height: 16px;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.step-dot {
  width: 8px;
  height: 8px;
  background: #D1D5DB;
  border-radius: 50%;
}

.step-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.step-completed .step-text {
  color: #059669;
}

.step-current .step-text {
  color: #4f46e5;
  font-weight: 600;
}

.step-pending .step-text {
  color: #9CA3AF;
}

/* アニメーション改善 */
.animate-spin {
  animation: spin 1.5s linear infinite;
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .mini-spinner {
    animation: none;
  }
  
  .progress-fill {
    transition: none;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .progress-bar {
    background: #374151;
  }
  
  .step-text {
    color: #D1D5DB;
  }
  
  .step-pending .step-text {
    color: #6B7280;
  }
}
</style>
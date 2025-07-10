<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        コイン購入履歴
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        コインの購入・使用履歴を確認できます
      </p>
    </div>

    <!-- Coin Balance Card -->
    <div class="mb-8">
      <CoinBalance
        ref="coinBalanceRef"
        @purchase="showPurchaseModal = true"
        @view-history="scrollToHistory"
      />
    </div>

    <!-- Purchase Modal -->
    <CoinPurchaseModal
      :show="showPurchaseModal"
      @close="showPurchaseModal = false"
      @success="handlePurchaseSuccess"
    />

    <!-- Transaction History -->
    <div id="transaction-history" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          取引履歴
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-6">
        <div class="space-y-4">
          <SkeletonLoader v-for="i in 5" :key="i" height="60px" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="transactions.length === 0" class="p-6">
        <EmptyState
          title="取引履歴がありません"
          description="まだコインの購入や使用がありません"
        >
          <BaseButton @click="showPurchaseModal = true">
            コインを購入する
          </BaseButton>
        </EmptyState>
      </div>

      <!-- Transaction List -->
      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-start space-x-4">
              <!-- Transaction Type Icon -->
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                :class="{
                  'bg-green-100 text-green-600': transaction.transaction_type === 'purchase',
                  'bg-red-100 text-red-600': transaction.transaction_type === 'spend',
                  'bg-blue-100 text-blue-600': transaction.transaction_type === 'refund',
                }"
              >
                <!-- Purchase Icon -->
                <svg
                  v-if="transaction.transaction_type === 'purchase'"
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                
                <!-- Spend Icon -->
                <svg
                  v-else-if="transaction.transaction_type === 'spend'"
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                
                <!-- Refund Icon -->
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                </svg>
              </div>

              <!-- Transaction Details -->
              <div class="flex-grow">
                <div class="flex items-center space-x-2">
                  <h3 class="font-medium text-gray-900 dark:text-gray-100">
                    {{ getTransactionTitle(transaction) }}
                  </h3>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': transaction.transaction_type === 'purchase',
                      'bg-red-100 text-red-800': transaction.transaction_type === 'spend',
                      'bg-blue-100 text-blue-800': transaction.transaction_type === 'refund',
                    }"
                  >
                    {{ getTransactionTypeLabel(transaction.transaction_type) }}
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ transaction.description || '説明なし' }}
                </p>
                
                <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ formatDate(transaction.created_at) }}</span>
                  <span>残高: {{ transaction.balance_after }} コイン</span>
                  <span v-if="transaction.square_payment_id">
                    支払いID: {{ transaction.square_payment_id }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Amount -->
            <div class="text-right">
              <div
                class="text-lg font-semibold"
                :class="{
                  'text-green-600': transaction.transaction_type === 'purchase',
                  'text-red-600': transaction.transaction_type === 'spend',
                  'text-blue-600': transaction.transaction_type === 'refund',
                }"
              >
                {{ transaction.transaction_type === 'purchase' ? '+' : '' }}{{ transaction.amount }} コイン
              </div>
              
              <!-- Receipt Link -->
              <div v-if="transaction.square_receipt_url" class="mt-1">
                <a
                  :href="transaction.square_receipt_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  レシートを表示
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !loading" class="p-6 border-t border-gray-200 dark:border-gray-700">
        <BaseButton
          variant="secondary"
          @click="loadMore"
          :loading="loadingMore"
          class="w-full"
        >
          {{ loadingMore ? '読み込み中...' : 'さらに読み込む' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { CoinApi } from '@/lib/coinApi'
import CoinBalance from '@/components/payment/CoinBalance.vue'
import CoinPurchaseModal from '@/components/payment/CoinPurchaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { CoinTransaction } from '@/types/coin'

const { addToast } = useToast()

const coinBalanceRef = ref()
const showPurchaseModal = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const transactions = ref<CoinTransaction[]>([])
const hasMore = ref(true)
const limit = 20

onMounted(async () => {
  await loadTransactions()
})

async function loadTransactions() {
  try {
    loading.value = true
    const data = await CoinApi.getCoinTransactions(limit)
    transactions.value = data
    hasMore.value = data.length === limit
  } catch (error) {
    console.error('Failed to load transactions:', error)
    addToast('取引履歴の読み込みに失敗しました', 'error')
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  try {
    loadingMore.value = true
    const offset = transactions.value.length
    const data = await CoinApi.getCoinTransactions(limit)
    
    // Note: This is a simplified implementation
    // In a real app, you'd need to implement proper pagination
    transactions.value = [...transactions.value, ...data]
    hasMore.value = data.length === limit
  } catch (error) {
    console.error('Failed to load more transactions:', error)
    addToast('追加の読み込みに失敗しました', 'error')
  } finally {
    loadingMore.value = false
  }
}

function handlePurchaseSuccess(newBalance: number) {
  // Refresh transaction history and balance
  loadTransactions()
  if (coinBalanceRef.value) {
    coinBalanceRef.value.refresh()
  }
  addToast('コインを購入しました', 'success')
}

function scrollToHistory() {
  const element = document.getElementById('transaction-history')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

function getTransactionTitle(transaction: CoinTransaction): string {
  switch (transaction.transaction_type) {
    case 'purchase':
      return 'コイン購入'
    case 'spend':
      return 'コイン使用'
    case 'refund':
      return 'コイン返金'
    default:
      return '不明な取引'
  }
}

function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'purchase':
      return '購入'
    case 'spend':
      return '使用'
    case 'refund':
      return '返金'
    default:
      return '不明'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
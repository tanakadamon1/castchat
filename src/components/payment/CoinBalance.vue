<template>
  <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"/>
          </svg>
        </div>
        <div>
          <div class="text-sm text-gray-600 dark:text-gray-400">コイン残高</div>
          <div class="font-semibold text-lg text-gray-900 dark:text-gray-100">{{ coinBalance }} コイン</div>
        </div>
      </div>
      
      <div class="flex space-x-2">
        <BaseButton
          variant="secondary"
          size="sm"
          @click="$emit('view-history')"
        >
          履歴
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          @click="$emit('purchase')"
        >
          購入
        </BaseButton>
      </div>
    </div>
    
    <!-- Recent Transactions -->
    <div v-if="recentTransactions.length > 0" class="mt-4 pt-4 border-t dark:border-gray-700">
      <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">最近の取引</h4>
      <div class="space-y-2">
        <div
          v-for="transaction in recentTransactions.slice(0, 3)"
          :key="transaction.id"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center space-x-2">
            <div
              class="w-2 h-2 rounded-full"
              :class="{
                'bg-green-500': transaction.transaction_type === 'purchase',
                'bg-red-500': transaction.transaction_type === 'spend',
                'bg-blue-500': transaction.transaction_type === 'refund',
              }"
            />
            <span class="text-gray-700 dark:text-gray-300">{{ transaction.description }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <span
              :class="{
                'text-green-600 dark:text-green-400': transaction.transaction_type === 'purchase',
                'text-red-600 dark:text-red-400': transaction.transaction_type === 'spend',
                'text-blue-600 dark:text-blue-400': transaction.transaction_type === 'refund',
              }"
            >
              {{ transaction.transaction_type === 'purchase' ? '+' : '' }}{{ transaction.amount }}
            </span>
            <span class="text-gray-500 dark:text-gray-400">コイン</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CoinBalance'
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CoinApi } from '@/lib/coinApi'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { CoinTransaction } from '@/types/coin'

const emit = defineEmits<{
  purchase: []
  'view-history': []
}>()

const coinBalance = ref(0)
const recentTransactions = ref<CoinTransaction[]>([])

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    const [balance, transactions] = await Promise.all([
      CoinApi.getCoinBalance(),
      CoinApi.getCoinTransactions(5),
    ])
    
    coinBalance.value = balance
    recentTransactions.value = transactions
  } catch (error) {
    console.error('Failed to load coin data:', error)
  }
}

// Expose refresh method for parent components
defineExpose({
  refresh: loadData,
})
</script>
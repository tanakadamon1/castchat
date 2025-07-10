<template>
  <BaseModal
    :show="show"
    @close="$emit('close')"
    title="コイン購入"
    size="lg"
  >
    <div class="space-y-6">
      <!-- Current Balance -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-gray-700">現在のコイン残高</span>
          <span class="font-semibold text-blue-600">{{ coinBalance }} コイン</span>
        </div>
      </div>

      <!-- Purchase Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="option in coinPurchaseOptions"
          :key="option.id"
          class="relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg"
          :class="{
            'border-blue-500 bg-blue-50': selectedOption?.id === option.id,
            'border-gray-200': selectedOption?.id !== option.id,
            'ring-2 ring-blue-500': option.popular,
          }"
          @click="selectedOption = option"
        >
          <!-- Popular Badge -->
          <div v-if="option.popular" class="absolute -top-2 -right-2">
            <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              人気
            </span>
          </div>

          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ option.coins }}</div>
            <div class="text-sm text-gray-600 mb-2">コイン</div>
            <div class="text-lg font-semibold text-blue-600">
              ¥{{ option.price.toLocaleString() }}
            </div>
            <div v-if="option.bonus" class="text-sm text-green-600 mt-1">
              ¥{{ option.bonus.toLocaleString() }} お得
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <div v-if="selectedOption" class="space-y-4">
        <div class="border-t pt-4">
          <h3 class="font-semibold text-gray-900 mb-3">お支払い方法</h3>
          
          <!-- Square Not Configured Warning -->
          <div v-if="!isSquareConfigured" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div>
                <h4 class="font-medium text-yellow-800">決済機能は現在無効です</h4>
                <p class="text-sm text-yellow-700 mt-1">
                  Square決済システムの設定が完了していません。管理者にお問い合わせください。
                </p>
              </div>
            </div>
          </div>
          
          <!-- Square Payment Form will be injected here -->
          <div v-else id="square-payment-form" class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600 mb-4">
                クレジットカード情報を入力してください
              </p>
              
              <!-- Card Number -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  カード番号
                </label>
                <div id="card-number" class="border rounded-lg p-3 min-h-[45px]"></div>
              </div>

              <!-- Expiry and CVV -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    有効期限
                  </label>
                  <div id="expiry-date" class="border rounded-lg p-3 min-h-[45px]"></div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <div id="cvv" class="border rounded-lg p-3 min-h-[45px]"></div>
                </div>
              </div>

              <!-- Postal Code -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  郵便番号
                </label>
                <div id="postal-code" class="border rounded-lg p-3 min-h-[45px]"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-700">コイン数</span>
            <span class="font-semibold">{{ selectedOption.coins }} コイン</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-700">合計金額</span>
            <span class="font-semibold text-lg">¥{{ selectedOption.price.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <BaseButton
            variant="secondary"
            @click="$emit('close')"
            :disabled="processing"
          >
            キャンセル
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="handlePayment"
            :disabled="!selectedOption || processing || !isSquareConfigured"
            :loading="processing"
            class="flex-1"
          >
            {{ processing ? '処理中...' : isSquareConfigured ? '購入する' : '決済機能無効' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { CoinApi, coinPurchaseOptions } from '@/lib/coinApi'
import { config } from '@/config/env'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { CoinPurchaseOption } from '@/types/coin'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  success: [balance: number]
}>()

const { addToast } = useToast()

const selectedOption = ref<CoinPurchaseOption | null>(null)
const processing = ref(false)
const coinBalance = ref(0)

// Check if Square is configured
const isSquareConfigured = ref(!!config.squareApplicationId)

// Square Web Payments SDK
let payments: any = null
let card: any = null

onMounted(async () => {
  await loadCoinBalance()
  await initializeSquarePayments()
})

onUnmounted(() => {
  if (card) {
    card.destroy()
  }
})

async function loadCoinBalance() {
  try {
    coinBalance.value = await CoinApi.getCoinBalance()
  } catch (error) {
    console.error('Failed to load coin balance:', error)
  }
}

async function initializeSquarePayments() {
  try {
    if (!config.squareApplicationId) {
      console.warn('Square Application ID not configured - payment disabled')
      return
    }

    // Load Square Web Payments SDK
    const script = document.createElement('script')
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'
    script.async = true
    
    script.onload = async () => {
      if (typeof window.Square === 'undefined') {
        throw new Error('Square Web Payments SDK failed to load')
      }

      payments = window.Square.payments(config.squareApplicationId, config.squareLocationId)
      
      // Initialize card payment method
      card = await payments.card()
      await card.attach('#card-number')
    }
    
    document.head.appendChild(script)
  } catch (error) {
    console.error('Failed to initialize Square payments:', error)
    addToast('決済システムの初期化に失敗しました', 'error')
  }
}

async function handlePayment() {
  if (!selectedOption.value || !card) return

  processing.value = true

  try {
    // Tokenize the card
    const result = await card.tokenize()
    
    if (result.status === 'OK') {
      // Process payment
      const paymentResult = await CoinApi.purchaseCoins({
        sourceId: result.token,
        amount: selectedOption.value.price,
        coinAmount: selectedOption.value.coins,
        locationId: config.squareLocationId || '',
      })

      if (paymentResult.success) {
        addToast(`${selectedOption.value.coins}コインを購入しました`, 'success')
        emit('success', paymentResult.coinBalance)
        emit('close')
      } else {
        throw new Error(paymentResult.error || 'Payment failed')
      }
    } else {
      throw new Error(result.errors?.[0]?.message || 'Card tokenization failed')
    }
  } catch (error) {
    console.error('Payment error:', error)
    addToast('決済に失敗しました', 'error')
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
#card-number,
#expiry-date,
#cvv,
#postal-code {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem;
  min-height: 45px;
}

#card-number:focus-within,
#expiry-date:focus-within,
#cvv:focus-within,
#postal-code:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
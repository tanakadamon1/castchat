<template>
  <BaseModal
    :show="show"
    @close="$emit('close')"
    title="コイン購入"
    size="lg"
    @opened="onModalOpened"
  >
    <div class="space-y-6">
      <!-- Current Balance -->
      <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-gray-700 dark:text-gray-300">現在のコイン残高</span>
          <span class="font-semibold text-blue-600 dark:text-blue-400">{{ coinBalance }} コイン</span>
        </div>
      </div>

      <!-- Purchase Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="option in coinPurchaseOptions"
          :key="option.id"
          class="relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg dark:border-gray-600"
          :class="{
            'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400': selectedOption?.id === option.id,
            'border-gray-200 dark:border-gray-600': selectedOption?.id !== option.id,
            'ring-2 ring-blue-500': option.popular,
          }"
          @click="selectedOption = option"
        >
          <!-- Popular Badge -->
          <div v-if="option.popular" class="absolute -top-2 -right-2">
            <span class="bg-blue-500 dark:bg-blue-600 text-white text-xs px-2 py-1 rounded-full"> 人気 </span>
          </div>

          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ option.coins }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">コイン</div>
            <div class="text-lg font-semibold text-blue-600 dark:text-blue-400">
              ¥{{ option.price.toLocaleString() }}
            </div>
            <div v-if="option.bonus" class="text-sm text-green-600 dark:text-green-400 mt-1">
              ¥{{ option.bonus.toLocaleString() }} お得
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <div v-show="selectedOption" class="space-y-4">
        <div class="border-t pt-4">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">お支払い方法</h3>

          <!-- Square Not Configured Warning -->
          <div
            v-if="!isSquareConfigured"
            class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div>
                <h4 class="font-medium text-yellow-800 dark:text-yellow-200">決済機能は現在無効です</h4>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Square決済システムの設定が完了していません。管理者にお問い合わせください。
                </p>
              </div>
            </div>
          </div>

          <!-- Square Payment Form will be injected here -->
          <div v-else class="space-y-4">
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">クレジットカード情報を入力してください</p>

              <!-- Square Card Input -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> カード情報 </label>
                <div id="card-number" class="square-card-container"></div>
                <div v-if="squareInitialized" class="text-xs text-green-600 dark:text-green-400 mt-1">
                  決済フォームが準備できました
                </div>
                <div v-else-if="squareError" class="text-xs text-red-600 dark:text-red-400 mt-1">
                  {{ squareError }}
                </div>
                <div v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">決済フォームを準備しています...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="safeSelectedOption" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-700 dark:text-gray-300">コイン数</span>
            <span class="font-semibold">{{ selectedCoins }} コイン</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-700 dark:text-gray-300">合計金額</span>
            <span class="font-semibold text-lg text-gray-900 dark:text-gray-100">¥{{ selectedPrice.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <BaseButton variant="secondary" @click="$emit('close')" :disabled="processing">
            キャンセル
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="handlePayment"
            :disabled="!safeSelectedOption || processing || !squareInitialized"
            :loading="processing"
            class="flex-1"
          >
            {{ processing ? '処理中...' : squareInitialized ? '購入する' : '準備中...' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script lang="ts">
export default {
  name: 'CoinPurchaseModal'
}
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
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
const squareInitialized = ref(false)
const squareError = ref('')
const initializationAttempts = ref(0)
const maxRetryAttempts = 5

// Check if Square is configured
const isSquareConfigured = ref(!!config.squareApplicationId)

// Square configuration loaded

// Computed properties for safe access
const safeSelectedOption = computed(() => {
  return selectedOption.value || null
})

const selectedCoins = computed(() => {
  return safeSelectedOption.value?.coins || 0
})

const selectedPrice = computed(() => {
  return safeSelectedOption.value?.price || 0
})

// Square Web Payments SDK
declare global {
  interface Window {
    Square: any // Square公式SDK型がなければanyで許容
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let payments: any = null,
  card: any = null // Square SDK型がなければanyで許容
let isInitializing = false

onMounted(async () => {
  await loadCoinBalance()
})

onUnmounted(() => {
  cleanupSquare()
})

// モーダルが完全に表示されたタイミングでSquare初期化
function onModalOpened() {
  if (props.show && safeSelectedOption.value && isSquareConfigured.value && !squareInitialized.value) {
    cleanupSquare()
    setTimeout(() => {
      initializeSquareWithRetry()
    }, 100)
  }
}

// モーダルが閉じられたときはクリーンアップ
watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) {
      cleanupSquare()
    }
  },
)

// 支払いオプション選択時の処理
watch(() => safeSelectedOption.value, async (newOption) => {
  if (newOption && props.show && isSquareConfigured.value && !squareInitialized.value) {
    await nextTick()
    
    // カード入力エリアが表示されるまで少し待機
    setTimeout(async () => {
      if (!squareInitialized.value && initializationAttempts.value < maxRetryAttempts) {
        await initializeSquareWithRetry()
      }
    }, 200)
  }
})

async function loadCoinBalance() {
  try {
    coinBalance.value = await CoinApi.getCoinBalance()
  } catch (error) {
    console.error('Failed to load coin balance:', error)
  }
}

// 初期化状態のリセット
function resetSquareState() {
  squareInitialized.value = false
  squareError.value = ''
  initializationAttempts.value = 0
  isInitializing = false
}

// Squareのクリーンアップ
function cleanupSquare() {
  try {
    if (card && typeof card.destroy === 'function') {
      card.destroy()
      card = null
    }
    payments = null
    resetSquareState()
  } catch (error) {
    console.warn('Error during Square cleanup:', error)
    // エラーが発生してもリセットは実行
    card = null
    payments = null
    resetSquareState()
  }
}

// リトライ機能付きのSquare初期化
async function initializeSquareWithRetry() {
  if (isInitializing) {
    return
  }

  if (initializationAttempts.value >= maxRetryAttempts) {
    console.error('❌ Maximum retry attempts reached for Square initialization')
    squareError.value = `決済システムの初期化に失敗しました（${maxRetryAttempts}回試行）`
    return
  }

  initializationAttempts.value++
  isInitializing = true

  try {
    await initializeSquarePayments()
  } catch (error) {
    console.error(`❌ Square initialization attempt ${initializationAttempts.value} failed:`, error)

    if (initializationAttempts.value < maxRetryAttempts) {
      setTimeout(async () => {
        isInitializing = false
        await initializeSquareWithRetry()
      }, 1000)
    } else {
      squareError.value = '決済システムの初期化に失敗しました。ページを再読み込みしてください。'
      addToast('決済システムの初期化に失敗しました', 'error')
    }
  } finally {
    if (initializationAttempts.value >= maxRetryAttempts || squareInitialized.value) {
      isInitializing = false
    }
  }
}

// Square決済システムの初期化（メイン処理）
async function initializeSquarePayments() {
  if (!config.squareApplicationId) {
    throw new Error('Square Application ID not configured')
  }

  // 1. DOM要素の確認
  const cardElement = await waitForElement('card-number', 5000)
  if (!cardElement) {
    throw new Error('Card input element not found or not visible')
  }

  // 2. Square SDKの読み込み
  await loadSquareSDK()

  if (typeof window.Square === 'undefined') {
    throw new Error('Square SDK failed to load')
  }

  // 3. Square Paymentsの初期化

  if (!config.squareLocationId) {
    throw new Error('Square Location ID is not configured')
  }

  try {
    payments = window.Square.payments(config.squareApplicationId, config.squareLocationId)
  } catch (paymentsError: unknown) {
    console.error('❌ Failed to create Square payments object:', paymentsError)
    throw new Error(`Square payments initialization failed: ${paymentsError instanceof Error ? paymentsError.message : 'Unknown error'}`)
  }

  // 4. カードコンポーネントの作成（詳細なオプション）
  try {
    card = await payments.card({
      style: {
        input: {
          color: '#374151',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal',
        },
        '.input-container': {
          borderRadius: '6px',
          borderWidth: '1px',
          borderColor: '#d1d5db',
        },
        '.input-container.is-focus': {
          borderColor: '#3b82f6',
        },
        '.input-container.is-error': {
          borderColor: '#ef4444',
        },
        '.message-text': {
          color: '#6b7280',
        },
        '.message-text.is-error': {
          color: '#ef4444',
        },
      },
    })
  } catch (cardError: unknown) {
    console.error('❌ Failed to create Square card component:', cardError)
    throw new Error(`Card component creation failed: ${cardError instanceof Error ? cardError.message : 'Unknown error'}`)
  }

  // 5. カードコンポーネントのアタッチ
  try {
    await card.attach('#card-number')
    
    // カード状態の監視
    card.addEventListener('cardBrandChanged', () => {
      // Card brand recognition
    })
    
    card.addEventListener('errorClassAdded', () => {
      // Card error handling
    })
    
    card.addEventListener('errorClassRemoved', () => {
      // Card error cleared
    })
  } catch (attachError: unknown) {
    console.error('❌ Failed to attach card to DOM:', attachError)
    throw new Error(`Card attachment failed: ${attachError instanceof Error ? attachError.message : 'Unknown error'}`)
  }

  // 6. 初期化完了
  squareInitialized.value = true
  squareError.value = ''
}

// DOM要素が表示されるまで待機する関数
async function waitForElement(
  elementId: string,
  timeout: number = 5000,
): Promise<HTMLElement | null> {
  const startTime = Date.now()
  const checkInterval = 100

  while (Date.now() - startTime < timeout) {
    const element = document.getElementById(elementId)
    if (element) {
      // 要素が存在するかチェック
      try {
        // Style access for debugging purposes only
      } catch (styleError) {
        console.warn(`   Could not access style properties:`, styleError)
      }
      
      // DOM要素が存在すれば可視性に関係なく成功とする
      return element
    }
    
    await new Promise((resolve) => setTimeout(resolve, checkInterval))
  }

  console.error(`❌ Element #${elementId} not found after ${timeout}ms`)
  return null
}

function loadSquareSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 既に読み込まれている場合
    if (typeof window.Square !== 'undefined') {
      resolve()
      return
    }

    // 既にスクリプトタグがある場合
    const existingScript = document.head.querySelector('script[src*="square.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', reject)
      return
    }

    const script = document.createElement('script')
    // 環境に応じてSquare SDKのURLを選択
    const isProduction = import.meta.env.VITE_SQUARE_ENVIRONMENT === 'production'
    script.src = isProduction 
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js'
    script.async = true

    script.onload = () => {
      resolve()
    }

    script.onerror = () => {
      console.error('Failed to load Square SDK')
      reject(new Error('Failed to load Square SDK'))
    }

    document.head.appendChild(script)
  })
}

async function handlePayment() {
  if (!safeSelectedOption.value || !card) {
    console.error('Payment prerequisites not met:', { 
      hasSelectedOption: !!safeSelectedOption.value, 
      hasCard: !!card,
      selectedOption: safeSelectedOption.value
    })
    addToast('決済の準備ができていません', 'error')
    return
  }

  processing.value = true

  try {
    // Tokenize the card
    const result = await card.tokenize()

    if (result.status === 'OK') {
      // Process payment
      const paymentResult = await CoinApi.purchaseCoins({
        sourceId: result.token,
        amount: safeSelectedOption.value.price,
        coinAmount: safeSelectedOption.value.coins,
      })

      if (paymentResult.success) {
        addToast(`${safeSelectedOption.value.coins}コインを購入しました`, 'success')
        emit('success', paymentResult.coinBalance)
        emit('close')
      } else {
        throw new Error(paymentResult.error || 'Payment failed')
      }
    } else {
      throw new Error(result.errors?.[0]?.message || 'Card tokenization failed')
    }
  } catch (error: unknown) {
    console.error('Payment error:', error)
    
    // エラーの種類に応じた詳細なメッセージ
    let errorMessage = '決済に失敗しました'
    
    if (error instanceof Error) {
      if (error.message.includes('refund')) {
        errorMessage = '決済は処理されましたが、システムエラーにより返金されました。再度お試しください。'
      } else if (error.message.includes('Critical payment error')) {
        errorMessage = '決済処理中に重大なエラーが発生しました。サポートまでご連絡ください。'
      } else if (error.message.includes('Card tokenization failed')) {
        errorMessage = 'カード情報の処理に失敗しました。カード情報を確認してください。'
      } else if (error.message.includes('Payment processing failed')) {
        errorMessage = '決済処理中にエラーが発生しました。時間をおいて再度お試しください。'
      } else if (error.message.includes('configuration')) {
        errorMessage = 'システム設定エラーです。管理者にお問い合わせください。'
      }
    }
    
    addToast(errorMessage, 'error')
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
/* Square Card Container - Squareの公式推奨スタイル */
.square-card-container {
  min-height: 200px;
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background-color: #ffffff;
  position: relative;
  box-sizing: border-box;
}

/* ダークモード対応 */
:deep(.dark) .square-card-container {
  border-color: #4b5563;
  background-color: #1f2937;
}

.square-card-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* Square SDK内のスタイル調整 */
.square-card-container :deep(iframe) {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  background: transparent !important;
}

/* 読み込み中の表示 */
.square-card-container:empty::before {
  content: '決済フォームを準備しています...';
  color: #6b7280;
  font-size: 14px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>

<template>
  <BaseModal
    :show="show"
    @close="$emit('close')"
    title="優先表示設定"
    size="md"
  >
    <div class="space-y-4">
      <div class="text-center">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">投稿を優先表示しますか？</h3>
        <p class="text-sm text-gray-600 mt-2">
          1コインで24時間、あなたの投稿を一覧の上部に表示します
        </p>
      </div>

      <!-- Current Balance -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-gray-700">現在のコイン残高</span>
          <span class="font-semibold text-blue-600">{{ coinBalance }} コイン</span>
        </div>
      </div>

      <!-- Priority Features -->
      <div class="space-y-3">
        <h4 class="font-medium text-gray-900">優先表示の効果</h4>
        <div class="space-y-2">
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div class="text-sm text-gray-600">
              投稿一覧の上部に24時間固定表示
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div class="text-sm text-gray-600">
              「優先」バッジが表示され、注目度アップ
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div class="text-sm text-gray-600">
              より多くの応募者にアピールできます
            </div>
          </div>
        </div>
      </div>

      <!-- Cost -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-gray-700">優先表示料金</span>
          <span class="font-semibold text-blue-600">1 コイン / 24時間</span>
        </div>
      </div>

      <!-- Insufficient Balance Warning -->
      <div v-if="coinBalance < 1" class="bg-red-50 p-4 rounded-lg">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span class="text-sm text-red-700">
            コイン残高が不足しています。コインを購入してください。
          </span>
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
          v-if="coinBalance < 1"
          variant="primary"
          @click="$emit('purchase-coins')"
          :disabled="processing"
          class="flex-1"
        >
          コイン購入
        </BaseButton>
        <BaseButton
          v-else
          variant="primary"
          @click="enablePriorityDisplay"
          :disabled="processing"
          :loading="processing"
          class="flex-1"
        >
          {{ processing ? '処理中...' : '優先表示を有効にする' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { CoinApi } from '@/lib/coinApi'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  show: boolean
  postId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  success: []
  'purchase-coins': []
}>()

const { addToast } = useToast()

const processing = ref(false)
const coinBalance = ref(0)

onMounted(async () => {
  await loadCoinBalance()
})

async function loadCoinBalance() {
  try {
    coinBalance.value = await CoinApi.getCoinBalance()
  } catch (error) {
    console.error('Failed to load coin balance:', error)
  }
}

async function enablePriorityDisplay() {
  processing.value = true

  try {
    await CoinApi.enablePriorityDisplay(props.postId)
    addToast('優先表示を有効にしました', 'success')
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Failed to enable priority display:', error)
    addToast('優先表示の設定に失敗しました', 'error')
  } finally {
    processing.value = false
  }
}
</script>
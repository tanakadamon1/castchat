<template>
  <div class="flex items-end space-x-3">
    <!-- 画像添付ボタン -->
    <button
      type="button"
      @click="fileInput?.click()"
      class="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
      :disabled="loading || uploadingFile"
    >
      <LoadingSpinner v-if="uploadingFile" size="sm" />
      <ImageIcon v-else class="w-5 h-5" />
    </button>
    
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileChange"
      class="hidden"
    />

    <!-- メッセージ入力エリア -->
    <div class="flex-1 min-w-0">
      <div class="relative">
        <textarea
          v-model="message"
          @keydown="handleKeydown"
          placeholder="メッセージを入力..."
          rows="1"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
          :disabled="loading"
          :style="{ height: textareaHeight }"
        />
        
        <!-- 文字数カウンター -->
        <div class="absolute right-2 bottom-1 text-xs text-gray-400">
          {{ message.length }}/{{ maxLength }}
        </div>
      </div>
    </div>

    <!-- 送信ボタン -->
    <button
      type="button"
      @click="handleSend"
      :disabled="!canSend"
      class="flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="loading">
        <LoadingSpinner size="sm" class="mr-1" />
        送信中
      </span>
      <span v-else>
        送信
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ImageIcon } from 'lucide-vue-next'
import { uploadMessageImage } from '@/lib/imageUpload'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

interface Props {
  modelValue: string
  loading?: boolean
  maxLength?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'fileSelect', file: File): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  maxLength: 1000
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement>()
const textareaHeight = ref('auto')
const uploadingFile = ref(false)

const message = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const canSend = computed(() => {
  return !props.loading && 
         message.value.trim().length > 0 && 
         message.value.length <= props.maxLength
})

// 自動リサイズ
const adjustTextareaHeight = async () => {
  await nextTick()
  const textarea = document.querySelector('textarea')
  if (textarea) {
    textarea.style.height = 'auto'
    const scrollHeight = Math.min(textarea.scrollHeight, 120) // 最大120px
    textarea.style.height = scrollHeight + 'px'
    textareaHeight.value = scrollHeight + 'px'
  }
}

// メッセージ変更時に高さ調整
watch(message, adjustTextareaHeight)

// キーダウン処理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (canSend.value) {
      handleSend()
    }
  }
}

// 送信処理
const handleSend = () => {
  if (canSend.value) {
    emit('send')
  }
}

// ファイル選択処理
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!authStore.user?.id) {
    alert('ログインが必要です')
    return
  }
  
  // ファイルサイズチェック (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('ファイルサイズが5MBを超えています')
    return
  }
  
  // 画像ファイルかチェック
  if (!file.type.startsWith('image/')) {
    alert('画像ファイルのみアップロード可能です')
    return
  }
  
  uploadingFile.value = true
  
  try {
    const result = await uploadMessageImage(file, authStore.user.id)
    
    if (result.error) {
      alert(result.error)
      return
    }
    
    if (result.data) {
      emit('fileSelect', file)
      // 画像URLをメッセージに挿入（オプション）
      // message.value += `\n![画像](${result.data.url})`
    }
  } catch (err) {
    console.error('Image upload error:', err)
    alert('画像のアップロードに失敗しました')
  } finally {
    uploadingFile.value = false
    // inputをリセット
    target.value = ''
  }
}
</script>
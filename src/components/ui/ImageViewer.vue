<template>
  <BaseModal :show="show" @close="$emit('close')" size="full">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          画像ビューア ({{ currentIndex + 1 }} / {{ images.length }})
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>
    </template>

    <div class="relative">
      <!-- メイン画像 -->
      <div class="flex justify-center items-center min-h-96 bg-gray-100 rounded-lg">
        <img
          :src="currentImage"
          :alt="`画像 ${currentIndex + 1}`"
          class="max-w-full max-h-[60vh] object-contain rounded-lg"
        />
      </div>

      <!-- ナビゲーションボタン -->
      <button
        v-if="images.length > 1 && currentIndex > 0"
        @click="previousImage"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <button
        v-if="images.length > 1 && currentIndex < images.length - 1"
        @click="nextImage"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>

    <!-- サムネイル -->
    <div v-if="images.length > 1" class="mt-4">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="currentIndex = index"
          class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
          :class="index === currentIndex ? 'border-indigo-500' : 'border-transparent'"
        >
          <img :src="image" :alt="`サムネイル ${index + 1}`" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">キーボード: ← → で画像を切り替え、ESCで閉じる</div>

        <div class="flex gap-2">
          <button
            @click="downloadImage"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download class="w-4 h-4 mr-2" />
            ダウンロード
          </button>

          <button
            @click="$emit('close')"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
export default {
  name: 'ImageViewer'
}
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'

interface Props {
  show: boolean
  images: string[]
  initialIndex?: number
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
})

const emit = defineEmits<Emits>()

const currentIndex = ref(props.initialIndex)

const currentImage = computed(() => {
  return props.images[currentIndex.value] || ''
})

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const downloadImage = async () => {
  try {
    const response = await fetch(currentImage.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `image-${currentIndex.value + 1}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download image:', error)
  }
}

// キーボードショートカット
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.show) return

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      previousImage()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextImage()
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

// プロップス変更時にインデックスをリセット
watch(
  () => props.initialIndex,
  (newIndex) => {
    currentIndex.value = newIndex
  },
)

watch(
  () => props.show,
  (show) => {
    if (show) {
      currentIndex.value = props.initialIndex
    }
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

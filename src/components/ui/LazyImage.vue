<template>
  <div 
    class="relative overflow-hidden"
    :class="containerClass"
  >
    <img
      :ref="(el) => setImageRef(el as HTMLImageElement, src)"
      :src="currentSrc"
      :alt="alt"
      :class="[
        'transition-opacity duration-300',
        imageClass,
        isLoaded ? 'opacity-100' : 'opacity-70'
      ]"
      :loading="eager ? 'eager' : 'lazy'"
      @load="onLoad"
      @error="onError"
    />
    
    <!-- ローディングスピナー -->
    <div
      v-if="!isLoaded && !isError && showLoader"
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
    
    <!-- エラー表示 -->
    <div
      v-if="isError && showError"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500"
    >
      <ImageOff class="w-8 h-8 mb-2" />
      <span class="text-sm">画像を読み込めません</span>
    </div>
    
    <!-- フェードイン効果用のオーバーレイ -->
    <div
      v-if="!isLoaded && !isError"
      class="absolute inset-0 bg-gray-200 animate-pulse"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ImageOff } from 'lucide-vue-next'
import { useLazyImage } from '@/composables/useLazyImage'

interface Props {
  src: string
  alt: string
  eager?: boolean
  showLoader?: boolean
  showError?: boolean
  placeholder?: string
  fallback?: string
  containerClass?: string
  imageClass?: string
  rootMargin?: string
  threshold?: number
}

interface Emits {
  (e: 'load'): void
  (e: 'error'): void
}

const props = withDefaults(defineProps<Props>(), {
  eager: false,
  showLoader: true,
  showError: true,
  containerClass: '',
  imageClass: 'w-full h-full object-cover',
  rootMargin: '50px',
  threshold: 0.1
})

const emit = defineEmits<Emits>()

const { isLoaded, isError, currentSrc, setImageRef } = useLazyImage({
  rootMargin: props.rootMargin,
  threshold: props.threshold,
  placeholder: props.placeholder,
  fallback: props.fallback
})

const onLoad = () => {
  emit('load')
}

const onError = () => {
  emit('error')
}
</script>
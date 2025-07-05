import { ref, onMounted, onUnmounted } from 'vue'

export interface LazyImageOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  placeholder?: string
  fallback?: string
}

export function useLazyImage(options: LazyImageOptions = {}) {
  const {
    root = null,
    rootMargin = '50px',
    threshold = 0.1,
    placeholder = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f3f4f6%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-size%3D%2216%22%3E読み込み中...%3C/text%3E%3C/svg%3E',
    fallback = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f3f4f6%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ef4444%22%20font-size%3D%2216%22%3E画像を読み込めません%3C/text%3E%3C/svg%3E'
  } = options

  const isLoaded = ref(false)
  const isError = ref(false)
  const currentSrc = ref(placeholder)
  const imageRef = ref<HTMLImageElement>()
  
  let observer: IntersectionObserver | null = null

  const loadImage = (src: string) => {
    if (!src || src === placeholder) return

    const img = new Image()
    
    img.onload = () => {
      currentSrc.value = src
      isLoaded.value = true
      isError.value = false
    }
    
    img.onerror = (event) => {
      console.error('useLazyImage: Failed to load image:', src, event)
      console.error('useLazyImage: Image element:', img)
      currentSrc.value = fallback
      isLoaded.value = false
      isError.value = true
    }
    
    img.src = src
  }

  const setupObserver = (src: string) => {
    if (!('IntersectionObserver' in window)) {
      // フォールバック: Intersection Observer をサポートしていない場合は即座に読み込み
      loadImage(src)
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(src)
            if (observer && imageRef.value) {
              observer.unobserve(imageRef.value)
            }
          }
        })
      },
      {
        root,
        rootMargin,
        threshold
      }
    )

    if (imageRef.value) {
      observer.observe(imageRef.value)
    }
  }

  const setImageRef = (el: HTMLImageElement | null, src: string) => {
    if (el) {
      imageRef.value = el
      setupObserver(src)
    }
  }

  onUnmounted(() => {
    if (observer && imageRef.value) {
      observer.unobserve(imageRef.value)
      observer.disconnect()
    }
  })

  return {
    isLoaded,
    isError,
    currentSrc,
    setImageRef,
    loadImage
  }
}

// プリロード機能付きの遅延読み込み
export function useLazyImageWithPreload(src: string, options: LazyImageOptions = {}) {
  const { isLoaded, isError, currentSrc, setImageRef } = useLazyImage(options)
  
  // 優先度の高い画像のプリロード
  const preloadImage = (priority: 'high' | 'low' = 'low') => {
    if (!src || isLoaded.value) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high')
    }
    document.head.appendChild(link)

    // リンクを後でクリーンアップ
    setTimeout(() => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }, 10000)
  }

  return {
    isLoaded,
    isError,
    currentSrc,
    setImageRef,
    preloadImage
  }
}
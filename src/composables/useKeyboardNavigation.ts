import { ref, onMounted, onUnmounted, Ref } from 'vue'

export interface KeyboardNavigationOptions {
  loop?: boolean
  skipDisabled?: boolean
  autoFocus?: boolean
  focusableSelector?: string
}

export function useKeyboardNavigation(
  containerRef: Ref<HTMLElement | null>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    loop = true,
    skipDisabled = true,
    autoFocus = false,
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  } = options

  const currentIndex = ref(-1)
  const focusableElements = ref<HTMLElement[]>([])

  const updateFocusableElements = () => {
    if (!containerRef.value) return
    
    const elements = Array.from(
      containerRef.value.querySelectorAll(focusableSelector)
    ) as HTMLElement[]
    
    focusableElements.value = skipDisabled 
      ? elements.filter(el => !el.hasAttribute('disabled') && !el.hasAttribute('aria-disabled'))
      : elements
  }

  const focusElement = (index: number) => {
    if (index < 0 || index >= focusableElements.value.length) return
    
    const element = focusableElements.value[index]
    element?.focus()
    currentIndex.value = index
    
    // ARIAライブリージョンで現在位置を通知
    announcePosition(index)
  }

  const announcePosition = (index: number) => {
    const element = focusableElements.value[index]
    if (!element) return

    // aria-live要素が存在しない場合は作成
    let liveRegion = document.querySelector('#keyboard-nav-announcer') as HTMLElement
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'keyboard-nav-announcer'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      document.body.appendChild(liveRegion)
    }

    // 要素の説明を取得
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('title') || 
                  element.textContent?.trim() || 
                  '要素'

    liveRegion.textContent = `${index + 1} / ${focusableElements.value.length}: ${label}`
  }

  const moveToNext = () => {
    updateFocusableElements()
    
    if (focusableElements.value.length === 0) return
    
    let nextIndex = currentIndex.value + 1
    
    if (nextIndex >= focusableElements.value.length) {
      nextIndex = loop ? 0 : focusableElements.value.length - 1
    }
    
    focusElement(nextIndex)
  }

  const moveToPrevious = () => {
    updateFocusableElements()
    
    if (focusableElements.value.length === 0) return
    
    let prevIndex = currentIndex.value - 1
    
    if (prevIndex < 0) {
      prevIndex = loop ? focusableElements.value.length - 1 : 0
    }
    
    focusElement(prevIndex)
  }

  const moveToFirst = () => {
    updateFocusableElements()
    if (focusableElements.value.length > 0) {
      focusElement(0)
    }
  }

  const moveToLast = () => {
    updateFocusableElements()
    if (focusableElements.value.length > 0) {
      focusElement(focusableElements.value.length - 1)
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey } = event

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        moveToNext()
        break
        
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        moveToPrevious()
        break
        
      case 'Home':
        if (ctrlKey) {
          event.preventDefault()
          moveToFirst()
        }
        break
        
      case 'End':
        if (ctrlKey) {
          event.preventDefault()
          moveToLast()
        }
        break
        
      case 'Tab':
        // Tabキーでのナビゲーションは標準動作に任せる
        break
        
      default:
        // 文字キーでの検索
        if (!ctrlKey && !altKey && key.length === 1) {
          searchByKey(key.toLowerCase())
        }
        break
    }
  }

  const searchByKey = (key: string) => {
    updateFocusableElements()
    
    const startIndex = Math.max(0, currentIndex.value)
    
    // 現在位置より後を検索
    for (let i = startIndex + 1; i < focusableElements.value.length; i++) {
      const element = focusableElements.value[i]
      const text = (element.textContent || element.getAttribute('aria-label') || '').toLowerCase()
      
      if (text.startsWith(key)) {
        focusElement(i)
        return
      }
    }
    
    // 見つからない場合は最初から現在位置まで検索
    for (let i = 0; i <= startIndex; i++) {
      const element = focusableElements.value[i]
      const text = (element.textContent || element.getAttribute('aria-label') || '').toLowerCase()
      
      if (text.startsWith(key)) {
        focusElement(i)
        return
      }
    }
  }

  const getCurrentElement = () => {
    return focusableElements.value[currentIndex.value] || null
  }

  const setFocusableElements = (elements: HTMLElement[]) => {
    focusableElements.value = elements
    currentIndex.value = -1
  }

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('keydown', handleKeydown)
      updateFocusableElements()
      
      if (autoFocus && focusableElements.value.length > 0) {
        focusElement(0)
      }
    }
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('keydown', handleKeydown)
    }
    
    // ライブリージョンのクリーンアップ
    const liveRegion = document.querySelector('#keyboard-nav-announcer')
    if (liveRegion) {
      liveRegion.remove()
    }
  })

  return {
    currentIndex,
    focusableElements,
    moveToNext,
    moveToPrevious,
    moveToFirst,
    moveToLast,
    focusElement,
    getCurrentElement,
    updateFocusableElements,
    setFocusableElements
  }
}
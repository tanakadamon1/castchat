import { ref, computed, watch, onMounted } from 'vue'

export type ColorScheme = 'light' | 'dark' | 'auto'
export type ContrastLevel = 'normal' | 'high' | 'maximum'

interface ColorContrastState {
  scheme: ColorScheme
  contrast: ContrastLevel
  reducedMotion: boolean
}

export function useColorContrast() {
  const state = ref<ColorContrastState>({
    scheme: 'auto',
    contrast: 'normal',
    reducedMotion: false
  })

  // システム設定の検出
  const detectSystemPreferences = () => {
    if (typeof window === 'undefined') return

    // ダークモード検出
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    // ハイコントラスト検出
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    // モーション削減検出
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    return {
      isDarkMode: darkModeQuery.matches,
      isHighContrast: highContrastQuery.matches,
      isReducedMotion: reducedMotionQuery.matches
    }
  }

  // システム設定の監視
  const watchSystemPreferences = () => {
    if (typeof window === 'undefined') return

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateFromSystem = () => {
      const prefs = detectSystemPreferences()
      if (prefs) {
        if (state.value.scheme === 'auto') {
          applyColorScheme(prefs.isDarkMode ? 'dark' : 'light')
        }
        
        if (prefs.isHighContrast && state.value.contrast === 'normal') {
          setContrastLevel('high')
        }
        
        state.value.reducedMotion = prefs.isReducedMotion
        applyReducedMotion(prefs.isReducedMotion)
      }
    }

    darkModeQuery.addEventListener('change', updateFromSystem)
    highContrastQuery.addEventListener('change', updateFromSystem)
    reducedMotionQuery.addEventListener('change', updateFromSystem)

    return () => {
      darkModeQuery.removeEventListener('change', updateFromSystem)
      highContrastQuery.removeEventListener('change', updateFromSystem)
      reducedMotionQuery.removeEventListener('change', updateFromSystem)
    }
  }

  // カラースキームの適用
  const applyColorScheme = (scheme: 'light' | 'dark') => {
    const root = document.documentElement
    
    if (scheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }

  // コントラストレベルの設定
  const setContrastLevel = (level: ContrastLevel) => {
    const root = document.documentElement
    
    // 既存のコントラストクラスを削除
    root.classList.remove('contrast-normal', 'contrast-high', 'contrast-maximum')
    
    // 新しいコントラストクラスを追加
    root.classList.add(`contrast-${level}`)
    
    state.value.contrast = level
    savePreferences()
  }

  // カラースキームの設定
  const setColorScheme = (scheme: ColorScheme) => {
    state.value.scheme = scheme
    
    if (scheme === 'auto') {
      const prefs = detectSystemPreferences()
      applyColorScheme(prefs?.isDarkMode ? 'dark' : 'light')
    } else {
      applyColorScheme(scheme)
    }
    
    savePreferences()
  }

  // モーション削減の適用
  const applyReducedMotion = (reduce: boolean) => {
    const root = document.documentElement
    
    if (reduce) {
      root.classList.add('motion-reduce')
    } else {
      root.classList.remove('motion-reduce')
    }
  }

  // 計算されたプロパティ
  const currentScheme = computed(() => {
    if (state.value.scheme === 'auto') {
      const prefs = detectSystemPreferences()
      return prefs?.isDarkMode ? 'dark' : 'light'
    }
    return state.value.scheme
  })

  const isDarkMode = computed(() => currentScheme.value === 'dark')
  const isHighContrast = computed(() => state.value.contrast !== 'normal')

  // カラーコントラスト計算
  const calculateContrast = (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      // RGB値を取得（簡略化版）
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255

      // 相対輝度計算
      const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
      const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
      const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

      return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB
    }

    const l1 = getLuminance(color1)
    const l2 = getLuminance(color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  // コントラスト比の検証
  const validateContrast = (
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): { valid: boolean; ratio: number; required: number } => {
    const ratio = calculateContrast(foreground, background)
    const required = level === 'AAA' ? 7 : 4.5

    return {
      valid: ratio >= required,
      ratio: Math.round(ratio * 100) / 100,
      required
    }
  }

  // 設定の保存
  const savePreferences = () => {
    const preferences = {
      scheme: state.value.scheme,
      contrast: state.value.contrast,
      reducedMotion: state.value.reducedMotion
    }
    
    localStorage.setItem('color-preferences', JSON.stringify(preferences))
  }

  // 設定の読み込み
  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('color-preferences')
      if (saved) {
        const preferences = JSON.parse(saved)
        state.value = { ...state.value, ...preferences }
        
        setColorScheme(preferences.scheme)
        setContrastLevel(preferences.contrast)
        applyReducedMotion(preferences.reducedMotion)
      }
    } catch (error) {
      console.warn('Failed to load color preferences:', error)
    }
  }

  // アクセシビリティに優しい色の提案
  const suggestAccessibleColor = (
    baseColor: string,
    backgroundColor: string,
    targetLevel: 'AA' | 'AAA' = 'AA'
  ): string => {
    // 簡略化された実装
    // 実際の実装では、より詳細な色調整が必要
    const contrast = calculateContrast(baseColor, backgroundColor)
    const required = targetLevel === 'AAA' ? 7 : 4.5
    
    if (contrast >= required) {
      return baseColor
    }
    
    // ここでは黒または白を返す簡略化された実装
    const whiteContrast = calculateContrast('#ffffff', backgroundColor)
    const blackContrast = calculateContrast('#000000', backgroundColor)
    
    return whiteContrast > blackContrast ? '#ffffff' : '#000000'
  }

  onMounted(() => {
    loadPreferences()
    const cleanup = watchSystemPreferences()
    
    return cleanup
  })

  // 状態変更の監視
  watch(
    () => state.value.reducedMotion,
    (newValue) => applyReducedMotion(newValue),
    { immediate: true }
  )

  return {
    state,
    currentScheme,
    isDarkMode,
    isHighContrast,
    setColorScheme,
    setContrastLevel,
    calculateContrast,
    validateContrast,
    suggestAccessibleColor,
    savePreferences,
    loadPreferences
  }
}

// グローバルなカラーコントラスト管理
let globalColorContrast: ReturnType<typeof useColorContrast> | null = null

export function getGlobalColorContrast() {
  if (!globalColorContrast) {
    globalColorContrast = useColorContrast()
  }
  return globalColorContrast
}
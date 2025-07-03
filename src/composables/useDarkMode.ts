import { ref, computed, watchEffect } from 'vue'

// ダークモード設定の型定義
export type DarkModePreference = 'light' | 'dark' | 'system'

// ローカルストレージのキー
const DARK_MODE_KEY = 'castchat-dark-mode'

// グローバル状態
const isDarkMode = ref(false)
const preference = ref<DarkModePreference>('system')

// システムのダークモード設定を取得
const getSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// ローカルストレージから設定を読み込み
const loadPreference = (): DarkModePreference => {
  if (typeof window === 'undefined') return 'system'
  
  const stored = localStorage.getItem(DARK_MODE_KEY)
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored as DarkModePreference
  }
  return 'system'
}

// ローカルストレージに設定を保存
const savePreference = (pref: DarkModePreference): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(DARK_MODE_KEY, pref)
}

// ダークモードのCSSクラスを適用/削除
const applyDarkMode = (dark: boolean): void => {
  if (typeof window === 'undefined') return
  
  const html = document.documentElement
  const body = document.body
  
  if (dark) {
    html.classList.add('dark')
    body.classList.add('dark-mode')
  } else {
    html.classList.remove('dark')
    body.classList.remove('dark-mode')
  }
  
  // メタテーマカラーの更新
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', dark ? '#1F2937' : '#6366f1')
  }
}

// 実際のダークモード状態を計算
const calculateDarkMode = (pref: DarkModePreference): boolean => {
  switch (pref) {
    case 'dark':
      return true
    case 'light':
      return false
    case 'system':
    default:
      return getSystemDarkMode()
  }
}

// システムのカラースキーム変更を監視
let mediaQueryList: MediaQueryList | null = null

const setupSystemListener = (): void => {
  if (typeof window === 'undefined') return
  
  mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (): void => {
    if (preference.value === 'system') {
      const newDarkMode = getSystemDarkMode()
      isDarkMode.value = newDarkMode
      applyDarkMode(newDarkMode)
    }
  }
  
  // モダンブラウザ
  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener('change', handleChange)
  } else {
    // レガシーブラウザサポート
    mediaQueryList.addListener(handleChange)
  }
}

const removeSystemListener = (): void => {
  if (!mediaQueryList) return
  
  const handleChange = (): void => {
    if (preference.value === 'system') {
      const newDarkMode = getSystemDarkMode()
      isDarkMode.value = newDarkMode
      applyDarkMode(newDarkMode)
    }
  }
  
  if (mediaQueryList.removeEventListener) {
    mediaQueryList.removeEventListener('change', handleChange)
  } else {
    mediaQueryList.removeListener(handleChange)
  }
}

export function useDarkMode() {
  // 初期化
  const initialize = (): void => {
    const savedPreference = loadPreference()
    preference.value = savedPreference
    isDarkMode.value = calculateDarkMode(savedPreference)
    applyDarkMode(isDarkMode.value)
    setupSystemListener()
  }
  
  // 設定変更
  const setPreference = (newPreference: DarkModePreference): void => {
    preference.value = newPreference
    savePreference(newPreference)
    
    const newDarkMode = calculateDarkMode(newPreference)
    isDarkMode.value = newDarkMode
    applyDarkMode(newDarkMode)
  }
  
  // ダークモードのトグル
  const toggle = (): void => {
    const newPreference = isDarkMode.value ? 'light' : 'dark'
    setPreference(newPreference)
  }
  
  // 次のテーマに切り替え
  const cycle = (): void => {
    const cycle: DarkModePreference[] = ['light', 'system', 'dark']
    const currentIndex = cycle.indexOf(preference.value)
    const nextIndex = (currentIndex + 1) % cycle.length
    setPreference(cycle[nextIndex])
  }
  
  // CSS変数の計算
  const cssVariables = computed(() => {
    return isDarkMode.value ? {
      '--bg-color': '#111827',
      '--bg-color-secondary': '#1F2937',
      '--text-color': '#F9FAFB',
      '--text-color-secondary': '#D1D5DB',
      '--border-color': '#374151',
      '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    } : {
      '--bg-color': '#FFFFFF',
      '--bg-color-secondary': '#F9FAFB',
      '--text-color': '#111827',
      '--text-color-secondary': '#6B7280',
      '--border-color': '#E5E7EB',
      '--shadow-color': 'rgba(0, 0, 0, 0.1)',
    }
  })
  
  // テーマカラーパレット
  const colors = computed(() => {
    const base = {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      secondary: '#10b981',
      secondaryHover: '#059669',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    }
    
    if (isDarkMode.value) {
      return {
        ...base,
        background: '#111827',
        backgroundSecondary: '#1F2937',
        backgroundTertiary: '#374151',
        text: '#F9FAFB',
        textSecondary: '#D1D5DB',
        textTertiary: '#9CA3AF',
        border: '#374151',
        borderSecondary: '#4B5563',
        shadow: 'rgba(0, 0, 0, 0.3)',
      }
    } else {
      return {
        ...base,
        background: '#FFFFFF',
        backgroundSecondary: '#F9FAFB',
        backgroundTertiary: '#F3F4F6',
        text: '#111827',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        border: '#E5E7EB',
        borderSecondary: '#D1D5DB',
        shadow: 'rgba(0, 0, 0, 0.1)',
      }
    }
  })
  
  // アイコン・表示名の取得
  const getPreferenceIcon = (pref: DarkModePreference): string => {
    const icons = {
      light: '☀️',
      dark: '🌙',
      system: '💻'
    }
    return icons[pref]
  }
  
  const getPreferenceLabel = (pref: DarkModePreference): string => {
    const labels = {
      light: 'ライトモード',
      dark: 'ダークモード',
      system: 'システム設定'
    }
    return labels[pref]
  }
  
  // 現在の設定の表示
  const currentIcon = computed(() => getPreferenceIcon(preference.value))
  const currentLabel = computed(() => getPreferenceLabel(preference.value))
  
  // クリーンアップ
  const cleanup = (): void => {
    removeSystemListener()
  }
  
  // 設定の監視
  watchEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      Object.entries(cssVariables.value).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
    }
  })
  
  return {
    // 状態
    isDarkMode: computed(() => isDarkMode.value),
    preference: computed(() => preference.value),
    colors,
    cssVariables,
    
    // 表示用
    currentIcon,
    currentLabel,
    getPreferenceIcon,
    getPreferenceLabel,
    
    // アクション
    initialize,
    setPreference,
    toggle,
    cycle,
    cleanup,
  }
}

// デフォルトエクスポート（自動初期化版）
export default function useDarkModeWithInit() {
  const darkMode = useDarkMode()
  
  // 初期化（一度だけ実行）
  if (typeof window !== 'undefined' && !window.__darkModeInitialized) {
    darkMode.initialize()
    window.__darkModeInitialized = true
  }
  
  return darkMode
}

// TypeScript用のWindow拡張
declare global {
  interface Window {
    __darkModeInitialized?: boolean
  }
}
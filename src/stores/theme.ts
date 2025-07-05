import { ref, computed, watchEffect } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<Theme>('system')
  const systemTheme = ref<'light' | 'dark'>('light')
  
  // Computed
  const isDark = computed(() => {
    if (theme.value === 'system') {
      return systemTheme.value === 'dark'
    }
    return theme.value === 'dark'
  })
  
  const currentTheme = computed(() => {
    if (theme.value === 'system') {
      return systemTheme.value
    }
    return theme.value
  })
  
  // Methods
  const updateSystemTheme = () => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemTheme.value = mediaQuery.matches ? 'dark' : 'light'
      
      const handleChange = (e: MediaQueryListEvent) => {
        systemTheme.value = e.matches ? 'dark' : 'light'
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }
  
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    saveTheme(newTheme)
    applyTheme()
  }
  
  const toggleTheme = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }
  
  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'system', 'dark']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }
  
  const applyTheme = () => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement
      
      if (isDark.value) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
      
      // Update meta theme-color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]')
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark.value ? '#1f2937' : '#ffffff')
      }
    }
  }
  
  const saveTheme = (themeToSave: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('castchat-theme', themeToSave)
    }
  }
  
  const loadTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('castchat-theme')
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved as Theme
      }
    }
    return 'system'
  }
  
  const initialize = () => {
    // Load saved theme
    theme.value = loadTheme()
    
    // Setup system theme detection
    const cleanup = updateSystemTheme()
    
    // Apply initial theme
    applyTheme()
    
    // Watch for theme changes
    watchEffect(() => {
      applyTheme()
    })
    
    return cleanup
  }
  
  // Theme labels and icons
  const getThemeLabel = (themeType: Theme): string => {
    const labels = {
      light: 'ライトモード',
      dark: 'ダークモード',
      system: 'システム設定'
    }
    return labels[themeType]
  }
  
  const getThemeIcon = (themeType: Theme): string => {
    const icons = {
      light: '☀️',
      dark: '🌙',
      system: '💻'
    }
    return icons[themeType]
  }
  
  const currentLabel = computed(() => getThemeLabel(theme.value))
  const currentIcon = computed(() => getThemeIcon(theme.value))
  
  return {
    // State
    theme: computed(() => theme.value),
    systemTheme: computed(() => systemTheme.value),
    isDark,
    currentTheme,
    currentLabel,
    currentIcon,
    
    // Methods
    setTheme,
    toggleTheme,
    cycleTheme,
    initialize,
    getThemeLabel,
    getThemeIcon,
  }
})
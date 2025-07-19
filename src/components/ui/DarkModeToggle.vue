<template>
  <div class="dark-mode-toggle">
    <!-- Desktop Toggle -->
    <button
      v-if="!compact"
      @click="themeStore.cycleTheme()"
      class="toggle-button"
      :class="{ 'button-dark': themeStore.isDark }"
      :aria-label="`現在のテーマ: ${themeStore.currentLabel}。クリックして切り替え`"
    >
      <Sun v-if="themeStore.theme === 'light'" class="toggle-icon" />
      <Moon v-else-if="themeStore.theme === 'dark'" class="toggle-icon" />
      <Monitor v-else class="toggle-icon" />
      <span class="toggle-text">{{ themeStore.currentLabel }}</span>
    </button>

    <!-- Compact Toggle (for mobile) -->
    <button
      v-else
      @click="themeStore.cycleTheme()"
      class="toggle-button-compact"
      :class="{ 'button-compact-dark': themeStore.isDark }"
      :aria-label="`現在のテーマ: ${themeStore.currentLabel}。クリックして切り替え`"
    >
      <Sun v-if="themeStore.theme === 'light'" class="toggle-icon-compact" />
      <Moon v-else-if="themeStore.theme === 'dark'" class="toggle-icon-compact" />
      <Monitor v-else class="toggle-icon-compact" />
    </button>

    <!-- Theme Dropdown (optional) -->
    <div v-if="showDropdown" class="theme-dropdown" :class="{ 'dropdown-dark': themeStore.isDark }">
      <button
        v-for="theme in themes"
        :key="theme.value"
        @click="selectTheme(theme.value)"
        class="dropdown-item"
        :class="{ 
          'item-active': themeStore.theme === theme.value,
          'item-dark': themeStore.isDark 
        }"
      >
        <Sun v-if="theme.value === 'light'" class="item-icon" />
        <Moon v-else-if="theme.value === 'dark'" class="item-icon" />
        <Monitor v-else class="item-icon" />
        <span class="item-label">{{ theme.label }}</span>
        <span v-if="themeStore.theme === theme.value" class="item-check">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useThemeStore, type Theme } from '@/stores/theme'

interface Props {
  compact?: boolean
  showDropdown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showDropdown: false
})

const themeStore = useThemeStore()

const themes = computed(() => [
  { value: 'light' as Theme, label: 'ライトモード' },
  { value: 'system' as Theme, label: 'システム設定' },
  { value: 'dark' as Theme, label: 'ダークモード' }
])


const selectTheme = (theme: Theme) => {
  themeStore.setTheme(theme)
}
</script>

<style scoped>
/* Desktop Toggle */
.toggle-button {
  @apply flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all text-sm font-medium min-w-[140px];
  @apply bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400;
  @apply dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700;
}

.toggle-icon {
  @apply w-[18px] h-[18px] flex items-center justify-center;
}

.toggle-text {
  @apply font-medium whitespace-nowrap;
}

/* Compact Toggle */
.toggle-button-compact {
  @apply flex items-center justify-center w-10 h-10 border rounded-lg cursor-pointer transition-all;
  @apply bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400;
  @apply dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700;
}

.toggle-icon-compact {
  @apply w-5 h-5 flex items-center justify-center;
}

/* Theme Dropdown */
.theme-dropdown {
  @apply absolute top-full right-0 mt-2 min-w-[160px] p-1 rounded-lg border shadow-lg z-50;
  @apply bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600;
}

.dropdown-item {
  @apply flex items-center gap-2 w-full px-3 py-2 border-none rounded-md bg-transparent cursor-pointer transition-all text-sm text-left;
  @apply text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700;
}

.item-active {
  @apply bg-indigo-600 text-white hover:bg-indigo-700;
}

.item-icon {
  @apply w-4 h-4 flex items-center justify-center;
}

.item-label {
  @apply flex-1 font-medium;
}

.item-check {
  @apply text-xs font-bold;
}

/* Responsive */
@media (max-width: 768px) {
  .toggle-button {
    @apply min-w-0 px-2.5 py-1.5;
  }
  
  .toggle-text {
    @apply hidden;
  }
  
  .theme-dropdown {
    @apply -right-5 min-w-[180px];
  }
}

/* Animation */
.toggle-button,
.toggle-button-compact {
  @apply transform scale-100 active:scale-95;
}

/* Focus styles */
.toggle-button:focus,
.toggle-button-compact:focus {
  @apply outline-2 outline-indigo-500 outline-offset-2;
}
</style>
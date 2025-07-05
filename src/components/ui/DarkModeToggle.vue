<template>
  <div class="dark-mode-toggle">
    <!-- Desktop Toggle -->
    <button
      v-if="!compact"
      @click="darkMode.cycle()"
      class="toggle-button"
      :class="{ 'button-dark': darkMode.isDarkMode.value }"
      :aria-label="`現在のテーマ: ${darkMode.currentLabel.value}。クリックして切り替え`"
    >
      <component :is="currentIconComponent" class="toggle-icon" />
      <span class="toggle-text">{{ darkMode.currentLabel.value }}</span>
    </button>

    <!-- Compact Toggle (for mobile) -->
    <button
      v-else
      @click="darkMode.cycle()"
      class="toggle-button-compact"
      :class="{ 'button-compact-dark': darkMode.isDarkMode.value }"
      :aria-label="`現在のテーマ: ${darkMode.currentLabel.value}。クリックして切り替え`"
    >
      <component :is="currentIconComponent" class="toggle-icon-compact" />
    </button>

    <!-- Theme Dropdown (optional) -->
    <div v-if="showDropdown" class="theme-dropdown" :class="{ 'dropdown-dark': darkMode.isDarkMode.value }">
      <button
        v-for="theme in themes"
        :key="theme.value"
        @click="selectTheme(theme.value)"
        class="dropdown-item"
        :class="{ 
          'item-active': darkMode.preference.value === theme.value,
          'item-dark': darkMode.isDarkMode.value 
        }"
      >
        <component :is="theme.icon" class="item-icon" />
        <span class="item-label">{{ theme.label }}</span>
        <span v-if="darkMode.preference.value === theme.value" class="item-check">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import useDarkModeWithInit, { type DarkModePreference } from '@/composables/useDarkMode'

interface Props {
  compact?: boolean
  showDropdown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showDropdown: false
})

const darkMode = useDarkModeWithInit()

const themes = computed(() => [
  { value: 'light' as DarkModePreference, icon: Sun, label: 'ライトモード' },
  { value: 'system' as DarkModePreference, icon: Monitor, label: 'システム設定' },
  { value: 'dark' as DarkModePreference, icon: Moon, label: 'ダークモード' }
])

const currentIconComponent = computed(() => {
  const iconMap = {
    light: Sun,
    dark: Moon,
    system: Monitor
  }
  return iconMap[darkMode.preference.value]
})

const selectTheme = (theme: DarkModePreference) => {
  darkMode.setPreference(theme)
}
</script>

<style scoped>
/* Desktop Toggle */
.toggle-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #ffffff);
  color: var(--text-color, #374151);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  min-width: 140px;
}

.toggle-button:hover {
  background: var(--bg-color-secondary, #f9fafb);
  border-color: var(--border-color, #d1d5db);
}

.button-dark {
  background: var(--bg-color, #1f2937);
  border-color: var(--border-color, #374151);
  color: var(--text-color, #f9fafb);
}

.button-dark:hover {
  background: var(--bg-color-secondary, #374151);
}

.toggle-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-text {
  font-weight: 500;
  white-space: nowrap;
}

/* Compact Toggle */
.toggle-button-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #ffffff);
  color: var(--text-color, #374151);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-button-compact:hover {
  background: var(--bg-color-secondary, #f9fafb);
  border-color: var(--border-color, #d1d5db);
}

.button-compact-dark {
  background: var(--bg-color, #1f2937);
  border-color: var(--border-color, #374151);
  color: var(--text-color, #f9fafb);
}

.button-compact-dark:hover {
  background: var(--bg-color-secondary, #374151);
}

.toggle-icon-compact {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Theme Dropdown */
.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-color, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  box-shadow: var(--shadow-color, rgba(0, 0, 0, 0.1)) 0 4px 6px -1px;
  padding: 4px;
  min-width: 160px;
  z-index: 50;
}

.dropdown-dark {
  background: var(--bg-color, #1f2937);
  border-color: var(--border-color, #374151);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color, #374151);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-color-secondary, #f9fafb);
}

.item-dark:hover {
  background: var(--bg-color-secondary, #374151);
}

.item-active {
  background: #6366f1;
  color: white;
}

.item-active:hover {
  background: #4f46e5;
}

.item-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-label {
  flex: 1;
  font-weight: 500;
}

.item-check {
  font-size: 12px;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .toggle-button {
    min-width: auto;
    padding: 6px 10px;
  }
  
  .toggle-text {
    display: none;
  }
  
  .theme-dropdown {
    right: -20px;
    min-width: 180px;
  }
}

/* Animation */
.toggle-button,
.toggle-button-compact {
  transform: scale(1);
}

.toggle-button:active,
.toggle-button-compact:active {
  transform: scale(0.95);
}

/* Focus styles */
.toggle-button:focus,
.toggle-button-compact:focus {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Dark mode theme colors integration */
.dark-mode-toggle {
  --bg-color: var(--bg-color);
  --bg-color-secondary: var(--bg-color-secondary);
  --text-color: var(--text-color);
  --border-color: var(--border-color);
  --shadow-color: var(--shadow-color);
}
</style>
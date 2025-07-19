<template>
  <span :class="badgeClasses">
    <component :is="statusIcon" class="w-3 h-3" />
    {{ statusText }}
  </span>
</template>

<script lang="ts">
export default {
  name: 'UserStatusBadge'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { Circle, Clock, Minus } from 'lucide-vue-next'

interface Props {
  status: 'active' | 'inactive' | 'away'
}

const props = defineProps<Props>()

const statusConfig = {
  active: {
    text: 'アクティブ',
    icon: Circle,
    classes: 'bg-green-100 text-green-800 border-green-200'
  },
  inactive: {
    text: '非アクティブ',
    icon: Minus,
    classes: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  away: {
    text: '一時退席',
    icon: Clock,
    classes: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
}

const statusText = computed(() => statusConfig[props.status].text)
const statusIcon = computed(() => statusConfig[props.status].icon)

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border'
  return `${baseClasses} ${statusConfig[props.status].classes}`
})
</script>
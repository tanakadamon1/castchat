<template>
  <span :class="badgeClasses">
    <component :is="statusIcon" class="w-3 h-3" />
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, CheckCircle, XCircle } from 'lucide-vue-next'

interface Props {
  status: 'pending' | 'accepted' | 'rejected'
}

const props = defineProps<Props>()

const statusConfig = {
  pending: {
    text: '審査中',
    icon: Clock,
    classes: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  accepted: {
    text: '承認済み',
    icon: CheckCircle,
    classes: 'bg-green-100 text-green-800 border-green-200'
  },
  rejected: {
    text: '却下',
    icon: XCircle,
    classes: 'bg-red-100 text-red-800 border-red-200'
  }
}

const statusText = computed(() => statusConfig[props.status].text)
const statusIcon = computed(() => statusConfig[props.status].icon)

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border'
  return `${baseClasses} ${statusConfig[props.status].classes}`
})
</script>
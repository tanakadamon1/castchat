<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-medium text-gray-900">System Performance</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Last updated: {{ lastUpdated }}</span>
        <button
          @click="refreshData"
          :disabled="loading"
          class="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Health Status Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center">
          <div :class="[
            'w-3 h-3 rounded-full mr-3',
            healthStatus?.status === 'healthy' ? 'bg-green-500' :
            healthStatus?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
          ]"></div>
          <div>
            <p class="text-sm font-medium text-gray-900">Overall Status</p>
            <p class="text-sm text-gray-600 capitalize">{{ healthStatus?.status || 'Unknown' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
          <div>
            <p class="text-sm font-medium text-gray-900">Response Time</p>
            <p class="text-sm text-gray-600">{{ formatResponseTime(healthStatus?.metrics.responseTime) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
          <div>
            <p class="text-sm font-medium text-gray-900">Error Rate</p>
            <p class="text-sm text-gray-600">{{ formatErrorRate(healthStatus?.metrics.errorRate) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Status Details -->
    <div class="mb-8">
      <h3 class="text-md font-medium text-gray-900 mb-4">Service Status</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(service, name) in healthStatus?.services" :key="name" class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-gray-900 capitalize">{{ name }}</h4>
            <span :class="[
              'px-2 py-1 text-xs rounded-full',
              service.status === 'healthy' ? 'bg-green-100 text-green-800' :
              service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            ]">
              {{ service.status }}
            </span>
          </div>
          <div class="text-sm text-gray-600">
            <p>Response: {{ formatResponseTime(service.responseTime) }}</p>
            <p>Last Check: {{ formatTime(service.lastCheck) }}</p>
            <p v-if="service.error" class="text-red-600 mt-1">Error: {{ service.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics Chart -->
    <div class="mb-8">
      <h3 class="text-md font-medium text-gray-900 mb-4">Performance Trends</h3>
      <div class="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
        <div class="text-center text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p class="text-sm">Performance chart will be implemented with historical data</p>
          <p class="text-xs text-gray-400 mt-1">Integration with monitoring service required</p>
        </div>
      </div>
    </div>

    <!-- System Information -->
    <div>
      <h3 class="text-md font-medium text-gray-900 mb-4">System Information</h3>
      <div class="bg-gray-50 rounded-lg p-4">
        <dl class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt class="font-medium text-gray-900">Version</dt>
            <dd class="text-gray-600">{{ healthStatus?.version || 'Unknown' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-gray-900">Environment</dt>
            <dd class="text-gray-600">{{ environment }}</dd>
          </div>
          <div>
            <dt class="font-medium text-gray-900">Uptime</dt>
            <dd class="text-gray-600">{{ uptime }}</dd>
          </div>
          <div>
            <dt class="font-medium text-gray-900">Last Deploy</dt>
            <dd class="text-gray-600">{{ lastDeploy }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { healthMonitor, type HealthStatus } from '@/utils/health-check'

// Reactive state
const healthStatus = ref<HealthStatus | null>(null)
const loading = ref(false)
const lastUpdated = ref<string>('')

// Computed properties
const environment = computed(() => {
  return import.meta.env.DEV ? 'Development' : 'Production'
})

const uptime = computed(() => {
  // Calculate uptime from page load (simplified)
  const now = Date.now()
  const loadTime = performance.timeOrigin
  const uptimeMs = now - loadTime
  const minutes = Math.floor(uptimeMs / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m`
})

const lastDeploy = computed(() => {
  // In a real implementation, this would come from build info
  return new Date().toLocaleDateString()
})

// Format helper functions
const formatResponseTime = (time?: number): string => {
  if (!time) return 'N/A'
  return time < 1000 ? `${Math.round(time)}ms` : `${(time / 1000).toFixed(2)}s`
}

const formatErrorRate = (rate?: number): string => {
  if (rate === undefined) return 'N/A'
  return `${rate.toFixed(1)}%`
}

const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString()
}

// Data refresh
const refreshData = async () => {
  loading.value = true
  try {
    healthStatus.value = await healthMonitor.getCurrentHealth()
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('Failed to refresh health data:', error)
  } finally {
    loading.value = false
  }
}

// Health monitoring subscription
let unsubscribe: (() => void) | null = null

onMounted(async () => {
  // Initial load
  await refreshData()
  
  // Subscribe to health updates
  unsubscribe = healthMonitor.subscribe((health) => {
    healthStatus.value = health
    lastUpdated.value = new Date().toLocaleTimeString()
  })
  
  // Start monitoring if not already started
  healthMonitor.start()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>
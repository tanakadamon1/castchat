// Health check utilities for infrastructure monitoring
import { supabase } from '@/lib/supabase'

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: ServiceStatus
    authentication: ServiceStatus
    storage: ServiceStatus
  }
  metrics: {
    responseTime: number
    memoryUsage?: number
    errorRate: number
  }
}

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  lastCheck: string
  error?: string
}

// Check database connectivity and performance
export async function checkDatabaseHealth(): Promise<ServiceStatus> {
  const startTime = performance.now()
  
  try {
    // Simple query to test database connectivity
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    const responseTime = performance.now() - startTime
    
    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        error: error.message
      }
    }
    
    // Consider degraded if response time > 1 second
    const status = responseTime > 1000 ? 'degraded' : 'healthy'
    
    return {
      status,
      responseTime,
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: performance.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Check authentication service
export async function checkAuthHealth(): Promise<ServiceStatus> {
  const startTime = performance.now()
  
  try {
    // Test auth service by getting current session
    const { data, error } = await supabase.auth.getSession()
    
    const responseTime = performance.now() - startTime
    
    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        error: error.message
      }
    }
    
    const status = responseTime > 500 ? 'degraded' : 'healthy'
    
    return {
      status,
      responseTime,
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: performance.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Check storage service
export async function checkStorageHealth(): Promise<ServiceStatus> {
  const startTime = performance.now()
  
  try {
    // Test storage by listing buckets
    const { data, error } = await supabase.storage.listBuckets()
    
    const responseTime = performance.now() - startTime
    
    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        error: error.message
      }
    }
    
    const status = responseTime > 500 ? 'degraded' : 'healthy'
    
    return {
      status,
      responseTime,
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: performance.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Comprehensive health check
export async function performHealthCheck(): Promise<HealthStatus> {
  const startTime = performance.now()
  
  // Run all health checks in parallel
  const [database, authentication, storage] = await Promise.all([
    checkDatabaseHealth(),
    checkAuthHealth(),
    checkStorageHealth()
  ])
  
  const totalResponseTime = performance.now() - startTime
  
  // Determine overall status
  const services = { database, authentication, storage }
  const serviceStatuses = Object.values(services).map(s => s.status)
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
  if (serviceStatuses.some(s => s === 'unhealthy')) {
    overallStatus = 'unhealthy'
  } else if (serviceStatuses.some(s => s === 'degraded')) {
    overallStatus = 'degraded'
  } else {
    overallStatus = 'healthy'
  }
  
  // Calculate error rate (simplified - in real implementation, track over time)
  const errorCount = serviceStatuses.filter(s => s === 'unhealthy').length
  const errorRate = (errorCount / serviceStatuses.length) * 100
  
  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    services,
    metrics: {
      responseTime: totalResponseTime,
      errorRate
    }
  }
}

// Health check endpoint for monitoring tools
export async function healthCheckEndpoint(): Promise<Response> {
  try {
    const health = await performHealthCheck()
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503
    
    return new Response(JSON.stringify(health), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed'
    }
    
    return new Response(JSON.stringify(errorResponse), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}

// Monitoring utilities
export class HealthMonitor {
  private interval: number | null = null
  private callbacks: ((health: HealthStatus) => void)[] = []
  
  constructor(private checkInterval = 30000) {} // 30 seconds default
  
  // Start periodic health monitoring
  start() {
    if (this.interval) return
    
    this.interval = window.setInterval(async () => {
      const health = await performHealthCheck()
      this.callbacks.forEach(callback => callback(health))
    }, this.checkInterval)
  }
  
  // Stop monitoring
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
  
  // Subscribe to health updates
  subscribe(callback: (health: HealthStatus) => void) {
    this.callbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }
  
  // Get current health status
  async getCurrentHealth(): Promise<HealthStatus> {
    return await performHealthCheck()
  }
}

// Create global health monitor instance
export const healthMonitor = new HealthMonitor()

// Auto-start monitoring in development
if (import.meta.env.DEV) {
  healthMonitor.start()
  
  // Log health status in development
  healthMonitor.subscribe((health) => {
    console.log('Health Check:', health)
    
    if (health.status !== 'healthy') {
      console.warn('Application health degraded:', health)
    }
  })
}
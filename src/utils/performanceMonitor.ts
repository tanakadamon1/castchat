// パフォーマンス監視とデバッグ用のユーティリティ

interface PerformanceMetrics {
  name: string
  duration: number
  timestamp: number
  type: 'render' | 'api' | 'navigation' | 'image' | 'chunk'
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private observers: Map<string, PerformanceObserver> = new Map()

  // レンダリング時間の測定
  measureRender<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    
    this.addMetric({
      name: `render-${name}`,
      duration,
      timestamp: Date.now(),
      type: 'render'
    })

    if (duration > 16) { // 60fps threshold
      console.warn(`🐌 Slow render detected: ${name} took ${duration.toFixed(2)}ms`)
    }

    return result
  }

  // 非同期処理の測定
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      
      this.addMetric({
        name: `async-${name}`,
        duration,
        timestamp: Date.now(),
        type: 'api'
      })

      return result
    } catch (error) {
      const duration = performance.now() - start
      this.addMetric({
        name: `async-${name}-error`,
        duration,
        timestamp: Date.now(),
        type: 'api'
      })
      throw error
    }
  }

  // LCP (Largest Contentful Paint) の監視
  observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lcpEntry = entries[entries.length - 1] as any
        
        this.addMetric({
          name: 'lcp',
          duration: lcpEntry.startTime,
          timestamp: Date.now(),
          type: 'render'
        })

        if (lcpEntry.startTime > 2500) {
          console.warn(`🐌 Slow LCP detected: ${lcpEntry.startTime.toFixed(2)}ms`)
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', observer)
    }
  }

  // FID (First Input Delay) の監視
  observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.addMetric({
            name: 'fid',
            duration: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            type: 'navigation'
          })

          if (entry.processingStart - entry.startTime > 100) {
            console.warn(`🐌 Slow FID detected: ${(entry.processingStart - entry.startTime).toFixed(2)}ms`)
          }
        })
      })

      observer.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', observer)
    }
  }

  // リソース読み込み時間の監視
  observeResources() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.initiatorType === 'img') {
            this.addMetric({
              name: `image-${entry.name.split('/').pop()}`,
              duration: entry.loadEventEnd - entry.startTime,
              timestamp: Date.now(),
              type: 'image'
            })
          }
          
          if (entry.initiatorType === 'script') {
            this.addMetric({
              name: `script-${entry.name.split('/').pop()}`,
              duration: entry.loadEventEnd - entry.startTime,
              timestamp: Date.now(),
              type: 'chunk'
            })
          }
        })
      })

      observer.observe({ entryTypes: ['resource'] })
      this.observers.set('resources', observer)
    }
  }

  // メトリクスの追加
  private addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)
    
    // 古いメトリクスを削除（最新1000件のみ保持）
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  // メトリクスの取得
  getMetrics(type?: PerformanceMetrics['type']) {
    if (type) {
      return this.metrics.filter(m => m.type === type)
    }
    return [...this.metrics]
  }

  // パフォーマンスレポート
  generateReport() {
    const report = {
      summary: {
        totalMetrics: this.metrics.length,
        averageRenderTime: this.getAverageByType('render'),
        averageApiTime: this.getAverageByType('api'),
        slowOperations: this.getSlowOperations()
      },
      details: this.groupMetricsByType()
    }

    console.group('📊 Performance Report')
    console.table(report.summary)
    console.log('🐌 Slow Operations:', report.details.slow)
    console.groupEnd()

    return report
  }

  private getAverageByType(type: PerformanceMetrics['type']) {
    const typeMetrics = this.metrics.filter(m => m.type === type)
    if (typeMetrics.length === 0) return 0
    
    const total = typeMetrics.reduce((sum, m) => sum + m.duration, 0)
    return Number((total / typeMetrics.length).toFixed(2))
  }

  private getSlowOperations() {
    return this.metrics
      .filter(m => 
        (m.type === 'render' && m.duration > 16) ||
        (m.type === 'api' && m.duration > 1000) ||
        (m.type === 'image' && m.duration > 500)
      )
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
  }

  private groupMetricsByType() {
    const grouped: Record<string, PerformanceMetrics[]> = {}
    
    this.metrics.forEach(metric => {
      if (!grouped[metric.type]) {
        grouped[metric.type] = []
      }
      grouped[metric.type].push(metric)
    })

    return {
      ...grouped,
      slow: this.getSlowOperations()
    }
  }

  // クリーンアップ
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.metrics = []
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor()

// 開発環境でのみ有効化
if (import.meta.env.DEV) {
  performanceMonitor.observeLCP()
  performanceMonitor.observeFID()
  performanceMonitor.observeResources()
  
  // 5秒ごとにレポート生成（開発環境のみ）
  setInterval(() => {
    performanceMonitor.generateReport()
  }, 30000)
}

// Vue コンポーネント用のコンポーザブル
export function usePerformanceMonitor() {
  const measureRender = (name: string, fn: () => any) => {
    return performanceMonitor.measureRender(name, fn)
  }

  const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsync(name, fn)
  }

  return {
    measureRender,
    measureAsync,
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor)
  }
}
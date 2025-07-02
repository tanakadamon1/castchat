// Analytics utility for tracking user behavior and application metrics
// Supports Google Analytics, custom analytics, and performance monitoring

import { logger } from './logger'

interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
}

interface PageView {
  path: string
  title: string
  referrer?: string
}

interface UserProperties {
  userId?: string
  userRole?: string
  subscriptionTier?: string
  [key: string]: any
}

class Analytics {
  private isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  private isDevelopment = import.meta.env.DEV
  private initialized = false
  
  constructor() {
    if (this.isEnabled && !this.isDevelopment) {
      this.initialize()
    }
  }

  private initialize() {
    // Initialize Google Analytics (GA4)
    if (typeof window !== 'undefined' && !this.initialized) {
      // Add Google Analytics script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        send_page_view: false // We'll manually track page views
      })

      this.initialized = true
      logger.info('Analytics initialized')
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return

    logger.debug('Analytics Event', {
      action: 'analytics_event',
      metadata: event
    })

    if (!this.isDevelopment && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata
      })
    }
  }

  // Track page views
  trackPageView(pageView: PageView) {
    if (!this.isEnabled) return

    logger.debug('Page View', {
      action: 'page_view',
      metadata: pageView
    })

    if (!this.isDevelopment && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pageView.path,
        page_title: pageView.title,
        page_referrer: pageView.referrer
      })
    }
  }

  // Set user properties
  setUserProperties(properties: UserProperties) {
    if (!this.isEnabled) return

    logger.debug('Set User Properties', {
      action: 'set_user_properties',
      metadata: properties
    })

    if (!this.isDevelopment && window.gtag) {
      window.gtag('set', { user_properties: properties })
      
      if (properties.userId) {
        window.gtag('set', { user_id: properties.userId })
      }
    }
  }

  // Track timing events (performance)
  trackTiming(category: string, variable: string, value: number, label?: string) {
    if (!this.isEnabled) return

    this.trackEvent({
      category,
      action: 'timing',
      label: label || variable,
      value: Math.round(value),
      metadata: {
        timing_category: category,
        timing_var: variable,
        timing_value: value
      }
    })
  }

  // Track exceptions
  trackException(description: string, fatal = false) {
    if (!this.isEnabled) return

    logger.error('Analytics Exception', new Error(description))

    if (!this.isDevelopment && window.gtag) {
      window.gtag('event', 'exception', {
        description,
        fatal
      })
    }
  }

  // Track social interactions
  trackSocial(network: string, action: string, target: string) {
    this.trackEvent({
      category: 'social',
      action,
      label: `${network}:${target}`,
      metadata: {
        social_network: network,
        social_action: action,
        social_target: target
      }
    })
  }

  // E-commerce tracking (for premium features)
  trackPurchase(transactionId: string, value: number, currency = 'JPY', items?: any[]) {
    if (!this.isEnabled) return

    logger.info('Purchase Tracked', {
      action: 'purchase',
      metadata: { transactionId, value, currency }
    })

    if (!this.isDevelopment && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value,
        currency,
        items
      })
    }
  }

  // Track search queries
  trackSearch(searchTerm: string, resultCount?: number) {
    this.trackEvent({
      category: 'engagement',
      action: 'search',
      label: searchTerm,
      value: resultCount,
      metadata: {
        search_term: searchTerm,
        results_count: resultCount
      }
    })
  }

  // Track content engagement
  trackContentView(contentType: string, contentId: string, contentName?: string) {
    this.trackEvent({
      category: 'content',
      action: 'view',
      label: `${contentType}:${contentId}`,
      metadata: {
        content_type: contentType,
        content_id: contentId,
        content_name: contentName
      }
    })
  }

  // Track user engagement metrics
  trackEngagement(action: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'engagement',
      action,
      metadata
    })
  }

  // Performance monitoring
  measurePageLoadTime() {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart
        
        this.trackTiming('performance', 'page_load', pageLoadTime)
        this.trackTiming('performance', 'dom_ready', domReadyTime)
        
        logger.info('Page Performance', {
          action: 'performance_metrics',
          metadata: {
            pageLoadTime,
            domReadyTime
          }
        })
      })
    }
  }

  // Core Web Vitals tracking
  trackWebVitals() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.trackTiming('web_vitals', 'LCP', (lastEntry as any).renderTime || (lastEntry as any).loadTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.name === 'first-input') {
            this.trackTiming('web_vitals', 'FID', (entry as any).processingStart - entry.startTime)
          }
        })
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        })
        this.trackTiming('web_vitals', 'CLS', clsValue * 1000) // Convert to milliseconds
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }
}

// Create singleton instance
export const analytics = new Analytics()

// Initialize performance tracking
if (typeof window !== 'undefined') {
  analytics.measurePageLoadTime()
  analytics.trackWebVitals()
}

// Export convenience functions
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  analytics.trackEvent({ category, action, label, value })
}

export const trackPageView = (path: string, title: string) => {
  analytics.trackPageView({ path, title })
}

export const trackUserAction = (action: string, metadata?: Record<string, any>) => {
  analytics.trackEngagement(action, metadata)
}

// Vue Router integration
export const setupRouterTracking = (router: any) => {
  router.afterEach((to: any) => {
    trackPageView(to.path, to.meta.title || to.name || 'Untitled Page')
  })
}

// Declare global types
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
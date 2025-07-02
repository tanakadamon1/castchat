// Logger utility for application monitoring
// Integrates with external services in production

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  sessionId?: string
  action?: string
  metadata?: Record<string, any>
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true'
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 100

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
    let message = `${prefix} ${entry.message}`
    
    if (entry.context) {
      message += ` | Context: ${JSON.stringify(entry.context)}`
    }
    
    if (entry.error) {
      message += ` | Error: ${entry.error.message}`
      if (entry.error.stack && this.isDevelopment) {
        message += `\n${entry.error.stack}`
      }
    }
    
    return message
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    }

    // Add to buffer
    this.logBuffer.push(entry)
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift()
    }

    // Console output in development
    if (this.isDevelopment || this.isDebugMode) {
      const formattedMessage = this.formatMessage(entry)
      
      switch (level) {
        case 'debug':
          if (this.isDebugMode) console.debug(formattedMessage)
          break
        case 'info':
          console.info(formattedMessage)
          break
        case 'warn':
          console.warn(formattedMessage)
          break
        case 'error':
          console.error(formattedMessage)
          break
      }
    }

    // Send to monitoring service in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToMonitoring(entry)
    }
  }

  private async sendToMonitoring(entry: LogEntry) {
    // Integration point for services like Sentry, LogRocket, etc.
    // This would be configured based on environment variables
    
    // Example: Send to an analytics endpoint
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: entry.message,
        fatal: false,
        error: entry.error
      })
    }

    // Example: Send to custom monitoring endpoint
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    } catch (err) {
      // Silently fail to avoid infinite loops
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error)
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logBuffer.slice(-count)
  }

  // Clear log buffer
  clearLogs() {
    this.logBuffer = []
  }

  // Performance monitoring
  measurePerformance(name: string, fn: () => void | Promise<void>) {
    const start = performance.now()
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start
        this.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`)
      })
    } else {
      const duration = performance.now() - start
      this.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`)
      return result
    }
  }
}

// Create singleton instance
export const logger = new Logger()

// Export types
export type { LogLevel, LogContext, LogEntry }

// Utility functions for common logging scenarios
export const logApiCall = (method: string, url: string, status?: number) => {
  logger.info(`API Call: ${method} ${url}`, {
    action: 'api_call',
    metadata: { method, url, status }
  })
}

export const logUserAction = (action: string, metadata?: Record<string, any>) => {
  logger.info(`User Action: ${action}`, {
    action,
    metadata
  })
}

export const logError = (message: string, error: Error, context?: LogContext) => {
  logger.error(message, error, context)
}

// Vue error handler integration
export const setupVueErrorHandler = (app: any) => {
  app.config.errorHandler = (err: Error, instance: any, info: string) => {
    logger.error('Vue Error', err, {
      metadata: { componentInfo: info }
    })
  }
}

// Global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', new Error(event.reason), {
      metadata: { reason: event.reason }
    })
  })

  window.addEventListener('error', (event) => {
    logger.error('Global Error', event.error || new Error(event.message), {
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    })
  })
}
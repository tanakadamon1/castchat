#!/bin/bash

# Production Monitoring and Alerting Setup Script
# This script sets up comprehensive monitoring and alerting for production

set -e

echo "📊 CastChat Production Monitoring Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "info")
            echo -e "${BLUE}ℹ${NC}  $message"
            ;;
        "ok")
            echo -e "${GREEN}✓${NC} $message"
            ;;
        "warn")
            echo -e "${YELLOW}⚠${NC}  $message"
            ;;
        "error")
            echo -e "${RED}✗${NC} $message"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Set up Vercel monitoring
setup_vercel_monitoring() {
    print_status "info" "Setting up Vercel monitoring..."
    
    # Create Vercel configuration for monitoring
    cat > vercel-monitoring.json << 'EOF'
{
  "functions": {
    "api/health": {
      "maxDuration": 10
    },
    "api/metrics": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/health-check",
      "schedule": "*/5 * * * *"
    }
  ]
}
EOF

    print_status "ok" "Vercel monitoring configuration created"
    
    # Create health check endpoint
    mkdir -p api
    cat > api/health.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { performHealthCheck } from '../src/utils/health-check'

export async function GET(request: NextRequest) {
  try {
    const health = await performHealthCheck()
    
    const status = health.status === 'healthy' ? 200 : 
                  health.status === 'degraded' ? 200 : 503
    
    return NextResponse.json(health, { status })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
EOF

    print_status "ok" "Health check endpoint created"
}

# Set up application metrics
setup_application_metrics() {
    print_status "info" "Setting up application metrics..."
    
    # Create metrics collection script
    cat > scripts/collect-metrics.js << 'EOF'
// Application Metrics Collection
const metrics = {
  // Performance metrics
  pageLoadTime: 0,
  timeToInteractive: 0,
  firstContentfulPaint: 0,
  largestContentfulPaint: 0,
  cumulativeLayoutShift: 0,
  
  // User interaction metrics
  clickThroughRate: 0,
  conversionRate: 0,
  bounceRate: 0,
  sessionDuration: 0,
  
  // Technical metrics
  errorRate: 0,
  apiResponseTime: 0,
  databaseQueryTime: 0,
  cacheHitRate: 0
}

// Collect Core Web Vitals
function collectWebVitals() {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS((metric) => {
      metrics.cumulativeLayoutShift = metric.value
      sendMetric('CLS', metric.value)
    })
    
    getFID((metric) => {
      sendMetric('FID', metric.value)
    })
    
    getFCP((metric) => {
      metrics.firstContentfulPaint = metric.value
      sendMetric('FCP', metric.value)
    })
    
    getLCP((metric) => {
      metrics.largestContentfulPaint = metric.value
      sendMetric('LCP', metric.value)
    })
    
    getTTFB((metric) => {
      sendMetric('TTFB', metric.value)
    })
  })
}

// Send metrics to monitoring service
function sendMetric(name, value, labels = {}) {
  // Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', name, {
      event_category: 'Performance',
      value: Math.round(value),
      custom_map: labels
    })
  }
  
  // Send to custom monitoring endpoint
  fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric: name,
      value,
      labels,
      timestamp: Date.now()
    })
  }).catch(console.error)
}

// Initialize metrics collection
if (typeof window !== 'undefined') {
  collectWebVitals()
  
  // Collect page load metrics
  window.addEventListener('load', () => {
    const perfData = performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    metrics.pageLoadTime = pageLoadTime
    sendMetric('page_load_time', pageLoadTime)
  })
}
EOF

    print_status "ok" "Metrics collection script created"
}

# Set up uptime monitoring
setup_uptime_monitoring() {
    print_status "info" "Setting up uptime monitoring..."
    
    # Create uptime monitoring script
    cat > scripts/uptime-monitor.sh << 'EOF'
#!/bin/bash

# Uptime Monitoring Script
# Checks application health and sends alerts

HEALTH_URL="https://castchat.jp/api/health"
ALERT_WEBHOOK="$SLACK_WEBHOOK_URL"

check_health() {
    local response=$(curl -s -w "%{http_code}" -o /tmp/health_response "$HEALTH_URL")
    local http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        echo "✓ Health check passed"
        return 0
    else
        echo "✗ Health check failed with status $http_code"
        cat /tmp/health_response
        return 1
    fi
}

send_alert() {
    local message="$1"
    local severity="$2"
    
    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"text\":\"🚨 [$severity] CastChat Alert: $message\"}" \
             "$ALERT_WEBHOOK"
    fi
    
    echo "Alert sent: $message"
}

# Main monitoring logic
if ! check_health; then
    send_alert "Application health check failed" "CRITICAL"
    exit 1
fi

# Check response time
response_time=$(curl -o /dev/null -s -w "%{time_total}" "$HEALTH_URL")
response_ms=$(echo "$response_time * 1000" | bc -l)

if (( $(echo "$response_ms > 2000" | bc -l) )); then
    send_alert "Slow response time: ${response_ms}ms" "WARNING"
fi

echo "Uptime check completed successfully"
EOF

    chmod +x scripts/uptime-monitor.sh
    print_status "ok" "Uptime monitoring script created"
}

# Set up error tracking
setup_error_tracking() {
    print_status "info" "Setting up error tracking..."
    
    # Create error tracking configuration
    cat > src/utils/error-tracking.ts << 'EOF'
// Error Tracking and Reporting System

interface ErrorReport {
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

class ErrorTracker {
  private endpoint = '/api/errors'
  private enabled = !import.meta.env.DEV
  
  track(error: Error | string, context?: Record<string, any>, severity: ErrorReport['severity'] = 'medium') {
    if (!this.enabled) return
    
    const report: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity,
      context
    }
    
    // Send to tracking service
    this.sendReport(report)
    
    // Log locally in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', report)
    }
  }
  
  private async sendReport(report: ErrorReport) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      })
    } catch (err) {
      console.error('Failed to send error report:', err)
    }
  }
  
  // Track unhandled errors
  setupGlobalHandlers() {
    window.addEventListener('error', (event) => {
      this.track(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, 'high')
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      this.track(`Unhandled Promise Rejection: ${event.reason}`, {
        promise: true
      }, 'high')
    })
  }
}

export const errorTracker = new ErrorTracker()

// Initialize global error handling
if (typeof window !== 'undefined') {
  errorTracker.setupGlobalHandlers()
}
EOF

    print_status "ok" "Error tracking system created"
}

# Set up performance monitoring
setup_performance_monitoring() {
    print_status "info" "Setting up performance monitoring..."
    
    # Create performance monitoring dashboard
    cat > src/components/admin/MonitoringDashboard.vue << 'EOF'
<template>
  <div class="monitoring-dashboard">
    <h2>Production Monitoring Dashboard</h2>
    
    <!-- System Status -->
    <div class="status-grid">
      <div class="status-card" :class="systemStatus.overall">
        <h3>System Status</h3>
        <div class="status-indicator"></div>
        <span>{{ systemStatus.message }}</span>
      </div>
      
      <!-- Performance Metrics -->
      <div class="metrics-grid">
        <div v-for="metric in performanceMetrics" :key="metric.name" class="metric-card">
          <h4>{{ metric.name }}</h4>
          <div class="metric-value" :class="getMetricStatus(metric)">
            {{ formatMetric(metric) }}
          </div>
          <div class="metric-trend">{{ metric.trend }}</div>
        </div>
      </div>
    </div>
    
    <!-- Alerts -->
    <div class="alerts-section">
      <h3>Active Alerts</h3>
      <div v-if="alerts.length === 0" class="no-alerts">
        ✓ No active alerts
      </div>
      <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.severity">
        <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
        <span class="alert-message">{{ alert.message }}</span>
        <button @click="acknowledgeAlert(alert.id)">Acknowledge</button>
      </div>
    </div>
    
    <!-- Recent Errors -->
    <div class="errors-section">
      <h3>Recent Errors</h3>
      <div v-for="error in recentErrors" :key="error.id" class="error-item">
        <span class="error-time">{{ formatTime(error.timestamp) }}</span>
        <span class="error-message">{{ error.message }}</span>
        <span class="error-count">{{ error.count }}x</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const systemStatus = ref({
  overall: 'healthy',
  message: 'All systems operational'
})

const performanceMetrics = ref([
  { name: 'Response Time', value: 245, unit: 'ms', threshold: 500, trend: '↗ +5%' },
  { name: 'Error Rate', value: 0.1, unit: '%', threshold: 1, trend: '↘ -0.2%' },
  { name: 'Uptime', value: 99.9, unit: '%', threshold: 99, trend: '→ stable' },
  { name: 'Active Users', value: 1247, unit: '', threshold: 0, trend: '↗ +12%' }
])

const alerts = ref([])
const recentErrors = ref([])

const formatMetric = (metric: any) => {
  return `${metric.value}${metric.unit}`
}

const getMetricStatus = (metric: any) => {
  if (metric.threshold === 0) return 'info'
  return metric.value <= metric.threshold ? 'good' : 'warning'
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

const acknowledgeAlert = (alertId: string) => {
  alerts.value = alerts.value.filter(alert => alert.id !== alertId)
}

// Real-time updates
let updateInterval: number

onMounted(() => {
  updateInterval = setInterval(fetchMetrics, 30000) // Update every 30 seconds
  fetchMetrics()
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
})

async function fetchMetrics() {
  try {
    const response = await fetch('/api/monitoring/metrics')
    const data = await response.json()
    
    // Update metrics
    performanceMetrics.value = data.metrics
    alerts.value = data.alerts
    recentErrors.value = data.errors
    systemStatus.value = data.status
  } catch (error) {
    console.error('Failed to fetch monitoring data:', error)
  }
}
</script>

<style scoped>
.monitoring-dashboard {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 30px;
}

.status-card {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.status-card.healthy { background: #d4edda; border-color: #c3e6cb; }
.status-card.degraded { background: #fff3cd; border-color: #ffeaa7; }
.status-card.unhealthy { background: #f8d7da; border-color: #f5c6cb; }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.metric-card {
  padding: 15px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  text-align: center;
}

.metric-value {
  font-size: 2em;
  font-weight: bold;
  margin: 10px 0;
}

.metric-value.good { color: #28a745; }
.metric-value.warning { color: #ffc107; }
.metric-value.critical { color: #dc3545; }
.metric-value.info { color: #17a2b8; }

.alerts-section, .errors-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  border-radius: 4px;
}

.alert-item.critical { background: #f8d7da; }
.alert-item.warning { background: #fff3cd; }

.error-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 3px 0;
  border-left: 3px solid #dc3545;
  background: #f8f9fa;
}

.error-time, .alert-time {
  font-size: 0.85em;
  color: #6c757d;
  margin-right: 10px;
}

.error-count {
  margin-left: auto;
  background: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.8em;
}
</style>
EOF

    print_status "ok" "Performance monitoring dashboard created"
}

# Set up alerting rules
setup_alerting_rules() {
    print_status "info" "Setting up alerting rules..."
    
    # Create alerting configuration
    cat > monitoring/alerting-rules.json << 'EOF'
{
  "rules": [
    {
      "name": "High Error Rate",
      "condition": "error_rate > 5%",
      "severity": "critical",
      "channels": ["slack", "email"],
      "cooldown": "10m"
    },
    {
      "name": "Slow Response Time",
      "condition": "avg_response_time > 2000ms",
      "severity": "warning",
      "channels": ["slack"],
      "cooldown": "5m"
    },
    {
      "name": "Database Connection Issues",
      "condition": "db_connection_failures > 0",
      "severity": "critical",
      "channels": ["slack", "sms"],
      "cooldown": "1m"
    },
    {
      "name": "Memory Usage High",
      "condition": "memory_usage > 90%",
      "severity": "warning",
      "channels": ["slack"],
      "cooldown": "15m"
    },
    {
      "name": "Service Down",
      "condition": "uptime < 99%",
      "severity": "critical",
      "channels": ["slack", "email", "sms"],
      "cooldown": "1m"
    }
  ],
  "channels": {
    "slack": {
      "webhook": "$SLACK_WEBHOOK_URL",
      "format": "🚨 *{severity}* Alert: {name}\n{message}\nTime: {timestamp}"
    },
    "email": {
      "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "user": "$EMAIL_USER",
        "pass": "$EMAIL_PASS"
      },
      "to": ["alerts@castchat.jp"],
      "subject": "[CastChat] {severity} Alert: {name}"
    },
    "sms": {
      "provider": "twilio",
      "numbers": ["+81-XX-XXXX-XXXX"]
    }
  }
}
EOF

    mkdir -p monitoring
    print_status "ok" "Alerting rules configuration created"
}

# Generate monitoring documentation
generate_monitoring_docs() {
    print_status "info" "Generating monitoring documentation..."
    
    cat > docs/production-monitoring.md << 'EOF'
# Production Monitoring Guide

## Overview

This guide covers the production monitoring setup for CastChat, including metrics, alerts, and troubleshooting procedures.

## Monitoring Stack

### Core Components
- **Vercel Analytics**: Built-in performance monitoring
- **Custom Health Checks**: Application-specific monitoring
- **Error Tracking**: Comprehensive error reporting
- **Uptime Monitoring**: Service availability checks

### Key Metrics

#### Performance Metrics
- **Response Time**: Average API response time
- **Error Rate**: Percentage of failed requests
- **Uptime**: Service availability percentage
- **Core Web Vitals**: LCP, FID, CLS measurements

#### Business Metrics
- **Active Users**: Current active user count
- **Page Views**: Total page impressions
- **Conversion Rate**: Registration/application success rate
- **User Engagement**: Session duration and bounce rate

#### Technical Metrics
- **Database Performance**: Query execution time
- **Cache Hit Rate**: Cache effectiveness
- **Bundle Size**: Application asset sizes
- **Memory Usage**: Application memory consumption

## Alert Configuration

### Critical Alerts (Immediate Response)
- Service completely down
- Database connection failures
- Security incidents
- Data corruption

### Warning Alerts (Within 1 Hour)
- High error rates (>5%)
- Slow response times (>2s)
- High memory usage (>90%)
- Cache failures

### Info Alerts (Daily Summary)
- Performance degradation
- Unusual traffic patterns
- Feature usage statistics
- System health summaries

## Monitoring Commands

```bash
# Check system health
./scripts/uptime-monitor.sh

# Collect performance metrics
node scripts/collect-metrics.js

# Generate monitoring report
./scripts/monitoring-setup.sh --report

# Test alert systems
./scripts/monitoring-setup.sh --test-alerts
```

## Troubleshooting

### High Response Times
1. Check database query performance
2. Review server resource usage
3. Analyze CDN cache hit rates
4. Investigate third-party service delays

### Error Rate Spikes
1. Check recent deployments
2. Review error logs for patterns
3. Verify external service status
4. Check database connectivity

### Memory Issues
1. Check for memory leaks
2. Review cache configuration
3. Analyze user session data
4. Monitor garbage collection

## Dashboard Access

- **Production Monitoring**: https://castchat.jp/admin/monitoring
- **Vercel Analytics**: https://vercel.com/dashboard/analytics
- **Supabase Monitoring**: https://supabase.com/dashboard/project/monitoring

## Contact Information

- **Emergency**: +81-XX-XXXX-XXXX
- **Slack**: #production-alerts
- **Email**: alerts@castchat.jp
EOF

    print_status "ok" "Monitoring documentation generated"
}

# Main execution
main() {
    local action="${1:-setup}"
    
    case $action in
        "setup")
            echo "Setting up complete production monitoring..."
            setup_vercel_monitoring
            setup_application_metrics
            setup_uptime_monitoring
            setup_error_tracking
            setup_performance_monitoring
            setup_alerting_rules
            generate_monitoring_docs
            print_status "ok" "Production monitoring setup complete!"
            ;;
        "test-alerts")
            print_status "info" "Testing alert systems..."
            # Test alert functionality
            if [ -n "$SLACK_WEBHOOK_URL" ]; then
                curl -X POST -H 'Content-type: application/json' \
                     --data '{"text":"🧪 Test alert from CastChat monitoring system"}' \
                     "$SLACK_WEBHOOK_URL"
                print_status "ok" "Test alert sent to Slack"
            else
                print_status "warn" "SLACK_WEBHOOK_URL not set"
            fi
            ;;
        "report")
            print_status "info" "Generating monitoring report..."
            # Generate comprehensive monitoring report
            echo "Monitoring Report - $(date)" > monitoring-report.txt
            echo "================================" >> monitoring-report.txt
            if command_exists curl; then
                echo "Health Check:" >> monitoring-report.txt
                curl -s https://castchat.jp/api/health | jq . >> monitoring-report.txt 2>/dev/null || echo "Health check failed" >> monitoring-report.txt
            fi
            print_status "ok" "Monitoring report generated: monitoring-report.txt"
            ;;
        *)
            echo "Usage: $0 [setup|test-alerts|report]"
            echo ""
            echo "Commands:"
            echo "  setup       Set up complete monitoring system"
            echo "  test-alerts Test alert notification systems"
            echo "  report      Generate monitoring status report"
            ;;
    esac
}

# Run main function
main "$@"
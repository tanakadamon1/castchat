# Monitoring and Alerting Setup

## Overview

This document outlines the monitoring, logging, and alerting setup for the CastChat application.

## Monitoring Stack

### 1. Vercel Analytics (Built-in)
- **Real User Monitoring (RUM)**
- **Core Web Vitals tracking**
- **Function performance monitoring**
- **Geographic performance data**

Access: https://vercel.com/dashboard/analytics

### 2. Supabase Monitoring
- **Database performance metrics**
- **API request monitoring**
- **Authentication analytics**
- **Storage usage tracking**

Access: https://supabase.com/dashboard/project/ewjfnquypoeyoicmgbnp

### 3. Application Monitoring

#### Google Analytics 4 (GA4)
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Custom Application Metrics
- Error tracking via `src/utils/logger.ts`
- Performance monitoring via `src/utils/analytics.ts`
- User behavior tracking

## Key Metrics to Monitor

### Performance Metrics
- **Page Load Time** (target: < 2s)
- **First Contentful Paint** (target: < 1.5s)
- **Largest Contentful Paint** (target: < 2.5s)
- **First Input Delay** (target: < 100ms)
- **Cumulative Layout Shift** (target: < 0.1)

### Application Metrics
- **API Response Times** (target: < 500ms)
- **Error Rates** (target: < 1%)
- **User Registration Rate**
- **Post Creation Rate**
- **Application Submission Rate**

### Infrastructure Metrics
- **Database Connection Pool Usage**
- **Storage Usage**
- **CDN Cache Hit Rate**
- **Serverless Function Cold Starts**

## Alerting Rules

### Critical Alerts (Immediate Response)
1. **Error Rate > 5%** for 5 minutes
2. **Page Load Time > 5s** for 10 minutes
3. **Database Connection Failures**
4. **Authentication Service Down**

### Warning Alerts (Within 24 hours)
1. **Error Rate > 2%** for 15 minutes
2. **Page Load Time > 3s** for 15 minutes
3. **Database Storage > 80%**
4. **API Response Time > 1s** for 10 minutes

## Dashboard Configuration

### Vercel Dashboard
- Monitor deployment status
- Track function execution times
- View bandwidth usage
- Monitor edge network performance

### Supabase Dashboard
- Database health and performance
- API usage and error rates
- Authentication metrics
- Storage usage

### Custom Monitoring Dashboard

Create a monitoring dashboard using the provided utilities:

```typescript
// Example: Monitor critical user flows
analytics.trackEvent({
  category: 'user_flow',
  action: 'post_creation_started',
  metadata: { userId: user.id }
})

// Track completion
analytics.trackEvent({
  category: 'user_flow',
  action: 'post_creation_completed',
  metadata: { 
    userId: user.id,
    duration: completionTime,
    postId: newPost.id
  }
})
```

## Log Management

### Log Levels
- **ERROR**: Application errors, failed operations
- **WARN**: Potential issues, deprecated features
- **INFO**: General application flow, user actions
- **DEBUG**: Detailed debugging information (dev only)

### Log Retention
- **Production**: 30 days
- **Staging**: 7 days
- **Development**: 1 day

### Log Aggregation
Logs are automatically collected and can be viewed in:
1. Vercel Function Logs
2. Browser DevTools (development)
3. Custom log aggregation service (if configured)

## Health Check Endpoints

### Application Health
Create health check endpoints for monitoring:

```typescript
// /api/health
export default function handler(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION,
    services: {
      database: 'ok', // Check Supabase connection
      storage: 'ok',  // Check Supabase storage
      auth: 'ok'      // Check authentication service
    }
  }
  
  res.status(200).json(health)
}
```

### Database Health
Monitor database performance:
- Connection pool status
- Query execution times
- Active connections
- Lock waits

## Incident Response

### Severity Levels

#### P0 - Critical (0-1 hour response)
- Complete service outage
- Data loss or corruption
- Security breach

#### P1 - High (1-4 hours response)
- Major feature outage
- Performance degradation affecting >50% users
- Authentication issues

#### P2 - Medium (4-24 hours response)
- Minor feature issues
- Performance issues affecting <50% users
- Non-critical bugs

#### P3 - Low (1-7 days response)
- Feature requests
- Minor improvements
- Documentation updates

### Response Procedures

1. **Acknowledge** the incident
2. **Assess** the impact and severity
3. **Escalate** if necessary
4. **Investigate** and identify root cause
5. **Implement** fix or workaround
6. **Verify** resolution
7. **Document** incident and lessons learned

## Monitoring Tools Integration

### Optional: Sentry (Error Tracking)
```bash
npm install @sentry/vue @sentry/vite-plugin
```

```typescript
// Add to main.ts
import * as Sentry from "@sentry/vue"

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
})
```

### Optional: LogRocket (Session Replay)
```bash
npm install logrocket logrocket-vue
```

```typescript
// Add to main.ts
import LogRocket from 'logrocket'

LogRocket.init(import.meta.env.VITE_LOGROCKET_APP_ID)
```

## Performance Budget

Set performance budgets to prevent regression:

```json
{
  "budget": [
    {
      "path": "/**",
      "timings": [
        {
          "metric": "interactive",
          "budget": 3000
        },
        {
          "metric": "first-contentful-paint",
          "budget": 1500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 400
        },
        {
          "resourceType": "total",
          "budget": 1000
        }
      ]
    }
  ]
}
```

## Maintenance Windows

### Scheduled Maintenance
- **Time**: Sundays 02:00-04:00 JST (lowest traffic)
- **Frequency**: Monthly
- **Duration**: Max 2 hours
- **Notification**: 48 hours advance notice

### Emergency Maintenance
- Immediate for P0 issues
- Coordination with team leads
- User notification via status page

## Status Page

Consider implementing a status page to communicate service status:
- Current service status
- Planned maintenance
- Incident history
- Performance metrics

## Monitoring Checklist

### Daily
- [ ] Check error rates
- [ ] Review performance metrics
- [ ] Monitor resource usage

### Weekly
- [ ] Review alert fatigue
- [ ] Analyze user behavior trends
- [ ] Check security metrics

### Monthly
- [ ] Review and update alerting rules
- [ ] Analyze performance trends
- [ ] Update monitoring documentation
- [ ] Review incident response procedures

## Contact Information

### On-Call Rotation
- **Primary**: Infrastructure Team
- **Secondary**: Backend Team
- **Escalation**: Technical Lead

### Communication Channels
- **Incidents**: #incidents (Discord/Slack)
- **Alerts**: #alerts (Discord/Slack)
- **General**: #infrastructure (Discord/Slack)
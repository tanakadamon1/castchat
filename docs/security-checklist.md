# Security Checklist

## Overview

This document outlines the security measures and checks that should be performed regularly to maintain the security of the CastChat application.

## Pre-Deployment Security Checks

### 1. Code Security
- [ ] No hardcoded secrets or API keys in source code
- [ ] All environment variables properly configured
- [ ] Sensitive data not logged
- [ ] Input validation implemented
- [ ] SQL injection prevention (Supabase handles this)
- [ ] XSS protection in place

### 2. Authentication & Authorization
- [ ] Strong password requirements enforced
- [ ] Session management properly configured
- [ ] JWT tokens securely handled
- [ ] Role-based access control implemented
- [ ] OAuth flow properly secured

### 3. Data Protection
- [ ] Database Row Level Security (RLS) enabled
- [ ] API endpoints properly protected
- [ ] File upload restrictions in place
- [ ] Data encryption at rest (Supabase default)
- [ ] HTTPS enforced everywhere

### 4. Infrastructure Security
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] CDN security settings enabled
- [ ] Database access restricted
- [ ] No unnecessary services exposed

## Security Headers Verification

Verify these headers are set in production:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Database Security

### Row Level Security Policies

Verify these RLS policies are active:

#### Users Table
- Users can view all profiles
- Users can only update their own profile
- Users cannot delete other users

#### Posts Table
- Anyone can view published posts
- Users can only create posts as themselves
- Users can only edit/delete their own posts

#### Applications Table
- Users can only view applications for their own posts or applications they created
- Users can only create applications as themselves
- Users can only edit their own applications

### Database Access
- [ ] Direct database access restricted to authorized personnel
- [ ] Service role key not exposed to client
- [ ] Anonymous access properly limited
- [ ] Audit logging enabled

## API Security

### Endpoint Protection
```typescript
// Example: Verify user can only access their own data
const { data: user } = await supabase.auth.getUser()
if (!user || user.id !== requestedUserId) {
  throw new Error('Unauthorized')
}
```

### Rate Limiting
- [ ] API rate limiting configured
- [ ] DoS protection enabled
- [ ] Resource usage monitoring

## File Upload Security

### Restrictions
- [ ] File type validation
- [ ] File size limits
- [ ] Malware scanning (if implemented)
- [ ] Secure storage configuration

```typescript
// Example: File upload validation
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxSize = 5 * 1024 * 1024 // 5MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type')
}

if (file.size > maxSize) {
  throw new Error('File too large')
}
```

## Client-Side Security

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co;
               frame-src 'none';">
```

### Input Sanitization
- [ ] All user inputs sanitized
- [ ] HTML entities escaped
- [ ] URL validation for external links

## Monitoring & Alerting

### Security Events to Monitor
- [ ] Failed login attempts
- [ ] Unusual API usage patterns
- [ ] Large file uploads
- [ ] Database errors
- [ ] Authentication errors

### Alerting Rules
- [ ] Multiple failed logins from same IP
- [ ] Unusual traffic patterns
- [ ] Database performance issues
- [ ] Error rate spikes

## Dependency Security

### Regular Checks
```bash
# Check for vulnerable dependencies
npm audit

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

### Automated Scanning
- [ ] Dependabot enabled
- [ ] Snyk or similar tool configured
- [ ] Regular security updates applied

## Penetration Testing

### Automated Testing
- [ ] OWASP ZAP scans
- [ ] Security-focused integration tests
- [ ] Dependency vulnerability scans

### Manual Testing
- [ ] Authentication bypass attempts
- [ ] Authorization tests
- [ ] Input validation tests
- [ ] Session management tests

## Incident Response

### Preparation
- [ ] Incident response plan documented
- [ ] Contact information up to date
- [ ] Backup and recovery procedures tested
- [ ] Security team roles defined

### Detection
- [ ] Monitoring systems in place
- [ ] Log analysis tools configured
- [ ] Alerting mechanisms tested

### Response
- [ ] Escalation procedures defined
- [ ] Communication templates prepared
- [ ] Forensic tools available

## Compliance

### Data Protection
- [ ] Privacy policy published
- [ ] Data retention policies defined
- [ ] User consent mechanisms
- [ ] Data deletion procedures

### Security Standards
- [ ] OWASP Top 10 addressed
- [ ] Security best practices followed
- [ ] Regular security reviews conducted

## Security Testing Script

Create automated security tests:

```bash
#!/bin/bash
# scripts/security-check.sh

echo "🔒 Running security checks..."

# Check for secrets in code
echo "Checking for secrets..."
git log --all --full-history -- "*.env*" | grep -i "secret\|key\|password" && echo "⚠️  Secrets found in git history!"

# Check npm audit
echo "Running npm audit..."
npm audit --audit-level=moderate

# Check for outdated packages
echo "Checking for outdated packages..."
npm outdated

# Check security headers (requires deployment)
if [ "$1" = "deployed" ]; then
  echo "Checking security headers..."
  curl -I https://castchat.jp | grep -E "(X-|Content-Security|Strict-Transport)"
fi

echo "✅ Security checks complete"
```

## Regular Security Reviews

### Weekly
- [ ] Review failed login attempts
- [ ] Check error logs for security issues
- [ ] Monitor unusual user behavior

### Monthly
- [ ] Run full npm audit
- [ ] Review and update dependencies
- [ ] Check access logs
- [ ] Review user permissions

### Quarterly
- [ ] Full security assessment
- [ ] Penetration testing
- [ ] Update security documentation
- [ ] Review incident response procedures

## Security Team Contacts

### Primary Security Contact
- **Name**: Infrastructure Team Lead
- **Email**: security@castchat.jp
- **Discord**: @infra-team

### Escalation
- **Technical Lead**: tech-lead@castchat.jp
- **Emergency**: +81-XX-XXXX-XXXX

## External Security Services

### Bug Bounty Program
Consider implementing a responsible disclosure program:
- Scope definition
- Reward structure
- Response procedures

### Third-Party Security Audits
- Annual penetration testing
- Code security reviews
- Infrastructure assessments
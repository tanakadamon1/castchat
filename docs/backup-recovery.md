# Backup and Recovery Guide

## Overview

This document outlines the backup and recovery procedures for the CastChat application, including database backups, application data recovery, and disaster recovery procedures.

## Database Backup (Supabase)

### Automatic Backups

Supabase provides automatic daily backups for all projects:

- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 7 days for free tier, 30 days for Pro+
- **Location**: Encrypted storage in the same region as your database

#### Accessing Backups
1. Go to Supabase Dashboard
2. Navigate to Settings → Database
3. Click on "Backups" tab
4. View available backup points

### Manual Backups

#### Using Supabase CLI
```bash
# Create a backup
supabase db dump --file backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
supabase db reset --file backup_20240115_120000.sql
```

#### Using pg_dump (Direct Database Access)
```bash
# Create full database backup
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > backup.sql

# Create schema-only backup
pg_dump --schema-only "postgresql://..." > schema_backup.sql

# Create data-only backup
pg_dump --data-only "postgresql://..." > data_backup.sql
```

### Backup Best Practices

1. **Regular Testing**
   - Test restore procedures monthly
   - Verify backup integrity
   - Document restore times

2. **Multiple Backup Types**
   - Full database backups
   - Schema-only backups
   - Critical table backups
   - Configuration backups

3. **Offsite Storage**
   - Store backups in multiple locations
   - Use cloud storage (S3, GCS, etc.)
   - Encrypt sensitive backups

## Application Code Backup

### Git Repository Backup

Primary backup through Git:
- **Primary**: GitHub repository
- **Mirror**: GitLab (optional)
- **Local**: Developer machines

#### Creating Repository Mirror
```bash
# Create bare mirror
git clone --mirror https://github.com/your-org/castchat.git

# Push to secondary remote
cd castchat.git
git remote add gitlab https://gitlab.com/your-org/castchat.git
git push gitlab --mirror
```

### Environment Configuration Backup

Store configuration securely:
- Environment variables documentation
- Infrastructure as Code (IaC) files
- Deployment scripts
- SSL certificates

## Disaster Recovery Procedures

### Recovery Time Objectives (RTO)

- **Database Recovery**: 30 minutes
- **Application Recovery**: 15 minutes
- **Full System Recovery**: 1 hour

### Recovery Point Objectives (RPO)

- **Database**: 24 hours (daily backups)
- **Code**: Real-time (Git)
- **Configuration**: 24 hours

### Emergency Recovery Steps

#### Database Corruption
1. **Immediate Actions**
   ```bash
   # Stop all writes to database
   # Assess corruption extent
   supabase db status
   ```

2. **Recovery Process**
   ```bash
   # Restore from latest backup
   supabase db reset --file latest_backup.sql
   
   # Verify data integrity
   npm run test:integration
   ```

3. **Validation**
   - Check critical user data
   - Verify application functionality
   - Test authentication flow

#### Application Deployment Failure
1. **Rollback Procedure**
   ```bash
   # Revert to previous deployment
   vercel promote [previous-deployment-url] --prod
   
   # Or rollback git commit
   git revert HEAD
   git push origin main
   ```

2. **Verification**
   - Check application health
   - Monitor error rates
   - Verify user access

#### Complete Infrastructure Failure
1. **New Environment Setup**
   - Create new Supabase project
   - Set up Vercel deployment
   - Configure DNS

2. **Data Recovery**
   - Restore database from backup
   - Update connection strings
   - Test all integrations

## Backup Monitoring

### Automated Monitoring
```bash
#!/bin/bash
# scripts/backup-monitor.sh

# Check last backup timestamp
LAST_BACKUP=$(supabase db backups list | head -n 1)
echo "Last backup: $LAST_BACKUP"

# Alert if backup is older than 25 hours
BACKUP_AGE=$(date -d "$LAST_BACKUP" +%s)
CURRENT_TIME=$(date +%s)
AGE_HOURS=$(( (CURRENT_TIME - BACKUP_AGE) / 3600 ))

if [ $AGE_HOURS -gt 25 ]; then
    echo "WARNING: Last backup is $AGE_HOURS hours old"
    # Send alert (Slack, email, etc.)
fi
```

### Backup Validation
```sql
-- Validate backup integrity
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY schemaname, tablename;

-- Check critical tables
SELECT count(*) as user_count FROM users;
SELECT count(*) as post_count FROM posts;
SELECT count(*) as application_count FROM applications;
```

## Data Retention Policies

### User Data
- **Active Users**: Retain indefinitely
- **Inactive Users**: 2 years after last login
- **Deleted Accounts**: 30 days soft delete, then permanent

### Application Data
- **Posts**: Retain for 1 year after closure
- **Applications**: Retain for 6 months after post closure
- **Logs**: 30 days for errors, 7 days for info

### Backup Retention
- **Daily Backups**: 30 days
- **Weekly Backups**: 3 months
- **Monthly Backups**: 1 year
- **Annual Backups**: 5 years

## Recovery Testing

### Monthly Recovery Test
```bash
#!/bin/bash
# scripts/recovery-test.sh

echo "Starting recovery test..."

# Create test backup
supabase db dump --file test_backup.sql

# Create test environment
supabase projects create test-recovery

# Restore backup to test environment
supabase db reset --file test_backup.sql

# Run integration tests
npm run test:integration

# Cleanup test environment
supabase projects delete test-recovery

echo "Recovery test completed"
```

### Test Checklist
- [ ] Database restoration successful
- [ ] All tables present with correct schema
- [ ] Data integrity verified
- [ ] Application connectivity working
- [ ] Authentication functional
- [ ] Critical user flows working

## Emergency Contacts

### Primary Contacts
- **Infrastructure Lead**: infra-lead@castchat.jp
- **Database Admin**: db-admin@castchat.jp
- **Emergency Hotline**: +81-XX-XXXX-XXXX

### Vendor Contacts
- **Supabase Support**: support@supabase.io
- **Vercel Support**: support@vercel.com
- **DNS Provider**: [contact info]

## Documentation Updates

### Change Log
- Version 1.0: Initial backup procedures
- Version 1.1: Added automated monitoring
- Version 1.2: Enhanced recovery testing

### Review Schedule
- **Monthly**: Review backup success rates
- **Quarterly**: Update recovery procedures
- **Annually**: Full disaster recovery drill

## Compliance and Legal

### Data Protection
- GDPR compliance for EU users
- User data export procedures
- Right to deletion implementation

### Audit Trail
- Backup access logs
- Recovery operation logs
- Data retention compliance

## Cost Optimization

### Backup Storage Costs
- Use compression for large backups
- Implement tiered storage (hot/cold)
- Regular cleanup of old backups

### Recovery Costs
- Pre-provisioned recovery environments
- Cross-region replication costs
- Emergency scaling costs

This backup and recovery strategy ensures the CastChat application can recover from various failure scenarios while maintaining data integrity and minimizing downtime.
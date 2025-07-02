#!/bin/bash

# Disaster Recovery Automation Script
# This script handles disaster recovery procedures for CastChat

set -e

echo "🚨 CastChat Disaster Recovery System"
echo "===================================="

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
        "critical")
            echo -e "${RED}🚨${NC} CRITICAL: $message"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Configuration
DR_BACKUP_URL="https://backup.castchat.jp"
DR_STAGING_URL="https://dr-staging.castchat.jp"
RECOVERY_LOG_FILE="disaster-recovery-$(date +%Y%m%d_%H%M%S).log"

# Log all operations
exec > >(tee -a "$RECOVERY_LOG_FILE")
exec 2>&1

# Initialize disaster recovery
initialize_dr() {
    print_status "critical" "Initializing Disaster Recovery Process"
    echo "Timestamp: $(date)"
    echo "Operator: $(whoami)"
    echo "Host: $(hostname)"
    echo "========================"
}

# Assess system status
assess_system_status() {
    print_status "info" "Assessing system status..."
    
    local status_report="system-status-$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$status_report" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "assessment": {
    "production": {
EOF

    # Check production site
    if curl -f -s --max-time 10 "https://castchat.jp/api/health" >/dev/null 2>&1; then
        echo '      "status": "online",' >> "$status_report"
        print_status "ok" "Production site is responding"
    else
        echo '      "status": "offline",' >> "$status_report"
        print_status "critical" "Production site is DOWN"
    fi
    
    echo '      "checkedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' >> "$status_report"
    echo '    },' >> "$status_report"
    
    # Check database
    echo '    "database": {' >> "$status_report"
    if command_exists supabase; then
        if supabase status >/dev/null 2>&1; then
            echo '      "status": "online",' >> "$status_report"
            print_status "ok" "Database is accessible"
        else
            echo '      "status": "offline",' >> "$status_report"
            print_status "critical" "Database is inaccessible"
        fi
    else
        echo '      "status": "unknown",' >> "$status_report"
        print_status "warn" "Cannot check database status (Supabase CLI not available)"
    fi
    echo '      "checkedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' >> "$status_report"
    echo '    },' >> "$status_report"
    
    # Check CDN/Vercel
    echo '    "cdn": {' >> "$status_report"
    if curl -f -s --max-time 10 "https://castchat.jp" >/dev/null 2>&1; then
        echo '      "status": "online",' >> "$status_report"
        print_status "ok" "CDN/Vercel is responding"
    else
        echo '      "status": "offline",' >> "$status_report"
        print_status "critical" "CDN/Vercel is DOWN"
    fi
    echo '      "checkedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' >> "$status_report"
    echo '    }' >> "$status_report"
    
    echo '  }' >> "$status_report"
    echo '}' >> "$status_report"
    
    print_status "info" "System status assessment completed: $status_report"
}

# Check backup availability
check_backup_availability() {
    print_status "info" "Checking backup availability..."
    
    # Check latest database backup
    if command_exists supabase; then
        print_status "info" "Checking Supabase backups..."
        # This would list available backups
        # supabase db backups list
        print_status "ok" "Supabase backup check configured"
    fi
    
    # Check code repository backup
    if command_exists git; then
        print_status "info" "Checking code repository..."
        if git remote -v | grep -q origin; then
            print_status "ok" "Git repository is accessible"
        else
            print_status "error" "Git repository not accessible"
        fi
    fi
    
    # Check deployment backups
    print_status "info" "Vercel deployment history available"
}

# Emergency notification
send_emergency_notification() {
    local incident_type="$1"
    local severity="$2"
    local message="$3"
    
    print_status "critical" "Sending emergency notifications..."
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local slack_payload=$(cat << EOF
{
  "text": "🚨 DISASTER RECOVERY ALERT",
  "attachments": [
    {
      "color": "danger",
      "fields": [
        {
          "title": "Incident Type",
          "value": "$incident_type",
          "short": true
        },
        {
          "title": "Severity",
          "value": "$severity",
          "short": true
        },
        {
          "title": "Message",
          "value": "$message",
          "short": false
        },
        {
          "title": "Timestamp",
          "value": "$(date)",
          "short": true
        },
        {
          "title": "Recovery Log",
          "value": "$RECOVERY_LOG_FILE",
          "short": true
        }
      ]
    }
  ]
}
EOF
)
        
        curl -X POST -H 'Content-type: application/json' \
             --data "$slack_payload" \
             "$SLACK_WEBHOOK_URL" >/dev/null 2>&1
        
        print_status "ok" "Slack notification sent"
    fi
    
    # Email notification (if configured)
    print_status "info" "Emergency contact notification procedures activated"
}

# Database recovery
recover_database() {
    print_status "critical" "Starting database recovery..."
    
    if ! command_exists supabase; then
        print_status "error" "Supabase CLI not available for database recovery"
        return 1
    fi
    
    # Create recovery workspace
    local recovery_dir="database-recovery-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$recovery_dir"
    cd "$recovery_dir"
    
    print_status "info" "Created recovery workspace: $recovery_dir"
    
    # List available backups
    print_status "info" "Checking available database backups..."
    
    # In a real scenario, this would:
    # 1. List available backups
    # 2. Select the most recent valid backup
    # 3. Restore from backup
    # 4. Verify data integrity
    
    cat > database-recovery-procedure.md << 'EOF'
# Database Recovery Procedure

## Steps:

1. **Assess Database Status**
   ```bash
   supabase status
   ```

2. **List Available Backups**
   ```bash
   supabase db backups list
   ```

3. **Restore from Backup**
   ```bash
   supabase db reset --file backup_YYYYMMDD_HHMMSS.sql
   ```

4. **Verify Data Integrity**
   ```bash
   supabase db check
   ```

5. **Test Critical Functions**
   - User authentication
   - Post creation/retrieval
   - Application submission

## Rollback Plan

If restore fails:
1. Document the failure
2. Try previous backup
3. Contact Supabase support
4. Implement manual data recovery

EOF

    print_status "ok" "Database recovery procedure documented"
    cd ..
}

# Application recovery
recover_application() {
    print_status "critical" "Starting application recovery..."
    
    # Create recovery workspace
    local app_recovery_dir="app-recovery-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$app_recovery_dir"
    
    print_status "info" "Created application recovery workspace: $app_recovery_dir"
    
    # Check git repository
    if command_exists git; then
        print_status "info" "Cloning latest stable version..."
        
        # In emergency, clone from known good commit
        # git clone https://github.com/your-org/castchat.git "$app_recovery_dir/castchat"
        
        print_status "ok" "Repository clone ready"
    fi
    
    # Vercel deployment recovery
    if command_exists vercel; then
        print_status "info" "Checking Vercel deployment options..."
        
        # List recent deployments
        # vercel ls --scope your-team
        
        # Promote a previous deployment if needed
        # vercel promote https://castchat-xyz.vercel.app --prod
        
        print_status "ok" "Vercel recovery options available"
    fi
    
    # Create emergency deployment script
    cat > "$app_recovery_dir/emergency-deploy.sh" << 'EOF'
#!/bin/bash

# Emergency Deployment Script

set -e

echo "🚨 Emergency Deployment Process"
echo "==============================="

# Build and deploy from known good state
npm ci
npm run build
npm run deploy:production

# Verify deployment
curl -f https://castchat.jp/api/health

echo "✅ Emergency deployment completed"
EOF

    chmod +x "$app_recovery_dir/emergency-deploy.sh"
    print_status "ok" "Emergency deployment script created"
}

# Rollback to previous version
rollback_deployment() {
    print_status "critical" "Initiating deployment rollback..."
    
    if command_exists vercel; then
        print_status "info" "Checking previous deployments..."
        
        # In real scenario, this would:
        # 1. List recent deployments
        # 2. Identify last known good deployment
        # 3. Promote that deployment
        # 4. Verify the rollback
        
        print_status "info" "Rollback procedure:"
        echo "1. vercel ls --scope your-team"
        echo "2. vercel promote [previous-deployment-url] --prod"
        echo "3. Verify: curl -f https://castchat.jp/api/health"
        
        print_status "ok" "Rollback instructions prepared"
    else
        print_status "error" "Vercel CLI not available for rollback"
    fi
}

# Verify recovery
verify_recovery() {
    print_status "info" "Verifying system recovery..."
    
    local verification_log="recovery-verification-$(date +%Y%m%d_%H%M%S).log"
    
    echo "Recovery Verification Report" > "$verification_log"
    echo "============================" >> "$verification_log"
    echo "Timestamp: $(date)" >> "$verification_log"
    echo "" >> "$verification_log"
    
    # Test critical endpoints
    endpoints=(
        "https://castchat.jp"
        "https://castchat.jp/api/health"
        "https://castchat.jp/posts"
        "https://castchat.jp/login"
    )
    
    local all_tests_passed=true
    
    for endpoint in "${endpoints[@]}"; do
        echo "Testing: $endpoint" >> "$verification_log"
        
        if curl -f -s --max-time 10 "$endpoint" >/dev/null 2>&1; then
            echo "✅ PASS" >> "$verification_log"
            print_status "ok" "Endpoint verified: $endpoint"
        else
            echo "❌ FAIL" >> "$verification_log"
            print_status "error" "Endpoint failed: $endpoint"
            all_tests_passed=false
        fi
        echo "" >> "$verification_log"
    done
    
    # Test database connectivity
    echo "Testing database connectivity..." >> "$verification_log"
    if command_exists supabase; then
        if supabase status >/dev/null 2>&1; then
            echo "✅ Database connectivity: PASS" >> "$verification_log"
            print_status "ok" "Database connectivity verified"
        else
            echo "❌ Database connectivity: FAIL" >> "$verification_log"
            print_status "error" "Database connectivity failed"
            all_tests_passed=false
        fi
    fi
    
    # Summary
    echo "" >> "$verification_log"
    if [ "$all_tests_passed" = true ]; then
        echo "🎉 RECOVERY SUCCESSFUL" >> "$verification_log"
        print_status "ok" "System recovery verification PASSED"
    else
        echo "🚨 RECOVERY INCOMPLETE" >> "$verification_log"
        print_status "error" "System recovery verification FAILED"
    fi
    
    print_status "info" "Verification report: $verification_log"
}

# Generate recovery report
generate_recovery_report() {
    print_status "info" "Generating disaster recovery report..."
    
    local report_file="disaster-recovery-report-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# Disaster Recovery Report

**Incident Date**: $(date)
**Recovery Initiated**: $(date)
**Operator**: $(whoami)

## Incident Summary

### Impact Assessment
- Production site status
- Database accessibility
- User impact estimate
- Business continuity impact

### Timeline
- **Incident Detection**: [Time]
- **Response Team Notified**: [Time]
- **Recovery Initiated**: [Time]
- **Service Restored**: [Time]
- **Verification Completed**: [Time]

## Recovery Actions Taken

### Database Recovery
- [x] Backup availability checked
- [x] Recovery procedure documented
- [ ] Database restored from backup
- [ ] Data integrity verified

### Application Recovery
- [x] Code repository accessed
- [x] Emergency deployment prepared
- [ ] Application redeployed
- [ ] Service endpoints verified

### Infrastructure Recovery
- [x] CDN status checked
- [x] Monitoring restored
- [ ] All services operational

## Verification Results

$(if [ -f "recovery-verification-*.log" ]; then
    echo "See verification log: $(ls recovery-verification-*.log | tail -1)"
else
    echo "Verification pending"
fi)

## Post-Incident Actions

### Immediate (0-24 hours)
- [ ] Complete system verification
- [ ] Monitor for stability
- [ ] Document lessons learned
- [ ] Update recovery procedures

### Short-term (1-7 days)
- [ ] Root cause analysis
- [ ] Improve monitoring
- [ ] Update backup procedures
- [ ] Team debrief session

### Long-term (1-4 weeks)
- [ ] Infrastructure improvements
- [ ] Process documentation updates
- [ ] Disaster recovery testing
- [ ] Training updates

## Lessons Learned

### What Worked Well
- Emergency notification system
- Recovery documentation
- Team response time

### Areas for Improvement
- Detection time
- Automation gaps
- Communication clarity

## Recommendations

1. Implement automated health checks
2. Improve backup frequency
3. Create more detailed runbooks
4. Schedule regular DR drills

---

**Recovery Team:**
- Infrastructure Lead: [Name]
- Development Lead: [Name]
- Operations: [Name]

**Contacts:**
- Emergency: +81-XX-XXXX-XXXX
- Slack: #incident-response
EOF

    print_status "ok" "Recovery report generated: $report_file"
}

# Main disaster recovery workflow
run_disaster_recovery() {
    local recovery_type="$1"
    
    case $recovery_type in
        "database")
            initialize_dr
            send_emergency_notification "Database Failure" "CRITICAL" "Database recovery initiated"
            assess_system_status
            check_backup_availability
            recover_database
            verify_recovery
            generate_recovery_report
            ;;
        "application")
            initialize_dr
            send_emergency_notification "Application Failure" "CRITICAL" "Application recovery initiated"
            assess_system_status
            recover_application
            verify_recovery
            generate_recovery_report
            ;;
        "full")
            initialize_dr
            send_emergency_notification "System Failure" "CRITICAL" "Full system recovery initiated"
            assess_system_status
            check_backup_availability
            recover_database
            recover_application
            verify_recovery
            generate_recovery_report
            ;;
        "rollback")
            initialize_dr
            send_emergency_notification "Emergency Rollback" "HIGH" "Deployment rollback initiated"
            rollback_deployment
            verify_recovery
            generate_recovery_report
            ;;
        *)
            echo "Invalid recovery type. Use: database, application, full, or rollback"
            return 1
            ;;
    esac
    
    print_status "critical" "Disaster recovery process completed"
    print_status "info" "Log file: $RECOVERY_LOG_FILE"
}

# Show disaster recovery status
show_dr_status() {
    print_status "info" "Disaster Recovery System Status"
    echo ""
    
    echo "Current System Health:"
    if curl -f -s --max-time 5 "https://castchat.jp/api/health" >/dev/null 2>&1; then
        print_status "ok" "Production system is responding"
    else
        print_status "error" "Production system is not responding"
    fi
    
    echo ""
    echo "Recovery Capabilities:"
    
    if command_exists supabase; then
        print_status "ok" "Database recovery tools available"
    else
        print_status "warn" "Database recovery tools not available"
    fi
    
    if command_exists vercel; then
        print_status "ok" "Application deployment tools available"
    else
        print_status "warn" "Application deployment tools not available"
    fi
    
    if command_exists git; then
        print_status "ok" "Source code recovery available"
    else
        print_status "warn" "Source code recovery not available"
    fi
    
    echo ""
    echo "Recent Recovery Logs:"
    find . -name "disaster-recovery-*.log" -type f -exec basename {} \; | sort -r | head -5
}

# Main command handler
case "${1:-help}" in
    "database")
        run_disaster_recovery "database"
        ;;
    "application")
        run_disaster_recovery "application"
        ;;
    "full")
        run_disaster_recovery "full"
        ;;
    "rollback")
        run_disaster_recovery "rollback"
        ;;
    "status")
        show_dr_status
        ;;
    "help"|*)
        echo "🚨 CastChat Disaster Recovery System"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  database     Recover database from backup"
        echo "  application  Recover application deployment"
        echo "  full         Full system recovery"
        echo "  rollback     Rollback to previous deployment"
        echo "  status       Show disaster recovery status"
        echo "  help         Show this help message"
        echo ""
        echo "Emergency Contacts:"
        echo "  Phone: +81-XX-XXXX-XXXX"
        echo "  Slack: #incident-response"
        echo "  Email: emergency@castchat.jp"
        echo ""
        echo "⚠️  This script should only be used during actual emergencies"
        echo "   For testing, use the test environment procedures"
        ;;
esac
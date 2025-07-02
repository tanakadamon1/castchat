#!/bin/bash

# Bug Tracking Automation Script
# This script helps with bug tracking and resolution workflow

set -e

echo "🐛 CastChat Bug Tracking System"
echo "==============================="

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

# Create a new bug report
create_bug_report() {
    local title="$1"
    local severity="$2"
    local description="$3"
    
    if [ -z "$title" ] || [ -z "$severity" ] || [ -z "$description" ]; then
        echo "Usage: $0 create \"Bug Title\" \"P0|P1|P2|P3\" \"Description\""
        return 1
    fi
    
    print_status "info" "Creating bug report: $title"
    
    # Generate bug report template
    local bug_file="bug-reports/bug-$(date +%Y%m%d_%H%M%S).md"
    mkdir -p bug-reports
    
    cat > "$bug_file" << EOF
# Bug Report: $title

**Created**: $(date)
**Severity**: $severity
**Status**: Open
**Assigned**: Unassigned

## Description
$description

## Environment
- **Browser**: 
- **Device**: 
- **OS**: 
- **User**: 

## Reproduction Steps
1. 
2. 
3. 

## Expected Behavior


## Actual Behavior


## Error Messages


## Additional Information


## Resolution
<!-- To be filled when bug is resolved -->

EOF

    print_status "ok" "Bug report created: $bug_file"
    
    # If gh CLI is available, create GitHub issue
    if command_exists gh; then
        local labels="bug"
        case $severity in
            "P0") labels="$labels,critical,P0" ;;
            "P1") labels="$labels,high,P1" ;;
            "P2") labels="$labels,medium,P2" ;;
            "P3") labels="$labels,low,P3" ;;
        esac
        
        gh issue create \
            --title "[$severity] $title" \
            --body-file "$bug_file" \
            --label "$labels"
        
        print_status "ok" "GitHub issue created"
    fi
}

# List open bugs
list_bugs() {
    print_status "info" "Listing open bugs..."
    
    if command_exists gh; then
        gh issue list --label "bug" --state open --json number,title,labels,createdAt \
            --template '{{range .}}{{printf "#%v" .number | color "blue"}} {{.title}} {{range .labels}}[{{.name}}] {{end}}{{printf "\n   Created: %s\n" (.createdAt | date "2006-01-02 15:04")}}{{end}}'
    else
        print_status "warn" "GitHub CLI not available. Listing local bug reports..."
        if [ -d "bug-reports" ]; then
            find bug-reports -name "*.md" -exec basename {} \; | sort
        else
            print_status "info" "No local bug reports found"
        fi
    fi
}

# Analyze bug trends
analyze_bugs() {
    print_status "info" "Analyzing bug trends..."
    
    if command_exists gh; then
        echo "Bug Analysis Report"
        echo "==================="
        
        # Total bugs
        total_bugs=$(gh issue list --label "bug" --state all --json number | jq length)
        open_bugs=$(gh issue list --label "bug" --state open --json number | jq length)
        closed_bugs=$(gh issue list --label "bug" --state closed --json number | jq length)
        
        echo "Total bugs: $total_bugs"
        echo "Open bugs: $open_bugs"
        echo "Closed bugs: $closed_bugs"
        echo ""
        
        # Bugs by severity
        echo "Bugs by Severity:"
        echo "----------------"
        for severity in P0 P1 P2 P3; do
            count=$(gh issue list --label "bug,$severity" --state all --json number | jq length)
            echo "$severity: $count"
        done
        echo ""
        
        # Recent bugs (last 7 days)
        echo "Recent Bugs (Last 7 days):"
        echo "-------------------------"
        gh issue list --label "bug" --state all --created "$(date -d '7 days ago' '+%Y-%m-%d')" \
            --json number,title,createdAt \
            --template '{{range .}}#{{.number}} {{.title}} ({{.createdAt | date "2006-01-02"}}){{"\n"}}{{end}}'
    else
        print_status "warn" "GitHub CLI not available. Cannot analyze bugs."
    fi
}

# Run automated bug detection
detect_bugs() {
    print_status "info" "Running automated bug detection..."
    
    # Check for JavaScript errors in build
    if [ -f "dist/index.html" ]; then
        print_status "info" "Checking build for potential issues..."
        
        # Check for console.error or console.warn in production build
        if grep -r "console\." dist/ >/dev/null 2>&1; then
            print_status "warn" "Console statements found in production build"
        fi
        
        # Check bundle size
        bundle_size=$(du -sb dist | cut -f1)
        if [ "$bundle_size" -gt 10485760 ]; then # 10MB
            print_status "warn" "Bundle size is large (>10MB): $(du -sh dist | cut -f1)"
        fi
    fi
    
    # Check for security vulnerabilities
    if command_exists npm; then
        print_status "info" "Checking for security vulnerabilities..."
        if npm audit --audit-level=moderate --json > audit_result.json 2>/dev/null; then
            vulnerabilities=$(jq '.metadata.vulnerabilities.total' audit_result.json 2>/dev/null || echo "0")
            if [ "$vulnerabilities" -gt 0 ]; then
                print_status "warn" "Found $vulnerabilities security vulnerabilities"
                print_status "info" "Run 'npm audit' for details"
            else
                print_status "ok" "No security vulnerabilities found"
            fi
        fi
        rm -f audit_result.json
    fi
    
    # Check for TypeScript errors
    if command_exists npx; then
        print_status "info" "Checking for TypeScript errors..."
        if npx tsc --noEmit >/dev/null 2>&1; then
            print_status "ok" "No TypeScript errors found"
        else
            print_status "warn" "TypeScript errors detected"
            print_status "info" "Run 'npm run type-check' for details"
        fi
    fi
    
    # Check for linting errors
    if command_exists npm; then
        print_status "info" "Checking for linting errors..."
        if npm run lint >/dev/null 2>&1; then
            print_status "ok" "No linting errors found"
        else
            print_status "warn" "Linting errors detected"
            print_status "info" "Run 'npm run lint' for details"
        fi
    fi
}

# Generate bug report
generate_report() {
    print_status "info" "Generating comprehensive bug report..."
    
    local report_file="bug-analysis-$(date +%Y%m%d).md"
    
    cat > "$report_file" << EOF
# Bug Analysis Report

**Generated**: $(date)
**Period**: Last 30 days

## Summary

$(analyze_bugs 2>&1)

## Automated Bug Detection

$(detect_bugs 2>&1)

## Recommendations

### High Priority Actions
- [ ] Review and fix all P0/P1 bugs
- [ ] Implement additional automated testing
- [ ] Update error handling and logging
- [ ] Review security vulnerabilities

### Process Improvements
- [ ] Enhance bug triage process
- [ ] Implement better error tracking
- [ ] Add more comprehensive testing
- [ ] Improve documentation

### Monitoring Enhancements
- [ ] Set up real-time error alerts
- [ ] Implement performance monitoring
- [ ] Add user experience tracking
- [ ] Enhance log analysis

## Next Steps

1. Address critical and high-priority bugs
2. Implement recommended process improvements
3. Schedule regular bug review meetings
4. Update bug tracking documentation

EOF

    print_status "ok" "Bug report generated: $report_file"
}

# Assign bug to team member
assign_bug() {
    local bug_number="$1"
    local assignee="$2"
    
    if [ -z "$bug_number" ] || [ -z "$assignee" ]; then
        echo "Usage: $0 assign <bug-number> <assignee>"
        return 1
    fi
    
    if command_exists gh; then
        gh issue edit "$bug_number" --add-assignee "$assignee"
        print_status "ok" "Bug #$bug_number assigned to $assignee"
    else
        print_status "error" "GitHub CLI not available"
    fi
}

# Close bug
close_bug() {
    local bug_number="$1"
    local comment="$2"
    
    if [ -z "$bug_number" ]; then
        echo "Usage: $0 close <bug-number> [comment]"
        return 1
    fi
    
    if command_exists gh; then
        if [ -n "$comment" ]; then
            gh issue comment "$bug_number" --body "$comment"
        fi
        gh issue close "$bug_number"
        print_status "ok" "Bug #$bug_number closed"
    else
        print_status "error" "GitHub CLI not available"
    fi
}

# Show usage
show_usage() {
    echo "CastChat Bug Tracking System"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  create <title> <severity> <description>  Create new bug report"
    echo "  list                                     List open bugs"
    echo "  analyze                                  Analyze bug trends"
    echo "  detect                                   Run automated bug detection"
    echo "  report                                   Generate comprehensive report"
    echo "  assign <number> <assignee>               Assign bug to team member"
    echo "  close <number> [comment]                 Close bug with optional comment"
    echo "  help                                     Show this help message"
    echo ""
    echo "Severity Levels:"
    echo "  P0    Critical (0-2 hours response)"
    echo "  P1    High (2-8 hours response)"
    echo "  P2    Medium (1-3 days response)"
    echo "  P3    Low (3-7 days response)"
    echo ""
    echo "Examples:"
    echo "  $0 create \"Login fails on mobile\" P1 \"Users cannot login on mobile devices\""
    echo "  $0 list"
    echo "  $0 assign 123 @username"
    echo "  $0 close 123 \"Fixed in commit abc123\""
}

# Main command handler
case "${1:-help}" in
    "create")
        create_bug_report "$2" "$3" "$4"
        ;;
    "list")
        list_bugs
        ;;
    "analyze")
        analyze_bugs
        ;;
    "detect")
        detect_bugs
        ;;
    "report")
        generate_report
        ;;
    "assign")
        assign_bug "$2" "$3"
        ;;
    "close")
        close_bug "$2" "$3"
        ;;
    "help"|*)
        show_usage
        ;;
esac
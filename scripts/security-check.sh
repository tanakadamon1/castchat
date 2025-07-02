#!/bin/bash

# Security Check Script
# This script performs automated security checks before deployment

set -e

echo "🔒 CastChat Security Check"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    
    case $status in
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

# Check for secrets in environment files
check_secrets() {
    echo ""
    echo "Checking for exposed secrets..."
    
    # Check if .env.production is in git
    if git ls-files --error-unmatch .env.production 2>/dev/null; then
        print_status "error" ".env.production file is tracked by git!"
        echo "  Run: git rm --cached .env.production"
        return 1
    else
        print_status "ok" ".env.production not tracked by git"
    fi
    
    # Check for secrets in git history
    if git log --all --full-history --source -- "*.env*" | grep -qi "secret\|key\|password"; then
        print_status "warn" "Possible secrets found in git history"
        echo "  Consider using git-filter-branch to clean history"
    else
        print_status "ok" "No obvious secrets in git history"
    fi
    
    # Check for hardcoded secrets in source
    if grep -r -E "(secret|key|password|token).*=.*['\"][a-zA-Z0-9]{20,}" src/ 2>/dev/null; then
        print_status "error" "Hardcoded secrets found in source code!"
        return 1
    else
        print_status "ok" "No hardcoded secrets found in source"
    fi
}

# Check npm dependencies for vulnerabilities
check_dependencies() {
    echo ""
    echo "Checking dependencies for vulnerabilities..."
    
    if command_exists npm; then
        # Run npm audit
        if npm audit --audit-level=moderate; then
            print_status "ok" "No moderate or high vulnerabilities found"
        else
            print_status "error" "Vulnerabilities found in dependencies!"
            echo "  Run: npm audit fix"
            return 1
        fi
        
        # Check for outdated packages
        outdated=$(npm outdated --json 2>/dev/null || echo "{}")
        if [ "$outdated" = "{}" ]; then
            print_status "ok" "All packages are up to date"
        else
            print_status "warn" "Some packages are outdated"
            npm outdated
        fi
    else
        print_status "error" "npm not found"
        return 1
    fi
}

# Check TypeScript compilation
check_typescript() {
    echo ""
    echo "Checking TypeScript compilation..."
    
    if npm run type-check; then
        print_status "ok" "TypeScript compilation successful"
    else
        print_status "error" "TypeScript compilation failed!"
        return 1
    fi
}

# Check linting
check_linting() {
    echo ""
    echo "Checking code quality..."
    
    if npm run lint; then
        print_status "ok" "Linting passed"
    else
        print_status "error" "Linting failed!"
        echo "  Run: npm run lint:fix"
        return 1
    fi
}

# Check environment files
check_env_files() {
    echo ""
    echo "Checking environment configuration..."
    
    # Check if .env.example exists
    if [ -f ".env.example" ]; then
        print_status "ok" ".env.example exists"
    else
        print_status "error" ".env.example missing!"
        return 1
    fi
    
    # Check if .env.local.example exists
    if [ -f ".env.local.example" ]; then
        print_status "ok" ".env.local.example exists"
    else
        print_status "error" ".env.local.example missing!"
        return 1
    fi
    
    # Check for required environment variables in examples
    required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_APP_URL")
    
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.example; then
            print_status "ok" "$var defined in .env.example"
        else
            print_status "error" "$var missing from .env.example!"
            return 1
        fi
    done
}

# Check build process
check_build() {
    echo ""
    echo "Checking build process..."
    
    if npm run build; then
        print_status "ok" "Build successful"
        
        # Check build size
        if [ -d "dist" ]; then
            build_size=$(du -sh dist | cut -f1)
            print_status "ok" "Build size: $build_size"
            
            # Warn if build is too large (> 10MB)
            size_bytes=$(du -sb dist | cut -f1)
            if [ "$size_bytes" -gt 10485760 ]; then
                print_status "warn" "Build size is large (>10MB). Consider optimization."
            fi
        fi
    else
        print_status "error" "Build failed!"
        return 1
    fi
}

# Check security headers in production (if URL provided)
check_production_headers() {
    local url=$1
    
    if [ -n "$url" ]; then
        echo ""
        echo "Checking security headers for $url..."
        
        if command_exists curl; then
            headers=$(curl -sI "$url" 2>/dev/null || echo "")
            
            # Check for security headers
            security_headers=("X-Content-Type-Options" "X-Frame-Options" "X-XSS-Protection" "Referrer-Policy")
            
            for header in "${security_headers[@]}"; do
                if echo "$headers" | grep -qi "$header"; then
                    print_status "ok" "$header header present"
                else
                    print_status "warn" "$header header missing"
                fi
            done
            
            # Check for HTTPS
            if echo "$url" | grep -q "^https://"; then
                print_status "ok" "Using HTTPS"
            else
                print_status "error" "Not using HTTPS!"
                return 1
            fi
        else
            print_status "warn" "curl not available, skipping header check"
        fi
    fi
}

# Main execution
main() {
    local production_url=""
    local exit_code=0
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --url)
                production_url="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [--url PRODUCTION_URL]"
                echo ""
                echo "Options:"
                echo "  --url URL    Check security headers for production URL"
                echo "  --help       Show this help message"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run checks
    check_env_files || exit_code=1
    check_secrets || exit_code=1
    check_dependencies || exit_code=1
    check_typescript || exit_code=1
    check_linting || exit_code=1
    check_build || exit_code=1
    
    if [ -n "$production_url" ]; then
        check_production_headers "$production_url" || exit_code=1
    fi
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        print_status "ok" "All security checks passed!"
        echo ""
        echo "🚀 Ready for deployment!"
    else
        print_status "error" "Some security checks failed!"
        echo ""
        echo "❌ Please fix issues before deployment"
    fi
    
    exit $exit_code
}

# Run main function with all arguments
main "$@"
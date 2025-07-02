#!/bin/bash

# Production Deployment Script
# This script handles the deployment process for CastChat

set -e

echo "🚀 CastChat Deployment Script"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
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

# Check prerequisites
check_prerequisites() {
    print_status "info" "Checking prerequisites..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node -v)
        print_status "ok" "Node.js $NODE_VERSION"
    else
        print_status "error" "Node.js not found!"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        print_status "ok" "npm $NPM_VERSION"
    else
        print_status "error" "npm not found!"
        exit 1
    fi
    
    # Check git
    if command_exists git; then
        print_status "ok" "Git available"
    else
        print_status "error" "Git not found!"
        exit 1
    fi
    
    # Check if we're on main branch for production
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$1" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        print_status "error" "Production deployment must be from main branch (currently on $CURRENT_BRANCH)"
        exit 1
    fi
    
    print_status "ok" "Prerequisites check passed"
}

# Run pre-deployment checks
run_pre_deployment_checks() {
    print_status "info" "Running pre-deployment checks..."
    
    # Run security checks
    if ./scripts/security-check.sh; then
        print_status "ok" "Security checks passed"
    else
        print_status "error" "Security checks failed!"
        exit 1
    fi
    
    # Run tests
    print_status "info" "Running tests..."
    if npm run test:integration; then
        print_status "ok" "Integration tests passed"
    else
        print_status "error" "Integration tests failed!"
        exit 1
    fi
    
    print_status "ok" "Pre-deployment checks completed"
}

# Build application
build_application() {
    print_status "info" "Building application..."
    
    # Install dependencies
    if npm ci; then
        print_status "ok" "Dependencies installed"
    else
        print_status "error" "Failed to install dependencies!"
        exit 1
    fi
    
    # Build
    if npm run build; then
        print_status "ok" "Application built successfully"
        
        # Show build info
        if [ -d "dist" ]; then
            BUILD_SIZE=$(du -sh dist | cut -f1)
            print_status "info" "Build size: $BUILD_SIZE"
        fi
    else
        print_status "error" "Build failed!"
        exit 1
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    local environment=$1
    
    print_status "info" "Deploying to Vercel ($environment)..."
    
    if command_exists vercel; then
        case $environment in
            "production")
                if vercel --prod --yes; then
                    print_status "ok" "Deployed to production"
                else
                    print_status "error" "Production deployment failed!"
                    exit 1
                fi
                ;;
            "staging")
                if vercel --yes; then
                    print_status "ok" "Deployed to staging"
                else
                    print_status "error" "Staging deployment failed!"
                    exit 1
                fi
                ;;
            "preview")
                if vercel --yes; then
                    print_status "ok" "Preview deployment created"
                else
                    print_status "error" "Preview deployment failed!"
                    exit 1
                fi
                ;;
        esac
    else
        print_status "warn" "Vercel CLI not found. Using GitHub Actions for deployment."
    fi
}

# Run post-deployment checks
run_post_deployment_checks() {
    local url=$1
    
    if [ -n "$url" ]; then
        print_status "info" "Running post-deployment checks for $url..."
        
        # Wait for deployment to be ready
        print_status "info" "Waiting for deployment to be ready..."
        sleep 30
        
        # Check if site is accessible
        if command_exists curl; then
            if curl -f -s "$url" > /dev/null; then
                print_status "ok" "Site is accessible"
            else
                print_status "error" "Site is not accessible!"
                exit 1
            fi
            
            # Check security headers
            if ./scripts/security-check.sh --url "$url"; then
                print_status "ok" "Security headers verified"
            else
                print_status "warn" "Some security headers are missing"
            fi
        else
            print_status "warn" "curl not available, skipping accessibility check"
        fi
    else
        print_status "info" "No URL provided, skipping post-deployment checks"
    fi
}

# Database migration (if needed)
run_database_migration() {
    print_status "info" "Checking for database migrations..."
    
    if command_exists supabase; then
        # Check if there are pending migrations
        if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations)" ]; then
            print_status "info" "Running database migrations..."
            
            if supabase db push; then
                print_status "ok" "Database migrations completed"
            else
                print_status "error" "Database migrations failed!"
                exit 1
            fi
        else
            print_status "info" "No migrations to run"
        fi
    else
        print_status "warn" "Supabase CLI not found, skipping migrations"
    fi
}

# Create deployment tag
create_deployment_tag() {
    local environment=$1
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local tag="deploy_${environment}_${timestamp}"
    
    print_status "info" "Creating deployment tag: $tag"
    
    if git tag -a "$tag" -m "Deployment to $environment on $(date)"; then
        print_status "ok" "Tag created: $tag"
        
        # Push tag to remote
        if git push origin "$tag"; then
            print_status "ok" "Tag pushed to remote"
        else
            print_status "warn" "Failed to push tag to remote"
        fi
    else
        print_status "warn" "Failed to create deployment tag"
    fi
}

# Send deployment notification
send_notification() {
    local environment=$1
    local status=$2
    local url=${3:-""}
    
    # This can be extended to send notifications to Discord, Slack, etc.
    print_status "info" "Deployment notification: $environment - $status"
    
    if [ -n "$url" ]; then
        print_status "info" "Deployment URL: $url"
    fi
}

# Show deployment summary
show_summary() {
    local environment=$1
    local url=${2:-""}
    
    echo ""
    echo "=============================="
    echo "🎉 Deployment Summary"
    echo "=============================="
    echo "Environment: $environment"
    echo "Branch: $(git branch --show-current)"
    echo "Commit: $(git rev-parse --short HEAD)"
    echo "Time: $(date)"
    
    if [ -n "$url" ]; then
        echo "URL: $url"
    fi
    
    echo ""
    echo "Next Steps:"
    echo "- Monitor deployment at $url"
    echo "- Check application logs"
    echo "- Verify core functionality"
    echo "- Update team about deployment"
    echo ""
}

# Main deployment function
deploy() {
    local environment=${1:-"staging"}
    local skip_checks=${2:-false}
    local deployment_url=""
    
    echo "Starting deployment to $environment..."
    echo ""
    
    # Set deployment URL based on environment
    case $environment in
        "production")
            deployment_url="https://castchat.jp"
            ;;
        "staging")
            deployment_url="https://staging.castchat.jp"
            ;;
        "preview")
            deployment_url="" # Will be generated by Vercel
            ;;
    esac
    
    # Step 1: Check prerequisites
    check_prerequisites "$environment"
    
    # Step 2: Run pre-deployment checks (unless skipped)
    if [ "$skip_checks" != "true" ]; then
        run_pre_deployment_checks
    else
        print_status "warn" "Skipping pre-deployment checks"
    fi
    
    # Step 3: Run database migrations
    run_database_migration
    
    # Step 4: Build application
    build_application
    
    # Step 5: Deploy to Vercel
    deploy_to_vercel "$environment"
    
    # Step 6: Create deployment tag
    create_deployment_tag "$environment"
    
    # Step 7: Run post-deployment checks
    run_post_deployment_checks "$deployment_url"
    
    # Step 8: Send notification
    send_notification "$environment" "success" "$deployment_url"
    
    # Step 9: Show summary
    show_summary "$environment" "$deployment_url"
    
    print_status "ok" "Deployment completed successfully!"
}

# Script usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [ENVIRONMENT]"
    echo ""
    echo "ENVIRONMENT:"
    echo "  production    Deploy to production (main branch only)"
    echo "  staging       Deploy to staging (default)"
    echo "  preview       Create preview deployment"
    echo ""
    echo "OPTIONS:"
    echo "  --skip-checks    Skip pre-deployment checks"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to staging"
    echo "  $0 production         # Deploy to production"
    echo "  $0 --skip-checks staging  # Deploy to staging without checks"
}

# Parse command line arguments
SKIP_CHECKS=false
ENVIRONMENT="staging"

while [[ $# -gt 0 ]]; do
    case $1 in
        production|staging|preview)
            ENVIRONMENT="$1"
            shift
            ;;
        --skip-checks)
            SKIP_CHECKS=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Run deployment
deploy "$ENVIRONMENT" "$SKIP_CHECKS"
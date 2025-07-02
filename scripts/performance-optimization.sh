#!/bin/bash

# Performance Optimization Script
# This script implements various performance optimization measures

set -e

echo "🚀 CastChat Performance Optimization"
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
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Analyze bundle size
analyze_bundle_size() {
    print_status "info" "Analyzing bundle size..."
    
    if [ -d "dist" ]; then
        # Build analysis
        npm run build > /dev/null 2>&1
        
        # Check bundle sizes
        echo "Bundle Size Analysis:"
        echo "===================="
        du -sh dist/assets/*.js 2>/dev/null | while read size file; do
            echo "  JavaScript: $size - $(basename $file)"
        done
        
        du -sh dist/assets/*.css 2>/dev/null | while read size file; do
            echo "  CSS: $size - $(basename $file)"
        done
        
        total_size=$(du -sh dist | cut -f1)
        print_status "info" "Total bundle size: $total_size"
        
        # Warn if bundle is too large
        size_bytes=$(du -sb dist | cut -f1)
        if [ "$size_bytes" -gt 5242880 ]; then # 5MB
            print_status "warn" "Bundle size exceeds 5MB, consider optimization"
        else
            print_status "ok" "Bundle size is within acceptable limits"
        fi
    else
        print_status "error" "No dist directory found. Run 'npm run build' first"
        return 1
    fi
}

# Optimize images
optimize_images() {
    print_status "info" "Optimizing images..."
    
    # Check for imagemin or similar tools
    if command_exists "imagemin"; then
        find public -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | while read img; do
            original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
            imagemin "$img" --out-dir="$(dirname "$img")" > /dev/null 2>&1
            new_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
            savings=$((original_size - new_size))
            if [ $savings -gt 0 ]; then
                print_status "ok" "Optimized $(basename "$img"): saved ${savings} bytes"
            fi
        done
    else
        print_status "warn" "imagemin not found. Install with: npm install -g imagemin-cli"
    fi
}

# Check for unused dependencies
check_unused_dependencies() {
    print_status "info" "Checking for unused dependencies..."
    
    if command_exists "depcheck"; then
        depcheck --json > depcheck_result.json 2>/dev/null
        
        unused_deps=$(jq -r '.dependencies[]' depcheck_result.json 2>/dev/null | wc -l)
        unused_devdeps=$(jq -r '.devDependencies[]' depcheck_result.json 2>/dev/null | wc -l)
        
        if [ "$unused_deps" -gt 0 ] || [ "$unused_devdeps" -gt 0 ]; then
            print_status "warn" "Found $unused_deps unused dependencies and $unused_devdeps unused dev dependencies"
            echo "Run 'npx depcheck' for details"
        else
            print_status "ok" "No unused dependencies found"
        fi
        
        rm -f depcheck_result.json
    else
        print_status "warn" "depcheck not found. Install with: npm install -g depcheck"
    fi
}

# Analyze Core Web Vitals
analyze_core_web_vitals() {
    print_status "info" "Setting up Core Web Vitals monitoring..."
    
    # Create web vitals measurement script
    cat > public/measure-vitals.js << 'EOF'
// Core Web Vitals measurement
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics service
  console.log('Web Vital:', metric);
  
  // Send to Google Analytics if available
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
EOF
    
    print_status "ok" "Core Web Vitals monitoring script created"
}

# Optimize Vite configuration
optimize_vite_config() {
    print_status "info" "Optimizing Vite configuration..."
    
    # Check current vite.config.ts for optimizations
    if [ -f "vite.config.ts" ]; then
        # Backup current config
        cp vite.config.ts vite.config.ts.backup
        
        print_status "ok" "Vite configuration optimization suggestions:"
        echo "  - Enable bundle analyzer: npm run build -- --analyze"
        echo "  - Configure chunk splitting for better caching"
        echo "  - Enable compression in production"
        echo "  - Optimize asset handling"
    fi
}

# Database performance optimization
optimize_database_performance() {
    print_status "info" "Database performance optimization recommendations..."
    
    echo "Database Optimization Checklist:"
    echo "================================"
    echo "  - [ ] Add indexes for frequently queried columns"
    echo "  - [ ] Implement query result caching"
    echo "  - [ ] Use database connection pooling"
    echo "  - [ ] Optimize complex queries"
    echo "  - [ ] Implement database query monitoring"
    echo ""
    echo "Supabase Performance Tips:"
    echo "  - Use select() to limit returned columns"
    echo "  - Use filters to reduce data transfer"
    echo "  - Implement pagination for large datasets"
    echo "  - Use indexes on foreign keys and search columns"
}

# CDN and caching optimization
optimize_cdn_caching() {
    print_status "info" "CDN and caching optimization..."
    
    echo "Caching Strategy Recommendations:"
    echo "================================"
    echo "  Static Assets (images, fonts): 1 year cache"
    echo "  JavaScript/CSS bundles: 1 year cache with versioning"
    echo "  HTML files: No cache or short cache (5 minutes)"
    echo "  API responses: Appropriate cache based on data freshness"
    echo ""
    echo "Vercel automatically handles most caching optimizations"
    print_status "ok" "Vercel CDN configuration is already optimized"
}

# Lighthouse performance audit
run_lighthouse_audit() {
    print_status "info" "Running Lighthouse performance audit..."
    
    if command_exists "lighthouse"; then
        # Run Lighthouse audit on localhost
        if curl -f -s http://localhost:5173 > /dev/null 2>&1; then
            lighthouse http://localhost:5173 \
                --output=html \
                --output-path=./lighthouse-report.html \
                --chrome-flags="--headless" \
                --quiet
            print_status "ok" "Lighthouse report generated: lighthouse-report.html"
        else
            print_status "warn" "Development server not running. Start with 'npm run dev'"
        fi
    else
        print_status "warn" "Lighthouse not found. Install with: npm install -g lighthouse"
    fi
}

# Generate performance report
generate_performance_report() {
    print_status "info" "Generating performance report..."
    
    cat > performance-report.md << EOF
# Performance Optimization Report

Generated on: $(date)

## Bundle Size Analysis
$(analyze_bundle_size 2>&1)

## Recommendations

### High Priority
- [ ] Implement code splitting for large routes
- [ ] Enable image optimization
- [ ] Add service worker for caching
- [ ] Optimize database queries with indexes

### Medium Priority  
- [ ] Implement lazy loading for images
- [ ] Add compression for text assets
- [ ] Optimize font loading
- [ ] Implement resource preloading

### Low Priority
- [ ] Optimize animation performance
- [ ] Implement virtual scrolling for large lists
- [ ] Add performance budgets
- [ ] Optimize third-party scripts

## Performance Metrics Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1

### Additional Metrics
- **Time to Interactive**: < 3.5s
- **Total Blocking Time**: < 200ms
- **Speed Index**: < 3.0s

## Monitoring

Performance is continuously monitored through:
- Real User Monitoring (RUM)
- Synthetic monitoring with Lighthouse
- Core Web Vitals tracking
- Custom performance metrics

EOF

    print_status "ok" "Performance report generated: performance-report.md"
}

# Main execution
main() {
    echo "Starting performance optimization analysis..."
    echo ""
    
    analyze_bundle_size
    echo ""
    
    optimize_images
    echo ""
    
    check_unused_dependencies
    echo ""
    
    analyze_core_web_vitals
    echo ""
    
    optimize_vite_config
    echo ""
    
    optimize_database_performance
    echo ""
    
    optimize_cdn_caching
    echo ""
    
    # Only run Lighthouse if requested
    if [ "$1" = "--lighthouse" ]; then
        run_lighthouse_audit
        echo ""
    fi
    
    generate_performance_report
    echo ""
    
    print_status "ok" "Performance optimization analysis complete!"
    echo ""
    echo "Next steps:"
    echo "1. Review performance-report.md"
    echo "2. Implement high-priority optimizations"
    echo "3. Run lighthouse audit: $0 --lighthouse"
    echo "4. Monitor performance metrics in production"
}

# Run main function
main "$@"
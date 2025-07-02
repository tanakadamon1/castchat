#!/bin/bash

# Load Testing and Performance Benchmarking Script
# This script performs comprehensive load testing on CastChat

set -e

echo "⚡ CastChat Load Testing & Performance Benchmarks"
echo "================================================="

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

# Configuration
BASE_URL=${TEST_URL:-"http://localhost:5173"}
CONCURRENT_USERS=${CONCURRENT_USERS:-10}
TEST_DURATION=${TEST_DURATION:-60}
RAMP_UP_TIME=${RAMP_UP_TIME:-30}

# Install required tools
install_tools() {
    print_status "info" "Checking load testing tools..."
    
    # Check for artillery
    if ! command_exists artillery; then
        print_status "info" "Installing Artillery.js..."
        npm install -g artillery
    else
        print_status "ok" "Artillery.js is available"
    fi
    
    # Check for k6 (alternative)
    if ! command_exists k6; then
        print_status "warn" "k6 not found. Install from https://k6.io/ for advanced testing"
    else
        print_status "ok" "k6 is available"
    fi
    
    # Check for curl
    if ! command_exists curl; then
        print_status "error" "curl is required but not found"
        return 1
    else
        print_status "ok" "curl is available"
    fi
}

# Create Artillery test configuration
create_artillery_config() {
    print_status "info" "Creating Artillery test configuration..."
    
    cat > load-test-config.yml << EOF
config:
  target: '$BASE_URL'
  phases:
    - duration: $RAMP_UP_TIME
      arrivalRate: 1
      rampTo: $CONCURRENT_USERS
      name: "Ramp up phase"
    - duration: $TEST_DURATION
      arrivalRate: $CONCURRENT_USERS
      name: "Sustained load phase"
    - duration: 30
      arrivalRate: $CONCURRENT_USERS
      rampTo: 1
      name: "Ramp down phase"
  defaults:
    headers:
      User-Agent: "LoadTest/1.0"
  processor: "./load-test-processor.js"

scenarios:
  - name: "Homepage Load"
    weight: 30
    flow:
      - get:
          url: "/"
          capture:
            - json: "\$.status"
              as: "status"
      - think: 2

  - name: "Posts List"
    weight: 25
    flow:
      - get:
          url: "/posts"
      - think: 3

  - name: "User Registration Flow"
    weight: 20
    flow:
      - get:
          url: "/register"
      - think: 5
      - post:
          url: "/api/auth/signup"
          json:
            email: "test{{ \$randomString() }}@loadtest.com"
            password: "LoadTest123!"
      - think: 2

  - name: "Search Posts"
    weight: 15
    flow:
      - get:
          url: "/api/posts"
          qs:
            search: "{{ \$randomString() }}"
            limit: 10
      - think: 1

  - name: "Health Check"
    weight: 10
    flow:
      - get:
          url: "/api/health"
          expect:
            - statusCode: 200
EOF

    print_status "ok" "Artillery configuration created"
}

# Create test processor for custom logic
create_test_processor() {
    print_status "info" "Creating test processor..."
    
    cat > load-test-processor.js << 'EOF'
// Load Test Processor
// Custom functions for Artillery load tests

const faker = require('faker');

module.exports = {
  // Generate random user data
  generateUser: function(context, events, done) {
    context.vars.email = faker.internet.email();
    context.vars.username = faker.internet.userName();
    context.vars.displayName = faker.name.findName();
    return done();
  },
  
  // Generate random post data
  generatePost: function(context, events, done) {
    context.vars.title = faker.lorem.sentence();
    context.vars.description = faker.lorem.paragraphs(2);
    context.vars.requirements = faker.lorem.paragraph();
    return done();
  },
  
  // Log response times
  logResponseTime: function(requestParams, response, context, ee, next) {
    if (response.timings) {
      console.log(`Response time: ${response.timings.response}ms for ${requestParams.url}`);
    }
    return next();
  },
  
  // Validate response
  validateResponse: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 400) {
      console.error(`Error ${response.statusCode} for ${requestParams.url}`);
    }
    return next();
  }
};
EOF

    print_status "ok" "Test processor created"
}

# Create k6 test script
create_k6_test() {
    print_status "info" "Creating k6 test script..."
    
    cat > load-test-k6.js << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '${RAMP_UP_TIME}s', target: $CONCURRENT_USERS },
    { duration: '${TEST_DURATION}s', target: $CONCURRENT_USERS },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete within 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be less than 10%
    errors: ['rate<0.1'],              // Custom error rate
  },
};

const BASE_URL = '$BASE_URL';

export default function() {
  // Test scenarios with weighted distribution
  let scenario = Math.random();
  
  if (scenario < 0.3) {
    // Homepage load (30%)
    testHomepage();
  } else if (scenario < 0.55) {
    // Posts list (25%)
    testPostsList();
  } else if (scenario < 0.75) {
    // User registration (20%)
    testUserRegistration();
  } else if (scenario < 0.9) {
    // Search (15%)
    testSearch();
  } else {
    // Health check (10%)
    testHealthCheck();
  }
  
  sleep(1 + Math.random() * 2); // Random think time 1-3 seconds
}

function testHomepage() {
  let response = http.get(\`\${BASE_URL}/\`);
  
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
}

function testPostsList() {
  let response = http.get(\`\${BASE_URL}/posts\`);
  
  check(response, {
    'posts list status is 200': (r) => r.status === 200,
    'posts list loads in <3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
}

function testUserRegistration() {
  let payload = JSON.stringify({
    email: \`test\${Math.random().toString(36).substr(2, 9)}@loadtest.com\`,
    password: 'LoadTest123!'
  });
  
  let params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  let response = http.post(\`\${BASE_URL}/api/auth/signup\`, payload, params);
  
  check(response, {
    'registration response received': (r) => r.status !== 0,
  }) || errorRate.add(1);
}

function testSearch() {
  let searchTerm = Math.random().toString(36).substr(2, 5);
  let response = http.get(\`\${BASE_URL}/api/posts?search=\${searchTerm}&limit=10\`);
  
  check(response, {
    'search response received': (r) => r.status !== 0,
    'search completes in <1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
}

function testHealthCheck() {
  let response = http.get(\`\${BASE_URL}/api/health\`);
  
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check completes in <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}
EOF

    print_status "ok" "k6 test script created"
}

# Run basic connectivity test
run_connectivity_test() {
    print_status "info" "Running basic connectivity test..."
    
    # Test if the application is accessible
    if curl -f -s "$BASE_URL" >/dev/null; then
        print_status "ok" "Application is accessible at $BASE_URL"
    else
        print_status "error" "Cannot connect to $BASE_URL"
        return 1
    fi
    
    # Test API endpoints
    endpoints=("/api/health" "/posts")
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s "$BASE_URL$endpoint" >/dev/null; then
            print_status "ok" "Endpoint accessible: $endpoint"
        else
            print_status "warn" "Endpoint not accessible: $endpoint"
        fi
    done
}

# Run Artillery load test
run_artillery_test() {
    print_status "info" "Running Artillery load test..."
    
    if ! command_exists artillery; then
        print_status "error" "Artillery not found. Please install it first."
        return 1
    fi
    
    # Run the test
    local report_file="load-test-report-$(date +%Y%m%d_%H%M%S).json"
    
    artillery run load-test-config.yml --output "$report_file"
    
    # Generate HTML report
    if [ -f "$report_file" ]; then
        artillery report "$report_file" --output "load-test-report.html"
        print_status "ok" "Artillery test completed. Report: load-test-report.html"
    else
        print_status "error" "Artillery test failed"
        return 1
    fi
}

# Run k6 load test
run_k6_test() {
    if ! command_exists k6; then
        print_status "warn" "k6 not found. Skipping k6 test."
        return 0
    fi
    
    print_status "info" "Running k6 load test..."
    
    # Run the test
    k6 run load-test-k6.js --out json=k6-results.json
    
    print_status "ok" "k6 test completed. Results: k6-results.json"
}

# Performance baseline test
run_baseline_test() {
    print_status "info" "Running performance baseline test..."
    
    local baseline_file="performance-baseline.json"
    
    # Test key endpoints for baseline performance
    endpoints=(
        "/"
        "/posts"
        "/api/health"
        "/login"
    )
    
    echo "{" > "$baseline_file"
    echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> "$baseline_file"
    echo "  \"baseUrl\": \"$BASE_URL\"," >> "$baseline_file"
    echo "  \"endpoints\": {" >> "$baseline_file"
    
    local first=true
    for endpoint in "${endpoints[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            echo "    ," >> "$baseline_file"
        fi
        
        print_status "info" "Testing endpoint: $endpoint"
        
        # Measure response time
        local response_time
        response_time=$(curl -o /dev/null -s -w "%{time_total}" "$BASE_URL$endpoint")
        
        # Convert to milliseconds
        local response_ms
        response_ms=$(echo "$response_time * 1000" | bc -l)
        
        echo -n "    \"$endpoint\": {" >> "$baseline_file"
        echo -n "\"responseTime\": $response_ms," >> "$baseline_file"
        echo -n "\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" >> "$baseline_file"
        echo -n "}" >> "$baseline_file"
        
        print_status "ok" "Endpoint $endpoint: ${response_ms}ms"
    done
    
    echo "" >> "$baseline_file"
    echo "  }" >> "$baseline_file"
    echo "}" >> "$baseline_file"
    
    print_status "ok" "Baseline test completed: $baseline_file"
}

# Generate comprehensive report
generate_load_test_report() {
    print_status "info" "Generating comprehensive load test report..."
    
    local report_file="load-test-summary-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# Load Test Report

**Date**: $(date)
**Target**: $BASE_URL
**Concurrent Users**: $CONCURRENT_USERS
**Test Duration**: ${TEST_DURATION}s
**Ramp Up Time**: ${RAMP_UP_TIME}s

## Test Configuration

- **Base URL**: $BASE_URL
- **Concurrent Users**: $CONCURRENT_USERS
- **Test Duration**: $TEST_DURATION seconds
- **Ramp Up Time**: $RAMP_UP_TIME seconds

## Test Scenarios

1. **Homepage Load** (30% of traffic)
   - Simple GET request to homepage
   - Expected response time: < 2s

2. **Posts List** (25% of traffic)
   - Load posts listing page
   - Expected response time: < 3s

3. **User Registration** (20% of traffic)
   - POST request to registration endpoint
   - Tests database write operations

4. **Search** (15% of traffic)
   - Search functionality testing
   - Expected response time: < 1s

5. **Health Check** (10% of traffic)
   - Infrastructure health monitoring
   - Expected response time: < 500ms

## Performance Thresholds

- **95th percentile response time**: < 2000ms
- **Error rate**: < 10%
- **Availability**: > 99%

## Results Summary

$(if [ -f "performance-baseline.json" ]; then
    echo "### Baseline Performance"
    cat performance-baseline.json | jq -r '.endpoints | to_entries[] | "- \(.key): \(.value.responseTime | tonumber | floor)ms"'
fi)

### Load Test Results

$(if [ -f "load-test-report.html" ]; then
    echo "- Artillery HTML report: load-test-report.html"
fi)

$(if [ -f "k6-results.json" ]; then
    echo "- k6 JSON results: k6-results.json"
fi)

## Recommendations

### Performance Optimizations
- [ ] Optimize slow endpoints (>2s response time)
- [ ] Implement caching for frequently accessed data
- [ ] Add database query optimization
- [ ] Consider CDN for static assets

### Scalability Improvements
- [ ] Implement horizontal scaling
- [ ] Add load balancing
- [ ] Optimize database connection pooling
- [ ] Implement circuit breakers

### Monitoring Enhancements
- [ ] Add real-time performance monitoring
- [ ] Set up automated performance alerts
- [ ] Implement performance regression testing
- [ ] Add custom metrics tracking

## Next Steps

1. Review detailed reports (HTML/JSON files)
2. Address performance bottlenecks
3. Implement recommended optimizations
4. Re-run tests to validate improvements
5. Set up continuous performance monitoring

EOF

    print_status "ok" "Load test report generated: $report_file"
}

# Clean up test files
cleanup_test_files() {
    print_status "info" "Cleaning up temporary test files..."
    
    # Remove test configuration files
    rm -f load-test-config.yml
    rm -f load-test-processor.js
    rm -f load-test-k6.js
    
    print_status "ok" "Cleanup completed"
}

# Main execution
main() {
    local action="${1:-full}"
    
    case $action in
        "install")
            install_tools
            ;;
        "baseline")
            install_tools
            run_connectivity_test
            run_baseline_test
            ;;
        "artillery")
            install_tools
            create_artillery_config
            create_test_processor
            run_connectivity_test
            run_artillery_test
            ;;
        "k6")
            create_k6_test
            run_connectivity_test
            run_k6_test
            ;;
        "full")
            echo "Running comprehensive load testing suite..."
            install_tools
            create_artillery_config
            create_test_processor
            create_k6_test
            run_connectivity_test
            run_baseline_test
            run_artillery_test
            run_k6_test
            generate_load_test_report
            print_status "ok" "Complete load testing suite finished!"
            ;;
        "clean")
            cleanup_test_files
            ;;
        *)
            echo "CastChat Load Testing Tool"
            echo ""
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  install     Install required testing tools"
            echo "  baseline    Run baseline performance test"
            echo "  artillery   Run Artillery.js load test"
            echo "  k6          Run k6 load test"
            echo "  full        Run complete testing suite (default)"
            echo "  clean       Clean up temporary files"
            echo ""
            echo "Environment Variables:"
            echo "  TEST_URL            Target URL (default: http://localhost:5173)"
            echo "  CONCURRENT_USERS    Number of concurrent users (default: 10)"
            echo "  TEST_DURATION       Test duration in seconds (default: 60)"
            echo "  RAMP_UP_TIME        Ramp up time in seconds (default: 30)"
            echo ""
            echo "Examples:"
            echo "  TEST_URL=https://staging.castchat.jp $0 full"
            echo "  CONCURRENT_USERS=50 TEST_DURATION=300 $0 artillery"
            ;;
    esac
}

# Run main function
main "$@"
#!/bin/bash

# =================================
# Comprehensive Performance Testing Runner
# Orchestrates all performance testing tools
# =================================

set -e

# Configuration
APP_URL="${APP_URL:-http://localhost:3000}"
TEST_TYPE="${TEST_TYPE:-all}"
RESULTS_DIR="/tmp/performance-results"
LOG_FILE="${LOG_FILE:-./logs/performance-tests.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo -e "${BLUE}🚀 Local Power - Comprehensive Performance Testing${NC}"
echo "=================================================="
log "Performance testing suite started"

# Create results directory
mkdir -p "$RESULTS_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Check if application is running
echo -e "${YELLOW}🔍 Checking application status...${NC}"
if ! curl -s -f "$APP_URL" > /dev/null; then
    echo -e "${RED}❌ Application not accessible at $APP_URL${NC}"
    echo "Please ensure the application is running before running performance tests."
    echo "Start the application with: npm run dev (development) or npm start (production)"
    exit 1
fi
echo -e "${GREEN}✅ Application is accessible${NC}"

# Initialize results summary
total_tests=0
passed_tests=0
failed_tests=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local required="$3"
    
    echo ""
    echo -e "${PURPLE}🧪 Running $test_name...${NC}"
    echo "================================"
    
    total_tests=$((total_tests + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name - PASSED${NC}"
        passed_tests=$((passed_tests + 1))
        log "$test_name - PASSED"
        return 0
    else
        echo -e "${RED}❌ $test_name - FAILED${NC}"
        failed_tests=$((failed_tests + 1))
        log "$test_name - FAILED"
        
        if [ "$required" = "required" ]; then
            echo -e "${RED}🚨 Required test failed. Stopping execution.${NC}"
            exit 1
        fi
        return 1
    fi
}

# 1. Basic Performance Test (Apache Bench)
if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "basic" ]; then
    run_test "Basic Load Test (Apache Bench)" "cd '$(pwd)' && bash scripts/production/performance-test.sh" "required"
fi

# 2. Lighthouse Performance Audit
if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "lighthouse" ]; then
    # Check if Lighthouse CI is installed
    if command -v lhci &> /dev/null; then
        run_test "Lighthouse Performance Audit" "BASE_URL='$APP_URL' lhci autorun --config=lighthouse.config.js"
    else
        echo -e "${YELLOW}⚠️ Lighthouse CI not found. Installing...${NC}"
        npm install -g @lhci/cli
        if command -v lhci &> /dev/null; then
            run_test "Lighthouse Performance Audit" "BASE_URL='$APP_URL' lhci autorun --config=lighthouse.config.js"
        else
            echo -e "${YELLOW}⚠️ Lighthouse CI installation failed. Skipping Lighthouse tests.${NC}"
        fi
    fi
fi

# 3. K6 Load Testing
if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "k6" ]; then
    # Check if K6 is installed
    if command -v k6 &> /dev/null; then
        echo -e "${BLUE}🎯 Running K6 Load Tests...${NC}"
        
        # Run different K6 scenarios
        run_test "K6 Smoke Test" "BASE_URL='$APP_URL' k6 run --scenario smoke_test k6-load-test.js"
        run_test "K6 Load Test" "BASE_URL='$APP_URL' k6 run --scenario load_test k6-load-test.js"
        
        if [ "$TEST_TYPE" = "all" ]; then
            run_test "K6 Stress Test" "BASE_URL='$APP_URL' k6 run --scenario stress_test k6-load-test.js"
            run_test "K6 Spike Test" "BASE_URL='$APP_URL' k6 run --scenario spike_test k6-load-test.js"
        fi
    else
        echo -e "${YELLOW}⚠️ K6 not found. Skipping K6 load tests.${NC}"
        echo "To install K6, visit: https://k6.io/docs/getting-started/installation/"
    fi
fi

# 4. Web Vitals Testing (if available)
if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "vitals" ]; then
    if command -v web-vitals &> /dev/null; then
        run_test "Core Web Vitals Test" "web-vitals --url='$APP_URL' --runs=3"
    else
        echo -e "${YELLOW}⚠️ Web Vitals CLI not found. Skipping Core Web Vitals tests.${NC}"
    fi
fi

# 5. Custom API Performance Tests
if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "api" ]; then
    echo -e "${BLUE}🔌 Testing API Performance...${NC}"
    
    # Test critical API endpoints
    api_endpoints=(
        "/api/database/health"
        "/api/contacts"
        "/api/calculations"
    )
    
    for endpoint in "${api_endpoints[@]}"; do
        echo "Testing $endpoint..."
        response_time=$(curl -o /dev/null -s -w '%{time_total}' "$APP_URL$endpoint" || echo "999")
        response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d'.' -f1)
        
        if [ "$response_time_ms" -lt 2000 ]; then
            echo -e "${GREEN}✅ $endpoint: ${response_time_ms}ms${NC}"
        else
            echo -e "${YELLOW}⚠️ $endpoint: ${response_time_ms}ms (slow)${NC}"
        fi
    done
fi

# 6. Database Performance Test
if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "database" ]; then
    echo -e "${BLUE}🗄️ Testing Database Performance...${NC}"
    
    # Test database health endpoint multiple times
    db_times=()
    for i in {1..10}; do
        db_time=$(curl -o /dev/null -s -w '%{time_total}' "$APP_URL/api/database/health")
        db_times+=("$db_time")
    done
    
    # Calculate average
    total_time=0
    for time in "${db_times[@]}"; do
        total_time=$(echo "$total_time + $time" | bc -l)
    done
    avg_time=$(echo "scale=3; $total_time / ${#db_times[@]}" | bc -l)
    avg_time_ms=$(echo "$avg_time * 1000" | bc -l | cut -d'.' -f1)
    
    if [ "$avg_time_ms" -lt 500 ]; then
        echo -e "${GREEN}✅ Database average response: ${avg_time_ms}ms${NC}"
    else
        echo -e "${YELLOW}⚠️ Database average response: ${avg_time_ms}ms (consider optimization)${NC}"
    fi
fi

# Generate comprehensive report
echo ""
echo "========================================"
echo -e "${BLUE}📊 PERFORMANCE TESTING SUMMARY${NC}"
echo "========================================"

echo "🎯 Test Results:"
echo "  - Total Tests: $total_tests"
echo "  - Passed: $passed_tests"
echo "  - Failed: $failed_tests"

if [ "$failed_tests" -eq 0 ]; then
    echo -e "${GREEN}🎉 All performance tests passed!${NC}"
    success_rate=100
else
    success_rate=$(echo "scale=1; $passed_tests * 100 / $total_tests" | bc -l)
    echo -e "${YELLOW}⚠️ Success Rate: ${success_rate}%${NC}"
fi

echo ""
echo "📁 Results Location: $RESULTS_DIR"
echo "📋 Detailed Logs: $LOG_FILE"

# Performance recommendations based on results
echo ""
echo "💡 Performance Optimization Recommendations:"

if [ "$success_rate" -lt 90 ]; then
    echo "  🔥 Critical optimizations needed:"
    echo "    - Review failed tests and address issues"
    echo "    - Consider server scaling"
    echo "    - Optimize database queries"
    echo "    - Implement caching strategies"
fi

if [ "$success_rate" -lt 95 ]; then
    echo "  ⚡ Recommended optimizations:"
    echo "    - Enable CDN for static assets"
    echo "    - Implement database connection pooling"
    echo "    - Optimize image delivery (WebP/AVIF)"
    echo "    - Enable gzip compression"
fi

echo "  🚀 General optimizations:"
echo "    - Monitor Core Web Vitals regularly"
echo "    - Set up production monitoring"
echo "    - Implement progressive web app features"
echo "    - Regular performance testing in CI/CD"

# Archive results
timestamp=$(date +%Y%m%d-%H%M%S)
archive_file="$RESULTS_DIR/performance-test-archive-$timestamp.tar.gz"

if [ -d "$RESULTS_DIR" ]; then
    tar -czf "$archive_file" -C "$RESULTS_DIR" . 2>/dev/null || true
    echo ""
    echo "📦 Results archived: $archive_file"
fi

log "Performance testing suite completed - Success rate: ${success_rate}%"

# Exit with appropriate code
if [ "$failed_tests" -eq 0 ]; then
    echo -e "${GREEN}✅ All performance tests completed successfully${NC}"
    exit 0
elif [ "$success_rate" -ge 80 ]; then
    echo -e "${YELLOW}⚠️ Some performance tests failed but overall acceptable${NC}"
    exit 1
else
    echo -e "${RED}❌ Too many performance tests failed - optimization required${NC}"
    exit 2
fi
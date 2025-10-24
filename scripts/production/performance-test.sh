#!/bin/bash

# =================================
# Production Performance Test Script
# Load testing and optimization verification
# =================================

set -e

# Configuration
APP_URL="${APP_URL:-https://yourdomain.com}"
CONCURRENT_USERS="${CONCURRENT_USERS:-50}"
DURATION="${DURATION:-120}"
RAMP_UP="${RAMP_UP:-30}"
LOG_FILE="${LOG_FILE:-./logs/performance-test.log}"
RESULTS_DIR="/tmp/performance-results"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo -e "${BLUE}⚡ Starting Local Power Performance Testing${NC}"
echo "========================================"
log "Performance test started"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Performance thresholds
MAX_RESPONSE_TIME=3000  # 3 seconds
MIN_THROUGHPUT=10       # requests per second
MAX_ERROR_RATE=1        # 1%

# Initialize test results
overall_score=100
issues=()

echo -e "${YELLOW}🔧 Test Configuration:${NC}"
echo "  Target URL: $APP_URL"
echo "  Concurrent Users: $CONCURRENT_USERS"
echo "  Test Duration: ${DURATION}s"
echo "  Ramp-up Time: ${RAMP_UP}s"
echo ""

# 1. Check prerequisites
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl not found. Installing...${NC}"
    apt-get update && apt-get install -y curl
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq not found. Installing...${NC}"
    apt-get install -y jq
fi

# Check if ab (Apache Bench) is available
if ! command -v ab &> /dev/null; then
    echo -e "${YELLOW}⚠️ Apache Bench not found. Installing...${NC}"
    apt-get install -y apache2-utils
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"

# 2. Baseline performance check
echo -e "${BLUE}🏁 Running Baseline Performance Check...${NC}"

baseline_start=$(date +%s.%N)
response_code=$(curl -o /dev/null -s -w '%{http_code}' "$APP_URL")
baseline_end=$(date +%s.%N)
baseline_time=$(echo "$baseline_end - $baseline_start" | bc -l)
baseline_time_ms=$(echo "$baseline_time * 1000" | bc -l | cut -d'.' -f1)

if [ "$response_code" != "200" ]; then
    echo -e "${RED}❌ Application not responding (HTTP $response_code)${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Application responding (${baseline_time_ms}ms)${NC}"
fi

# 3. Core Web Vitals check
echo -e "${BLUE}📊 Checking Core Web Vitals...${NC}"

# Use Lighthouse CI for Core Web Vitals (if available)
if command -v lhci &> /dev/null; then
    echo "Running Lighthouse audit..."
    lhci autorun --collect.url="$APP_URL" --upload.target=filesystem --upload.outputDir="$RESULTS_DIR/lighthouse" &>/dev/null || true
    
    # Parse results if available
    if [ -f "$RESULTS_DIR/lighthouse/manifest.json" ]; then
        lcp=$(cat "$RESULTS_DIR/lighthouse"/*.json | jq -r '.audits."largest-contentful-paint".numericValue' 2>/dev/null || echo "0")
        fid=$(cat "$RESULTS_DIR/lighthouse"/*.json | jq -r '.audits."first-input-delay".numericValue' 2>/dev/null || echo "0")
        cls=$(cat "$RESULTS_DIR/lighthouse"/*.json | jq -r '.audits."cumulative-layout-shift".numericValue' 2>/dev/null || echo "0")
        
        echo "  - LCP: ${lcp}ms"
        echo "  - FID: ${fid}ms"
        echo "  - CLS: $cls"
        
        # Check Core Web Vitals thresholds
        if [ "$(echo "$lcp > 2500" | bc -l 2>/dev/null)" = "1" ]; then
            issues+=("LCP too slow: ${lcp}ms (should be < 2.5s)")
            overall_score=$((overall_score - 15))
        fi
        
        if [ "$(echo "$fid > 100" | bc -l 2>/dev/null)" = "1" ]; then
            issues+=("FID too slow: ${fid}ms (should be < 100ms)")
            overall_score=$((overall_score - 10))
        fi
        
        if [ "$(echo "$cls > 0.1" | bc -l 2>/dev/null)" = "1" ]; then
            issues+=("CLS too high: $cls (should be < 0.1)")
            overall_score=$((overall_score - 10))
        fi
    fi
else
    echo -e "${YELLOW}⚠️ Lighthouse not available, skipping Core Web Vitals check${NC}"
fi

# 4. Load testing with Apache Bench
echo -e "${BLUE}🚀 Running Load Test...${NC}"

ab_output_file="$RESULTS_DIR/ab-results.txt"
ab -n $((CONCURRENT_USERS * 10)) -c "$CONCURRENT_USERS" -g "$RESULTS_DIR/ab-gnuplot.tsv" "$APP_URL/" > "$ab_output_file" 2>&1

# Parse Apache Bench results
if [ -f "$ab_output_file" ]; then
    requests_per_second=$(grep "Requests per second" "$ab_output_file" | awk '{print $4}' | head -1)
    mean_response_time=$(grep "Time per request" "$ab_output_file" | head -1 | awk '{print $4}')
    failed_requests=$(grep "Failed requests" "$ab_output_file" | awk '{print $3}')
    total_requests=$(grep "Complete requests" "$ab_output_file" | awk '{print $3}')
    
    echo "  - Requests per second: $requests_per_second"
    echo "  - Mean response time: ${mean_response_time}ms"
    echo "  - Failed requests: $failed_requests/$total_requests"
    
    # Calculate error rate
    if [ "$total_requests" -gt 0 ]; then
        error_rate=$(echo "scale=2; $failed_requests * 100 / $total_requests" | bc -l)
    else
        error_rate="0"
    fi
    
    echo "  - Error rate: ${error_rate}%"
    
    # Check performance thresholds
    if [ "$(echo "$mean_response_time > $MAX_RESPONSE_TIME" | bc -l 2>/dev/null)" = "1" ]; then
        issues+=("Response time too slow: ${mean_response_time}ms (should be < ${MAX_RESPONSE_TIME}ms)")
        overall_score=$((overall_score - 20))
    fi
    
    if [ "$(echo "$requests_per_second < $MIN_THROUGHPUT" | bc -l 2>/dev/null)" = "1" ]; then
        issues+=("Throughput too low: $requests_per_second req/s (should be > $MIN_THROUGHPUT)")
        overall_score=$((overall_score - 15))
    fi
    
    if [ "$(echo "$error_rate > $MAX_ERROR_RATE" | bc -l 2>/dev/null)" = "1" ]; then
        issues+=("Error rate too high: ${error_rate}% (should be < ${MAX_ERROR_RATE}%)")
        overall_score=$((overall_score - 25))
    fi
else
    echo -e "${RED}❌ Load test failed${NC}"
    issues+=("Load test execution failed")
    overall_score=$((overall_score - 30))
fi

# 5. Database performance check
echo -e "${BLUE}🗄️ Checking Database Performance...${NC}"

db_response_time=$(curl -o /dev/null -s -w '%{time_total}' "$APP_URL/api/database/health")
db_response_ms=$(echo "$db_response_time * 1000" | bc -l | cut -d'.' -f1)

echo "  - Database response time: ${db_response_ms}ms"

if [ "$db_response_ms" -gt 1000 ]; then
    issues+=("Database response too slow: ${db_response_ms}ms")
    overall_score=$((overall_score - 10))
fi

# 6. API endpoints performance
echo -e "${BLUE}🔌 Testing API Endpoints...${NC}"

api_endpoints=(
    "/api/database/health"
    "/api/contacts"
    "/api/calculations"
)

for endpoint in "${api_endpoints[@]}"; do
    echo "  Testing $endpoint..."
    api_time=$(curl -o /dev/null -s -w '%{time_total}' "$APP_URL$endpoint" 2>/dev/null || echo "999")
    api_time_ms=$(echo "$api_time * 1000" | bc -l | cut -d'.' -f1 2>/dev/null || echo "999")
    
    if [ "$api_time_ms" -gt 2000 ]; then
        issues+=("API endpoint slow: $endpoint (${api_time_ms}ms)")
        overall_score=$((overall_score - 5))
    fi
    
    echo "    Response time: ${api_time_ms}ms"
done

# 7. Memory and CPU usage during load
echo -e "${BLUE}📈 Monitoring Resource Usage...${NC}"

if command -v ps &> /dev/null; then
    # Get Node.js process stats
    node_pid=$(pgrep -f "node.*server.js\|next" | head -1)
    if [ -n "$node_pid" ]; then
        cpu_usage=$(ps -p "$node_pid" -o %cpu --no-headers | xargs || echo "0")
        memory_usage=$(ps -p "$node_pid" -o %mem --no-headers | xargs || echo "0")
        
        echo "  - CPU Usage: ${cpu_usage}%"
        echo "  - Memory Usage: ${memory_usage}%"
        
        if [ "$(echo "$cpu_usage > 80" | bc -l 2>/dev/null)" = "1" ]; then
            issues+=("High CPU usage during load: ${cpu_usage}%")
            overall_score=$((overall_score - 10))
        fi
        
        if [ "$(echo "$memory_usage > 80" | bc -l 2>/dev/null)" = "1" ]; then
            issues+=("High memory usage during load: ${memory_usage}%")
            overall_score=$((overall_score - 10))
        fi
    fi
fi

# 8. Generate performance report
echo ""
echo "========================================"
echo -e "${BLUE}📊 PERFORMANCE TEST REPORT${NC}"
echo "========================================"

# Determine overall grade
if [ "$overall_score" -ge 90 ]; then
    grade="A"
    grade_color="$GREEN"
elif [ "$overall_score" -ge 80 ]; then
    grade="B"
    grade_color="$GREEN"
elif [ "$overall_score" -ge 70 ]; then
    grade="C"
    grade_color="$YELLOW"
elif [ "$overall_score" -ge 60 ]; then
    grade="D"
    grade_color="$YELLOW"
else
    grade="F"
    grade_color="$RED"
fi

echo -e "${grade_color}🎯 Overall Performance Score: $overall_score/100 (Grade: $grade)${NC}"
echo ""

if [ ${#issues[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 No performance issues found!${NC}"
    echo -e "${GREEN}✅ Your application is production-ready${NC}"
else
    echo -e "${YELLOW}⚠️ Performance Issues Found:${NC}"
    for issue in "${issues[@]}"; do
        echo "  - $issue"
    done
fi

echo ""
echo "📈 Performance Metrics:"
echo "  - Baseline Response: ${baseline_time_ms}ms"
echo "  - Load Test Throughput: $requests_per_second req/s"
echo "  - Average Response Time: ${mean_response_time}ms"
echo "  - Error Rate: ${error_rate}%"
echo "  - Database Response: ${db_response_ms}ms"

# 9. Generate recommendations
echo ""
echo "💡 Performance Recommendations:"

if [ "$overall_score" -lt 90 ]; then
    echo "  - Enable Redis caching for database queries"
    echo "  - Implement CDN for static assets"
    echo "  - Optimize database indexes"
    echo "  - Enable gzip compression"
    echo "  - Implement image optimization"
fi

if [ "$overall_score" -lt 70 ]; then
    echo "  - Consider horizontal scaling"
    echo "  - Implement load balancing"
    echo "  - Optimize bundle size"
    echo "  - Use database connection pooling"
fi

# 10. Save detailed report
report_file="$RESULTS_DIR/performance-report-$(date +%Y%m%d-%H%M%S).json"
cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "overall_score": $overall_score,
  "grade": "$grade",
  "metrics": {
    "baseline_response_ms": $baseline_time_ms,
    "throughput_rps": ${requests_per_second:-0},
    "mean_response_ms": ${mean_response_time:-0},
    "error_rate_percent": ${error_rate:-0},
    "database_response_ms": $db_response_ms
  },
  "issues": [$(printf '"%s",' "${issues[@]}" | sed 's/,$//')]
}
EOF

echo ""
echo "📁 Detailed results saved to: $RESULTS_DIR"
log "Performance test completed - Score: $overall_score/100"

# Exit with appropriate code
if [ "$overall_score" -ge 80 ]; then
    exit 0
elif [ "$overall_score" -ge 60 ]; then
    exit 1
else
    exit 2
fi
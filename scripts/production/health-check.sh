#!/bin/bash

# =================================
# Production Health Check Script
# =================================

set -e

# Configuration
APP_URL="${APP_URL:-https://yourdomain.com}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-/api/database/health}"
MAX_RESPONSE_TIME="${MAX_RESPONSE_TIME:-5}"
LOG_FILE="/var/log/localpower/health-check.log"
ALERT_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Send alert function
send_alert() {
    local message="$1"
    local severity="$2"
    
    log "🚨 ALERT: $message"
    
    if [ -n "$ALERT_WEBHOOK" ]; then
        local emoji="⚠️"
        if [ "$severity" = "critical" ]; then
            emoji="🔥"
        elif [ "$severity" = "warning" ]; then
            emoji="⚠️"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$emoji LOCAL POWER ALERT: $message\"}" \
            "$ALERT_WEBHOOK" &>/dev/null || true
    fi
}

echo -e "${GREEN}🏥 Starting Local Power Health Check${NC}"
log "Health check started"

# Initialize status
overall_status="healthy"
issues=()

# 1. Check if application is responding
echo "🌐 Checking application response..."
response_time=$(curl -o /dev/null -s -w '%{time_total}' "$APP_URL" || echo "0")
response_code=$(curl -o /dev/null -s -w '%{http_code}' "$APP_URL" || echo "000")

if [ "$response_code" != "200" ]; then
    issues+=("Application not responding (HTTP $response_code)")
    overall_status="unhealthy"
    echo -e "${RED}❌ Application not responding${NC}"
else
    echo -e "${GREEN}✅ Application responding${NC}"
fi

# Check response time
if [ "$(echo "$response_time > $MAX_RESPONSE_TIME" | bc -l 2>/dev/null || echo 0)" -eq 1 ]; then
    issues+=("Slow response time: ${response_time}s")
    overall_status="degraded"
    echo -e "${YELLOW}⚠️ Slow response time: ${response_time}s${NC}"
else
    echo -e "${GREEN}✅ Response time: ${response_time}s${NC}"
fi

# 2. Check database health
echo "🗄️ Checking database health..."
db_health=$(curl -s "$APP_URL$HEALTH_ENDPOINT" | jq -r '.status' 2>/dev/null || echo "unknown")

if [ "$db_health" != "healthy" ]; then
    issues+=("Database health check failed")
    overall_status="unhealthy"
    echo -e "${RED}❌ Database health check failed${NC}"
else
    echo -e "${GREEN}✅ Database healthy${NC}"
fi

# 3. Check PM2 process status
echo "⚙️ Checking PM2 processes..."
pm2_status=$(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")

if [ "$pm2_status" != "online" ]; then
    issues+=("PM2 process not online: $pm2_status")
    overall_status="unhealthy"
    echo -e "${RED}❌ PM2 process status: $pm2_status${NC}"
else
    echo -e "${GREEN}✅ PM2 process online${NC}"
fi

# 4. Check disk space
echo "💾 Checking disk space..."
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$disk_usage" -gt 90 ]; then
    issues+=("Disk usage critical: ${disk_usage}%")
    overall_status="unhealthy"
    echo -e "${RED}❌ Disk usage critical: ${disk_usage}%${NC}"
elif [ "$disk_usage" -gt 80 ]; then
    issues+=("Disk usage high: ${disk_usage}%")
    if [ "$overall_status" = "healthy" ]; then
        overall_status="degraded"
    fi
    echo -e "${YELLOW}⚠️ Disk usage high: ${disk_usage}%${NC}"
else
    echo -e "${GREEN}✅ Disk usage: ${disk_usage}%${NC}"
fi

# 5. Check memory usage
echo "🧠 Checking memory usage..."
memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')

if [ "$memory_usage" -gt 90 ]; then
    issues+=("Memory usage critical: ${memory_usage}%")
    overall_status="unhealthy"
    echo -e "${RED}❌ Memory usage critical: ${memory_usage}%${NC}"
elif [ "$memory_usage" -gt 80 ]; then
    issues+=("Memory usage high: ${memory_usage}%")
    if [ "$overall_status" = "healthy" ]; then
        overall_status="degraded"
    fi
    echo -e "${YELLOW}⚠️ Memory usage high: ${memory_usage}%${NC}"
else
    echo -e "${GREEN}✅ Memory usage: ${memory_usage}%${NC}"
fi

# 6. Check SSL certificate expiry
echo "🔒 Checking SSL certificate..."
cert_days=$(echo | openssl s_client -servername $(echo "$APP_URL" | sed 's/https:\/\///') -connect $(echo "$APP_URL" | sed 's/https:\/\///'):443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | sed 's/notAfter=//' | xargs -I {} date -d "{}" +%s | xargs -I {} echo "(({} - $(date +%s)) / 86400)" | bc 2>/dev/null || echo "0")

if [ "$cert_days" -lt 7 ]; then
    issues+=("SSL certificate expires in $cert_days days")
    overall_status="unhealthy"
    echo -e "${RED}❌ SSL certificate expires in $cert_days days${NC}"
elif [ "$cert_days" -lt 30 ]; then
    issues+=("SSL certificate expires in $cert_days days")
    if [ "$overall_status" = "healthy" ]; then
        overall_status="degraded"
    fi
    echo -e "${YELLOW}⚠️ SSL certificate expires in $cert_days days${NC}"
else
    echo -e "${GREEN}✅ SSL certificate valid for $cert_days days${NC}"
fi

# 7. Check log file sizes
echo "📋 Checking log file sizes..."
log_size=$(du -sm /var/log/localpower/ 2>/dev/null | cut -f1 || echo "0")

if [ "$log_size" -gt 1000 ]; then
    issues+=("Log files large: ${log_size}MB")
    if [ "$overall_status" = "healthy" ]; then
        overall_status="degraded"
    fi
    echo -e "${YELLOW}⚠️ Log files large: ${log_size}MB${NC}"
else
    echo -e "${GREEN}✅ Log files size: ${log_size}MB${NC}"
fi

# Summary
echo ""
echo "==============================================="
if [ "$overall_status" = "healthy" ]; then
    echo -e "${GREEN}🎉 Overall Status: HEALTHY${NC}"
    log "Health check completed - Status: HEALTHY"
elif [ "$overall_status" = "degraded" ]; then
    echo -e "${YELLOW}⚠️ Overall Status: DEGRADED${NC}"
    log "Health check completed - Status: DEGRADED"
    
    if [ ${#issues[@]} -gt 0 ]; then
        echo "Issues found:"
        for issue in "${issues[@]}"; do
            echo "  - $issue"
        done
    fi
    
    # Send warning alert
    send_alert "System status degraded. Issues: $(IFS=', '; echo "${issues[*]}")" "warning"
else
    echo -e "${RED}🔥 Overall Status: UNHEALTHY${NC}"
    log "Health check completed - Status: UNHEALTHY"
    
    if [ ${#issues[@]} -gt 0 ]; then
        echo "Critical issues found:"
        for issue in "${issues[@]}"; do
            echo "  - $issue"
        done
    fi
    
    # Send critical alert
    send_alert "System is UNHEALTHY! Issues: $(IFS=', '; echo "${issues[*]}")" "critical"
fi

echo "==============================================="
echo "📊 System Metrics:"
echo "  - Response time: ${response_time}s"
echo "  - HTTP status: $response_code"
echo "  - Database: $db_health"
echo "  - PM2 status: $pm2_status"
echo "  - Disk usage: ${disk_usage}%"
echo "  - Memory usage: ${memory_usage}%"
echo "  - SSL expires: $cert_days days"
echo "  - Log size: ${log_size}MB"

# Exit with appropriate code
if [ "$overall_status" = "unhealthy" ]; then
    exit 1
elif [ "$overall_status" = "degraded" ]; then
    exit 2
else
    exit 0
fi
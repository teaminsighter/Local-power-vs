#!/bin/bash

# Production Database Backup Script for Local Power
# Supports both PostgreSQL and SQLite with automated rotation

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/database/backups"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS=30
MAX_BACKUPS=50

# Database configuration
DB_TYPE="${DATABASE_TYPE:-postgres}"
DB_NAME="${DB_NAME:-localpower_prod}"
DB_USER="${DB_USER:-localpower}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
SQLITE_PATH="${SQLITE_PATH:-${PROJECT_ROOT}/prisma/dev.db}"

# Backup configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PREFIX="localpower_backup"
COMPRESS=true
VERIFY_BACKUP=true
UPLOAD_TO_S3=false
S3_BUCKET="${S3_BUCKET:-localpower-backups}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Setup backup directory
setup_backup_dir() {
    log "Setting up backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/daily"
    mkdir -p "$BACKUP_DIR/weekly"
    mkdir -p "$BACKUP_DIR/monthly"
    
    # Initialize log file
    if [[ ! -f "$LOG_FILE" ]]; then
        touch "$LOG_FILE"
    fi
}

# Check if required tools are available
check_dependencies() {
    log "Checking dependencies..."
    
    if [[ "$DB_TYPE" == "postgres" ]]; then
        if ! command -v pg_dump &> /dev/null; then
            error "pg_dump not found. Please install PostgreSQL client tools."
            exit 1
        fi
        
        if ! command -v psql &> /dev/null; then
            error "psql not found. Please install PostgreSQL client tools."
            exit 1
        fi
    elif [[ "$DB_TYPE" == "sqlite" ]]; then
        if ! command -v sqlite3 &> /dev/null; then
            error "sqlite3 not found. Please install SQLite."
            exit 1
        fi
    fi
    
    if [[ "$COMPRESS" == true ]]; then
        if ! command -v gzip &> /dev/null; then
            warn "gzip not found. Backups will not be compressed."
            COMPRESS=false
        fi
    fi
    
    if [[ "$UPLOAD_TO_S3" == true ]]; then
        if ! command -v aws &> /dev/null; then
            warn "AWS CLI not found. S3 upload disabled."
            UPLOAD_TO_S3=false
        fi
    fi
}

# Get backup file path based on type
get_backup_path() {
    local backup_type="$1"
    local extension="sql"
    
    if [[ "$COMPRESS" == true ]]; then
        extension="sql.gz"
    fi
    
    case "$backup_type" in
        daily)
            echo "$BACKUP_DIR/daily/${BACKUP_PREFIX}_daily_${TIMESTAMP}.${extension}"
            ;;
        weekly)
            echo "$BACKUP_DIR/weekly/${BACKUP_PREFIX}_weekly_${TIMESTAMP}.${extension}"
            ;;
        monthly)
            echo "$BACKUP_DIR/monthly/${BACKUP_PREFIX}_monthly_${TIMESTAMP}.${extension}"
            ;;
        *)
            echo "$BACKUP_DIR/${BACKUP_PREFIX}_${TIMESTAMP}.${extension}"
            ;;
    esac
}

# PostgreSQL backup
backup_postgres() {
    local backup_file="$1"
    local backup_type="${2:-manual}"
    
    log "Starting PostgreSQL backup to: $backup_file"
    
    # Set PGPASSWORD if provided
    if [[ -n "${PGPASSWORD:-}" ]]; then
        export PGPASSWORD
    fi
    
    # Create backup command
    local pg_dump_cmd="pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    
    # Add options based on backup type
    if [[ "$backup_type" == "weekly" ]] || [[ "$backup_type" == "monthly" ]]; then
        # Full backup with schema and data
        pg_dump_cmd="$pg_dump_cmd --verbose --clean --create --if-exists"
    else
        # Daily backup - data only for faster restore
        pg_dump_cmd="$pg_dump_cmd --data-only --verbose"
    fi
    
    # Execute backup
    if [[ "$COMPRESS" == true ]]; then
        $pg_dump_cmd | gzip > "$backup_file"
    else
        $pg_dump_cmd > "$backup_file"
    fi
    
    # Check backup status
    if [[ $? -eq 0 ]]; then
        log "PostgreSQL backup completed successfully"
        return 0
    else
        error "PostgreSQL backup failed"
        return 1
    fi
}

# SQLite backup
backup_sqlite() {
    local backup_file="$1"
    
    log "Starting SQLite backup to: $backup_file"
    
    if [[ ! -f "$SQLITE_PATH" ]]; then
        error "SQLite database not found: $SQLITE_PATH"
        return 1
    fi
    
    # Create backup
    if [[ "$COMPRESS" == true ]]; then
        sqlite3 "$SQLITE_PATH" .dump | gzip > "$backup_file"
    else
        sqlite3 "$SQLITE_PATH" .dump > "$backup_file"
    fi
    
    # Check backup status
    if [[ $? -eq 0 ]]; then
        log "SQLite backup completed successfully"
        return 0
    else
        error "SQLite backup failed"
        return 1
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    if [[ "$VERIFY_BACKUP" != true ]]; then
        return 0
    fi
    
    log "Verifying backup integrity: $backup_file"
    
    # Check file exists and has content
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [[ "$file_size" -lt 1000 ]]; then
        error "Backup file too small (${file_size} bytes): $backup_file"
        return 1
    fi
    
    # Verify compressed file integrity
    if [[ "$backup_file" == *.gz ]]; then
        if ! gzip -t "$backup_file"; then
            error "Backup file corrupted (gzip test failed): $backup_file"
            return 1
        fi
    fi
    
    # Test SQL syntax for uncompressed files
    if [[ "$DB_TYPE" == "postgres" ]] && [[ "$backup_file" == *.sql ]]; then
        # Basic SQL syntax check
        if ! head -n 50 "$backup_file" | grep -q "PostgreSQL database dump"; then
            warn "Backup file may not be a valid PostgreSQL dump"
        fi
    fi
    
    log "Backup verification passed"
    return 0
}

# Upload to S3
upload_to_s3() {
    local backup_file="$1"
    
    if [[ "$UPLOAD_TO_S3" != true ]]; then
        return 0
    fi
    
    log "Uploading backup to S3: $S3_BUCKET"
    
    local s3_key="backups/$(basename "$backup_file")"
    
    if aws s3 cp "$backup_file" "s3://$S3_BUCKET/$s3_key" --storage-class STANDARD_IA; then
        log "Backup uploaded to S3: s3://$S3_BUCKET/$s3_key"
        
        # Add lifecycle policy for automatic deletion after retention period
        local expiry_date=$(date -d "+$RETENTION_DAYS days" +%Y-%m-%d)
        aws s3api put-object-tagging \
            --bucket "$S3_BUCKET" \
            --key "$s3_key" \
            --tagging "TagSet=[{Key=ExpiryDate,Value=$expiry_date}]"
    else
        warn "Failed to upload backup to S3"
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (retention: $RETENTION_DAYS days)"
    
    # Clean local backups
    local dirs=("daily" "weekly" "monthly")
    
    for dir in "${dirs[@]}"; do
        local backup_dir_path="$BACKUP_DIR/$dir"
        if [[ -d "$backup_dir_path" ]]; then
            find "$backup_dir_path" -name "${BACKUP_PREFIX}_*" -type f -mtime +$RETENTION_DAYS -delete
            
            # Also limit total number of backups
            local backup_count=$(find "$backup_dir_path" -name "${BACKUP_PREFIX}_*" -type f | wc -l)
            if [[ $backup_count -gt $MAX_BACKUPS ]]; then
                log "Removing oldest backups to maintain limit of $MAX_BACKUPS"
                find "$backup_dir_path" -name "${BACKUP_PREFIX}_*" -type f -printf '%T@ %p\n' | \
                sort -n | head -n $((backup_count - MAX_BACKUPS)) | cut -d' ' -f2- | xargs rm -f
            fi
        fi
    done
    
    # Clean S3 backups (if enabled)
    if [[ "$UPLOAD_TO_S3" == true ]]; then
        local cutoff_date=$(date -d "-$RETENTION_DAYS days" +%Y-%m-%d)
        aws s3 ls "s3://$S3_BUCKET/backups/" | \
        awk -v cutoff="$cutoff_date" '$1 < cutoff {print $4}' | \
        while read file; do
            if [[ -n "$file" ]]; then
                aws s3 rm "s3://$S3_BUCKET/backups/$file"
                log "Removed old S3 backup: $file"
            fi
        done
    fi
}

# Get database size
get_database_size() {
    if [[ "$DB_TYPE" == "postgres" ]]; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs || echo "Unknown"
    elif [[ "$DB_TYPE" == "sqlite" ]]; then
        if [[ -f "$SQLITE_PATH" ]]; then
            local size_bytes=$(stat -f%z "$SQLITE_PATH" 2>/dev/null || stat -c%s "$SQLITE_PATH" 2>/dev/null)
            echo "$((size_bytes / 1024 / 1024)) MB"
        else
            echo "Unknown"
        fi
    fi
}

# Generate backup report
generate_report() {
    local backup_file="$1"
    local backup_type="$2"
    local start_time="$3"
    local end_time="$4"
    
    local duration=$((end_time - start_time))
    local backup_size="Unknown"
    
    if [[ -f "$backup_file" ]]; then
        local size_bytes=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
        backup_size="$((size_bytes / 1024 / 1024)) MB"
    fi
    
    local db_size=$(get_database_size)
    
    cat >> "$LOG_FILE" << EOF

========================================
BACKUP REPORT
========================================
Timestamp: $(date)
Backup Type: $backup_type
Database Type: $DB_TYPE
Database Size: $db_size
Backup File: $backup_file
Backup Size: $backup_size
Duration: ${duration}s
Compression: $COMPRESS
S3 Upload: $UPLOAD_TO_S3
Status: SUCCESS
========================================

EOF
}

# Main backup function
perform_backup() {
    local backup_type="${1:-daily}"
    local start_time=$(date +%s)
    
    log "Starting $backup_type backup (Database: $DB_TYPE)"
    
    local backup_file=$(get_backup_path "$backup_type")
    
    # Perform backup based on database type
    local backup_success=false
    
    if [[ "$DB_TYPE" == "postgres" ]]; then
        if backup_postgres "$backup_file" "$backup_type"; then
            backup_success=true
        fi
    elif [[ "$DB_TYPE" == "sqlite" ]]; then
        if backup_sqlite "$backup_file"; then
            backup_success=true
        fi
    else
        error "Unsupported database type: $DB_TYPE"
        exit 1
    fi
    
    if [[ "$backup_success" == true ]]; then
        # Verify backup
        if verify_backup "$backup_file"; then
            # Upload to S3 if enabled
            upload_to_s3 "$backup_file"
            
            # Generate report
            local end_time=$(date +%s)
            generate_report "$backup_file" "$backup_type" "$start_time" "$end_time"
            
            log "Backup completed successfully: $backup_file"
        else
            error "Backup verification failed"
            rm -f "$backup_file"
            exit 1
        fi
    else
        error "Backup failed"
        exit 1
    fi
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] [BACKUP_TYPE]

BACKUP_TYPE:
    daily       Create daily backup (default)
    weekly      Create weekly backup with full schema
    monthly     Create monthly backup with full schema
    manual      Create manual backup

OPTIONS:
    -h, --help              Show this help message
    -t, --type TYPE         Database type (postgres|sqlite)
    -c, --compress          Enable compression (default: true)
    -v, --verify            Verify backup integrity (default: true)
    -s, --s3                Upload to S3 (default: false)
    -r, --retention DAYS    Retention period in days (default: 30)
    --cleanup-only          Only perform cleanup, no backup

EXAMPLES:
    $0                      # Daily backup with default settings
    $0 weekly              # Weekly backup
    $0 -t sqlite daily     # SQLite daily backup
    $0 --s3 monthly        # Monthly backup with S3 upload
    $0 --cleanup-only      # Only cleanup old backups

ENVIRONMENT VARIABLES:
    DATABASE_TYPE          Database type (postgres|sqlite)
    DB_NAME               PostgreSQL database name
    DB_USER               PostgreSQL username
    DB_HOST               PostgreSQL host
    DB_PORT               PostgreSQL port
    PGPASSWORD            PostgreSQL password
    SQLITE_PATH           SQLite database file path
    S3_BUCKET             S3 bucket for uploads

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -t|--type)
                DB_TYPE="$2"
                shift 2
                ;;
            -c|--compress)
                COMPRESS=true
                shift
                ;;
            --no-compress)
                COMPRESS=false
                shift
                ;;
            -v|--verify)
                VERIFY_BACKUP=true
                shift
                ;;
            --no-verify)
                VERIFY_BACKUP=false
                shift
                ;;
            -s|--s3)
                UPLOAD_TO_S3=true
                shift
                ;;
            -r|--retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --cleanup-only)
                cleanup_old_backups
                exit 0
                ;;
            daily|weekly|monthly|manual)
                BACKUP_TYPE="$1"
                shift
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Main execution
main() {
    local backup_type="${BACKUP_TYPE:-daily}"
    
    # Setup
    setup_backup_dir
    check_dependencies
    
    # Perform backup
    perform_backup "$backup_type"
    
    # Cleanup old backups
    cleanup_old_backups
    
    log "Backup process completed successfully"
}

# Parse arguments and run
parse_args "$@"
main
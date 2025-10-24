#!/bin/bash

# =================================
# Production Database Backup Script
# =================================

set -e  # Exit on any error

# Configuration
DB_NAME="${DB_NAME:-localpower_prod}"
DB_USER="${DB_USER:-localpower_user}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/localpower}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/localpower_backup_$TIMESTAMP.sql"

echo "🗄️  Starting database backup at $(date)"

# Create database dump
pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" --no-password > "$BACKUP_FILE"

# Compress backup
echo "📦 Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# Encrypt backup if encryption key is provided
if [ -n "$ENCRYPTION_KEY" ]; then
    echo "🔐 Encrypting backup..."
    openssl enc -aes-256-cbc -salt -in "$BACKUP_FILE" -out "$BACKUP_FILE.enc" -k "$ENCRYPTION_KEY"
    rm "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.enc"
fi

echo "✅ Backup created: $BACKUP_FILE"

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    echo "☁️  Uploading to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/database/$(basename "$BACKUP_FILE")"
    echo "✅ Backup uploaded to S3"
fi

# Clean up old backups
echo "🧹 Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "localpower_backup_*.sql*" -mtime +$RETENTION_DAYS -delete

# Verify backup integrity
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup completed successfully"
    echo "📊 Backup size: $BACKUP_SIZE"
    echo "📅 Backup file: $(basename "$BACKUP_FILE")"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Send notification (optional)
if command -v curl &> /dev/null && [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Database backup completed successfully. Size: $BACKUP_SIZE\"}" \
        "$SLACK_WEBHOOK_URL"
fi

echo "🎉 Database backup process completed at $(date)"
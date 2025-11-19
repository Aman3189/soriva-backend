#!/bin/bash
# Soriva V2 - Database Backup Script (ENCRYPTED)

BACKUP_DIR="$HOME/soriva-backups/database"
DATE=$(date +%Y%m%d-%H%M%S)
DB_NAME="soriva_db"
BACKUP_PASSWORD="${SORIVA_BACKUP_PASSWORD:-Soriva#Backup@2025!Secure}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database with AES-256 encryption
echo "🔒 Backing up database: $DB_NAME (ENCRYPTED)"
pg_dump -U Aman $DB_NAME | gzip | gpg --batch --yes --passphrase "$BACKUP_PASSWORD" --symmetric --cipher-algo AES256 > $BACKUP_DIR/soriva_db_$DATE.sql.gz.gpg

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz.gpg" -mtime +30 -delete

echo "✅ Encrypted backup complete: soriva_db_$DATE.sql.gz.gpg"
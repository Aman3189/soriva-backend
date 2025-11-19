#!/bin/bash
# Soriva V2 - Database Backup Script

BACKUP_DIR="$HOME/soriva-backups/database"
DATE=$(date +%Y%m%d-%H%M%S)
DB_NAME="soriva_db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "🔒 Backing up database: $DB_NAME"
pg_dump -U soriva_admin $DB_NAME | gzip > $BACKUP_DIR/soriva_db_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup complete: soriva_db_$DATE.sql.gz"

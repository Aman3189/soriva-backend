#!/bin/bash
# Soriva V2 - File Backup Script

BACKUP_DIR="$HOME/soriva-backups/files"
DATE=$(date +%Y%m%d-%H%M%S)
SOURCE_DIR="./uploads"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup files
echo "📁 Backing up files from: $SOURCE_DIR"
tar -czf $BACKUP_DIR/soriva_files_$DATE.tar.gz $SOURCE_DIR

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ File backup complete: soriva_files_$DATE.tar.gz"

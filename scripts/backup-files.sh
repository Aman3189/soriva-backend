#!/bin/bash
# Soriva V2 - File Backup Script (ENCRYPTED)

BACKUP_DIR="$HOME/soriva-backups/files"
DATE=$(date +%Y%m%d-%H%M%S)
SOURCE_DIR="./uploads"
BACKUP_PASSWORD="${SORIVA_BACKUP_PASSWORD:-Soriva#Backup@2025!Secure}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup files with AES-256 encryption
echo "📁 Backing up files from: $SOURCE_DIR (ENCRYPTED)"
tar -czf - $SOURCE_DIR | gpg --batch --yes --passphrase "$BACKUP_PASSWORD" --symmetric --cipher-algo AES256 > $BACKUP_DIR/soriva_files_$DATE.tar.gz.gpg

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz.gpg" -mtime +30 -delete

echo "✅ Encrypted file backup complete: soriva_files_$DATE.tar.gz.gpg"
#!/bin/bash
# Soriva V2 - Master Backup Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 SORIVA V2 - DAILY BACKUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run database backup
./scripts/backup-database.sh

echo ""

# Run file backup
./scripts/backup-files.sh

echo ""
echo "✅ All backups complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

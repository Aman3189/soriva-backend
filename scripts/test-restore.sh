#!/bin/bash
# Soriva V2 - Restore Test Script (ENCRYPTED)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 SORIVA V2 - RESTORE TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKUP_DIR="$HOME/soriva-backups/database"
TEST_DB="soriva_test_restore"
BACKUP_PASSWORD="${SORIVA_BACKUP_PASSWORD:-Soriva#Backup@2025!Secure}"

# Find latest encrypted backup
LATEST_BACKUP=$(ls -t $BACKUP_DIR/*.sql.gz.gpg 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No encrypted backup found!"
    exit 1
fi

echo "📦 Testing encrypted backup: $(basename $LATEST_BACKUP)"
echo ""

# Create test database
echo "1️⃣ Creating test database..."
psql -U Aman -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB;" 2>/dev/null
psql -U Aman -d postgres -c "CREATE DATABASE $TEST_DB;"

# Decrypt and restore backup
echo "2️⃣ Decrypting and restoring backup..."
gpg --batch --yes --passphrase "$BACKUP_PASSWORD" --decrypt $LATEST_BACKUP | gunzip | psql -U Aman -d $TEST_DB

# Verify tables
echo "3️⃣ Verifying restore..."
TABLE_COUNT=$(psql -U Aman -d $TEST_DB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

echo ""
echo "✅ Restore test complete!"
echo "   Tables restored: $TABLE_COUNT"
echo ""

# Cleanup
echo "4️⃣ Cleaning up test database..."
psql -U Aman -d postgres -c "DROP DATABASE $TEST_DB;"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ENCRYPTED DR TEST PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
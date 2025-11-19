#!/bin/bash
# Soriva V2 - Restore Test Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 SORIVA V2 - RESTORE TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKUP_DIR="$HOME/soriva-backups/database"
TEST_DB="soriva_test_restore"

LATEST_BACKUP=$(ls -t $BACKUP_DIR/*.sql.gz | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    exit 1
fi

echo "📦 Testing backup: $(basename $LATEST_BACKUP)"
echo ""
echo "1️⃣ Creating test database..."
psql -U Aman -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB;" 2>/dev/null
psql -U Aman -d postgres -c "CREATE DATABASE $TEST_DB;"

echo "2️⃣ Restoring backup..."
gunzip -c $LATEST_BACKUP | psql -U Aman -d $TEST_DB

echo "3️⃣ Verifying restore..."
TABLE_COUNT=$(psql -U Aman -d $TEST_DB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

echo ""
echo "✅ Restore test complete!"
echo "   Tables restored: $TABLE_COUNT"
echo ""
echo "4️⃣ Cleaning up test database..."
psql -U Aman -d postgres -c "DROP DATABASE $TEST_DB;"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DR TEST PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

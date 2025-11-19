#!/bin/bash
# Soriva V2 - Security Audit Script

echo "🔒 Running npm security audit..."
npm audit --audit-level=moderate

if [ $? -eq 0 ]; then
    echo "✅ No vulnerabilities found!"
else
    echo "⚠️  Vulnerabilities detected! Check output above."
fi

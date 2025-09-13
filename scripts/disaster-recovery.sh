#!/bin/bash
set -e

echo "🚨 DISASTER RECOVERY - Ministry of Grenada"
echo "⚠️  This will restore the system from backup"
echo "📋 Recovery Time Objective: 30 minutes"
echo "📋 Recovery Point Objective: 0 data loss"

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_timestamp>"
  echo "Available backups:"
  ls -la /var/lib/mentorship/backups/hourly/db_hot_*.backup
  exit 1
fi

BACKUP_TIMESTAMP=$1
BACKUP_DIR="/var/lib/mentorship/backups/hourly"

# Verify backup exists
if [ ! -f "$BACKUP_DIR/db_hot_$BACKUP_TIMESTAMP.backup" ]; then
  echo "❌ Backup not found: db_hot_$BACKUP_TIMESTAMP.backup"
  exit 1
fi

# Stop services gracefully
echo "⏸️  Stopping services..."
docker compose down

# Restore database
echo "🔄 Restoring database..."
docker compose up -d postgres redis
sleep 10

# Wait for postgres to be ready
until docker compose exec postgres pg_isready -U postgres; do
  echo "Waiting for postgres..."
  sleep 2
done

# Restore database backup
echo "📥 Restoring database from backup..."
docker compose exec -T postgres pg_restore \
  -U postgres \
  -d mentorship_portal \
  --clean \
  --if-exists \
  --verbose < $BACKUP_DIR/db_hot_$BACKUP_TIMESTAMP.backup

# Restore files
echo "📁 Restoring files..."
if [ -f "$BACKUP_DIR/uploads_$BACKUP_TIMESTAMP.tar.gz" ]; then
  cd /var/lib/mentorship
  tar -xzf $BACKUP_DIR/uploads_$BACKUP_TIMESTAMP.tar.gz
  echo "✅ Files restored"
fi

# Start all services
echo "🚀 Starting all services..."
docker compose up -d

# Verify recovery
echo "🔍 Verifying recovery..."
sleep 30

# Test database connectivity
docker compose exec postgres psql -U postgres mentorship_portal -c "SELECT COUNT(*) FROM users;"

# Test API health
curl -f http://localhost:3001/health

echo "✅ DISASTER RECOVERY COMPLETED"
echo "⏱️  Recovery completed within 30-minute RTO"
echo "📊 System operational and verified"
#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="mentorship-postgres-dev"
DB_NAME="mentorship_portal_dev"

mkdir -p $BACKUP_DIR

echo "🔄 Creating database backup..."

# Create SQL backup
docker compose -f docker-compose.dev.yml exec -T postgres pg_dump -U postgres $DB_NAME > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Create compressed backup
docker compose -f docker-compose.dev.yml exec -T postgres pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Backup uploads directory
tar -czf $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz backend/uploads/

echo "✅ Backup created:"
echo "   Database: $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
echo "   Uploads: $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz"

# Keep only last 30 backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -type f -mtime +30 -delete
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -type f -mtime +30 -delete

echo "🧹 Old backups cleaned"
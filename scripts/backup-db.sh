# scripts/backup-db.sh
#!/bin/bash
set -e

# Database backup script
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DB_CONTAINER="mentorship-postgres"

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

docker exec $DB_CONTAINER pg_dump -U postgres mentorship_portal > $BACKUP_DIR/backup_$TIMESTAMP.sql

echo "✅ Backup created: $BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 7 backups
find $BACKUP_DIR -name "backup_*.sql" -type f -mtime +7 -delete
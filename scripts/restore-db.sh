# scripts/restore-db.sh
#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore-db.sh <backup_file>"
    exit 1
fi

BACKUP_FILE=$1
DB_CONTAINER="mentorship-postgres"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "📥 Restoring database from $BACKUP_FILE..."

docker exec -i $DB_CONTAINER psql -U postgres mentorship_portal < $BACKUP_FILE

echo "✅ Database restored successfully!"
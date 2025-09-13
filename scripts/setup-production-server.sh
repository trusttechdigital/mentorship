#!/bin/bash
set -e

echo "🚀 Setting up production server..."

# Create persistent directories
sudo mkdir -p /var/lib/mentorship/{postgres,uploads,logs,backups}
sudo chown -R 999:999 /var/lib/mentorship/postgres  # postgres user
sudo chown -R 1001:1001 /var/lib/mentorship/uploads # node user
sudo chown -R 1001:1001 /var/lib/mentorship/logs    # node user
sudo chmod 755 /var/lib/mentorship/backups

# Setup automated backups (cron job)
cat << 'EOF' | sudo tee /etc/cron.d/mentorship-backup
# Backup mentorship database every 6 hours
0 */6 * * * root /opt/mentorship-portal/scripts/automated-backup.sh >> /var/log/mentorship-backup.log 2>&1

# Daily backup cleanup
0 2 * * * root find /var/lib/mentorship/backups -name "*.sql.gz" -mtime +7 -delete
EOF

# Setup log rotation
cat << 'EOF' | sudo tee /etc/logrotate.d/mentorship
/var/lib/mentorship/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 1001 1001
}
EOF

echo "✅ Production server setup complete"
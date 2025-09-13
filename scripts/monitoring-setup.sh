#!/bin/bash
set -e

echo "📊 Setting up government-grade monitoring..."

# Install monitoring tools
sudo apt-get update
sudo apt-get install -y htop iotop nethogs

# Setup health monitoring cron jobs
cat << 'EOF' | sudo tee /etc/cron.d/mentorship-monitoring
# Health checks every 5 minutes
*/5 * * * * root /opt/mentorship-portal/scripts/health-check.sh

# Backup every hour (government requirement)
0 * * * * root /opt/mentorship-portal/scripts/government-backup-system.sh

# Daily system report
0 6 * * * root /opt/mentorship-portal/scripts/daily-report.sh

# Weekly compliance audit
0 0 * * 0 root /opt/mentorship-portal/scripts/compliance-audit.sh
EOF

echo "✅ Monitoring configured for Ministry of Grenada"
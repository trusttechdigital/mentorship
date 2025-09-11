# scripts/docker-prod.sh
#!/bin/bash
set -e

echo "🚀 Starting Mentorship Portal Production Environment..."

# Ensure environment variables are set
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please create it with production values."
    exit 1
fi

# Create necessary directories
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/receipts
mkdir -p backend/uploads/profiles
mkdir -p nginx/ssl

# Build and start production containers
docker compose --profile production up --build -d

echo "✅ Production environment started!"
echo "🌐 Application: http://localhost"
echo "🔧 API: http://localhost/api"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
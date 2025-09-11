# scripts/docker-dev.sh
#!/bin/bash
set -e

echo "🚀 Starting Mentorship Portal Development Environment..."

# Create necessary directories
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/receipts  
mkdir -p backend/uploads/profiles
mkdir -p backend/logs

# Build and start development containers
docker compose -f docker-compose.dev.yml up --build -d

echo "✅ Development environment started!"
echo "📝 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "🗄️  Database: localhost:5432"
echo ""
echo "To view logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "To stop: docker-compose -f docker-compose.dev.yml down"
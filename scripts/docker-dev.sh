#!/bin/bash
# scripts/docker-dev.sh
# Starts the development environment using the production compose file.
set -e

echo "🚀 Starting Mentorship Portal Development Environment..."

# Create necessary directories
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/receipts
mkdir -p backend/uploads/profiles
mkdir -p backend/logs

# Use the production Docker Compose file for development
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Build and start development containers
docker-compose -f "$DOCKER_COMPOSE_FILE" up --build -d

echo "✅ Development environment started!"
echo "📝 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "🗄️ Database: localhost:5432"
echo ""
echo "To view logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
echo "To stop: docker-compose -f $DOCKER_COMPOSE_FILE down"

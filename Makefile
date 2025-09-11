# Makefile
.PHONY: dev prod stop clean logs backup restore

# Development environment
dev:
	@chmod +x scripts/docker-dev.sh
	@./scripts/docker-dev.sh

# Production environment
prod:
	@chmod +x scripts/docker-prod.sh
	@./scripts/docker-prod.sh

# Stop all containers
stop:
	@docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	@docker-compose down 2>/dev/null || true

# Clean up containers and volumes
clean: stop
	@docker system prune -f
	@docker volume prune -f

# View logs
logs:
	@docker-compose logs -f

logs-dev:
	@docker-compose -f docker-compose.dev.yml logs -f

# Database backup
backup:
	@chmod +x scripts/backup-db.sh
	@./scripts/backup-db.sh

# Database restore (usage: make restore FILE=backup.sql)
restore:
	@chmod +x scripts/restore-db.sh
	@./scripts/restore-db.sh $(FILE)

# Health check
health:
	@docker-compose ps
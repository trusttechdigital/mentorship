# Makefile
.PHONY: dev prod stop clean logs backup restore backup-gov

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
	@docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Clean up containers and volumes
clean: stop
	@docker system prune -f
	@docker volume prune -f

# View logs for all services
logs:
	@docker-compose -f docker-compose.prod.yml logs -f

# Database backup
backup:
	@chmod +x scripts/backup-db.sh
	@./scripts/backup-db.sh

# Database restore (usage: make restore FILE=backup.sql)
restore:
	@chmod +x scripts/restore-db.sh
	@./scripts/restore-db.sh $(FILE)

# Government-compliant backup
backup-gov:
	@chmod +x scripts/backup/government-backup-system.sh
	@./scripts/backup/government-backup-system.sh

# Health check
health:
	@docker-compose -f docker-compose.prod.yml ps

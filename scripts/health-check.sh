#!/bin/bash

# Check database connectivity
docker compose exec -T postgres pg_isready -U postgres -d mentorship_portal

# Check critical tables exist
docker compose exec -T postgres psql -U postgres mentorship_portal -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE tablename IN ('users', 'staff', 'mentees', 'documents', 'invoices');
"

# Check volume mounts
docker compose exec backend ls -la /app/uploads

echo "✅ Health check completed"
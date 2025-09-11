# database/init.sql
-- Initial database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial admin user after tables are created
-- This will be handled by the backend initialization
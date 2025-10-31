@echo off
echo Running database migration to fix photo columns...

REM Connect to PostgreSQL and run the migration script
psql -h localhost -U postgres -d pledge_master -f database_migration.sql

echo Migration completed!
pause

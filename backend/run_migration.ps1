# PowerShell script to run database migration
Write-Host "Running database migration to fix photo columns..." -ForegroundColor Green

# Set the password for PostgreSQL (you might need to adjust this)
$env:PGPASSWORD = "Tech8092"

# Run the migration script
psql -h localhost -U postgres -d pledge_master -f database_migration.sql

Write-Host "Migration completed!" -ForegroundColor Green
Read-Host "Press Enter to continue"

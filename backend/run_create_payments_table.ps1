# PowerShell script to create payments table
$PG_HOST="localhost"
$PG_PORT="5432"
$PG_DB="pledge_db"
$PG_USER="pledge_user"
$PG_PASSWORD="password"

Write-Host "Creating payments table..."

# Set PostgreSQL password as environment variable for psql
$env:PGPASSWORD=$PG_PASSWORD

# Path to psql.exe (adjust if necessary)
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Error "psql.exe not found at $psqlPath. Please update the path."
    exit 1
}

& $psqlPath -h $PG_HOST -p $PG_PORT -d $PG_DB -U $PG_USER -f "create_payments_table.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nPayments table created successfully."
} else {
    Write-Host "`nError creating payments table."
}

# Clear the password environment variable
Remove-Item Env:PGPASSWORD

Read-Host "Press Enter to continue..."

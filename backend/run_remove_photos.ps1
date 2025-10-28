Write-Host "Removing photo columns from pledges table..." -ForegroundColor Green
Write-Host ""

# Set your database connection details
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "pledge_master"
$DB_USER = "postgres"
$DB_PASSWORD = "your_password"

Write-Host "Connecting to database..." -ForegroundColor Yellow
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f remove_photo_columns.sql

Write-Host ""
Write-Host "Photo columns removal completed!" -ForegroundColor Green
Read-Host "Press Enter to continue"

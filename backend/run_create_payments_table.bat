@echo off
set PG_HOST=localhost
set PG_PORT=5432
set PG_DB=pledge_db
set PG_USER=pledge_user
set PG_PASSWORD=password

echo Creating payments table...

"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h %PG_HOST% -p %PG_PORT% -d %PG_DB% -U %PG_USER% -w -f create_payments_table.sql

if %ERRORLEVEL% equ 0 (
    echo.
    echo Payments table created successfully.
) else (
    echo.
    echo Error creating payments table.
)
pause

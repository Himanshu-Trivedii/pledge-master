@echo off
echo Removing photo columns from pledges table...
echo.

REM Set your database connection details
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=pledge_master
set DB_USER=postgres
set DB_PASSWORD=your_password

echo Connecting to database...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f remove_photo_columns.sql

echo.
echo Photo columns removal completed!
pause

# Database Setup Instructions - Version 1 (Without Photos)

## Overview
This guide will help you set up the database for Pledge Master Version 1, which does not include photo functionality.

## Prerequisites
- PostgreSQL installed and running
- Database credentials ready

## Step 1: Remove Photo Columns (If Database Already Exists)

If you already have a pledge_master database with photo columns, run this migration to remove them:

### Using Windows Command Prompt (cmd):
```batch
cd backend
run_remove_photos.bat
```

### Using PowerShell:
```powershell
cd backend
.\run_remove_photos.ps1
```

### Manual Migration:
If you prefer to run the SQL manually:

1. Open your PostgreSQL client (pgAdmin, psql, etc.)
2. Connect to your `pledge_master` database
3. Run the contents of `remove_photo_columns.sql`:

```sql
BEGIN;

-- Drop photo columns if they exist
ALTER TABLE pledges DROP COLUMN IF EXISTS customer_photo;
ALTER TABLE pledges DROP COLUMN IF EXISTS item_photo;
ALTER TABLE pledges DROP COLUMN IF EXISTS receipt_photo;

COMMIT;
```

## Step 2: Configure Database Connection

Update the `backend/src/main/resources/application.properties` file with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pledge_master
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Step 3: Rebuild and Restart Backend

After removing photo columns and cleaning the build:

1. Rebuild the backend:
   ```bash
   cd backend
   mvn clean install
   ```

2. Restart the Spring Boot application

## Verification

After completing the setup, verify that:

1. Photo columns are removed from the `pledges` table
2. Backend starts without errors
3. You can create pledges without photo validation errors

## Troubleshooting

### Error: "Item photo is required" or "Interest rate is required"

This error occurs if:
1. The compiled classes are cached - **Solution**: Delete the `backend/target` folder and rebuild
2. The database still has photo columns - **Solution**: Run the migration script above

### How to Check if Photo Columns Exist

Run this SQL query:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'pledges' 
AND column_name IN ('customer_photo', 'item_photo', 'receipt_photo');
```

If this returns any rows, the photo columns still exist and need to be removed.

## Notes for Version 1

- **No photo functionality** - Photo fields have been completely removed from the backend
- **Automatic interest rate calculation** - Interest rates are calculated based on loan amount:
  - 0-50,000: 3%
  - 50,001-1,00,000: 2.5%
  - Above 1,00,000: 2%
- **Purity options**: 28K, 24K, 22K, 18K, 14K

## Future Versions

Photo functionality will be added in a future version. When that happens, we will provide migration scripts to add the photo columns back.


-- Database Migration Script to Fix Photo Columns
-- This script fixes the photo columns in the pledges table

-- First, let's check if the columns exist and their current type
-- You can run this to see the current schema:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'pledges' AND column_name IN ('customer_photo', 'item_photo', 'receipt_photo');

-- Option 1: If you want to preserve existing data (if any)
-- This approach tries to convert existing data
BEGIN;

-- Add new columns with proper TEXT type
ALTER TABLE pledges ADD COLUMN customer_photo_new TEXT;
ALTER TABLE pledges ADD COLUMN item_photo_new TEXT;
ALTER TABLE pledges ADD COLUMN receipt_photo_new TEXT;

-- Copy data from old columns to new columns (if any data exists)
-- UPDATE pledges SET customer_photo_new = customer_photo::TEXT WHERE customer_photo IS NOT NULL;
-- UPDATE pledges SET item_photo_new = item_photo::TEXT WHERE item_photo IS NOT NULL;
-- UPDATE pledges SET receipt_photo_new = receipt_photo::TEXT WHERE receipt_photo IS NOT NULL;

-- Drop old columns
ALTER TABLE pledges DROP COLUMN IF EXISTS customer_photo;
ALTER TABLE pledges DROP COLUMN IF EXISTS item_photo;
ALTER TABLE pledges DROP COLUMN IF EXISTS receipt_photo;

-- Rename new columns to original names
ALTER TABLE pledges RENAME COLUMN customer_photo_new TO customer_photo;
ALTER TABLE pledges RENAME COLUMN item_photo_new TO item_photo;
ALTER TABLE pledges RENAME COLUMN receipt_photo_new TO receipt_photo;

COMMIT;

-- Option 2: If you don't mind losing existing data (simpler approach)
-- Uncomment the following lines if you want to use this approach instead:

-- ALTER TABLE pledges DROP COLUMN IF EXISTS customer_photo;
-- ALTER TABLE pledges DROP COLUMN IF EXISTS item_photo;
-- ALTER TABLE pledges DROP COLUMN IF EXISTS receipt_photo;
-- ALTER TABLE pledges ADD COLUMN customer_photo TEXT;
-- ALTER TABLE pledges ADD COLUMN item_photo TEXT;
-- ALTER TABLE pledges ADD COLUMN receipt_photo TEXT;

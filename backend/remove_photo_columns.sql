-- Remove Photo Columns Migration Script
-- This script completely removes photo columns from the pledges table for version 1

BEGIN;

-- Drop photo columns if they exist
ALTER TABLE pledges DROP COLUMN IF EXISTS customer_photo;
ALTER TABLE pledges DROP COLUMN IF EXISTS item_photo;
ALTER TABLE pledges DROP COLUMN IF EXISTS receipt_photo;

COMMIT;

-- Verify the columns are removed
-- You can run this to verify:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'pledges' AND column_name IN ('customer_photo', 'item_photo', 'receipt_photo');

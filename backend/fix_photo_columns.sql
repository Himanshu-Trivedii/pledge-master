-- Fix photo columns in pledges table to support TEXT/LONGTEXT for base64 encoded images
-- This script changes the photo columns from long to text type

-- Drop existing columns if they exist (be careful with this in production)
ALTER TABLE pledges DROP COLUMN IF EXISTS customer_photo;
ALTER TABLE pledges DROP COLUMN IF EXISTS item_photo;
ALTER TABLE pledges DROP COLUMN IF EXISTS receipt_photo;

-- Add new columns with proper TEXT type for base64 encoded images
ALTER TABLE pledges ADD COLUMN customer_photo TEXT;
ALTER TABLE pledges ADD COLUMN item_photo TEXT;
ALTER TABLE pledges ADD COLUMN receipt_photo TEXT;

-- Alternative approach if you want to keep existing data:
-- ALTER TABLE pledges ALTER COLUMN customer_photo TYPE TEXT;
-- ALTER TABLE pledges ALTER COLUMN item_photo TYPE TEXT;
-- ALTER TABLE pledges ALTER COLUMN receipt_photo TYPE TEXT;

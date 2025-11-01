-- Quick fix script to remove ID proof columns and make fields nullable
-- Run this directly in your database if you're not using Flyway migrations

-- Drop ID proof columns
ALTER TABLE customers DROP COLUMN IF EXISTS id_proof_type;
ALTER TABLE customers DROP COLUMN IF EXISTS id_proof_number;

-- Make phone, email, and address nullable
ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN address DROP NOT NULL;


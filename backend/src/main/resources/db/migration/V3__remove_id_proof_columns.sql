-- Migration: Remove ID Proof columns from customers table
-- This migration removes id_proof_type and id_proof_number columns
-- and makes phone, email, address nullable

-- Drop ID proof columns
ALTER TABLE customers DROP COLUMN IF EXISTS id_proof_type;
ALTER TABLE customers DROP COLUMN IF EXISTS id_proof_number;

-- Make phone, email, and address nullable
ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN address DROP NOT NULL;


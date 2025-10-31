-- Migration: add remaining_amount and last_payment_date to pledges
-- Run this against your DB (Postgres/MySQL). Adjust types if needed.

ALTER TABLE pledges
    ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(15,2);

ALTER TABLE pledges
    ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP NULL;

-- Backfill remaining_amount with amount for existing rows
UPDATE pledges
SET remaining_amount = amount
WHERE remaining_amount IS NULL;

-- Optional: set a default for new rows (Postgres syntax example)
-- ALTER TABLE pledges ALTER COLUMN remaining_amount SET DEFAULT 0.0;

-- Ensure indexes if necessary
CREATE INDEX IF NOT EXISTS idx_pledges_customer_id ON pledges(customer_id);


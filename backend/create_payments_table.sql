-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    pledge_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_type VARCHAR(10) NOT NULL CHECK (payment_type IN ('PARTIAL', 'FULL')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pledge_id) REFERENCES pledges(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_pledge_id ON payments(pledge_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Add comment to table
COMMENT ON TABLE payments IS 'Stores payment history for pledges';
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: PARTIAL or FULL';
COMMENT ON COLUMN payments.amount IS 'Payment amount in rupees';

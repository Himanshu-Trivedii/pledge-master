package com.pledge.backend.service;

import org.springframework.stereotype.Service;

/**
 * Service for calculating monthly interest based on loan amount slabs
 * 
 * Interest Rates:
 * - 0-49,999: 3% monthly
 * - 50,000-99,999: 2.5% monthly
 * - 1,00,000+: 2% monthly
 */
@Service
public class InterestCalculationService {

    /**
     * Calculate monthly interest based on the loan amount
     * 
     * @param amount The loan amount
     * @return Monthly interest amount
     */
    public Double calculateMonthlyInterest(Double amount) {
        if (amount == null || amount <= 0) {
            return 0.0;
        }

        double interestRate = getInterestRate(amount);
        return (amount * interestRate) / 100;
    }

    /**
     * Get the interest rate percentage based on the loan amount
     * 
     * @param amount The loan amount
     * @return Interest rate percentage
     */
    public Double getInterestRate(Double amount) {
        if (amount == null || amount <= 0) {
            return 0.0;
        }

        if (amount < 50000) {
            return 3.0; // 3% for amounts 0-49,999
        } else if (amount < 100000) {
            return 2.5; // 2.5% for amounts 50,000-99,999
        } else {
            return 2.0; // 2% for amounts 1,00,000+
        }
    }

    /**
     * Handle partial payment and recalculate monthly interest for remaining amount
     * 
     * @param originalAmount The original loan amount
     * @param paymentAmount The partial payment amount
     * @return CalculationResult containing remaining amount and new monthly interest
     */
    public CalculationResult handlePartialPayment(Double originalAmount, Double paymentAmount) {
        if (originalAmount == null || originalAmount <= 0) {
            throw new IllegalArgumentException("Original amount must be greater than 0");
        }
        
        if (paymentAmount == null || paymentAmount < 0) {
            throw new IllegalArgumentException("Payment amount cannot be negative");
        }
        
        if (paymentAmount > originalAmount) {
            throw new IllegalArgumentException("Payment amount cannot exceed original amount");
        }

        double remainingAmount = originalAmount - paymentAmount;
        double newMonthlyInterest = calculateMonthlyInterest(remainingAmount);
        double originalMonthlyInterest = calculateMonthlyInterest(originalAmount);

        return new CalculationResult(
            originalAmount,
            paymentAmount,
            remainingAmount,
            originalMonthlyInterest,
            newMonthlyInterest,
            getInterestRate(originalAmount),
            getInterestRate(remainingAmount)
        );
    }

    /**
     * Result class for interest calculations
     */
    public static class CalculationResult {
        private final Double originalAmount;
        private final Double paymentAmount;
        private final Double remainingAmount;
        private final Double originalMonthlyInterest;
        private final Double newMonthlyInterest;
        private final Double originalInterestRate;
        private final Double newInterestRate;

        public CalculationResult(
            Double originalAmount,
            Double paymentAmount,
            Double remainingAmount,
            Double originalMonthlyInterest,
            Double newMonthlyInterest,
            Double originalInterestRate,
            Double newInterestRate
        ) {
            this.originalAmount = originalAmount;
            this.paymentAmount = paymentAmount;
            this.remainingAmount = remainingAmount;
            this.originalMonthlyInterest = originalMonthlyInterest;
            this.newMonthlyInterest = newMonthlyInterest;
            this.originalInterestRate = originalInterestRate;
            this.newInterestRate = newInterestRate;
        }

        public Double getOriginalAmount() {
            return originalAmount;
        }

        public Double getPaymentAmount() {
            return paymentAmount;
        }

        public Double getRemainingAmount() {
            return remainingAmount;
        }

        public Double getOriginalMonthlyInterest() {
            return originalMonthlyInterest;
        }

        public Double getNewMonthlyInterest() {
            return newMonthlyInterest;
        }

        public Double getOriginalInterestRate() {
            return originalInterestRate;
        }

        public Double getNewInterestRate() {
            return newInterestRate;
        }

        @Override
        public String toString() {
            return String.format(
                "Original Amount: ₹%.2f (Rate: %.1f%%, Monthly Interest: ₹%.2f)\n" +
                "Payment: ₹%.2f\n" +
                "Remaining Amount: ₹%.2f (Rate: %.1f%%, Monthly Interest: ₹%.2f)",
                originalAmount, originalInterestRate, originalMonthlyInterest,
                paymentAmount,
                remainingAmount, newInterestRate, newMonthlyInterest
            );
        }
    }
}


package com.pledge.backend.util;

/**
 * Helper for calculating pledge interest based on slab rules.
 */
public class InterestCalculator {
    /**
     * Calculate monthly interest based on slab rates:
     * - 0-49,999 → 3%
     * - 50,000-99,999 → 2.5%
     * - 100,000+ → 2%
     *
     * @param amount principal amount in currency units
     * @return monthly interest amount
     */
    public static double calculateMonthlyInterest(double amount) {
        if (amount <= 0.0) return 0.0;

        double monthlyRate;
        if (amount < 50_000) {
            monthlyRate = 3.0;
        } else if (amount < 100_000) {
            monthlyRate = 2.5;
        } else {
            monthlyRate = 2.0;
        }

        return roundTo2(amount * monthlyRate / 100.0);
    }

    /**
     * Apply a payment to current principal and recalculate interest.
     *
     * @param currentAmount current outstanding principal
     * @param payment payment amount to apply
     * @return PaymentResult containing new remaining amount and monthly interest
     */
    public static PaymentResult applyPayment(double currentAmount, double payment) {
        if (payment < 0 || currentAmount < 0) {
            throw new IllegalArgumentException("Amounts must be non-negative");
        }

        double newRemaining = Math.max(0.0, currentAmount - payment);
        double newMonthlyInterest = calculateMonthlyInterest(newRemaining);

        return new PaymentResult(
            roundTo2(newRemaining),
            newMonthlyInterest
        );
    }

    private static double roundTo2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    public static class PaymentResult {
        private final double remainingAmount;
        private final double monthlyInterest;

        public PaymentResult(double remainingAmount, double monthlyInterest) {
            this.remainingAmount = remainingAmount;
            this.monthlyInterest = monthlyInterest;
        }

        public double getRemainingAmount() { return remainingAmount; }
        public double getMonthlyInterest() { return monthlyInterest; }
    }

    // Example usage / quick test
    public static void main(String[] args) {
        // Example 1: ₹1,00,000 initial loan
        double initialAmount = 100_000.0;
        double initialInterest = calculateMonthlyInterest(initialAmount);
        System.out.printf("Initial amount: ₹%.2f%n", initialAmount);
        System.out.printf("Monthly interest (2%%): ₹%.2f%n", initialInterest);
        // Should show: ₹2000.00 (100000 * 2% = 2000)

        // Example 2: Pay ₹40,000, recalculate for remaining ₹60,000
        double payment = 40_000.0;
        var result = applyPayment(initialAmount, payment);
        System.out.printf("%nAfter payment: ₹%.2f%n", payment);
        System.out.printf("Remaining amount: ₹%.2f%n", result.getRemainingAmount());
        System.out.printf("New monthly interest (2.5%%): ₹%.2f%n", result.getMonthlyInterest());
        // Should show: remaining=60000.00, interest=1500.00 (60000 * 2.5% = 1500)
    }
}

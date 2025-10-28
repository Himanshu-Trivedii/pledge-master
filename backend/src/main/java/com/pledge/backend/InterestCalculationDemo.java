package com.pledge.backend;

import com.pledge.backend.service.InterestCalculationService;
import com.pledge.backend.service.InterestCalculationService.CalculationResult;

/**
 * Demo class to demonstrate monthly interest calculation with partial payments
 * 
 * This demonstrates:
 * 1. Original amount: ₹1,00,000 → Monthly interest: ₹2,000 (2%)
 * 2. After partial payment of ₹40,000
 * 3. Remaining amount: ₹60,000 → Monthly interest: ₹1,500 (2.5%)
 */
public class InterestCalculationDemo {

    public static void main(String[] args) {
        System.out.println("=== Pledge Master - Monthly Interest Calculation Demo ===\n");
        
        InterestCalculationService service = new InterestCalculationService();
        
        // Demo 1: ₹1,00,000
        demoCalculation(service, 100000.0, "Demo 1: ₹1,00,000 loan");
        
        // Demo 2: ₹1,00,000 with ₹40,000 partial payment
        System.out.println("\n--- Partial Payment Demo ---");
        demoPartialPayment(service, 100000.0, 40000.0);
        
        // Demo 3: Various amounts
        System.out.println("\n--- Various Amount Scenarios ---");
        demoCalculation(service, 30000.0, "₹30,000 (3% slab)");
        demoCalculation(service, 75000.0, "₹75,000 (2.5% slab)");
        demoCalculation(service, 150000.0, "₹1,50,000 (2% slab)");
        
        // Demo 4: Multiple partial payments
        System.out.println("\n--- Multiple Partial Payments Demo ---");
        demoMultiplePayments(service, 100000.0, new double[]{30000.0, 25000.0});
    }

    private static void demoCalculation(InterestCalculationService service, double amount, String label) {
        double monthlyInterest = service.calculateMonthlyInterest(amount);
        double interestRate = service.getInterestRate(amount);
        
        System.out.printf("%s:\n", label);
        System.out.printf("  Amount: ₹%,.2f\n", amount);
        System.out.printf("  Interest Rate: %.1f%%\n", interestRate);
        System.out.printf("  Monthly Interest: ₹%,.2f\n\n", monthlyInterest);
    }

    private static void demoPartialPayment(InterestCalculationService service, double originalAmount, double paymentAmount) {
        System.out.printf("Original Loan: ₹%,.2f\n", originalAmount);
        
        CalculationResult result = service.handlePartialPayment(originalAmount, paymentAmount);
        
        System.out.println(result);
    }

    private static void demoMultiplePayments(InterestCalculationService service, double originalAmount, double[] payments) {
        double currentAmount = originalAmount;
        
        System.out.printf("Starting Amount: ₹%,.2f\n", originalAmount);
        
        for (int i = 0; i < payments.length; i++) {
            double payment = payments[i];
            CalculationResult result = service.handlePartialPayment(currentAmount, payment);
            
            System.out.printf("\nPayment %d: ₹%,.2f\n", i + 1, payment);
            System.out.printf("Remaining: ₹%,.2f\n", result.getRemainingAmount());
            System.out.printf("New Monthly Interest: ₹%,.2f (%.1f%%)\n", 
                result.getNewMonthlyInterest(), result.getNewInterestRate());
            
            currentAmount = result.getRemainingAmount();
        }
    }
}


package com.pledge.backend.controller;

import com.pledge.backend.dto.response.ApiResponse;
import com.pledge.backend.service.InterestCalculationService;
import com.pledge.backend.service.InterestCalculationService.CalculationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/interest")
@RequiredArgsConstructor
public class InterestController {

    private final InterestCalculationService interestCalculationService;

    /**
     * Calculate monthly interest for a given amount
     * 
     * GET /api/interest/calculate?amount=100000
     */
    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateInterest(
            @RequestParam Double amount) {
        try {
            double monthlyInterest = interestCalculationService.calculateMonthlyInterest(amount);
            double interestRate = interestCalculationService.getInterestRate(amount);

            Map<String, Object> result = new HashMap<>();
            result.put("amount", amount);
            result.put("interestRate", interestRate);
            result.put("monthlyInterest", monthlyInterest);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Interest calculated successfully",
                result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                false,
                e.getMessage(),
                null
            ));
        }
    }

    /**
     * Handle partial payment and recalculate interest
     * 
     * POST /api/interest/partial-payment
     * Body: { "originalAmount": 100000, "paymentAmount": 40000 }
     */
    @PostMapping("/partial-payment")
    public ResponseEntity<ApiResponse<CalculationResult>> handlePartialPayment(
            @RequestBody Map<String, Double> request) {
        try {
            Double originalAmount = request.get("originalAmount");
            Double paymentAmount = request.get("paymentAmount");

            if (originalAmount == null || paymentAmount == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Both originalAmount and paymentAmount are required",
                    null
                ));
            }

            CalculationResult result = interestCalculationService.handlePartialPayment(
                originalAmount, paymentAmount
            );

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Partial payment processed successfully",
                result
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                false,
                e.getMessage(),
                null
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(
                false,
                "An error occurred: " + e.getMessage(),
                null
            ));
        }
    }

    /**
     * Get interest rate for a given amount
     * 
     * GET /api/interest/rate?amount=100000
     */
    @GetMapping("/rate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInterestRate(
            @RequestParam Double amount) {
        try {
            double interestRate = interestCalculationService.getInterestRate(amount);

            Map<String, Object> result = new HashMap<>();
            result.put("amount", amount);
            result.put("interestRate", interestRate);
            result.put("slab", getSlabDescription(amount));

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Interest rate retrieved successfully",
                result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                false,
                e.getMessage(),
                null
            ));
        }
    }

    private String getSlabDescription(double amount) {
        if (amount < 50000) {
            return "0-49,999 (3%)";
        } else if (amount < 100000) {
            return "50,000-99,999 (2.5%)";
        } else {
            return "1,00,000+ (2%)";
        }
    }
}


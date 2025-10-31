package com.pledge.backend.controller;

import com.pledge.backend.dto.request.PaymentCreateRequest;
import com.pledge.backend.dto.response.ApiResponse;
import com.pledge.backend.dto.response.PaymentResponse;
import com.pledge.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(@Valid @RequestBody PaymentCreateRequest request) {
        try {
            PaymentResponse payment = paymentService.createPayment(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Payment recorded successfully", payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/pledge/{pledgeId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByPledge(@PathVariable Long pledgeId) {
        try {
            List<PaymentResponse> payments = paymentService.getPaymentsByPledgeId(pledgeId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Payments retrieved successfully", payments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@PathVariable Long id) {
        try {
            PaymentResponse payment = paymentService.getPaymentById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Payment retrieved successfully", payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/pledge/{pledgeId}/total")
    public ResponseEntity<ApiResponse<Double>> getTotalPaymentsByPledge(@PathVariable Long pledgeId) {
        try {
            Double total = paymentService.getTotalPaymentsByPledgeId(pledgeId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Total payments retrieved successfully", total));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        try {
            paymentService.deletePayment(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Payment deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

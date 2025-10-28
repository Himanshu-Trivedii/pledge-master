package com.pledge.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateRequest {
    
    @NotNull(message = "Pledge ID is required")
    private Long pledgeId;
    
    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be positive")
    private Double amount;
    
    @NotBlank(message = "Payment type is required")
    @Pattern(regexp = "^(PARTIAL|FULL)$", message = "Payment type must be PARTIAL or FULL")
    private String paymentType;
    
    private String notes;
}

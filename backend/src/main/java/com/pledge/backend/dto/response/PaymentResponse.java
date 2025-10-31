package com.pledge.backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long pledgeId;
    private Double amount;
    private LocalDateTime paymentDate;
    private String paymentType;
    private String notes;
    private LocalDateTime createdAt;
}

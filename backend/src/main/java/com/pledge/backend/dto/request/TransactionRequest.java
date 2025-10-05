package com.pledge.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRequest {
    private Double amount;
    private String paymentMethod;
    private Long pledgeId;
    private Long userId;
}
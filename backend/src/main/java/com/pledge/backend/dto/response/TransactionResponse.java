package com.pledge.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private Long pledgeId;
    private Long userId;
    private Double amount;
    private String type;
    private String status;
    private LocalDateTime transactionDate;
    private String description;
    private String message;

    // Additional fields for context
    private Double pledgeAmount;
    private Double currentInterestRate;
    private Double totalInterestToDate;
    private Double remainingBalance;
}

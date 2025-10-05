package com.pledge.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponse {
    private Long id;
    private Double amount;
    private LocalDateTime date;
    private String status;
    private String paymentMethod;
    private Long pledgeId;
    private String pledgeTitle;
    private Long userId;
    private String username;
    private String message;
}
package com.pledge.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionDto {
    private Long id;
    private Double amount;
    private LocalDateTime date;
    private String status;
    private String paymentMethod;
    private Long pledgeId;
}
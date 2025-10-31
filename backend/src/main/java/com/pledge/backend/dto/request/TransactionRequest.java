package com.pledge.backend.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransactionRequest {
    private Long pledgeId;
    private Long userId;
    private Double amount;
    private String type;
    private String description;
}

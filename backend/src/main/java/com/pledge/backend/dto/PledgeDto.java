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
public class PledgeDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime deadline;
    private String status;
    private Double amount;
    private Long userId;
}
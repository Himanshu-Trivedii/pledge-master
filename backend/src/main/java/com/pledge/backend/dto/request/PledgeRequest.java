package com.pledge.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PledgeRequest {
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Double amount;
    private Long userId;
}
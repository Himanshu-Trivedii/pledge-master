package com.pledge.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private Long totalCustomers;
    private Long activePledges;
    private Double totalLoans;
    private Double monthlyInterest;
    private Double lastMonthInterest;
    private Double profitLoss;
    private Double profitLossPercentage;
}

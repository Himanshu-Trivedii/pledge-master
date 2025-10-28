package com.pledge.backend.service;

import com.pledge.backend.dto.response.DashboardStatsResponse;
import com.pledge.backend.entity.PledgeEntity;
import com.pledge.backend.repository.CustomerRepository;
import com.pledge.backend.repository.PledgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final PledgeRepository pledgeRepository;

    public DashboardStatsResponse getDashboardStats() {
        // Get total customers
        Long totalCustomers = customerRepository.count();

        // Get active pledges (status = "ACTIVE" or "PARTIALLY_PAID")
        Long activePledges = pledgeRepository.countByStatus("ACTIVE") + pledgeRepository.countByStatus("PARTIALLY_PAID");
        
        // Debug: Log the count and also check all pledges
        System.out.println("DEBUG: Active pledges count: " + activePledges);
        List<PledgeEntity> allPledges = pledgeRepository.findAll();
        System.out.println("DEBUG: Total pledges in database: " + allPledges.size());
        for (PledgeEntity pledge : allPledges) {
            System.out.println("DEBUG: Pledge ID: " + pledge.getId() + ", Status: '" + pledge.getStatus() + "', Customer: " + 
                (pledge.getCustomer() != null ? pledge.getCustomer().getName() : "null"));
        }

        // Get total loans amount from active pledges (ACTIVE + PARTIALLY_PAID)
        Double activeLoans = pledgeRepository.sumAmountByStatus("ACTIVE");
        Double partiallyPaidLoans = pledgeRepository.sumAmountByStatus("PARTIALLY_PAID");
        Double totalLoans = (activeLoans != null ? activeLoans : 0.0) + (partiallyPaidLoans != null ? partiallyPaidLoans : 0.0);

        // Calculate monthly interest for current month
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfMonth = now.withDayOfMonth(now.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);

        List<PledgeEntity> currentMonthPledges = pledgeRepository.findPledgesCreatedBetween(startOfMonth, endOfMonth);
        Double monthlyInterest = currentMonthPledges.stream()
                .mapToDouble(pledge -> pledge.getAmount() * (pledge.getInterestRate() / 100))
                .sum();

        // Calculate last month interest
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusNanos(1);

        List<PledgeEntity> lastMonthPledges = pledgeRepository.findPledgesCreatedBetween(startOfLastMonth, endOfLastMonth);
        Double lastMonthInterest = lastMonthPledges.stream()
                .mapToDouble(pledge -> pledge.getAmount() * (pledge.getInterestRate() / 100))
                .sum();

        // Calculate profit/loss
        Double profitLoss = monthlyInterest - lastMonthInterest;
        Double profitLossPercentage = lastMonthInterest > 0 ? (profitLoss / lastMonthInterest) * 100 : 0.0;

        return DashboardStatsResponse.builder()
                .totalCustomers(totalCustomers)
                .activePledges(activePledges)
                .totalLoans(totalLoans)
                .monthlyInterest(monthlyInterest)
                .lastMonthInterest(lastMonthInterest)
                .profitLoss(profitLoss)
                .profitLossPercentage(profitLossPercentage)
                .build();
    }
}

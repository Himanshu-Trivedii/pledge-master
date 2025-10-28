package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.request.PaymentCreateRequest;
import com.pledge.backend.dto.response.PaymentResponse;
import com.pledge.backend.entity.PaymentEntity;
import com.pledge.backend.entity.PledgeEntity;
import com.pledge.backend.repository.PaymentRepository;
import com.pledge.backend.repository.PledgeRepository;
import com.pledge.backend.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PledgeRepository pledgeRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, PledgeRepository pledgeRepository) {
        this.paymentRepository = paymentRepository;
        this.pledgeRepository = pledgeRepository;
    }

    @Override
    public PaymentResponse createPayment(PaymentCreateRequest request) {
        // Verify pledge exists
        PledgeEntity pledge = pledgeRepository.findById(request.getPledgeId())
                .orElseThrow(() -> new IllegalArgumentException("Pledge not found"));

        // Check if pledge is already closed
        if ("CLOSED".equals(pledge.getStatus())) {
            throw new IllegalArgumentException("Cannot make payment on a closed pledge");
        }

        // Create payment record
        PaymentEntity payment = PaymentEntity.builder()
                .pledge(pledge)
                .amount(request.getAmount())
                .paymentType(request.getPaymentType())
                .notes(request.getNotes())
                .build();

        PaymentEntity saved = paymentRepository.save(payment);

        // Calculate total amount due (principal + daily interest)
        Double totalAmountDue = calculateTotalAmountDue(pledge);
        Double totalPaid = getTotalPaymentsByPledgeId(pledge.getId());
        Double remainingAmount = totalAmountDue - totalPaid;

        // Update pledge status based on payment
        updatePledgeStatus(pledge, remainingAmount, totalPaid);

        return toResponse(saved);
    }

    @Override
    public List<PaymentResponse> getPaymentsByPledgeId(Long pledgeId) {
        List<PaymentEntity> payments = paymentRepository.findByPledgeIdOrderByPaymentDateDesc(pledgeId);
        return payments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Double getTotalPaymentsByPledgeId(Long pledgeId) {
        return paymentRepository.getTotalPaymentsByPledgeId(pledgeId);
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        PaymentEntity payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        return toResponse(payment);
    }

    @Override
    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }

    /**
     * Calculate total amount due including daily interest
     */
    private Double calculateTotalAmountDue(PledgeEntity pledge) {
        if (pledge.getAmount() == null || pledge.getInterestRate() == null || pledge.getCreatedAt() == null) {
            return pledge.getAmount();
        }

        // Calculate days elapsed since pledge creation
        long daysElapsed = ChronoUnit.DAYS.between(pledge.getCreatedAt(), LocalDateTime.now());
        
        // Calculate daily interest rate
        double dailyInterestRate = pledge.getInterestRate() / (100 * 365);
        
        // Calculate total interest accrued
        double totalInterest = pledge.getAmount() * dailyInterestRate * daysElapsed;
        
        // Return principal + interest
        return pledge.getAmount() + totalInterest;
    }

    /**
     * Update pledge status based on payment amount
     */
    private void updatePledgeStatus(PledgeEntity pledge, Double remainingAmount, Double totalPaid) {
        // Check if pledge amount is 0 or negative - automatically close
        if (pledge.getAmount() <= 0) {
            pledge.setStatus("CLOSED");
            System.out.println("DEBUG: Pledge " + pledge.getId() + " closed - amount is 0 or negative");
        } else if (remainingAmount <= 0) {
            // Fully paid - close the pledge
            pledge.setStatus("CLOSED");
            System.out.println("DEBUG: Pledge " + pledge.getId() + " closed - fully paid. Total paid: " + totalPaid);
        } else if (totalPaid > 0) {
            // Partially paid
            pledge.setStatus("PARTIALLY_PAID");
            System.out.println("DEBUG: Pledge " + pledge.getId() + " marked as PARTIALLY_PAID. Remaining: " + remainingAmount);
        } else {
            // No payments made yet
            pledge.setStatus("ACTIVE");
        }
        
        pledgeRepository.save(pledge);
    }

    private PaymentResponse toResponse(PaymentEntity entity) {
        return PaymentResponse.builder()
                .id(entity.getId())
                .pledgeId(entity.getPledge().getId())
                .amount(entity.getAmount())
                .paymentDate(entity.getPaymentDate())
                .paymentType(entity.getPaymentType())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

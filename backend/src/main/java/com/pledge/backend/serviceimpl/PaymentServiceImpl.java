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

        // 1) Compute accrued interest since last cycle on current principal
        double principal = pledge.getAmount() == null ? 0.0 : pledge.getAmount();
        double monthlyRatePercent = pledge.getInterestRate() == null ? 0.0 : pledge.getInterestRate();

        // Determine accrual start date: last payment date (if any), else createdAt
        LocalDateTime accrualStart = pledge.getCreatedAt();
        List<PaymentEntity> paymentsSoFar = paymentRepository.findByPledgeIdOrderByPaymentDateDesc(pledge.getId());
        if (paymentsSoFar != null && !paymentsSoFar.isEmpty()) {
            accrualStart = paymentsSoFar.get(0).getPaymentDate();
        }
        long daysElapsed = ChronoUnit.DAYS.between(accrualStart, LocalDateTime.now());

        double monthlyInterest = principal * (monthlyRatePercent / 100.0);
        double dailyInterestRate = (monthlyRatePercent / 100.0) / 30.0;
        double accruedInterest = daysElapsed <= 30 ? monthlyInterest : (monthlyInterest + principal * dailyInterestRate * (daysElapsed - 30L));

        // 2) Add interest to principal for this cycle
        double totalBeforePayment = principal + accruedInterest;

        // 3) Apply payment against total
        double remainingAfterPayment = Math.max(0.0, totalBeforePayment - request.getAmount());

        // 4) Update pledge principal to remaining (this becomes the new base for next cycle)
        pledge.setAmount(remainingAfterPayment);
        pledgeRepository.save(pledge);

        // 5) Now create payment record (dated now)
        PaymentEntity payment = PaymentEntity.builder()
                .pledge(pledge)
                .amount(request.getAmount())
                .paymentType(request.getPaymentType())
                .notes(request.getNotes())
                .build();

        PaymentEntity saved = paymentRepository.save(payment);

        // 6) Calculate total amount due after payment (principal since payment + next accrual will start post-payment)
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

        // Determine accrual start date: last payment date (if any), else createdAt
        LocalDateTime accrualStart = pledge.getCreatedAt();
        List<PaymentEntity> payments = paymentRepository.findByPledgeIdOrderByPaymentDateDesc(pledge.getId());
        if (payments != null && !payments.isEmpty()) {
            accrualStart = payments.get(0).getPaymentDate();
        }

        long daysElapsed = ChronoUnit.DAYS.between(accrualStart, LocalDateTime.now());

        // Treat stored interestRate as monthly percent (e.g., 2% per month)
        double monthlyRatePercent = pledge.getInterestRate();
        double monthlyInterest = pledge.getAmount() * (monthlyRatePercent / 100.0);
        double dailyInterestRate = (monthlyRatePercent / 100.0) / 30.0; // 30-day month basis

        // Business rule relative to accrualStart:
        // - First 30 days: full month interest
        // - After that: daily pro-rata on extra days
        double totalInterest;
        if (daysElapsed <= 30) {
            totalInterest = monthlyInterest;
        } else {
            long extraDays = daysElapsed - 30L;
            totalInterest = monthlyInterest + (pledge.getAmount() * dailyInterestRate * extraDays);
        }
        
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

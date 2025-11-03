// backend/src/main/java/com/pledge/backend/service/impl/PledgeServiceImpl.java
package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.request.PledgeRequest;
import com.pledge.backend.dto.response.PledgeResponse;
import com.pledge.backend.entity.PledgeEntity;
import com.pledge.backend.entity.CustomerEntity;
import com.pledge.backend.repository.PledgeRepository;
import com.pledge.backend.repository.CustomerRepository;
import com.pledge.backend.repository.PaymentRepository;
import com.pledge.backend.service.PledgeService;
import com.pledge.backend.service.InterestCalculationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PledgeServiceImpl implements PledgeService {

	private final PledgeRepository pledgeRepository;
	private final CustomerRepository customerRepository;
	private final PaymentRepository paymentRepository;
	private final InterestCalculationService interestCalculationService;

	public PledgeServiceImpl(
		PledgeRepository pledgeRepository, 
		CustomerRepository customerRepository,
		PaymentRepository paymentRepository,
		InterestCalculationService interestCalculationService
	) {
		this.pledgeRepository = pledgeRepository;
		this.customerRepository = customerRepository;
		this.paymentRepository = paymentRepository;
		this.interestCalculationService = interestCalculationService;
	}

	@Override
	public PledgeResponse createPledge(PledgeRequest request) {
		CustomerEntity customer = customerRepository.findById(request.getCustomerId())
													.orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // Prefer owner-provided interestRate; fallback to slab-based service if not provided
        Double interestRate = request.getInterestRate() != null && request.getInterestRate() > 0
                ? request.getInterestRate()
                : interestCalculationService.getInterestRate(request.getAmount());

		PledgeEntity pledge = PledgeEntity.builder()
										  .customer(customer)
										  .title(request.getTitle())
										  .description(request.getDescription())
										  .amount(request.getAmount())
                                          .interestRate(interestRate)
										  .createdAt(java.time.LocalDateTime.now())
										  .lastInterestAccruedAt(java.time.LocalDateTime.now())
										  .deadline(request.getDeadline())
									  .status(request.getStatus())
									  .itemType(request.getItemType())
									  .weight(request.getWeight())
									  .purity(request.getPurity())
									  .notes(request.getNotes())
								  .customerPhoto(request.getCustomerPhoto())
								  .itemPhoto(request.getItemPhoto())
								  .receiptPhoto(request.getReceiptPhoto())
										  .build();

		PledgeEntity saved = pledgeRepository.save(pledge);
		return toResponse(saved);
	}

	@Override
	public PledgeResponse getPledgeById(Long id) {
		PledgeEntity pledge = pledgeRepository.findById(id)
											  .orElseThrow(() -> new IllegalArgumentException("Pledge not found"));
		return toResponse(pledge);
	}

	// @Override
	// public List<PledgeResponse> getAllPledges() {
	// 	return pledgeRepository.findAll().stream()
	// 						   .map(this::toResponse)
	// 						   .collect(Collectors.toList());
	// }

	@Override
	public List<PledgeResponse> getAllPledges() {
		return pledgeRepository.findAllWithCustomer().stream()
							   .map(this::toResponse)
							   .collect(Collectors.toList());
	}

	@Override
	public List<PledgeResponse> getPledgesByCustomerId(Long customerId) {
		return pledgeRepository.findByCustomer_Id(customerId).stream()
							   .map(this::toResponse)
							   .collect(Collectors.toList());
	}

	@Override
	public PledgeResponse updatePledge(Long id, PledgeRequest request) {
		PledgeEntity pledge = pledgeRepository.findById(id)
											  .orElseThrow(() -> new IllegalArgumentException("Pledge not found"));

		// Determine if the interest rate is changing; only then accrue up to now
		boolean isRateChanging = request.getInterestRate() != null
			&& request.getInterestRate() > 0
			&& (pledge.getInterestRate() == null || !request.getInterestRate().equals(pledge.getInterestRate()));

		if (isRateChanging) {
			java.time.LocalDateTime now = java.time.LocalDateTime.now();
			java.time.LocalDateTime accrualStart = pledge.getLastInterestAccruedAt() != null ? pledge.getLastInterestAccruedAt() : pledge.getCreatedAt();
			long daysElapsed = java.time.temporal.ChronoUnit.DAYS.between(accrualStart, now);
			double principal = pledge.getAmount() == null ? 0.0 : pledge.getAmount();
			double oldMonthlyRatePercent = pledge.getInterestRate() == null ? 0.0 : pledge.getInterestRate();
			double dailyRate = (oldMonthlyRatePercent / 100.0) / 30.0;
			double accrued = principal * dailyRate * Math.max(0L, daysElapsed);
			pledge.setAmount(principal + accrued);
			pledge.setLastInterestAccruedAt(now);
		}

		// Apply incoming edits and set the NEW rate (prefer owner-provided, else keep old)
		pledge.setTitle(request.getTitle());
		pledge.setDescription(request.getDescription());
		pledge.setDeadline(request.getDeadline());
		pledge.setItemType(request.getItemType());
		pledge.setWeight(request.getWeight());
		pledge.setPurity(request.getPurity());
		pledge.setNotes(request.getNotes());
		pledge.setStatus(request.getStatus());
		pledge.setCustomerPhoto(request.getCustomerPhoto());
		pledge.setItemPhoto(request.getItemPhoto());
		pledge.setReceiptPhoto(request.getReceiptPhoto());

		Double newRate = request.getInterestRate() != null && request.getInterestRate() > 0
				? request.getInterestRate()
				: pledge.getInterestRate();
		pledge.setInterestRate(newRate);

		// If amount is provided, respect the edited principal
		if (request.getAmount() != null && request.getAmount() > 0) {
			pledge.setAmount(request.getAmount());
		}

		PledgeEntity updated = pledgeRepository.save(pledge);
		return toResponse(updated);
	}

	@Override
	public void deletePledge(Long id) {
		pledgeRepository.deleteById(id);
	}

	@Override
	public Double calculateInterestForPledge(Long id) {
		PledgeEntity pledge = pledgeRepository.findById(id)
											  .orElseThrow(() -> new IllegalArgumentException("Pledge not found"));
		return pledge.calculateTotalInterestToDate();
	}

	@Override
	public Double getTotalAmountForPledge(Long id) {
		PledgeEntity pledge = pledgeRepository.findById(id)
											  .orElseThrow(() -> new IllegalArgumentException("Pledge not found"));
		return pledge.calculateTotalAmount();
	}

	@Override
	public PledgeResponse recordPayment(Long pledgeId, Double amount) {
		PledgeEntity pledge = pledgeRepository.findById(pledgeId)
											  .orElseThrow(() -> new IllegalArgumentException("Pledge not found"));

		// Calculate new amount after payment
		double newAmount = pledge.getAmount() - amount;
		
		if (newAmount < 0) {
			throw new IllegalArgumentException("Payment amount cannot exceed pledge amount");
		}

		// Determine payment type
		String paymentType = newAmount == 0 ? "FULL" : "PARTIAL";

		// Create payment record
		com.pledge.backend.entity.PaymentEntity payment = com.pledge.backend.entity.PaymentEntity.builder()
				.pledge(pledge)
				.amount(amount)
				.paymentType(paymentType)
				.build();
		paymentRepository.save(payment);

		// Do NOT change interest rate after partial payment; keep original owner-defined rate
		pledge.setAmount(newAmount);

		// Auto-close if amount becomes 0 or negative
		if (newAmount <= 0) {
			pledge.setStatus("CLOSED");
			System.out.println("DEBUG: Pledge " + pledge.getId() + " auto-closed due to zero amount");
		}

		PledgeEntity updated = pledgeRepository.save(pledge);
		return toResponse(updated);
	}

	@Override
	public void autoCloseZeroAmountPledges() {
		// Find all active pledges with amount <= 0
		List<PledgeEntity> zeroAmountPledges = pledgeRepository.findAll().stream()
				.filter(pledge -> "ACTIVE".equals(pledge.getStatus()) && pledge.getAmount() <= 0)
				.collect(java.util.stream.Collectors.toList());
		
		// Close all zero amount pledges
		for (PledgeEntity pledge : zeroAmountPledges) {
			pledge.setStatus("CLOSED");
			pledgeRepository.save(pledge);
			System.out.println("DEBUG: Auto-closed pledge " + pledge.getId() + " with amount: " + pledge.getAmount());
		}
		
		if (!zeroAmountPledges.isEmpty()) {
			System.out.println("DEBUG: Auto-closed " + zeroAmountPledges.size() + " pledges with zero amounts");
		}
	}

	private PledgeResponse toResponse(PledgeEntity entity) {
		PledgeResponse response = new PledgeResponse();
		response.setId(entity.getId());
		response.setCustomerId(entity.getCustomerId());
		response.setTitle(entity.getTitle());
		response.setDescription(entity.getDescription());
		response.setAmount(entity.getAmount());
		response.setInterestRate(entity.getInterestRate());
		response.setCreatedAt(entity.getCreatedAt());
		response.setDeadline(entity.getDeadline());
		response.setStatus(entity.getStatus());
		response.setItemType(entity.getItemType());
		response.setWeight(entity.getWeight());
		response.setPurity(entity.getPurity());
		response.setNotes(entity.getNotes());
		response.setCustomerPhoto(entity.getCustomerPhoto());
		response.setItemPhoto(entity.getItemPhoto());
		response.setReceiptPhoto(entity.getReceiptPhoto());

		// Compute remaining amount = principal + accrued interest - total paid
		try {
			// Accrual from last payment date (if any) or createdAt
			java.time.LocalDateTime accrualStart = entity.getCreatedAt();
			java.util.List<com.pledge.backend.entity.PaymentEntity> payments = paymentRepository.findByPledgeIdOrderByPaymentDateDesc(entity.getId());
			if (payments != null && !payments.isEmpty()) {
				accrualStart = payments.get(0).getPaymentDate();
			}
			long daysElapsed = java.time.temporal.ChronoUnit.DAYS.between(accrualStart, java.time.LocalDateTime.now());
			double principal = entity.getAmount() == null ? 0.0 : entity.getAmount();
			double monthlyRatePercent = entity.getInterestRate() == null ? 0.0 : entity.getInterestRate();
			double monthlyInterest = principal * (monthlyRatePercent / 100.0);
			double dailyInterestRate = (monthlyRatePercent / 100.0) / 30.0;
			double accruedInterest = daysElapsed <= 30 ? monthlyInterest : (monthlyInterest + principal * dailyInterestRate * (daysElapsed - 30L));
			double remaining = principal + accruedInterest; // principal already reflects payments
			response.setRemainingAmount(remaining);
		} catch (Exception ignored) { }

		return response;
	}

}

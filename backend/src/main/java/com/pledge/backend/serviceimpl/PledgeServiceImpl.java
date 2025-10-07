// backend/src/main/java/com/pledge/backend/service/impl/PledgeServiceImpl.java
package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.request.PledgeRequest;
import com.pledge.backend.dto.response.PledgeResponse;
import com.pledge.backend.entity.PledgeEntity;
import com.pledge.backend.entity.CustomerEntity;
import com.pledge.backend.repository.PledgeRepository;
import com.pledge.backend.repository.CustomerRepository;
import com.pledge.backend.service.PledgeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PledgeServiceImpl implements PledgeService {

	private final PledgeRepository pledgeRepository;
	private final CustomerRepository customerRepository;

	public PledgeServiceImpl(PledgeRepository pledgeRepository, CustomerRepository customerRepository) {
		this.pledgeRepository = pledgeRepository;
		this.customerRepository = customerRepository;
	}

	@Override
	public PledgeResponse createPledge(PledgeRequest request) {
		CustomerEntity customer = customerRepository.findById(request.getCustomerId())
													.orElseThrow(() -> new IllegalArgumentException("Customer not found"));

		PledgeEntity pledge = PledgeEntity.builder()
										  .customer(customer)
										  .title(request.getTitle())
										  .description(request.getDescription())
										  .amount(request.getAmount())
										  .interestRate(request.getInterestRate())
										  .createdAt(java.time.LocalDateTime.now())
										  .deadline(request.getDeadline())
										  .status("ACTIVE")
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

	@Override
	public List<PledgeResponse> getAllPledges() {
		return pledgeRepository.findAll().stream()
							   .map(this::toResponse)
							   .collect(Collectors.toList());
	}

	@Override
	public List<PledgeResponse> getPledgesByCustomerId(Long customerId) {
		return pledgeRepository.findByCustomerId(customerId).stream()
							   .map(this::toResponse)
							   .collect(Collectors.toList());
	}

	@Override
	public PledgeResponse updatePledge(Long id, PledgeRequest request) {
		PledgeEntity pledge = pledgeRepository.findById(id)
											  .orElseThrow(() -> new IllegalArgumentException("Pledge not found"));

		pledge.setTitle(request.getTitle());
		pledge.setDescription(request.getDescription());
		pledge.setAmount(request.getAmount());
		pledge.setInterestRate(request.getInterestRate());
		pledge.setDeadline(request.getDeadline());
		pledge.setCustomerPhoto(request.getCustomerPhoto());
		pledge.setItemPhoto(request.getItemPhoto());
		pledge.setReceiptPhoto(request.getReceiptPhoto());
		pledge.setStatus(request.getStatus());
		pledge.setCreatedAt(pledge.getCreatedAt()); // keep original
		pledge.setDeadline(request.getDeadline());

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

	private PledgeResponse toResponse(PledgeEntity entity) {
		PledgeResponse response = new PledgeResponse();
		response.setId(entity.getId());
		response.setCustomerId(entity.getCustomer().getId());
		response.setTitle(entity.getTitle());
		response.setDescription(entity.getDescription());
		response.setAmount(entity.getAmount());
		response.setInterestRate(entity.getInterestRate());
		response.setCreatedAt(entity.getCreatedAt());
		response.setDeadline(entity.getDeadline());
		response.setStatus(entity.getStatus());
		response.setCustomerPhoto(entity.getCustomerPhoto());
		response.setItemPhoto(entity.getItemPhoto());
		response.setReceiptPhoto(entity.getReceiptPhoto());
		return response;
	}
}

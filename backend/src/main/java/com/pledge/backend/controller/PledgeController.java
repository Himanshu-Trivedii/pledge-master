package com.pledge.backend.controller;

import com.pledge.backend.dto.request.PledgeRequest;
import com.pledge.backend.dto.request.PaymentRequest;
import com.pledge.backend.dto.response.PledgeResponse;
import com.pledge.backend.service.PledgeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pledges")
public class PledgeController {
	private final PledgeService pledgeService;

	public PledgeController(PledgeService pledgeService) {
		this.pledgeService = pledgeService;
	}

    @PostMapping
    public PledgeResponse createPledge(@Valid @RequestBody PledgeRequest request) {
		System.out.println("Received pledge request: " + request);
		try {
			PledgeResponse response = pledgeService.createPledge(request);
			System.out.println("Pledge created successfully: " + response.getId());
			return response;
		} catch (Exception e) {
			System.err.println("Error creating pledge: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

	@GetMapping
	public List<PledgeResponse> getAllPledges() {
		// Auto-close pledges with zero amounts before returning
		pledgeService.autoCloseZeroAmountPledges();
		return pledgeService.getAllPledges();
	}

	@GetMapping("/customer/{customerId}")
	public List<PledgeResponse> getPledgesByCustomer(@PathVariable Long customerId) {
		// Auto-close pledges with zero amounts before returning
		pledgeService.autoCloseZeroAmountPledges();
		return pledgeService.getPledgesByCustomerId(customerId);
	}

	@GetMapping("/{id}")
	public PledgeResponse getPledge(@PathVariable Long id) {
		return pledgeService.getPledgeById(id);
	}

	@PostMapping("/{id}/payments")
	public PledgeResponse makePayment(@PathVariable("id") Long pledgeId, @Valid @RequestBody PaymentRequest request) {
		System.out.println("Received payment request for pledge " + pledgeId + " with amount: " + request.getAmount());
		try {
			PledgeResponse response = pledgeService.recordPayment(pledgeId, request.getAmount());
			System.out.println("Payment recorded successfully for pledge " + pledgeId);
			return response;
		} catch (Exception e) {
			System.err.println("Error recording payment for pledge " + pledgeId + ": " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

	@PostMapping("/auto-close-zero-amounts")
	public String autoCloseZeroAmountPledges() {
		pledgeService.autoCloseZeroAmountPledges();
		return "Auto-close process completed";
	}
}

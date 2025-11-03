package com.pledge.backend.controller;

import com.pledge.backend.dto.request.PledgeRequest;
import com.pledge.backend.dto.request.PaymentRequest;
import com.pledge.backend.dto.response.ApiResponse;
import com.pledge.backend.dto.response.PledgeResponse;
import com.pledge.backend.service.PledgeService;
import com.pledge.backend.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pledges")
public class PledgeController {
	private final PledgeService pledgeService;
    private final EmailService emailService;

    public PledgeController(PledgeService pledgeService, EmailService emailService) {
        this.pledgeService = pledgeService;
        this.emailService = emailService;
    }

    @PostMapping
    public PledgeResponse createPledge(@Valid @RequestBody PledgeRequest request) {
		System.out.println("Received pledge request: " + request);
		try {
			PledgeResponse response = pledgeService.createPledge(request);
			// Fire-and-forget email send
			try { com.pledge.backend.entity.PledgeEntity e = new com.pledge.backend.entity.PledgeEntity(); e.setId(response.getId()); e.setCustomerId(response.getCustomerId()); e.setAmount(response.getAmount()); e.setInterestRate(response.getInterestRate()); e.setCustomerPhoto(response.getCustomerPhoto()); e.setItemPhoto(response.getItemPhoto()); e.setReceiptPhoto(response.getReceiptPhoto()); if (emailService != null) emailService.sendPledgePhotosEmail(e, "godejewellers023@gmail.com"); } catch (Exception ignored) {}
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

    @PutMapping("/{id}")
    public PledgeResponse updatePledge(@PathVariable Long id, @Valid @RequestBody PledgeRequest request) {
        PledgeResponse response = pledgeService.updatePledge(id, request);
        try { com.pledge.backend.entity.PledgeEntity e = new com.pledge.backend.entity.PledgeEntity(); e.setId(response.getId()); e.setCustomerId(response.getCustomerId()); e.setAmount(response.getAmount()); e.setInterestRate(response.getInterestRate()); e.setCustomerPhoto(response.getCustomerPhoto()); e.setItemPhoto(response.getItemPhoto()); e.setReceiptPhoto(response.getReceiptPhoto()); if (emailService != null) emailService.sendPledgePhotosEmail(e, "godejewellers023@gmail.com"); } catch (Exception ignored) {}
        return response;
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

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deletePledge(@PathVariable Long id) {
		try {
			pledgeService.deletePledge(id);
			return ResponseEntity.ok(new ApiResponse<>(true, "Pledge deleted successfully", null));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse<>(false, e.getMessage(), null));
		}
	}

	@PostMapping("/auto-close-zero-amounts")
	public String autoCloseZeroAmountPledges() {
		pledgeService.autoCloseZeroAmountPledges();
		return "Auto-close process completed";
	}
}

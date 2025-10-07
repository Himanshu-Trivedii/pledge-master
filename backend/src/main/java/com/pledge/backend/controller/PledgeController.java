package com.pledge.backend.controller;

import com.pledge.backend.dto.request.PledgeRequest;
import com.pledge.backend.dto.response.PledgeResponse;
import com.pledge.backend.service.PledgeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pledges")
public class PledgeController {
	private final PledgeService pledgeService;

	public PledgeController(PledgeService pledgeService) {
		this.pledgeService = pledgeService;
	}

	@PostMapping
	public PledgeResponse createPledge(@RequestBody PledgeRequest request) {
		return pledgeService.createPledge(request);
	}

	@GetMapping("/customer/{customerId}")
	public List<PledgeResponse> getPledgesByCustomer(@PathVariable Long customerId) {
		return pledgeService.getPledgesByCustomerId(customerId);
	}

	@GetMapping("/{id}")
	public PledgeResponse getPledge(@PathVariable Long id) {
		return pledgeService.getPledgeById(id);
	}
}

// backend/src/main/java/com/pledge/backend/service/PledgeService.java
package com.pledge.backend.service;

import com.pledge.backend.dto.request.PledgeRequest;
import com.pledge.backend.dto.response.PledgeResponse;
import java.util.List;

public interface PledgeService {
	PledgeResponse createPledge(PledgeRequest request);
	PledgeResponse getPledgeById(Long id);
	List<PledgeResponse> getAllPledges();
	List<PledgeResponse> getPledgesByCustomerId(Long customerId);
	PledgeResponse updatePledge(Long id, PledgeRequest request);
	void deletePledge(Long id);
	Double calculateInterestForPledge(Long id);
	Double getTotalAmountForPledge(Long id);
	PledgeResponse recordPayment(Long pledgeId, Double amount);
	void autoCloseZeroAmountPledges();
}

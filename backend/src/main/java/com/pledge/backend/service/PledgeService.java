package com.pledge.backend.service;

import com.pledge.backend.dto.request.PledgeRequest;
import com.pledge.backend.dto.response.PledgeResponse;
import java.util.List;

public interface PledgeService {
    PledgeResponse createPledge(PledgeRequest request);
    PledgeResponse getPledgeById(Long id);
    List<PledgeResponse> getAllPledges();
    List<PledgeResponse> getPledgesByUserId(Long userId);
    PledgeResponse updatePledge(Long id, PledgeRequest request);
    void deletePledge(Long id);
}
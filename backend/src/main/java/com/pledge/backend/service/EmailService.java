package com.pledge.backend.service;

import com.pledge.backend.entity.PledgeEntity;

public interface EmailService {
	void sendPledgePhotosEmail(PledgeEntity pledge, String toEmailAddress);
}



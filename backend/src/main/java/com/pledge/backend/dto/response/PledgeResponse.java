package com.pledge.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class PledgeResponse {
	private Long id;
	private Long customerId;
	private String title;
	private String description;
	private Double amount;
	private Double interestRate;
	private Double dailyInterest;
	private Double totalInterestToDate;
	private Double totalAmount;
	private LocalDateTime createdAt;
	private LocalDateTime deadline;
	private String status;
	private String customerPhoto;
	private String itemPhoto;
	private String receiptPhoto;
	private String message;

	public PledgeResponse()
	{

	}
}

// java
package com.pledge.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PledgeResponse {
	private Long id;
	private Long customerId;
	private String title;
	private String description;
	private Double amount;
	private Double interestRate;
	private LocalDateTime createdAt;
	private LocalDateTime deadline;
	private String status;
	private String itemType;
	private Double weight;
	private String purity;
	private String notes;
	// <-- added field to match backend entity and avoid "setPledgeDuration" missing error
	private Integer pledgeDuration;
}

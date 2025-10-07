package com.pledge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "pledges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PledgeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "customer_id", nullable = false)
	private CustomerEntity customer;

	private String title;
	private String description;
	private Double amount;
	private Double interestRate;
	private LocalDateTime createdAt;
	private LocalDateTime deadline;
	private String status;

	@Column(columnDefinition = "TEXT")
	private String customerPhoto;

	@Column(columnDefinition = "TEXT")
	private String itemPhoto;

	@Column(columnDefinition = "TEXT")
	private String receiptPhoto;

	public Double calculateDailyInterest() {
		if (amount == null || interestRate == null) {
			throw new IllegalStateException("Amount or interest rate is not set");
		}
		return (amount * interestRate) / (100 * 365);
	}

	public Double calculateTotalInterestToDate() {
		if (createdAt == null) {
			throw new IllegalStateException("Created date is not set");
		}
		long daysElapsed = ChronoUnit.DAYS.between(createdAt, LocalDateTime.now());
		return calculateDailyInterest() * daysElapsed;
	}

	public Double calculateTotalAmount() {
		return amount + calculateTotalInterestToDate();
	}

	public boolean isValidAmount() {
		return amount != null && amount > 0;
	}

	public boolean isValidInterestRate() {
		return interestRate != null && interestRate > 0 && interestRate <= 36;
	}

	public boolean isValidStatus() {
		return status != null && (
				status.equals("ACTIVE") ||
				status.equals("COMPLETED") ||
				status.equals("DEFAULTED") ||
				status.equals("CLOSED")
		);
	}

	public boolean isValidDates() {
		return createdAt != null && deadline != null && deadline.isAfter(createdAt);
	}
}

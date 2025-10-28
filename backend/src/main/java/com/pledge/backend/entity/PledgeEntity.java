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

	// 1️⃣ id
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// 2️⃣ customer_id
	@Column(name = "customer_id", insertable = false, updatable = false)
	private Long customerId;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "customer_id", nullable = false)
	private CustomerEntity customer;

	// 3️⃣ title
	@Column(name = "title")
	private String title;

	// 4️⃣ description
	@Column(name = "description")
	private String description;

	// 5️⃣ amount
	@Column(name = "amount")
	private Double amount;

	// 6️⃣ interest_rate
	@Column(name = "interest_rate")
	private Double interestRate;

	// 7️⃣ created_at
	@Column(name = "created_at")
	private LocalDateTime createdAt;

	// 8️⃣ deadline
	@Column(name = "deadline")
	private LocalDateTime deadline;

	// 9️⃣ status
	@Column(name = "status")
	private String status;

	// 🔟 item_type
	@Column(name = "item_type")
	private String itemType;

	// 11️⃣ weight
	@Column(name = "weight")
	private Double weight;

	// 12️⃣ purity
	@Column(name = "purity")
	private String purity;

	// 13️⃣ notes
	@Column(name = "notes")
	private String notes;


	// 17️⃣ user_id
	@Column(name = "user_id")
	private Long userId;

	// ================= Business Logic =================

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
				status.equals("PARTIALLY_PAID") ||
				status.equals("COMPLETED") ||
				status.equals("DEFAULTED") ||
				status.equals("CLOSED")
		);
	}

	public boolean isValidDates() {
		return createdAt != null && deadline != null && deadline.isAfter(createdAt);
	}

	public void setPledgeDuration(final int pledgeDuration)
	{
		return;
	}
}

package com.pledge.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PledgeRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    @DecimalMax(value = "10000000", message = "Amount cannot exceed 1 Crore")
    private Double amount;

    @NotNull(message = "Deadline is required")
    // @Future(message = "Deadline must be in the future") // Temporarily disabled for debugging
    private LocalDateTime deadline;

    @NotNull(message = "Pledge duration is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    @Max(value = 60, message = "Duration cannot exceed 60 months")
    private Integer pledgeDuration;


    // Additional fields for pledge details
    @NotBlank(message = "Item type is required")
    private String itemType;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be greater than 0")
    private Double weight;

    @NotBlank(message = "Purity is required")
    @Pattern(regexp = "^(28K|24K|22K|18K|14K)$", message = "Invalid purity value")
    private String purity;

	@NotBlank(message = "Status is required")
	private String status;

	private String notes;
}

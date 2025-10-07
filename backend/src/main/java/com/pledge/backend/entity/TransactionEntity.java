package com.pledge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private String type; // PAYMENT, INTEREST, etc.
    private String status;
    private LocalDateTime transactionDate;
    private String description;

    @Column(name = "pledge_id")
    private Long pledgeId;

    @Column(name = "user_id")
    private Long userId;

    // Helper methods for validation
    public boolean isValidAmount() {
        return amount != null && amount > 0;
    }

    public boolean isValidType() {
        return type != null && (type.equals("PAYMENT") || type.equals("INTEREST"));
    }

    public boolean isValidStatus() {
        return status != null && (status.equals("PENDING") || status.equals("COMPLETED") || status.equals("FAILED"));
    }
}

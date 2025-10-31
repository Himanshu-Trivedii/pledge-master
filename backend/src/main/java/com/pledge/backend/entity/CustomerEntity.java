package com.pledge.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(name = "id_proof_type", nullable = false)
    private String idProofType;

    @Column(name = "id_proof_number", nullable = false, length = 50)
    private String idProofNumber;

    private LocalDateTime createdAt;

    @Column(name = "is_active")
    private Boolean isActive;
}

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

    @Column(nullable = true, length = 15)
    private String phone;

    @Column(nullable = true)
    private String email;

    @Column(nullable = true, length = 500)
    private String address;

    private LocalDateTime createdAt;

    @Column(name = "is_active")
    private Boolean isActive;
}

package com.pledge.backend.repository;

import com.pledge.backend.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    CustomerEntity findByEmail(String email);
}

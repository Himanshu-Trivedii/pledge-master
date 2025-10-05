package com.pledge.backend.repository;

import com.pledge.backend.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByPledgeId(Long pledgeId);
    List<TransactionEntity> findByStatus(String status);
}
package com.pledge.backend.repository;

import com.pledge.backend.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    
    List<PaymentEntity> findByPledgeIdOrderByPaymentDateDesc(Long pledgeId);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p WHERE p.pledge.id = :pledgeId")
    Double getTotalPaymentsByPledgeId(@Param("pledgeId") Long pledgeId);
    
    @Query("SELECT COUNT(p) FROM PaymentEntity p WHERE p.pledge.id = :pledgeId")
    Long getPaymentCountByPledgeId(@Param("pledgeId") Long pledgeId);
}

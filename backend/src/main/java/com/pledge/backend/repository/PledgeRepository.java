// backend/src/main/java/com/pledge/backend/repository/PledgeRepository.java
package com.pledge.backend.repository;

import com.pledge.backend.dto.response.PledgeResponse;
import com.pledge.backend.entity.PledgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface PledgeRepository extends JpaRepository<PledgeEntity, Long> {
	List<PledgeEntity> findByCustomer_Id(Long customerId);
	
	Long countByStatus(String status);


	List<PledgeEntity> findByCustomerId(Long customerId);


	@Query("SELECT p FROM PledgeEntity p JOIN FETCH p.customer")
	List<PledgeEntity> findAllWithCustomer();

	@Query("SELECT COALESCE(SUM(p.amount), 0) FROM PledgeEntity p WHERE p.status = :status")
	Double sumAmountByStatus(@Param("status") String status);
	
	@Query("SELECT p FROM PledgeEntity p WHERE p.createdAt BETWEEN :startDate AND :endDate")
	List<PledgeEntity> findPledgesCreatedBetween(@Param("startDate") LocalDateTime startDate, 
												  @Param("endDate") LocalDateTime endDate);
}

// backend/src/main/java/com/pledge/backend/repository/PledgeRepository.java
package com.pledge.backend.repository;

import com.pledge.backend.entity.PledgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PledgeRepository extends JpaRepository<PledgeEntity, Long> {
	List<PledgeEntity> findByCustomerId(Long customerId);
}

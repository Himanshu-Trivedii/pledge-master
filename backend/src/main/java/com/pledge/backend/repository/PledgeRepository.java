package com.pledge.backend.repository;

import com.pledge.backend.entity.PledgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PledgeRepository extends JpaRepository<PledgeEntity, Long> {
    List<PledgeEntity> findByUserId(Long userId);
    List<PledgeEntity> findByStatus(String status);
}
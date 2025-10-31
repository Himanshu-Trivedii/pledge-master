package com.pledge.backend.repository;

import java.util.Optional;

import com.pledge.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

	Optional<UserEntity> findByUsername(String username);

	UserEntity findByEmail(String email);

	boolean existsByEmail(String email);
}

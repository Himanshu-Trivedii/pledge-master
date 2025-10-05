package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.request.UserRequest;
import com.pledge.backend.dto.response.UserResponse;
import com.pledge.backend.entity.UserEntity;
import com.pledge.backend.repository.UserRepository;
import com.pledge.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;

    @Override
    public UserResponse createUser(UserRequest request) {
        log.info("Creating new user with username: {}", request.getUsername());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("Email already exists: {}", request.getEmail());
            return UserResponse.builder()
                    .status("ERROR")
                    .message("Email already exists")
                    .build();
        }
        
        UserEntity user = mapToEntity(request);
        UserEntity savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        return mapToResponse(savedUser, "User created successfully");
    }

    @Override
    public UserResponse getUserById(Long id) {
        log.info("Fetching user with ID: {}", id);
        
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });
                
        log.info("User found: {}", user.getUsername());
        return mapToResponse(user, "User retrieved successfully");
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        log.info("Fetching user with email: {}", email);
        
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new RuntimeException("User not found");
                });
                
        log.info("User found: {}", user.getUsername());
        return mapToResponse(user, "User retrieved successfully");
    }

    @Override
    public List<UserResponse> getAllUsers() {
        log.info("Fetching all users");
        List<UserEntity> users = userRepository.findAll();
        log.info("Found {} users", users.size());
        
        return users.stream()
                .map(user -> mapToResponse(user, "User retrieved successfully"))
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {
        log.info("Updating user with ID: {}", id);
        
        UserEntity existingUser = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });
        
        existingUser.setUsername(request.getUsername());
        existingUser.setEmail(request.getEmail());
        
        UserEntity updatedUser = userRepository.save(existingUser);
        log.info("User updated successfully: {}", updatedUser.getUsername());
        
        return mapToResponse(updatedUser, "User updated successfully");
    }

    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);
        
        if (!userRepository.existsById(id)) {
            log.error("User not found with ID: {}", id);
            throw new RuntimeException("User not found");
        }
        
        userRepository.deleteById(id);
        log.info("User deleted successfully");
    }

    private UserEntity mapToEntity(UserRequest request) {
        return UserEntity.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
    }

    private UserResponse mapToResponse(UserEntity user, String message) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status("SUCCESS")
                .message(message)
                .build();
    }
}
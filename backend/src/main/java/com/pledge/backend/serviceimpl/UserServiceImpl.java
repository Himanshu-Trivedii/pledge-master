package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.UserDto;
import com.pledge.backend.entity.UserEntity;
import com.pledge.backend.exception.ResourceNotFoundException;
import com.pledge.backend.repository.UserRepository;
import com.pledge.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto createUser(UserDto userDto) {
        log.info("Creating new user with email: {}", userDto.getEmail());

        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        UserEntity user = mapToEntity(userDto);
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setIsActive(true);

        UserEntity savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());

        return mapToDto(savedUser);
    }

    @Override
    public UserDto getUserById(Long id) {
        log.info("Fetching user with ID: {}", id);

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToDto(user);
    }

    @Override
    public UserDto getUserByEmail(String email) {
        log.info("Fetching user with email: {}", email);

        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }

        return mapToDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        log.info("Fetching all users");

        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto updateUser(Long id, UserDto userDto) {
        log.info("Updating user with ID: {}", id);

        UserEntity existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if email is being changed and if it's already taken
        if (!existingUser.getEmail().equals(userDto.getEmail())
                && userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        updateUserFields(existingUser, userDto);
        UserEntity updatedUser = userRepository.save(existingUser);

        log.info("User updated successfully: {}", updatedUser.getEmail());
        return mapToDto(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }

        userRepository.deleteById(id);
        log.info("User deleted successfully");
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private UserEntity mapToEntity(UserDto userDto) {
        return UserEntity.builder()
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .role(userDto.getRole())
                .isActive(true)
                .build();
    }

    private UserDto mapToDto(UserEntity user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private void updateUserFields(UserEntity user, UserDto userDto) {
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setRole(userDto.getRole());

        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        if (userDto.getIsActive() != null) {
            user.setIsActive(userDto.getIsActive());
        }
    }
}

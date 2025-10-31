package com.pledge.backend.controller;

import com.pledge.backend.dto.UserDto;
import com.pledge.backend.dto.response.ApiResponse;
import com.pledge.backend.exception.ResourceNotFoundException;
import com.pledge.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody UserDto userDto) {
        try {
            UserDto createdUser = userService.createUser(userDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "User created successfully", createdUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to create user: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        try {
            UserDto user = userService.getUserById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved successfully", user));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving user: " + e.getMessage(), null));
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserDto>> getUserByEmail(@PathVariable String email) {
        try {
            UserDto user = userService.getUserByEmail(email);
            return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved successfully", user));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving user by email: " + e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        try {
            List<UserDto> users = userService.getAllUsers();
            return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving users: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDto userDto) {
        try {
            UserDto updatedUser = userService.updateUser(id, userDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", updatedUser));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error updating user: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error deleting user: " + e.getMessage(), null));
        }
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = userService.existsByEmail(email);
            return ResponseEntity.ok(new ApiResponse<>(true,
                exists ? "Email already exists" : "Email is available",
                exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error checking email: " + e.getMessage(), null));
        }
    }
}

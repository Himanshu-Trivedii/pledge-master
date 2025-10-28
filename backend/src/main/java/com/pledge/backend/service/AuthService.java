package com.pledge.backend.service;

import com.pledge.backend.dto.request.LoginRequest;
import com.pledge.backend.dto.response.AuthResponse;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final String ADMIN_USERNAME = "Akash";
    private static final String ADMIN_PASSWORD = "Akash@123";
    private static final String MOCK_TOKEN = "mock-jwt-token"; // In production, use proper JWT

    public AuthResponse authenticate(LoginRequest request) {
        if (ADMIN_USERNAME.equals(request.getUsername()) &&
            ADMIN_PASSWORD.equals(request.getPassword())) {

            return AuthResponse.builder()
                .token(MOCK_TOKEN)
                .username(ADMIN_USERNAME)
                .role("ADMIN")
                .message("Login successful")
                .build();
        }

        throw new IllegalArgumentException("Invalid username or password");
    }
}

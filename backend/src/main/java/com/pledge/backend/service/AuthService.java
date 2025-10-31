package com.pledge.backend.service;

import com.pledge.backend.dto.request.LoginRequest;
import com.pledge.backend.dto.response.AuthResponse;
import com.pledge.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final String ADMIN_USERNAME = "Akash";
    private static final String ADMIN_PASSWORD = "Akash@123";

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse authenticate(LoginRequest request) {
        if (ADMIN_USERNAME.equals(request.getUsername()) &&
            ADMIN_PASSWORD.equals(request.getPassword())) {
            String token = jwtUtil.generateToken(ADMIN_USERNAME);
            return AuthResponse.builder()
                .token(token)
                .username(ADMIN_USERNAME)
                .role("ADMIN")
                .message("Login successful")
                .build();
        }
        throw new IllegalArgumentException("Invalid username or password");
    }
}

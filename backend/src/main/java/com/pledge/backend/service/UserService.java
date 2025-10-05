package com.pledge.backend.service;

import com.pledge.backend.dto.request.UserRequest;
import com.pledge.backend.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    UserResponse createUser(UserRequest request);
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
    List<UserResponse> getAllUsers();
    UserResponse updateUser(Long id, UserRequest request);
    void deleteUser(Long id);
}
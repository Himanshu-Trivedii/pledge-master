package com.pledge.backend.service;

import com.pledge.backend.dto.UserDto;
import java.util.List;

public interface UserService {
    UserDto createUser(UserDto userDto);
    UserDto getUserById(Long id);
    UserDto getUserByEmail(String email);
    List<UserDto> getAllUsers();
    UserDto updateUser(Long id, UserDto userDto);
    void deleteUser(Long id);
    boolean existsByEmail(String email);
}

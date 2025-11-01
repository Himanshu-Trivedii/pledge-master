package com.pledge.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name too long")
    private String name;

    @Pattern(regexp = "^$|^\\d{10,15}$", message = "Invalid phone number")
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email too long")
    private String email;

    @Size(max = 500, message = "Address too long")
    private String address;
}

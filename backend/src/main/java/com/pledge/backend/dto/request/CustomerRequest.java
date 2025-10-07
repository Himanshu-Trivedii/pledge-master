package com.pledge.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name too long")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10,15}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email too long")
    private String email;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address too long")
    private String address;

    @NotBlank(message = "ID proof type is required")
    private String idProofType;

    @NotBlank(message = "ID proof number is required")
    @Size(max = 50, message = "ID proof number too long")
    private String idProofNumber;
}

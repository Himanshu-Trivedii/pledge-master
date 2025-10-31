package com.pledge.backend.controller;

import com.pledge.backend.dto.request.CustomerRequest;
import com.pledge.backend.dto.response.ApiResponse;
import com.pledge.backend.entity.CustomerEntity;
import com.pledge.backend.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerEntity>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        try {
            CustomerEntity customer = customerService.createCustomer(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Customer created successfully", customer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerEntity>> getCustomerById(@PathVariable Long id) {
        try {
            CustomerEntity customer = customerService.getCustomerById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Customer retrieved successfully", customer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerEntity>>> getAllCustomers() {
        List<CustomerEntity> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Customers retrieved successfully", customers));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerEntity>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        try {
            CustomerEntity customer = customerService.updateCustomer(id, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Customer updated successfully", customer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Customer deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(@PathVariable String email) {
        boolean exists = customerService.existsByEmail(email);
        return ResponseEntity.ok(new ApiResponse<>(true,
            exists ? "Email already exists" : "Email is available",
            exists));
    }

    @GetMapping("/check-phone/{phone}")
    public ResponseEntity<ApiResponse<Boolean>> checkPhoneExists(@PathVariable String phone) {
        boolean exists = customerService.existsByPhone(phone);
        return ResponseEntity.ok(new ApiResponse<>(true,
            exists ? "Phone number already exists" : "Phone number is available",
            exists));
    }
}

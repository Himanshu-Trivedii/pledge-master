package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.request.CustomerRequest;
import com.pledge.backend.entity.CustomerEntity;
import com.pledge.backend.exception.ResourceNotFoundException;
import com.pledge.backend.repository.CustomerRepository;
import com.pledge.backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public CustomerEntity createCustomer(CustomerRequest request) {
        log.info("Creating new customer with email: {}", request.getEmail());

        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone number already exists");
        }

        CustomerEntity customer = CustomerEntity.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .idProofType(request.getIdProofType())
                .idProofNumber(request.getIdProofNumber())
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();

        CustomerEntity savedCustomer = customerRepository.save(customer);
        log.info("Customer created successfully with ID: {}", savedCustomer.getId());

        return savedCustomer;
    }

    @Override
    public CustomerEntity getCustomerById(Long id) {
        log.info("Fetching customer with ID: {}", id);
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    @Override
    public List<CustomerEntity> getAllCustomers() {
        log.info("Fetching all customers");
        return customerRepository.findAll();
    }

    @Override
    public CustomerEntity updateCustomer(Long id, CustomerRequest request) {
        log.info("Updating customer with ID: {}", id);

        CustomerEntity existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Check if email is being changed and if it's already taken
        if (!existingCustomer.getEmail().equals(request.getEmail())
                && customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Check if phone is being changed and if it's already taken
        if (!existingCustomer.getPhone().equals(request.getPhone())
                && customerRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone number already exists");
        }

        existingCustomer.setName(request.getName());
        existingCustomer.setEmail(request.getEmail());
        existingCustomer.setPhone(request.getPhone());
        existingCustomer.setAddress(request.getAddress());
        existingCustomer.setIdProofType(request.getIdProofType());
        existingCustomer.setIdProofNumber(request.getIdProofNumber());

        CustomerEntity updatedCustomer = customerRepository.save(existingCustomer);
        log.info("Customer updated successfully");

        return updatedCustomer;
    }

    @Override
    public void deleteCustomer(Long id) {
        log.info("Deleting customer with ID: {}", id);

        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found");
        }

        customerRepository.deleteById(id);
        log.info("Customer deleted successfully");
    }

    @Override
    public boolean existsByEmail(String email) {
        return customerRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return customerRepository.existsByPhone(phone);
    }
}

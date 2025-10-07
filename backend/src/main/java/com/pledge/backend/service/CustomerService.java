package com.pledge.backend.service;

import com.pledge.backend.dto.request.CustomerRequest;
import com.pledge.backend.entity.CustomerEntity;
import java.util.List;

public interface CustomerService {
    CustomerEntity createCustomer(CustomerRequest request);
    CustomerEntity getCustomerById(Long id);
    List<CustomerEntity> getAllCustomers();
    CustomerEntity updateCustomer(Long id, CustomerRequest request);
    void deleteCustomer(Long id);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}

package com.pledge.backend.service;

import com.pledge.backend.dto.request.PaymentCreateRequest;
import com.pledge.backend.dto.response.PaymentResponse;
import java.util.List;

public interface PaymentService {
    PaymentResponse createPayment(PaymentCreateRequest request);
    List<PaymentResponse> getPaymentsByPledgeId(Long pledgeId);
    Double getTotalPaymentsByPledgeId(Long pledgeId);
    PaymentResponse getPaymentById(Long id);
    void deletePayment(Long id);
}

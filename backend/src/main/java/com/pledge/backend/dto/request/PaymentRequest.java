package com.pledge.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PaymentRequest {
    @NotNull(message = "Payment amount is required")
    @Min(value = 0, message = "Payment amount must be non-negative")
    private Double amount;

    public PaymentRequest() {}

    public PaymentRequest(Double amount) {
        this.amount = amount;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}


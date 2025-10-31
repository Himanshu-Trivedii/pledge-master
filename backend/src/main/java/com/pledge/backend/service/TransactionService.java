package com.pledge.backend.service;

import com.pledge.backend.dto.request.TransactionRequest;
import com.pledge.backend.dto.response.TransactionResponse;
import java.util.List;

public interface TransactionService {
    TransactionResponse createTransaction(TransactionRequest request);
    TransactionResponse getTransactionById(Long id);
    List<TransactionResponse> getAllTransactionsByPledgeId(Long pledgeId);
    List<TransactionResponse> getAllTransactionsByUserId(Long userId);
    TransactionResponse updateTransactionStatus(Long id, String status);
    void deleteTransaction(Long id);
}

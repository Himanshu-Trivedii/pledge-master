package com.pledge.backend.service;

import com.pledge.backend.dto.request.TransactionRequest;
import com.pledge.backend.dto.response.TransactionResponse;
import java.util.List;

public interface TransactionService {
    TransactionResponse createTransaction(TransactionRequest request);
    TransactionResponse getTransactionById(Long id);
    List<TransactionResponse> getAllTransactions();
    List<TransactionResponse> getTransactionsByPledgeId(Long pledgeId);
    TransactionResponse updateTransaction(Long id, TransactionRequest request);
    void deleteTransaction(Long id);
}
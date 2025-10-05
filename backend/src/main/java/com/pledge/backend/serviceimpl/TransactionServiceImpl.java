package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.request.TransactionRequest;
import com.pledge.backend.dto.response.TransactionResponse;
import com.pledge.backend.entity.TransactionEntity;
import com.pledge.backend.entity.PledgeEntity;
import com.pledge.backend.repository.TransactionRepository;
import com.pledge.backend.repository.PledgeRepository;
import com.pledge.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final PledgeRepository pledgeRepository;

    @Override
    public TransactionResponse createTransaction(TransactionRequest request) {
        log.info("Creating new transaction for pledge ID: {}", request.getPledgeId());
        
        PledgeEntity pledge = pledgeRepository.findById(request.getPledgeId())
                .orElseThrow(() -> {
                    log.error("Pledge not found with ID: {}", request.getPledgeId());
                    return new RuntimeException("Pledge not found");
                });
                
        TransactionEntity transaction = mapToEntity(request);
        transaction.setPledge(pledge);
        transaction.setDate(LocalDateTime.now());
        transaction.setStatus("COMPLETED");
        
        TransactionEntity savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction created successfully with ID: {}", savedTransaction.getId());
        
        return mapToResponse(savedTransaction, "Transaction created successfully");
    }

    @Override
    public TransactionResponse getTransactionById(Long id) {
        log.info("Fetching transaction with ID: {}", id);
        
        TransactionEntity transaction = transactionRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Transaction not found with ID: {}", id);
                    return new RuntimeException("Transaction not found");
                });
                
        log.info("Transaction found for pledge: {}", transaction.getPledge().getTitle());
        return mapToResponse(transaction, "Transaction retrieved successfully");
    }

    @Override
    public List<TransactionResponse> getAllTransactions() {
        log.info("Fetching all transactions");
        List<TransactionEntity> transactions = transactionRepository.findAll();
        log.info("Found {} transactions", transactions.size());
        
        return transactions.stream()
                .map(transaction -> mapToResponse(transaction, "Transaction retrieved successfully"))
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponse> getTransactionsByPledgeId(Long pledgeId) {
        log.info("Fetching transactions for pledge ID: {}", pledgeId);
        
        List<TransactionEntity> transactions = transactionRepository.findByPledgeId(pledgeId);
        log.info("Found {} transactions for pledge", transactions.size());
        
        return transactions.stream()
                .map(transaction -> mapToResponse(transaction, "Transaction retrieved successfully"))
                .collect(Collectors.toList());
    }

    @Override
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        log.info("Updating transaction with ID: {}", id);
        
        TransactionEntity existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Transaction not found with ID: {}", id);
                    return new RuntimeException("Transaction not found");
                });
        
        existingTransaction.setAmount(request.getAmount());
        existingTransaction.setPaymentMethod(request.getPaymentMethod());
        
        TransactionEntity updatedTransaction = transactionRepository.save(existingTransaction);
        log.info("Transaction updated successfully");
        
        return mapToResponse(updatedTransaction, "Transaction updated successfully");
    }

    @Override
    public void deleteTransaction(Long id) {
        log.info("Deleting transaction with ID: {}", id);
        
        if (!transactionRepository.existsById(id)) {
            log.error("Transaction not found with ID: {}", id);
            throw new RuntimeException("Transaction not found");
        }
        
        transactionRepository.deleteById(id);
        log.info("Transaction deleted successfully");
    }

    private TransactionEntity mapToEntity(TransactionRequest request) {
        return TransactionEntity.builder()
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .build();
    }

    private TransactionResponse mapToResponse(TransactionEntity transaction, String message) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .date(transaction.getDate())
                .status(transaction.getStatus())
                .paymentMethod(transaction.getPaymentMethod())
                .pledgeId(transaction.getPledge().getId())
                .pledgeTitle(transaction.getPledge().getTitle())
                .userId(transaction.getPledge().getUser().getId())
                .username(transaction.getPledge().getUser().getUsername())
                .status("SUCCESS")
                .message(message)
                .build();
    }
}
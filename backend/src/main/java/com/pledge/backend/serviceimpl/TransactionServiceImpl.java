package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.request.TransactionRequest;
import com.pledge.backend.dto.response.TransactionResponse;
import com.pledge.backend.entity.PledgeEntity;
import com.pledge.backend.entity.TransactionEntity;
import com.pledge.backend.repository.PledgeRepository;
import com.pledge.backend.repository.TransactionRepository;
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

        // Validate pledge exists
        PledgeEntity pledge = pledgeRepository.findById(request.getPledgeId())
                .orElseThrow(() -> new RuntimeException("Pledge not found"));

        // Validate amount
        if (request.getAmount() <= 0) {
            throw new RuntimeException("Transaction amount must be greater than zero");
        }

        // Validate transaction type
        if (request.getType() == null || (!request.getType().equals("PAYMENT") && !request.getType().equals("INTEREST"))) {
            throw new RuntimeException("Invalid transaction type");
        }

        TransactionEntity transaction = TransactionEntity.builder()
                .pledgeId(request.getPledgeId())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .type(request.getType())
                .status("PENDING")
                .transactionDate(LocalDateTime.now())
                .description(request.getDescription())
                .build();

        if (!transaction.isValidAmount() || !transaction.isValidType() || !transaction.isValidStatus()) {
            throw new RuntimeException("Invalid transaction data");
        }

        TransactionEntity savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction created successfully with ID: {}", savedTransaction.getId());

        return mapToResponse(savedTransaction, pledge, "Transaction created successfully");
    }

    @Override
    public TransactionResponse getTransactionById(Long id) {
        log.info("Fetching transaction with ID: {}", id);

        TransactionEntity transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        PledgeEntity pledge = pledgeRepository.findById(transaction.getPledgeId())
                .orElseThrow(() -> new RuntimeException("Associated pledge not found"));

        return mapToResponse(transaction, pledge, "Transaction retrieved successfully");
    }

    @Override
    public List<TransactionResponse> getAllTransactionsByPledgeId(Long pledgeId) {
        log.info("Fetching all transactions for pledge ID: {}", pledgeId);

        PledgeEntity pledge = pledgeRepository.findById(pledgeId)
                .orElseThrow(() -> new RuntimeException("Pledge not found"));

        List<TransactionEntity> transactions = transactionRepository.findByPledgeId(pledgeId);

        return transactions.stream()
                .map(transaction -> mapToResponse(transaction, pledge, "Transaction retrieved successfully"))
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponse> getAllTransactionsByUserId(Long userId) {
        log.info("Fetching all transactions for user ID: {}", userId);

        List<TransactionEntity> transactions = transactionRepository.findAll().stream()
                .filter(t -> t.getUserId().equals(userId))
                .collect(Collectors.toList());

        return transactions.stream()
                .map(transaction -> {
                    PledgeEntity pledge = pledgeRepository.findById(transaction.getPledgeId())
                            .orElseThrow(() -> new RuntimeException("Associated pledge not found"));
                    return mapToResponse(transaction, pledge, "Transaction retrieved successfully");
                })
                .collect(Collectors.toList());
    }

    @Override
    public TransactionResponse updateTransactionStatus(Long id, String status) {
        log.info("Updating transaction status for ID: {}", id);

        TransactionEntity transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!status.equals("COMPLETED") && !status.equals("FAILED")) {
            throw new RuntimeException("Invalid transaction status");
        }

        transaction.setStatus(status);
        TransactionEntity updatedTransaction = transactionRepository.save(transaction);

        PledgeEntity pledge = pledgeRepository.findById(transaction.getPledgeId())
                .orElseThrow(() -> new RuntimeException("Associated pledge not found"));

        return mapToResponse(updatedTransaction, pledge, "Transaction status updated successfully");
    }

    @Override
    public void deleteTransaction(Long id) {
        log.info("Deleting transaction with ID: {}", id);

        if (!transactionRepository.existsById(id)) {
            throw new RuntimeException("Transaction not found");
        }

        transactionRepository.deleteById(id);
        log.info("Transaction deleted successfully");
    }

    private TransactionResponse mapToResponse(TransactionEntity transaction, PledgeEntity pledge, String message) {
        Double totalInterestToDate = pledge.calculateTotalInterestToDate();
        Double remainingBalance = pledge.getAmount() + totalInterestToDate;

        // Subtract completed payments from remaining balance
        List<TransactionEntity> completedPayments = transactionRepository.findByPledgeId(pledge.getId())
                .stream()
                .filter(t -> t.getStatus().equals("COMPLETED") && t.getType().equals("PAYMENT"))
                .collect(Collectors.toList());

        Double totalPaid = completedPayments.stream()
                .mapToDouble(TransactionEntity::getAmount)
                .sum();

        remainingBalance -= totalPaid;

        return TransactionResponse.builder()
                .id(transaction.getId())
                .pledgeId(transaction.getPledgeId())
                .userId(transaction.getUserId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .transactionDate(transaction.getTransactionDate())
                .description(transaction.getDescription())
                .message(message)
                .pledgeAmount(pledge.getAmount())
                .currentInterestRate(pledge.getInterestRate())
                .totalInterestToDate(totalInterestToDate)
                .remainingBalance(remainingBalance)
                .build();
    }
}

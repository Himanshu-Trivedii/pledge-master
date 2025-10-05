package com.pledge.backend.serviceimpl;

import com.pledge.backend.dto.request.PledgeRequest;
import com.pledge.backend.dto.response.PledgeResponse;
import com.pledge.backend.entity.PledgeEntity;
import com.pledge.backend.entity.UserEntity;
import com.pledge.backend.repository.PledgeRepository;
import com.pledge.backend.repository.UserRepository;
import com.pledge.backend.service.PledgeService;
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
public class PledgeServiceImpl implements PledgeService {
    
    private final PledgeRepository pledgeRepository;
    private final UserRepository userRepository;

    @Override
    public PledgeResponse createPledge(PledgeRequest request) {
        log.info("Creating new pledge with title: {}", request.getTitle());
        
        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", request.getUserId());
                    return new RuntimeException("User not found");
                });
                
        PledgeEntity pledge = mapToEntity(request);
        pledge.setUser(user);
        pledge.setCreatedAt(LocalDateTime.now());
        pledge.setStatus("ACTIVE");
        
        PledgeEntity savedPledge = pledgeRepository.save(pledge);
        log.info("Pledge created successfully with ID: {}", savedPledge.getId());
        
        return mapToResponse(savedPledge, "Pledge created successfully");
    }

    @Override
    public PledgeResponse getPledgeById(Long id) {
        log.info("Fetching pledge with ID: {}", id);
        
        PledgeEntity pledge = pledgeRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Pledge not found with ID: {}", id);
                    return new RuntimeException("Pledge not found");
                });
                
        log.info("Pledge found: {}", pledge.getTitle());
        return mapToResponse(pledge, "Pledge retrieved successfully");
    }

    @Override
    public List<PledgeResponse> getAllPledges() {
        log.info("Fetching all pledges");
        List<PledgeEntity> pledges = pledgeRepository.findAll();
        log.info("Found {} pledges", pledges.size());
        
        return pledges.stream()
                .map(pledge -> mapToResponse(pledge, "Pledge retrieved successfully"))
                .collect(Collectors.toList());
    }

    @Override
    public List<PledgeResponse> getPledgesByUserId(Long userId) {
        log.info("Fetching pledges for user ID: {}", userId);
        
        List<PledgeEntity> pledges = pledgeRepository.findByUserId(userId);
        log.info("Found {} pledges for user", pledges.size());
        
        return pledges.stream()
                .map(pledge -> mapToResponse(pledge, "Pledge retrieved successfully"))
                .collect(Collectors.toList());
    }

    @Override
    public PledgeResponse updatePledge(Long id, PledgeRequest request) {
        log.info("Updating pledge with ID: {}", id);
        
        PledgeEntity existingPledge = pledgeRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Pledge not found with ID: {}", id);
                    return new RuntimeException("Pledge not found");
                });
        
        existingPledge.setTitle(request.getTitle());
        existingPledge.setDescription(request.getDescription());
        existingPledge.setDeadline(request.getDeadline());
        existingPledge.setAmount(request.getAmount());
        
        PledgeEntity updatedPledge = pledgeRepository.save(existingPledge);
        log.info("Pledge updated successfully: {}", updatedPledge.getTitle());
        
        return mapToResponse(updatedPledge, "Pledge updated successfully");
    }

    @Override
    public void deletePledge(Long id) {
        log.info("Deleting pledge with ID: {}", id);
        
        if (!pledgeRepository.existsById(id)) {
            log.error("Pledge not found with ID: {}", id);
            throw new RuntimeException("Pledge not found");
        }
        
        pledgeRepository.deleteById(id);
        log.info("Pledge deleted successfully");
    }

    private PledgeEntity mapToEntity(PledgeRequest request) {
        return PledgeEntity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .amount(request.getAmount())
                .build();
    }

    private PledgeResponse mapToResponse(PledgeEntity pledge, String message) {
        Double collectedAmount = pledge.getTransactions() != null ?
                pledge.getTransactions().stream()
                        .mapToDouble(transaction -> transaction.getAmount())
                        .sum() : 0.0;

        return PledgeResponse.builder()
                .id(pledge.getId())
                .title(pledge.getTitle())
                .description(pledge.getDescription())
                .createdAt(pledge.getCreatedAt())
                .deadline(pledge.getDeadline())
                .status(pledge.getStatus())
                .amount(pledge.getAmount())
                .collectedAmount(collectedAmount)
                .userId(pledge.getUser().getId())
                .username(pledge.getUser().getUsername())
                .status("SUCCESS")
                .message(message)
                .build();
    }
}
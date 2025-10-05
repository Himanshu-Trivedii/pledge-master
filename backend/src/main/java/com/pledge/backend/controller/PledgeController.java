package com.pledge.backend.controller;

import com.pledge.backend.dto.PledgeDto;
import com.pledge.backend.service.PledgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pledges")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PledgeController {
    
    private final PledgeService pledgeService;

    @PostMapping
    public ResponseEntity<PledgeDto> createPledge(@RequestBody PledgeDto pledgeDto) {
        return ResponseEntity.ok(pledgeService.createPledge(pledgeDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PledgeDto> getPledgeById(@PathVariable Long id) {
        return ResponseEntity.ok(pledgeService.getPledgeById(id));
    }

    @GetMapping
    public ResponseEntity<List<PledgeDto>> getAllPledges() {
        return ResponseEntity.ok(pledgeService.getAllPledges());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PledgeDto>> getPledgesByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(pledgeService.getPledgesByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PledgeDto> updatePledge(@PathVariable Long id, @RequestBody PledgeDto pledgeDto) {
        return ResponseEntity.ok(pledgeService.updatePledge(id, pledgeDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePledge(@PathVariable Long id) {
        pledgeService.deletePledge(id);
        return ResponseEntity.ok().build();
    }
}
package com.finances.api.controller;

import com.finances.api.dto.TransactionDTO;
import com.finances.api.mapper.TransactionMapper;
import com.finances.api.model.Transaction;
import com.finances.api.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For development, will be refined in security config
public class TransactionController {

    private final TransactionService service;
    private final TransactionMapper mapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDTO create(@RequestBody @Valid TransactionDTO dto) {
        Transaction transaction = mapper.toEntity(dto);
        Transaction saved = service.save(transaction);
        return mapper.toDTO(saved);
    }

    @GetMapping
    public List<TransactionDTO> list(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        List<Transaction> transactions;
        if (month != null && year != null) {
            transactions = service.findByMonth(month, year);
        } else {
            transactions = service.findAll();
        }
        
        return transactions.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

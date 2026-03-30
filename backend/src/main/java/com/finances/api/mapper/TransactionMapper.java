package com.finances.api.mapper;

import com.finances.api.dto.TransactionDTO;
import com.finances.api.model.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public Transaction toEntity(TransactionDTO dto) {
        if (dto == null) return null;
        
        return Transaction.builder()
                .id(dto.getId())
                .description(dto.getDescription())
                .observation(dto.getObservation())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .type(dto.getType())
                .paymentType(dto.getPaymentType())
                .category(dto.getCategory())
                .currentInstallment(dto.getCurrentInstallment())
                .totalInstallments(dto.getTotalInstallments())
                .parentId(dto.getParentId())
                .build();
    }

    public TransactionDTO toDTO(Transaction entity) {
        if (entity == null) return null;

        return TransactionDTO.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .observation(entity.getObservation())
                .amount(entity.getAmount())
                .date(entity.getDate())
                .type(entity.getType())
                .paymentType(entity.getPaymentType())
                .category(entity.getCategory())
                .currentInstallment(entity.getCurrentInstallment())
                .totalInstallments(entity.getTotalInstallments())
                .parentId(entity.getParentId())
                .build();
    }
}

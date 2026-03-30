package com.finances.api.mapper;

import com.finances.api.dto.TransactionDTO;
import com.finances.api.dto.TransactionMetadataDTO;
import com.finances.api.model.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public Transaction toEntity(TransactionDTO dto) {
        if (dto == null) return null;
        
        Transaction.TransactionBuilder builder = Transaction.builder()
                .id(dto.getId())
                .description(dto.getDescription())
                .observation(dto.getObservation())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .type(dto.getType())
                .paymentType(dto.getPaymentType())
                .category(dto.getCategory());

        if (dto.getMetadata() != null) {
            builder.currentInstallment(dto.getMetadata().getCurrentInstallment())
                   .totalInstallments(dto.getMetadata().getTotalInstallments())
                   .parentId(dto.getMetadata().getParentId());
        }

        return builder.build();
    }

    public TransactionDTO toDTO(Transaction entity) {
        if (entity == null) return null;

        TransactionMetadataDTO metadata = null;
        if (entity.getCurrentInstallment() != null || entity.getTotalInstallments() != null || entity.getParentId() != null) {
            metadata = TransactionMetadataDTO.builder()
                    .currentInstallment(entity.getCurrentInstallment())
                    .totalInstallments(entity.getTotalInstallments())
                    .parentId(entity.getParentId())
                    .build();
        }

        return TransactionDTO.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .observation(entity.getObservation())
                .amount(entity.getAmount())
                .date(entity.getDate())
                .type(entity.getType())
                .paymentType(entity.getPaymentType())
                .category(entity.getCategory())
                .metadata(metadata)
                .build();
    }
}

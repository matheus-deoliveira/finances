package com.finances.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionMetadataDTO {
    private Integer currentInstallment;
    private Integer totalInstallments;
    private UUID parentId;
}

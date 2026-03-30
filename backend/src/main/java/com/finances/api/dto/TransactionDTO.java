package com.finances.api.dto;

import com.finances.api.model.Category;
import com.finances.api.model.PaymentType;
import com.finances.api.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {

    private UUID id;

    @NotBlank(message = "Description is required")
    private String description;

    private String observation;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Long amount;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    @NotNull(message = "Category is required")
    private Category category;

    // Metadata
    private Integer currentInstallment;
    private Integer totalInstallments;
    private UUID parentId;
}

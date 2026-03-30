package com.finances.api.service;

import com.finances.api.model.PaymentType;
import com.finances.api.model.Transaction;
import com.finances.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository repository;

    @Transactional
    public Transaction save(Transaction transaction) {
        return repository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Transaction> findByMonth(int month, int year) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        
        List<Transaction> allTransactions = repository.findAll();
        List<Transaction> monthlyTransactions = new ArrayList<>();

        for (Transaction t : allTransactions) {
            LocalDate tDate = t.getDate();
            
            // 1. SPOT (À vista)
            if (t.getPaymentType() == PaymentType.SPOT) {
                if (tDate.getMonthValue() == month && tDate.getYear() == year) {
                    monthlyTransactions.add(t);
                }
            }
            
            // 2. RECURRING
            else if (t.getPaymentType() == PaymentType.RECURRING) {
                if (!tDate.isAfter(startOfMonth.plusMonths(1).minusDays(1))) {
                    monthlyTransactions.add(t);
                }
            }
            
            // 3. INSTALLMENT / INSTALLMENT_PIX
            else if (t.getPaymentType() == PaymentType.INSTALLMENT || t.getPaymentType() == PaymentType.INSTALLMENT_PIX) {
                long monthsDiff = ChronoUnit.MONTHS.between(
                    tDate.withDayOfMonth(1), 
                    startOfMonth
                );
                
                int totalInstallments = t.getTotalInstallments() != null ? t.getTotalInstallments() : 1;
                
                if (monthsDiff >= 0 && monthsDiff < totalInstallments) {
                    Transaction installment = cloneTransaction(t);
                    installment.setAmount(t.getAmount() / totalInstallments);
                    installment.setCurrentInstallment((int) monthsDiff + 1);
                    monthlyTransactions.add(installment);
                }
            }
        }

        return monthlyTransactions;
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    private Transaction cloneTransaction(Transaction t) {
        return Transaction.builder()
                .id(t.getId())
                .description(t.getDescription())
                .observation(t.getObservation())
                .amount(t.getAmount())
                .date(t.getDate())
                .type(t.getType())
                .paymentType(t.getPaymentType())
                .category(t.getCategory())
                .totalInstallments(t.getTotalInstallments())
                .parentId(t.getParentId())
                .build();
    }
}

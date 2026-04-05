package com.finances.api.service;

import com.finances.api.model.PaymentType;
import com.finances.api.model.Transaction;
import com.finances.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository repository;

    @Transactional
    public Transaction saveNew(Transaction transaction) {
        // When creating a new recurring transaction, initialize its recurrence ID.
        if (transaction.getPaymentType() == PaymentType.RECURRING && transaction.getRecurrenceId() == null) {
            transaction.setRecurrenceId(UUID.randomUUID());
        }
        return repository.save(transaction);
    }

    @Transactional
    public Transaction updateRecurring(UUID id, Transaction transactionData) {
        Transaction originalRecurring = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring transaction not found"));

        LocalDate changeDate = transactionData.getDate();
        UUID recurrenceId = originalRecurring.getRecurrenceId();

        // 1. Materialize past occurrences (all months before the change month)
        YearMonth start = YearMonth.from(originalRecurring.getDate());
        YearMonth changeMonth = YearMonth.from(changeDate);

        while (start.isBefore(changeMonth)) {
            Transaction materialized = Transaction.builder()
                    .description(originalRecurring.getDescription())
                    .observation(originalRecurring.getObservation())
                    .amount(originalRecurring.getAmount())
                    .date(originalRecurring.getDate().withYear(start.getYear()).withMonth(start.getMonthValue()))
                    .type(originalRecurring.getType())
                    .paymentType(PaymentType.SPOT) // Past occurrences become SPOT
                    .category(originalRecurring.getCategory())
                    .recurrenceId(recurrenceId) // Link to the series
                    .build();
            repository.save(materialized);
            start = start.plusMonths(1);
        }

        // 2. End the old recurring rule at the last day of the PREVIOUS month
        // This ensures the old rule doesn't generate any "virtual" instances in the current month
        originalRecurring.setEndDate(changeMonth.atDay(1).minusDays(1));
        repository.save(originalRecurring);

        // 3. Create the new recurring rule starting from the change date
        Transaction newRecurring = Transaction.builder()
                .description(transactionData.getDescription())
                .observation(transactionData.getObservation())
                .amount(transactionData.getAmount())
                .date(changeDate)
                .type(transactionData.getType())
                .paymentType(PaymentType.RECURRING)
                .category(transactionData.getCategory())
                .recurrenceId(recurrenceId) // Link to the same series
                .build();
        
        return repository.save(newRecurring);
    }

    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Transaction> findByMonth(int month, int year) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        List<Transaction> allTransactions = repository.findCandidateTransactionsForMonth(startOfMonth, endOfMonth);
        List<Transaction> monthlyTransactions = new ArrayList<>();

        // 1. Add all non-recurring and materialized recurring transactions for the month.
        for (Transaction t : allTransactions) {
            if (t.getPaymentType() == PaymentType.SPOT) {
                if (t.getDate().getMonthValue() == month && t.getDate().getYear() == year) {
                    monthlyTransactions.add(t);
                }
            } else if (t.getPaymentType() == PaymentType.INSTALLMENT || t.getPaymentType() == PaymentType.INSTALLMENT_PIX) {
                long monthsDiff = ChronoUnit.MONTHS.between(t.getDate().withDayOfMonth(1), startOfMonth);
                int totalInstallments = t.getTotalInstallments() != null ? t.getTotalInstallments() : 1;
                if (monthsDiff >= 0 && monthsDiff < totalInstallments) {
                    Transaction installment = cloneTransaction(t);
                    installment.setAmount(t.getAmount() / totalInstallments);
                    installment.setCurrentInstallment((int) monthsDiff + 1);
                    monthlyTransactions.add(installment);
                }
            }
        }

        // 2. Create a lookup set of recurring series that already have a materialized transaction this month.
        Set<UUID> materializedSeries = monthlyTransactions.stream()
                .filter(t -> t.getRecurrenceId() != null)
                .map(Transaction::getRecurrenceId)
                .collect(Collectors.toSet());

        // 3. Project virtual instances for recurring rules that have NOT been materialized this month.
        for (Transaction t : allTransactions) {
            if (t.getPaymentType() == PaymentType.RECURRING) {
                // If this series is already represented by a materialized SPOT transaction, skip.
                if (materializedSeries.contains(t.getRecurrenceId())) {
                    continue;
                }

                LocalDate occurrenceDate = t.getDate().withYear(year).withMonth(month);
                boolean hasStarted = !t.getDate().isAfter(occurrenceDate);
                boolean hasNotEnded = (t.getEndDate() == null || !occurrenceDate.isAfter(t.getEndDate()));

                if (hasStarted && hasNotEnded) {
                    Transaction virtualInstance = cloneTransaction(t);
                    virtualInstance.setDate(occurrenceDate);
                    monthlyTransactions.add(virtualInstance);
                }
            }
        }

        // 4. Sort the list by date
        monthlyTransactions.sort((t1, t2) -> t1.getDate().compareTo(t2.getDate()));

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
                .recurrenceId(t.getRecurrenceId())
                .endDate(t.getEndDate())
                .build();
    }
}

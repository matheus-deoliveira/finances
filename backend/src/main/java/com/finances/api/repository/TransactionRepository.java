package com.finances.api.repository;

import com.finances.api.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("SELECT t FROM Transaction t WHERE " +
           // 1. SPOT transactions within the month
           "(t.paymentType = 'SPOT' AND t.date BETWEEN :startDate AND :endDate) OR " +
           // 2. INSTALLMENT transactions that started on or before the end of the month
           "(t.paymentType IN ('INSTALLMENT', 'INSTALLMENT_PIX') AND t.date <= :endDate) OR " +
           // 3. RECURRING rules that are potentially active in the month
           "(t.paymentType = 'RECURRING' AND t.date <= :endDate AND (t.endDate IS NULL OR t.endDate >= :startDate))")
    List<Transaction> findCandidateTransactionsForMonth(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

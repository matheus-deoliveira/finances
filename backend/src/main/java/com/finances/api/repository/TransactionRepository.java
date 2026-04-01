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
           "(t.date <= :endDate AND (t.endDate IS NULL OR t.endDate >= :startDate))")
    List<Transaction> findCandidateTransactionsForMonth(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

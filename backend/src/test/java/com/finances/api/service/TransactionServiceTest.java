package com.finances.api.service;

import com.finances.api.model.Category;
import com.finances.api.model.PaymentType;
import com.finances.api.model.Transaction;
import com.finances.api.model.TransactionType;
import com.finances.api.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class TransactionServiceTest {

    @Mock
    private TransactionRepository repository;

    @InjectMocks
    private TransactionService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findByMonth_shouldVirtualizeInstallments() {
        // Given
        UUID id = UUID.randomUUID();
        Transaction t = Transaction.builder()
                .id(id)
                .description("Buy TV")
                .amount(1200L)
                .date(LocalDate.of(2026, 3, 15))
                .type(TransactionType.EXPENSE)
                .paymentType(PaymentType.INSTALLMENT)
                .category(Category.BILLS)
                .totalInstallments(3)
                .build();

        when(repository.findAll()).thenReturn(Arrays.asList(t));

        // When
        List<Transaction> march = service.findByMonth(3, 2026);
        List<Transaction> april = service.findByMonth(4, 2026);
        List<Transaction> may = service.findByMonth(5, 2026);
        List<Transaction> june = service.findByMonth(6, 2026);

        // Then
        assertEquals(1, march.size(), "March should have 1 installment");
        assertEquals(400L, march.get(0).getAmount(), "March amount should be 400");
        assertEquals(1, march.get(0).getCurrentInstallment(), "March current installment should be 1");

        assertEquals(1, april.size(), "April should have 1 installment");
        assertEquals(400L, april.get(0).getAmount(), "April amount should be 400");
        assertEquals(2, april.get(0).getCurrentInstallment(), "April current installment should be 2");

        assertEquals(1, may.size(), "May should have 1 installment");
        assertEquals(400L, may.get(0).getAmount(), "May amount should be 400");
        assertEquals(3, may.get(0).getCurrentInstallment(), "May current installment should be 3");

        assertEquals(0, june.size(), "June should have 0 installments");
    }

    @Test
    void findByMonth_shouldHandleRecurring() {
        // Given
        UUID id = UUID.randomUUID();
        Transaction t = Transaction.builder()
                .id(id)
                .description("Rent")
                .amount(1000L)
                .date(LocalDate.of(2026, 3, 1))
                .type(TransactionType.EXPENSE)
                .paymentType(PaymentType.RECURRING)
                .category(Category.BILLS)
                .build();

        when(repository.findAll()).thenReturn(Arrays.asList(t));

        // When
        List<Transaction> march = service.findByMonth(3, 2026);
        List<Transaction> april = service.findByMonth(4, 2026);
        List<Transaction> february = service.findByMonth(2, 2026);

        // Then
        assertEquals(1, march.size(), "March should include recurring");
        assertEquals(1, april.size(), "April should include recurring");
        assertEquals(0, february.size(), "February should not include recurring");
    }
}

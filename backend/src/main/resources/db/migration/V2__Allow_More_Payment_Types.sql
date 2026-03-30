-- A anotação @Enumerated(EnumType.STRING) do JPA/Hibernate cria uma restrição (CHECK constraint) no H2.
-- Esta migração relaxa essa restrição, alterando a coluna para um VARCHAR padrão.
-- Isso permite a adição de novos valores ao enum `PaymentType` em Java sem que o banco de dados H2 bloqueie a inserção,
-- tornando futuras extensões mais fáceis e seguras, sem a necessidade de novas migrações para cada novo tipo.

ALTER TABLE transactions ALTER COLUMN payment_type VARCHAR(255);

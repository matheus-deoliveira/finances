export type TransactionType = 'INCOME' | 'EXPENSE';

export enum PaymentTypeEnum {
  SPOT = 'SPOT',
  RECURRING = 'RECURRING',
  INSTALLMENT = 'INSTALLMENT',
  INSTALLMENT_PIX = 'INSTALLMENT_PIX',
}
export type PaymentType = `${PaymentTypeEnum}`;

// Categorias específicas para Despesas (conforme GEMINI.md)
export type ExpenseCategory = 'TITHE' | 'BILLS' | 'DEBTS' | 'INVESTMENTS' | 'STUDIES' | 'GOALS' | 'OTHER';

// Categorias específicas para Receitas
export type IncomeCategory = 'SALARY' | 'FREELANCE' | 'INVESTMENT_RETURN' | 'GIFT' | 'OTHER';

export type Category = ExpenseCategory | IncomeCategory;

export interface InstallmentMetadata {
  currentInstallment?: number;
  totalInstallments?: number;
  parentId?: string;
}

export interface Transaction {
  id: string;
  description: string;
  observation?: string; // Campo opcional para detalhes extras
  amount: number;
  date: string;
  type: TransactionType;
  paymentType: PaymentType;
  category: Category;
  metadata?: InstallmentMetadata;
  recurrenceId?: string;
  endDate?: string;
}

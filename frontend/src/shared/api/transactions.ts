import { apiClient } from './apiClient';
import type { Transaction } from '../../entities/transaction/types';

export const transactionService = {
  list: async (month?: number, year?: number) => {
    const params = (month !== undefined && year !== undefined) 
      ? { month: month + 1, year } // API expects 1-12, JS uses 0-11
      : {};
      
    const response = await apiClient.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  create: async (transaction: Omit<Transaction, 'id'>) => {
    const response = await apiClient.post<Transaction>('/transactions', transaction);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/transactions/${id}`);
  }
};

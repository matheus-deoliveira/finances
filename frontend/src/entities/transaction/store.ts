import { create } from 'zustand';

interface TransactionState {
  lastUpdate: number;
  triggerRefresh: () => void;
}

/**
 * Lightweight store for UI refresh triggers.
 * Primary data fetching is managed by TanStack Query.
 */
export const useTransactionStore = create<TransactionState>((set) => ({
  lastUpdate: Date.now(),
  triggerRefresh: () => set({ lastUpdate: Date.now() }),
}));

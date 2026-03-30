import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../shared/ui/Card';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { transactionService } from '../../shared/api/transactions';
import { formatCurrency, formatDate } from '../../shared/utils/format';
import { ArrowDownRight, ArrowUpRight, Calendar, Tag, AlertTriangle, Repeat, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionForm } from './TransactionForm';
import type { Transaction } from '../../entities/transaction/types';

interface TransactionListProps {
  transactions: Transaction[]; 
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setDeletingId(null);
    }
  });

  if (transactions.length === 0) {
    return null; 
  }

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <Card className="flex items-center justify-between p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  transaction.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {transaction.type === 'INCOME' ? <ArrowUpRight size={24} strokeWidth={2.5} /> : <ArrowDownRight size={24} strokeWidth={2.5} />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#0F0F0F] text-base leading-tight">
                      {transaction.description}
                    </h4>
                    {transaction.paymentType === 'RECURRING' && (
                      <Repeat size={14} className="text-blue-500" title="Recorrente" />
                    )}
                    {transaction.paymentType === 'INSTALLMENT' && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                        <Layers size={10} />
                        {transaction.metadata?.currentInstallment}/{transaction.metadata?.totalInstallments}
                      </div>
                    )}
                  </div>
                  {transaction.observation && (
                    <p className="text-xs text-gray-500 italic mt-0.5">{transaction.observation}</p>
                  )}
                  <div className="flex flex-col gap-1 text-xs text-gray-400 font-medium mt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} strokeWidth={2.5} /> {formatDate(transaction.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Tag size={12} strokeWidth={2.5} /> {t(`transaction.category.${transaction.category}`)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`font-extrabold text-lg ${
                  transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
                
                <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingTransaction(transaction)}
                    className="text-xs text-gray-400 hover:text-black font-bold"
                  >
                    {t('transaction.actions.edit')}
                  </button>
                  <span className="text-[10px] text-gray-200">|</span>
                  <button 
                    onClick={() => setDeletingId(transaction.id)}
                    className="text-xs text-gray-400 hover:text-red-500 font-bold"
                  >
                    {t('transaction.actions.delete')}
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Modal 
        isOpen={!!editingTransaction} 
        onClose={() => setEditingTransaction(null)} 
        title={t('transaction.actions.editTransaction')}
      >
        <TransactionForm 
          initialData={editingTransaction} 
          onSuccess={() => setEditingTransaction(null)} 
        />
      </Modal>

      <Modal 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title={t('transaction.actions.confirmDelete.title')}
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {t('transaction.actions.confirmDelete.text')}
          </p>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="secondary" onClick={() => setDeletingId(null)}>
              {t('transaction.actions.confirmDelete.cancel')}
            </Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white" 
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              {t('transaction.actions.confirmDelete.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

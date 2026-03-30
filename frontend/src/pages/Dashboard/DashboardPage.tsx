import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { transactionService } from '../../shared/api/transactions';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Modal } from '../../shared/ui/Modal';
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher';
import { formatCurrency } from '../../shared/utils/format';
import { cn } from '../../shared/utils/cn';
import { TransactionList } from '../../features/transactions/TransactionList';
import { TransactionForm } from '../../features/transactions/TransactionForm';
import { LayoutGrid, Plus, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Fetch real data via React Query
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', month, year],
    queryFn: () => transactionService.list(month, year),
  });

  // Mark as loaded when first response arrives
  useEffect(() => {
    if (!isLoading) {
      setHasLoadedInitially(true);
    }
  }, [isLoading]);

  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [transactions]);

  const formattedMonth = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(currentDate);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isTransitioningRef = useRef(false);

  // Handle Trackpad Two-Finger Swipe (Horizontal Wheel)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 60 && !isTransitioningRef.current) {
        if (e.deltaX > 0) {
          navigateMonth(1);
        } else {
          navigateMonth(-1);
        }
        
        isTransitioningRef.current = true;
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 1000);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentDate]); 

  return (
    <>
      <AnimatePresence>
        {!hasLoadedInitially && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-[#FAFAFA] flex flex-col items-center justify-center"
          >
            <div className="relative flex flex-col items-center text-center px-8">
              <Loader2 size={48} className="animate-spin text-black mb-6" strokeWidth={2} />
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-black mb-2">Finances</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Sincronizando Banco de Dados...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        key={formattedMonth} // Re-animate on month change
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="max-w-screen-md mx-auto p-4 md:p-8 pb-24 min-h-screen"
        onPanEnd={(_, info) => {
          const swipeThreshold = 50;
          if (info.offset.x > swipeThreshold) {
            navigateMonth(-1);
          } else if (info.offset.x < -swipeThreshold) {
            navigateMonth(1);
          }
        }}
      >
        <header className="mb-10 flex justify-between items-center">
          <div className="flex items-center gap-3 relative">
            <button onClick={() => navigateMonth(-1)} className="p-1 -ml-2 text-gray-300 hover:text-black transition-colors">
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
            
            <button 
              onClick={() => monthInputRef.current?.showPicker()}
              className="flex flex-col items-start group"
            >
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl text-[var(--color-primary)] capitalize font-extrabold tracking-tight">
                  {new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(currentDate)}
                </h1>
                <ChevronDown size={20} className="text-gray-300 group-hover:text-black transition-colors mt-1" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-0.5">
                {year}
              </span>
            </button>

            <button onClick={() => navigateMonth(1)} className="p-1 text-gray-300 hover:text-black transition-colors">
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>

            <input 
              type="month"
              ref={monthInputRef}
              className="absolute inset-0 opacity-0 pointer-events-none"
              value={`${year}-${String(month + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-');
                if (y && m) {
                  setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button onClick={() => setIsModalOpen(true)} className="hidden md:flex">
              <Plus size={18} className="mr-2" /> {t('dashboard.addButton')}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <Card className="min-h-[100px] flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-500 mb-1">{t('summary.income')}</p>
            <h3 className="text-xl md:text-2xl text-[var(--color-income)] font-bold truncate">
              {formatCurrency(summary.income)}
            </h3>
          </Card>
          <Card className="min-h-[100px] flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-500 mb-1">{t('summary.expenses')}</p>
            <h3 className="text-xl md:text-2xl text-[var(--color-expense)] font-bold truncate">
              {formatCurrency(summary.expenses)}
            </h3>
          </Card>
          <Card 
            className="col-span-2 bg-[#0F0F0F] text-white min-h-[100px] flex flex-col justify-center px-6"
          >
            <p className="text-sm font-semibold text-gray-400 mb-1">
              {t('summary.balance')}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold">
              {formatCurrency(summary.balance)}
            </h3>
          </Card>
        </div>

        <section>
          <h2 className="text-xl mb-6">{t('dashboard.recentTransactions')}</h2>
          
          {isLoading ? (
            <div className="flex flex-col items-center py-20 text-gray-300">
              <Loader2 size={32} className="animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 bg-transparent shadow-none">
              <div className="text-gray-300 mb-4">
                <LayoutGrid size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('dashboard.noTransactions.title')}</h3>
              <p className="text-gray-500 max-w-xs mb-6 text-sm">
                {t('dashboard.noTransactions.text')}
              </p>
              <Button onClick={() => setIsModalOpen(true)} variant="secondary">
                {t('dashboard.noTransactions.button')}
              </Button>
            </Card>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </section>

        {/* Floating Action Button for Mobile */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="md:hidden fixed bottom-6 right-6 h-14 w-14 bg-[#0F0F0F] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform z-50"
        >
          <Plus size={24} />
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('dashboard.addButton')}>
          <TransactionForm onSuccess={() => setIsModalOpen(false)} />
        </Modal>
      </motion.div>
    </>
  );
};

export default DashboardPage;

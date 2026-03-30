import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { transactionService } from '../../shared/api/transactions';
import { formatCurrencyInput, parseToCents } from '../../shared/utils/format';
import type { Transaction } from '../../entities/transaction/types';

const transactionSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters").max(50),
  observation: z.string().max(200).optional(),
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, "Category is required"),
  paymentType: z.enum(['SPOT', 'RECURRING', 'INSTALLMENT']),
  installmentCount: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
  initialData?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, initialData }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: any) => {
      // In a real API we might use PUT for update, 
      // but for this MVP create often handles ID if provided.
      return transactionService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (onSuccess) onSuccess();
    }
  });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, control } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type || 'EXPENSE',
      category: initialData?.category || 'BILLS',
      paymentType: initialData?.paymentType || 'SPOT',
      installmentCount: initialData?.metadata?.totalInstallments?.toString() || '3',
      date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
      amount: initialData?.amount ? formatCurrencyInput(initialData.amount.toString()) : 'R$ 0,00',
      description: initialData?.description || '',
      observation: initialData?.observation || ''
    }
  });

  const transactionType = watch('type');
  const paymentType = watch('paymentType');

  // Ajusta a categoria padrão quando o tipo muda (apenas se não estiver editando)
  useEffect(() => {
    if (!initialData) {
      if (transactionType === 'INCOME') {
        setValue('category', 'SALARY');
      } else {
        setValue('category', 'BILLS');
      }
    }
  }, [transactionType, setValue, initialData]);

  const onSubmit = (data: TransactionFormData) => {
    const amountInCents = parseToCents(data.amount);
    
    if (amountInCents <= 0) return;

    const payload = {
      id: initialData?.id, // Pass ID for updates
      description: data.description,
      observation: data.observation,
      amount: amountInCents,
      type: data.type,
      category: data.category as any,
      paymentType: data.paymentType,
      date: new Date(data.date).toISOString(),
      metadata: data.paymentType === 'INSTALLMENT' ? {
        totalInstallments: Number(data.installmentCount) || 1
      } : undefined
    };

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50 transition-colors">
          <input type="radio" value="EXPENSE" {...register('type')} className="sr-only" />
          <span className="font-bold text-sm text-gray-700">{t('transaction.type.expense')}</span>
        </label>
        <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-colors">
          <input type="radio" value="INCOME" {...register('type')} className="sr-only" />
          <span className="font-bold text-sm text-gray-700">{t('transaction.type.income')}</span>
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <Input 
          label={t('transaction.fields.description')} 
          placeholder={t('transaction.fields.description')}
          {...register('description')}
          error={errors.description?.message}
        />

        <Input 
          label={t('transaction.fields.observation.label')} 
          placeholder={t('transaction.fields.observation.placeholder')}
          {...register('observation')}
          error={errors.observation?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Input 
              label={t('transaction.fields.amount')} 
              placeholder="0,00"
              inputMode="numeric"
              {...field}
              onChange={(e) => {
                const formatted = formatCurrencyInput(e.target.value);
                field.onChange(formatted);
              }}
              error={errors.amount?.message}
            />
          )}
        />

        <Input 
          label={t('transaction.fields.date')} 
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-semibold text-[#0F0F0F] ml-1">Tipo de Pagamento</label>
        <select 
          {...register('paymentType')}
          className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black transition-colors"
        >
          <option value="SPOT">À Vista</option>
          <option value="RECURRING">Recorrente (Mensal)</option>
          <option value="INSTALLMENT">Parcelado</option>
        </select>
      </div>

      {paymentType === 'INSTALLMENT' && (
        <Input 
          label="Número de Parcelas" 
          type="number"
          placeholder="Ex: 12"
          {...register('installmentCount')}
          error={errors.installmentCount?.message}
        />
      )}

      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-semibold text-[#0F0F0F] ml-1">{t('transaction.fields.category')}</label>
        <select 
          {...register('category')}
          className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black transition-colors"
        >
          {transactionType === 'EXPENSE' ? (
            <>
              <option value="BILLS">{t('transaction.category.BILLS')}</option>
              <option value="DEBTS">{t('transaction.category.DEBTS')}</option>
              <option value="INVESTMENTS">{t('transaction.category.INVESTMENTS')}</option>
              <option value="STUDIES">{t('transaction.category.STUDIES')}</option>
              <option value="GOALS">{t('transaction.category.GOALS')}</option>
              <option value="TITHE">{t('transaction.category.TITHE')}</option>
              <option value="OTHER">{t('transaction.category.OTHER')}</option>
            </>
          ) : (
            <>
              <option value="SALARY">{t('transaction.category.SALARY')}</option>
              <option value="FREELANCE">{t('transaction.category.FREELANCE')}</option>
              <option value="INVESTMENT_RETURN">{t('transaction.category.INVESTMENT_RETURN')}</option>
              <option value="GIFT">{t('transaction.category.GIFT')}</option>
              <option value="OTHER">{t('transaction.category.OTHER')}</option>
            </>
          )}
        </select>
        {errors.category && <span className="text-xs text-red-500 ml-1 font-medium">{errors.category.message}</span>}
      </div>

      <Button 
        type="submit" 
        className="mt-2 w-full" 
        size="lg"
        isLoading={mutation.isPending}
      >
        {t('transaction.fields.save')}
      </Button>
    </form>
  );
};

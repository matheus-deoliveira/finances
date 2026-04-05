import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { transactionService } from '../../shared/api/transactions';
import { formatCurrencyInput, parseToCents } from '../../shared/utils/format';
import type { Transaction, Category } from '../../entities/transaction/types';
import { PaymentTypeEnum } from '../../entities/transaction/types';
import { InstallmentField } from './InstallmentField';

const transactionSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters").max(50),
  observation: z.string().max(200).optional(),
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, "Category is required"),
  paymentType: z.nativeEnum(PaymentTypeEnum),
  installmentCount: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
  initialData?: Transaction | null;
  defaultDate?: Date;
}

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, initialData, defaultDate }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Omit<Transaction, 'id'> & { id?: string }) => {
      // If we are editing an active recurring rule, we call the specific endpoint.
      if (payload.id && initialData?.paymentType === PaymentTypeEnum.RECURRING && !initialData.endDate) {
        return transactionService.updateRecurring(payload.id, payload);
      }
      // Otherwise, we use the create/update endpoint for SPOT, INSTALLMENT, or new transactions.
      return transactionService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (onSuccess) onSuccess();
    }
  });

  const methods = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type || 'EXPENSE',
      category: initialData?.category || 'BILLS',
      paymentType: initialData?.paymentType || PaymentTypeEnum.SPOT,
      installmentCount: initialData?.metadata?.totalInstallments?.toString() || '3',
      date: initialData?.date 
        ? initialData.date.split('T')[0] 
        : formatDateForInput(defaultDate || new Date()),
      amount: initialData?.amount ? formatCurrencyInput(initialData.amount.toString()) : 'R$ 0,00',
      description: initialData?.description || '',
      observation: initialData?.observation || ''
    }
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = methods;

  const transactionType = watch('type');

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
      id: initialData?.id,
      description: data.description,
      observation: data.observation,
      amount: amountInCents,
      type: data.type,
      category: data.category as Category,
      paymentType: data.paymentType,
      date: new Date(data.date).toISOString(),
      metadata: (data.paymentType === PaymentTypeEnum.INSTALLMENT || data.paymentType === PaymentTypeEnum.INSTALLMENT_PIX) ? {
        totalInstallments: Number(data.installmentCount) || 1
      } : undefined
    };

    mutation.mutate(payload);
  };
  return (
    <FormProvider {...methods}>
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
            <option value={PaymentTypeEnum.SPOT}>À Vista</option>
            <option value={PaymentTypeEnum.RECURRING}>Recorrente (Mensal)</option>
            <option value={PaymentTypeEnum.INSTALLMENT}>Parcelado (Cartão)</option>
            <option value={PaymentTypeEnum.INSTALLMENT_PIX}>Parcelado (PIX)</option>
          </select>
        </div>

        <InstallmentField />

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
    </FormProvider>
  );
};

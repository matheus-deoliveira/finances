import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../shared/ui/Input';

export const InstallmentField = () => {
  const { register, watch, formState: { errors } } = useFormContext();
  const paymentType = watch('paymentType');

  if (paymentType !== 'INSTALLMENT') {
    return null;
  }

  return (
    <Input
      label="Número de Parcelas"
      type="number"
      placeholder="Ex: 12"
      {...register('installmentCount')}
      error={errors.installmentCount?.message as string | undefined}
    />
  );
};

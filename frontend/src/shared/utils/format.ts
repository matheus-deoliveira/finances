import i18n from '../i18n/config';

/**
 * Formata valores monetários fixos em Real Brasileiro (BRL)
 * Mantém o padrão R$ 1.234,56 mesmo em outros idiomas
 */
export const formatCurrency = (amountInCents: number): string => {
  const amount = amountInCents / 100;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDate = (isoString: string): string => {
  // Split "2026-03-29T..." to get only year, month, day
  const datePart = isoString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  
  // Create date using local time constructor (month is 0-indexed)
  const date = new Date(year, month - 1, day);
  
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US';
  
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Formata uma string de dígitos em formato de moeda BRL com prefixo (ex: 123 -> R$ 1,23)
 */
export const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const amount = Number(digits) / 100;
  
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `R$ ${formatted}`;
};

/**
 * Converte uma string formatada de volta para centavos (inteiro)
 */
export const parseToCents = (formattedValue: string): number => {
  return Number(formattedValue.replace(/\D/g, ''));
};

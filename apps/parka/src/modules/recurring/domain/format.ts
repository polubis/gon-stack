const plMoney = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plDate = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const money = (value: number): string => plMoney.format(value);

export const dateLabel = (iso: string): string => plDate.format(new Date(iso));

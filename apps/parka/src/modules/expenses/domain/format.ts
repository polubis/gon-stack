const plMoney = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plMonth = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
});

const plDateTime = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const money = (value: number): string => plMoney.format(value);

export const dateTimeLabel = (iso: string): string =>
  plDateTime.format(new Date(iso));

/** `2025-04` → `kwiecień 2025`. */
export const monthLabel = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  return plMonth.format(new Date(y, m - 1, 1));
};

export const monthOf = (iso: string): string => iso.slice(0, 7);

export const itemTotal = (item: {
  unitPrice: number;
  quantity: number;
  discount: number;
}): number => item.unitPrice * item.quantity - item.discount;

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

const plDate = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
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

/** `2025-04` → `kwiecień 2025`. */
export const monthLabel = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  return plMonth.format(new Date(y, m - 1, 1));
};

export const dateLabel = (iso: string): string => plDate.format(new Date(iso));

export const dateTimeLabel = (iso: string): string =>
  plDateTime.format(new Date(iso));

export const percent = (value: number): string =>
  `${value > 0 ? '+' : ''}${Math.round(value)}%`;

/** `2025-04` → `2025-03`. */
export const prevMonth = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/** `2025-04` → `2025-05`. */
export const nextMonth = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const monthOf = (iso: string): string => iso.slice(0, 7);

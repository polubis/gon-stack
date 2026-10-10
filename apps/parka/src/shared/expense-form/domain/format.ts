const plMoney = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (value: number): string => plMoney.format(value);

const pad = (value: number): string => String(value).padStart(2, '0');

/** ISO date-time → local `YYYY-MM-DD` (the day the user sees). */
export const toLocalDateInput = (iso: string): string => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * Local `YYYY-MM-DD` → ISO timestamp. Keeps `original` when it falls on that
 * local day, otherwise combines the day with the current local time.
 */
export const toTimestamp = (
  value: string,
  original?: string,
  now: Date = new Date(),
): string => {
  if (original && toLocalDateInput(original) === value) return original;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  return new Date(
    y,
    m - 1,
    d,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  ).toISOString();
};

export type RecurringSource = {
  id: string;
  name: string;
  cost: number;
  /** ISO date or date-time. */
  nextPaymentDate: string;
  active: boolean;
  categoryId: string;
  history: { date: string }[];
};

export type RecurringOccurrence = {
  recurringId: string;
  name: string;
  /** `YYYY-MM-DD`. */
  date: string;
  amount: number;
  categoryId: string;
};

const dayOf = (iso: string): string => iso.slice(0, 10);

const daysInMonth = (month: string): number => {
  const [year, m] = month.split('-').map(Number);
  return new Date(Date.UTC(year, m, 0)).getUTCDate();
};

/** Earliest known payment: the series starts there and repeats monthly. */
const anchorOf = (item: RecurringSource): string =>
  [item.nextPaymentDate, ...item.history.map((h) => h.date)]
    .map(dayOf)
    .reduce((first, d) => (d < first ? d : first));

/**
 * Payments an active recurring expense makes in `month` (`YYYY-MM`): one per
 * month from its first payment on, on the same day (clamped to the month's
 * length). Computed on demand, nothing is stored.
 */
export const occurrencesInMonth = (
  list: RecurringSource[],
  month: string,
): RecurringOccurrence[] =>
  list.flatMap((item) => {
    if (!item.active) return [];
    const anchor = anchorOf(item);
    if (anchor.slice(0, 7) > month) return [];
    const day = Math.min(Number(anchor.slice(8, 10)), daysInMonth(month));
    return [
      {
        recurringId: item.id,
        name: item.name,
        date: `${month}-${String(day).padStart(2, '0')}`,
        amount: item.cost,
        categoryId: item.categoryId,
      },
    ];
  });

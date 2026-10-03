export type DashboardExpense = {
  date: string;
  amount: number;
  categoryId: string;
};
export type DashboardCategory = { id: string; name: string; color: string };

export type DashboardCategorySlice = {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type DashboardDayPoint = { day: number; total: number };

export type DashboardSummary = {
  /** Selected month total. */
  total: number;
  /** Selected month vs previous month, in percent. */
  change: number;
  previousTotal: number;
  /** Number of expenses in the selected month. */
  transactions: number;
  /** Selected month total per elapsed day. */
  dailyAverage: number;
  /** Per-day totals of the selected month, day 1 first. */
  daily: DashboardDayPoint[];
  /** Per-day totals of the previous month, day 1 first. */
  previousDaily: DashboardDayPoint[];
  /** Total monthly limit, `null` when none is set. */
  monthlyLimit: number | null;
  /** Category breakdown of the selected month. */
  categories: DashboardCategorySlice[];
};

const monthOf = (iso: string): string => iso.slice(0, 7);

const prevMonthOf = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const nextMonthOf = (month: string): string => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const monthsEndingAt = (month: string, count: number): string[] => {
  const [y, m] = month.split('-').map(Number);
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

const sum = (expenses: DashboardExpense[]): number =>
  expenses.reduce((total, e) => total + e.amount, 0);

const inMonths = (
  expenses: DashboardExpense[],
  months: string[],
): DashboardExpense[] =>
  expenses.filter((e) => months.includes(monthOf(e.date)));

const daysIn = (month: string): number => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

const dayOf = (iso: string): number => Number(iso.slice(8, 10));

const dailyTotals = (
  expenses: DashboardExpense[],
  month: string,
): DashboardDayPoint[] => {
  const scoped = inMonths(expenses, [month]);
  return Array.from({ length: daysIn(month) }, (_, i) => ({
    day: i + 1,
    total: sum(scoped.filter((e) => dayOf(e.date) === i + 1)),
  }));
};

/** Days of `month` that have passed as of `today` (`YYYY-MM-DD`). */
const elapsedDays = (month: string, today: string): number => {
  const current = monthOf(today);
  if (month < current) return daysIn(month);
  if (month > current) return 0;
  return dayOf(today);
};

const totalFor = (expenses: DashboardExpense[], month: string): number =>
  sum(inMonths(expenses, [month]));

export const summarizeDashboard = ({
  expenses,
  categories,
  month,
  today,
  monthlyLimit,
}: {
  expenses: DashboardExpense[];
  categories: DashboardCategory[];
  month: string;
  /** `YYYY-MM-DD`; injected so the summary stays pure. */
  today: string;
  monthlyLimit: number | null;
}): DashboardSummary => {
  const total = totalFor(expenses, month);
  const previousTotal = totalFor(expenses, prevMonthOf(month));
  const change =
    previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100;

  const elapsed = elapsedDays(month, today);
  const dailyAverage = elapsed === 0 ? 0 : total / elapsed;

  const scoped = inMonths(expenses, [month]);
  const categorySlices = categories
    .map((category) => {
      const amount = sum(scoped.filter((e) => e.categoryId === category.id));
      return {
        categoryId: category.id,
        name: category.name,
        color: category.color,
        amount,
        pct: total === 0 ? 0 : (amount / total) * 100,
      };
    })
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return {
    total,
    change,
    previousTotal,
    transactions: scoped.length,
    dailyAverage,
    daily: dailyTotals(expenses, month),
    previousDaily: dailyTotals(expenses, prevMonthOf(month)),
    monthlyLimit,
    categories: categorySlices,
  };
};

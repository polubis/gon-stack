export type DashboardExpense = {
  date: string;
  amount: number;
  categoryId: string;
};
export type DashboardCategory = { id: string; name: string; color: string };

export type DashboardTrendPoint = { month: string; total: number };

export type DashboardCategorySlice = {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type DashboardCategoryChange = {
  categoryId: string;
  name: string;
  color: string;
  changePct: number;
};

export type DashboardSummary = {
  /** Selected month total. */
  total: number;
  /** Selected month vs previous month, in percent. */
  change: number;
  previousTotal: number;
  /** Total across the trailing `trendMonths` window. */
  rangeTotal: number;
  trend: DashboardTrendPoint[];
  /** Category breakdown across the trailing `trendMonths` window. */
  categories: DashboardCategorySlice[];
  /** Biggest category moves, selected month vs previous month. */
  categoryChanges: DashboardCategoryChange[];
};

const MAX_CATEGORY_CHANGES = 5;

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

const totalFor = (expenses: DashboardExpense[], month: string): number =>
  sum(inMonths(expenses, [month]));

export const summarizeDashboard = ({
  expenses,
  categories,
  month,
  trendMonths,
}: {
  expenses: DashboardExpense[];
  categories: DashboardCategory[];
  month: string;
  trendMonths: number;
}): DashboardSummary => {
  const months = monthsEndingAt(month, trendMonths);
  const total = totalFor(expenses, month);
  const previousTotal = totalFor(expenses, prevMonthOf(month));
  const change =
    previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100;

  const trend = months.map((m) => ({ month: m, total: totalFor(expenses, m) }));
  const rangeTotal = trend.reduce((s, t) => s + t.total, 0);

  const scoped = inMonths(expenses, months);
  const categorySlices = categories
    .map((category) => {
      const amount = sum(scoped.filter((e) => e.categoryId === category.id));
      return {
        categoryId: category.id,
        name: category.name,
        color: category.color,
        amount,
        pct: rangeTotal === 0 ? 0 : (amount / rangeTotal) * 100,
      };
    })
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const now = inMonths(expenses, [month]);
  const before = inMonths(expenses, [prevMonthOf(month)]);
  const categoryChanges = categories
    .map((category) => {
      const current = sum(now.filter((e) => e.categoryId === category.id));
      const previous = sum(before.filter((e) => e.categoryId === category.id));
      const changePct =
        previous === 0
          ? current === 0
            ? 0
            : 100
          : ((current - previous) / previous) * 100;
      return {
        categoryId: category.id,
        name: category.name,
        color: category.color,
        changePct,
      };
    })
    .filter((c) => Math.abs(c.changePct) >= 1)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, MAX_CATEGORY_CHANGES);

  return {
    total,
    change,
    previousTotal,
    rangeTotal,
    trend,
    categories: categorySlices,
    categoryChanges,
  };
};

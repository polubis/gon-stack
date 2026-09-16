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

export type DashboardSummary = {
  total: number;
  change: number;
  trend: DashboardTrendPoint[];
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

const totalFor = (expenses: DashboardExpense[], month: string): number =>
  expenses
    .filter((e) => monthOf(e.date) === month)
    .reduce((sum, e) => sum + e.amount, 0);

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
  const total = totalFor(expenses, month);
  const previous = totalFor(expenses, prevMonthOf(month));
  const change = previous === 0 ? 0 : ((total - previous) / previous) * 100;

  const trend = monthsEndingAt(month, trendMonths).map((m) => ({
    month: m,
    total: totalFor(expenses, m),
  }));

  const scoped = expenses.filter((e) => monthOf(e.date) === month);
  const categorySlices = categories
    .map((category) => {
      const amount = scoped
        .filter((e) => e.categoryId === category.id)
        .reduce((sum, e) => sum + e.amount, 0);
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

  return { total, change, trend, categories: categorySlices };
};

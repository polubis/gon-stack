import { categoryLabel } from '@/shared/i18n/category-label';
import type {
  Category,
  Expense,
  Month,
  Recurring,
  ReportSummary,
} from '../domain/models';
import { dateLabel, money, monthLabel, monthOf } from '../domain/format';

export const expensesForMonth = (
  expenses: Expense[],
  month: Month,
): Expense[] =>
  expenses
    .filter((e) => monthOf(e.date) === month)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

export const summarize = (
  monthExpenses: Expense[],
  recurring: Recurring[],
): ReportSummary => ({
  total: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
  categoryCount: new Set(monthExpenses.map((e) => e.categoryId)).size,
  recurringCount: recurring.filter((r) => r.active).length,
});

export const buildCsv = (
  monthExpenses: Expense[],
  categories: Category[],
): string =>
  [
    ['Data', 'Sklep', 'Kategoria', 'Kwota', 'Typ'],
    ...monthExpenses.map((e) => [
      dateLabel(e.date),
      e.merchant,
      categoryLabel(categories.find((c) => c.id === e.categoryId)?.name ?? ''),
      e.amount.toFixed(2),
      e.isBill ? 'Rachunek' : 'Zakup',
    ]),
  ]
    .map((row) => row.join(';'))
    .join('\n');

export const buildReport = (
  month: Month,
  summary: ReportSummary,
  csv: string,
): string =>
  [
    `Parka — raport ${monthLabel(month)}`,
    `Łączne wydatki: ${money(summary.total)}`,
    `Liczba kategorii: ${summary.categoryCount}`,
    `Transakcje cykliczne: ${summary.recurringCount}`,
    '',
    csv,
  ].join('\n');

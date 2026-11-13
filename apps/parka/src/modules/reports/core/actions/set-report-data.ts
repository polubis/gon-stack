import type { Store } from '../store';
import type { Category, Expense, Recurring } from '../../domain/models';

export const setReportData = (
  store: Store,
  [expenses, categories, recurring]: [Expense[], Category[], Recurring[]],
) => {
  store.$expenses.set(expenses);
  store.$categories.set(categories);
  store.$recurring.set(recurring);
};

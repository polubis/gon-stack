import { categoryShares } from '@/shared/expense-category/category';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { InternalServer } from '../core/error-handling';
import { logger } from '../core/logger';
import { loadCategoryNames, recordNotificationOnce } from './notifications';

type Db = Pick<SupabaseServer, 'from'>;

const nextMonth = (month: string): string => {
  const [year, number] = month.split('-').map(Number);
  return new Date(Date.UTC(year!, number!, 1)).toISOString().slice(0, 10);
};

/**
 * Tells the user about every limit whose spending in the month of `day`
 * reached its threshold (`alertAt`). A limit always notifies; push on top
 * follows the user's own choice. One limit tells once per month and threshold.
 * Never throws: a missing alert must not fail the user's change.
 */
export const notifyReachedLimits = async (
  db: Db,
  userId: string,
  day: string,
): Promise<void> => {
  try {
    const month = day.slice(0, 7);
    const limits = await db
      .from('limits')
      .select('id, scope, category_id, amount, alert_at');
    if (limits.error) throw new InternalServer(limits.error);
    if (limits.data.length === 0) return;

    const expenses = await db
      .from('expenses')
      .select('id, amount, category_id')
      .gte('date', `${month}-01`)
      .lt('date', nextMonth(month));
    if (expenses.error) throw new InternalServer(expenses.error);
    const ids = expenses.data.map((e) => e.id);
    const items = ids.length
      ? await db
          .from('receipt_items')
          .select('expense_id, unit_price, quantity, discount, category_id')
          .in('expense_id', ids)
      : { data: [], error: null };
    if (items.error) throw new InternalServer(items.error);

    const shares = expenses.data.flatMap((e) =>
      categoryShares({
        amount: Number(e.amount),
        categoryId: e.category_id,
        items: items.data
          .filter((it) => it.expense_id === e.id)
          .map((it) => ({
            categoryId: it.category_id,
            unitPrice: Number(it.unit_price),
            quantity: Number(it.quantity),
            discount: Number(it.discount),
          })),
      }),
    );
    const names = await loadCategoryNames(db);

    for (const limit of limits.data) {
      const amount = Number(limit.amount);
      const spent =
        limit.scope === 'category'
          ? shares
              .filter((s) => s.categoryId === limit.category_id)
              .reduce((total, s) => total + s.amount, 0)
          : expenses.data.reduce((total, e) => total + Number(e.amount), 0);
      if (amount <= 0 || (spent / amount) * 100 < limit.alert_at) continue;
      await recordNotificationOnce(
        db,
        userId,
        `limit-reached:${limit.id}:${month}:${limit.alert_at}`,
        {
          kind: 'limit-reached',
          payload: {
            category:
              limit.scope === 'category' && limit.category_id
                ? (names.get(limit.category_id) ?? null)
                : null,
            month,
            amount,
            spent: Number(spent.toFixed(2)),
            alertAt: limit.alert_at,
          },
        },
      );
    }
  } catch (error) {
    logger(error, 'error');
  }
};

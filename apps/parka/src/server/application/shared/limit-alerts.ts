import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { InternalServer } from '../core/error-handling';
import { logger } from '../core/logger';
import { readMonthSpending } from './finance-reads';
import { loadCategoryNames, recordNotificationOnce } from './notifications';

type Db = Pick<SupabaseServer, 'from' | 'rpc'>;

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

    // Added up in the database: a month can hold more rows than one read returns.
    const spending = await readMonthSpending(db, month);
    const names = await loadCategoryNames(db);

    for (const limit of limits.data) {
      const amount = Number(limit.amount);
      const spent =
        limit.scope === 'category'
          ? spending.categories
              .filter((c) => c.categoryId === limit.category_id)
              .reduce((total, c) => total + c.amount, 0)
          : spending.total;
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

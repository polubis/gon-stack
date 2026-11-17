import { updateExpenseSchema } from '@schemas/expenses';
import { deriveExpenseCategory } from '@/shared/expense-category/category';
import { BadRequest, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadProfiles, toDevice } from '../../shared/device';
import {
  expenseSnapshot,
  loadCategoryNames,
  tryRecordNotifications,
} from '../../shared/notifications';
import { notifyReachedLimits } from '../../shared/limit-alerts';
import { fromSupabaseError } from '../../adapter/supabase';
import { ruleTotals } from '../../shared/recurring';
import {
  editExpenses,
  editSeriesRule,
  seriesExpenseIds,
} from '../../shared/recurring-scope';

export const updateExpense = privateProcedure({
  schema: withZodSchema({ schema: updateExpenseSchema }),
})({
  handler: async (input, { db, user }) => {
    const uid = user.id;
    const categoryId = deriveExpenseCategory(input.items, input.categoryId);
    if (!categoryId && input.items.length === 0) {
      throw new BadRequest(undefined, 'Expense needs a category');
    }
    const { data: previous, error: previousError } = await db
      .from('expenses')
      .select('*')
      .eq('id', input.id)
      .maybeSingle();
    if (previousError) throw fromSupabaseError(previousError);
    if (!previous) throw new NotFound(undefined, 'Expense not found');

    // The series is read from the stored row, never from the request.
    const anchor = previous.occurrence_date;
    const series =
      previous.recurring_id !== null &&
      anchor !== null &&
      input.scope !== 'this'
        ? { ruleId: previous.recurring_id, anchor }
        : null;
    // "Only the following" leaves the opened occurrence as it is.
    const keepsAnchor = series !== null && input.scope === 'following';

    const { data, error } = keepsAnchor
      ? await db.from('expenses').select('*').eq('id', input.id).maybeSingle()
      : await db
          .from('expenses')
          .update({
            merchant: input.merchant,
            date: input.date,
            amount: input.amount,
            category_id: categoryId,
            payment_method: input.paymentMethod,
            is_bill: input.isBill,
            source: input.source,
          })
          .eq('id', input.id)
          .select()
          .maybeSingle();
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Expense not found');

    const replaceItems = async () => {
      if (keepsAnchor) return;
      const { error: wipeError } = await db
        .from('receipt_items')
        .delete()
        .eq('expense_id', input.id);
      if (wipeError) throw fromSupabaseError(wipeError);
      if (input.items.length === 0) return;
      const { error: itemsError } = await db.from('receipt_items').insert(
        input.items.map((it) => ({
          user_id: uid,
          id: it.id,
          expense_id: input.id,
          name: it.name,
          unit_price: it.unitPrice,
          quantity: it.quantity,
          discount: it.discount,
          category_id: it.categoryId,
        })),
      );
      if (itemsError) throw fromSupabaseError(itemsError);
    };

    if (series) {
      const edit = {
        merchant: input.merchant,
        amount: input.amount,
        categoryId,
        paymentMethod: input.paymentMethod,
        isBill: input.isBill,
        items: input.items,
      };
      const ids = (
        await seriesExpenseIds(db, series.ruleId, input.scope, series.anchor)
      ).filter((id) => id !== input.id);
      await editExpenses(db, uid, ids, edit);
      const totals = ruleTotals({
        cost: input.amount,
        categoryId: input.categoryId,
        items: input.items,
      });
      await editSeriesRule(db, uid, series.ruleId, series.anchor, input.scope, {
        name: input.merchant,
        cost: totals.cost,
        categoryId: totals.categoryId,
        paymentMethod: input.paymentMethod,
        items: input.items,
      });
    }

    // Independent reads overlap the items rewrite; limits need the items stored.
    const [profiles] = await Promise.all([
      loadProfiles(db),
      (async () => {
        const [names] = await Promise.all([
          loadCategoryNames(db),
          replaceItems(),
        ]);
        await tryRecordNotifications(db, uid, [
          {
            kind: 'expense-updated',
            payload: {
              before: expenseSnapshot(previous, names),
              after: expenseSnapshot(data, names),
            },
          },
        ]);
        await notifyReachedLimits(db, uid, data.date);
      })(),
    ]);

    return {
      code: 200 as const,
      data: {
        id: data.id,
        merchant: data.merchant,
        date: data.date,
        amount: Number(data.amount),
        categoryId: data.category_id,
        paymentMethod: data.payment_method,
        isBill: data.is_bill,
        source: data.source as 'receipt' | 'manual',
        device: toDevice(data, profiles),
        recurringId: data.recurring_id,
        occurrenceDate: data.occurrence_date,
        items: input.items,
      },
    };
  },
});

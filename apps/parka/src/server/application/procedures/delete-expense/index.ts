import { deleteExpenseSchema } from '@schemas/expenses';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  expenseSnapshot,
  loadCategoryNames,
  tryRecordNotifications,
} from '../../shared/notifications';

export const deleteExpense = privateProcedure({
  schema: withZodSchema({ schema: deleteExpenseSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data: previous, error: previousError } = await db
      .from('expenses')
      .select('*')
      .eq('id', input.id)
      .maybeSingle();
    if (previousError) throw new InternalServer(previousError);

    const { error: itemsError } = await db
      .from('receipt_items')
      .delete()
      .eq('expense_id', input.id);
    if (itemsError) throw new InternalServer(itemsError);

    const { data, error } = await db
      .from('expenses')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw new InternalServer(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Expense not found');

    if (previous) {
      await tryRecordNotifications(db, user.id, [
        {
          kind: 'expense-deleted',
          payload: {
            expense: expenseSnapshot(previous, await loadCategoryNames(db)),
          },
        },
      ]);
    }

    return { code: 200 as const, ok: true as const };
  },
});

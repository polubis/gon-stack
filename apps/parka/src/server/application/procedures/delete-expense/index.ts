import { deleteExpenseSchema } from '@schemas/expenses';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const deleteExpense = privateProcedure({
  schema: withZodSchema({ schema: deleteExpenseSchema }),
})({
  handler: async (input, { db }) => {
    const { error: itemsError } = await db
      .from('receipt_items')
      .delete()
      .eq('expense_id', input.id);
    if (itemsError) throw new InternalServer(itemsError.message);

    const { data, error } = await db
      .from('expenses')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw new InternalServer(error.message);
    if (!data || data.length === 0) throw new NotFound('Expense not found');

    return { code: 200 as const, ok: true as const };
  },
});

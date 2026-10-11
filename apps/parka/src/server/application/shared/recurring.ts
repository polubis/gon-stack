import type { z } from 'zod';
import type { recurring } from '@schemas/general';
import type { Database } from '@/shared/data-sources/db-schema';
import { dueOccurrences } from '@/shared/recurring/occurrences';
import { InternalServer } from '../core/error-handling';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';

type Rule = z.infer<ReturnType<typeof recurring>>;
type RuleRow = Database['public']['Tables']['recurring_expenses']['Row'];

const INTERVALS: readonly Rule['interval'][] = ['weekly', 'monthly', 'yearly'];

export const toRule = (row: RuleRow): Rule => ({
  id: row.id,
  name: row.name,
  cost: Number(row.cost),
  interval: INTERVALS.find((i) => i === row.interval) ?? 'monthly',
  startDate: row.start_date,
  endDate: row.end_date,
  lastMaterializedDate: row.last_materialized_date,
  active: row.active,
  paymentMethod: row.payment_method,
  categoryId: row.category_id,
});

/** Instants of an occurrence: noon UTC keeps its day in every zone but the far ends. */
const occurrenceInstant = (day: string): string => `${day}T12:00:00.000Z`;

/**
 * Turns every occurrence of every rule that has come due (`<= today`, the
 * caller's day) into an ordinary expense. Safe to run any number of times and
 * from parallel requests: the unique (rule, occurrence) key makes a repeat
 * insert a no-op, and `last_materialized_date` only ever moves forward, so an
 * expense the user deleted is not created again.
 */
export const materializeRecurring = async (
  db: SupabaseServer,
  userId: string,
  today: string,
): Promise<void> => {
  const { data: rows, error } = await db
    .from('recurring_expenses')
    .select('*')
    .eq('active', true);
  if (error) throw new InternalServer(error);

  for (const row of rows) {
    const due = dueOccurrences(toRule(row), today);
    const newest = due.at(-1);
    if (newest === undefined) continue;

    const { error: insertError } = await db.from('expenses').upsert(
      due.map((day) => ({
        user_id: userId,
        id: `${row.id}:${day}`,
        merchant: row.name,
        date: occurrenceInstant(day),
        amount: row.cost,
        category_id: row.category_id,
        payment_method: row.payment_method,
        is_bill: true,
        source: 'manual',
        recurring_id: row.id,
        occurrence_date: day,
      })),
      {
        onConflict: 'user_id,recurring_id,occurrence_date',
        ignoreDuplicates: true,
      },
    );
    if (insertError) throw new InternalServer(insertError);

    // Only forward: a slower parallel request must not roll the mark back.
    const { error: markError } = await db
      .from('recurring_expenses')
      .update({ last_materialized_date: newest })
      .eq('id', row.id)
      .or(`last_materialized_date.is.null,last_materialized_date.lt.${newest}`);
    if (markError) throw new InternalServer(markError);
  }
};

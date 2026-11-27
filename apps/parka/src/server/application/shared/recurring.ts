import type { z } from 'zod';
import type { recurring } from '@schemas/general';
import type { Database } from '@/shared/data-sources/db-schema';
import {
  deriveExpenseCategory,
  itemsTotal,
} from '@/shared/expense-category/category';
import { dueOccurrences } from '@/shared/recurring/occurrences';
import { BadRequest } from '../core/error-handling';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import {
  loadCategoryNames,
  recurringSnapshot,
  tryRecordNotifications,
  type NotificationEvent,
} from './notifications';
import { fromSupabaseError } from '../adapter/supabase';

type Rule = z.infer<ReturnType<typeof recurring>>;
type RuleRow = Database['public']['Tables']['recurring_expenses']['Row'];
type ItemRow = Database['public']['Tables']['recurring_items']['Row'];
type Item = Rule['items'][number];

const INTERVALS: readonly Rule['interval'][] = ['weekly', 'monthly', 'yearly'];

const toItem = (row: ItemRow): Item => ({
  id: row.id,
  name: row.name,
  unitPrice: Number(row.unit_price),
  quantity: Number(row.quantity),
  discount: Number(row.discount),
  categoryId: row.category_id,
});

export const toRule = (row: RuleRow, items: ItemRow[] = []): Rule => ({
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
  items: items.filter((i) => i.recurring_id === row.id).map(toItem),
});

/** Products of one rule, or of every rule (RLS scopes the read to the caller). */
export const loadRuleItems = async (
  db: SupabaseServer,
  recurringId?: string,
): Promise<ItemRow[]> => {
  const all = db.from('recurring_items').select('*');
  const { data, error } = await (recurringId === undefined
    ? all
    : all.eq('recurring_id', recurringId));
  if (error) throw fromSupabaseError(error);
  return data;
};

/**
 * What a rule stores: with products the cost is their total and the category
 * the shared one (`null` when they differ); without, both are taken as sent.
 */
export const ruleTotals = (
  input: Pick<Rule, 'cost' | 'categoryId' | 'items'>,
): { cost: number; categoryId: string | null } => {
  const categoryId = deriveExpenseCategory(input.items, input.categoryId);
  if (!categoryId && input.items.length === 0) {
    throw new BadRequest(undefined, 'Recurring expense needs a category');
  }
  return {
    cost: input.items.length > 0 ? itemsTotal(input.items) : input.cost,
    categoryId,
  };
};

/** Replaces the rule's products with `items`; returns what is stored. */
export const replaceRuleItems = async (
  db: SupabaseServer,
  userId: string,
  recurringId: string,
  items: Item[],
): Promise<ItemRow[]> => {
  const { error: wipeError } = await db
    .from('recurring_items')
    .delete()
    .eq('recurring_id', recurringId);
  if (wipeError) throw fromSupabaseError(wipeError);
  if (items.length === 0) return [];

  const { data, error } = await db
    .from('recurring_items')
    .insert(
      items.map((it) => ({
        user_id: userId,
        id: it.id,
        recurring_id: recurringId,
        name: it.name,
        unit_price: it.unitPrice,
        quantity: it.quantity,
        discount: it.discount,
        category_id: it.categoryId,
      })),
    )
    .select();
  if (error) throw fromSupabaseError(error);
  return data;
};

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
  // Rules and their products are independent reads: one round trip.
  const [{ data: rows, error }, ruleItems] = await Promise.all([
    db.from('recurring_expenses').select('*').eq('active', true),
    loadRuleItems(db),
  ]);
  if (error) throw fromSupabaseError(error);

  // Read once, only when some rule accrues, and shared by every rule.
  let namesLoad: ReturnType<typeof loadCategoryNames> | undefined;
  const categoryNames = () => (namesLoad ??= loadCategoryNames(db));

  // Rules are independent: one round trip chain per rule, all in parallel.
  // Events keep the rule order.
  const events = await Promise.all(
    rows.map(async (row): Promise<NotificationEvent | null> => {
      const due = dueOccurrences(toRule(row), today);
      const newest = due.at(-1);
      if (newest === undefined) return null;

      const { data: inserted, error: insertError } = await db
        .from('expenses')
        .upsert(
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
            // id is rule:day, so pk and occurrence key match; one arbiter, parallel race stays no-op
            onConflict: 'user_id,id',
            ignoreDuplicates: true,
          },
        )
        .select('occurrence_date');
      if (insertError) throw fromSupabaseError(insertError);

      // Only rows this call really created: a parallel request that lost the race adds none.
      const days = inserted
        .map((e) => e.occurrence_date)
        .filter((day): day is string => day !== null)
        .sort();

      // Each new expense gets its own copy of the products, so a later edit of the rule leaves it as is.
      const products = ruleItems.filter((i) => i.recurring_id === row.id);
      if (products.length > 0 && days.length > 0) {
        const { error: itemsError } = await db.from('receipt_items').upsert(
          days.flatMap((day) =>
            products.map((it) => ({
              user_id: userId,
              id: `${row.id}:${day}:${it.id}`,
              expense_id: `${row.id}:${day}`,
              name: it.name,
              unit_price: it.unit_price,
              quantity: it.quantity,
              discount: it.discount,
              category_id: it.category_id,
            })),
          ),
          { onConflict: 'user_id,id', ignoreDuplicates: true },
        );
        if (itemsError) throw fromSupabaseError(itemsError);
      }
      const event: NotificationEvent | null =
        days.length > 0
          ? {
              kind: 'recurring-accrued',
              payload: {
                rule: recurringSnapshot(row, await categoryNames()),
                days,
              },
            }
          : null;

      // Only forward: a slower parallel request must not roll the mark back.
      const { error: markError } = await db
        .from('recurring_expenses')
        .update({ last_materialized_date: newest })
        .eq('id', row.id)
        .or(
          `last_materialized_date.is.null,last_materialized_date.lt.${newest}`,
        );
      if (markError) throw fromSupabaseError(markError);
      return event;
    }),
  );

  const accrued = events.filter((e): e is NotificationEvent => e !== null);
  await tryRecordNotifications(db, userId, accrued);
};

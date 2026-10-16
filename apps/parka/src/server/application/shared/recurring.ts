import type { z } from 'zod';
import type { recurring } from '@schemas/general';
import type { Database } from '@/shared/data-sources/db-schema';
import {
  deriveExpenseCategory,
  itemsTotal,
} from '@/shared/expense-category/category';
import { dueOccurrences } from '@/shared/recurring/occurrences';
import { BadRequest, InternalServer } from '../core/error-handling';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import {
  loadCategoryNames,
  recurringSnapshot,
  tryRecordNotifications,
  type NotificationEvent,
} from './notifications';

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

/** Products of the given rules (RLS scopes the read to the caller). */
export const loadRuleItems = async (db: SupabaseServer): Promise<ItemRow[]> => {
  const { data, error } = await db.from('recurring_items').select('*');
  if (error) throw new InternalServer(error);
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
  if (wipeError) throw new InternalServer(wipeError);
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
  if (error) throw new InternalServer(error);
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
  const { data: rows, error } = await db
    .from('recurring_expenses')
    .select('*')
    .eq('active', true);
  if (error) throw new InternalServer(error);

  const ruleItems = await loadRuleItems(db);
  const accrued: NotificationEvent[] = [];
  for (const row of rows) {
    const due = dueOccurrences(toRule(row), today);
    const newest = due.at(-1);
    if (newest === undefined) continue;

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
          onConflict: 'user_id,recurring_id,occurrence_date',
          ignoreDuplicates: true,
        },
      )
      .select('occurrence_date');
    if (insertError) throw new InternalServer(insertError);

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
      if (itemsError) throw new InternalServer(itemsError);
    }
    if (days.length > 0) {
      accrued.push({
        kind: 'recurring-accrued',
        payload: {
          rule: recurringSnapshot(row, await loadCategoryNames(db)),
          days,
        },
      });
    }

    // Only forward: a slower parallel request must not roll the mark back.
    const { error: markError } = await db
      .from('recurring_expenses')
      .update({ last_materialized_date: newest })
      .eq('id', row.id)
      .or(`last_materialized_date.is.null,last_materialized_date.lt.${newest}`);
    if (markError) throw new InternalServer(markError);
  }

  await tryRecordNotifications(db, userId, accrued);
};

import type { z } from 'zod';
import type { recurring } from '@schemas/general';
import type { Database } from '@/shared/data-sources/db-schema';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import {
  inScope,
  nextOccurrence,
  previousOccurrence,
  type RecurringScope,
} from '@/shared/recurring/occurrences';
import { fromSupabaseError } from '../adapter/supabase';
import { loadRuleItems, replaceRuleItems, toRule } from './recurring';

type RuleRow = Database['public']['Tables']['recurring_expenses']['Row'];
type Item = z.infer<ReturnType<typeof recurring>>['items'][number];

/** What a scoped edit writes into expenses and into the rule. */
export type SeriesEdit = {
  merchant: string;
  amount: number;
  categoryId: string | null;
  paymentMethod: string;
  isBill: boolean;
  items: Item[];
};

/** When a rule makes its occurrences. */
export type RuleSchedule = {
  interval: RuleRow['interval'];
  startDate: string;
  endDate: string | null;
};

/** What a rule makes (totals already derived from products). */
export type RuleContent = {
  name: string;
  cost: number;
  categoryId: string | null;
  paymentMethod: string;
  items: Item[];
};

type RuleValues = RuleContent & RuleSchedule;

const CHUNK = 100;

const chunks = <T>(list: T[]): T[][] => {
  const parts: T[][] = [];
  for (let i = 0; i < list.length; i += CHUNK)
    parts.push(list.slice(i, i + CHUNK));
  return parts;
};

const loadRule = async (
  db: SupabaseServer,
  id: string,
): Promise<RuleRow | null> => {
  const { data, error } = await db
    .from('recurring_expenses')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw fromSupabaseError(error);
  return data;
};

/** Expenses of the series reached by `scope` from the `anchor` occurrence. */
export const seriesExpenseIds = async (
  db: SupabaseServer,
  ruleId: string,
  scope: RecurringScope,
  anchor: string,
): Promise<string[]> => {
  const { data, error } = await db
    .from('expenses')
    .select('id, occurrence_date')
    .eq('recurring_id', ruleId);
  if (error) throw fromSupabaseError(error);
  return data
    .filter(
      (row) =>
        row.occurrence_date !== null &&
        inScope(scope, row.occurrence_date, anchor),
    )
    .map((row) => row.id);
};

export const deleteExpenses = async (
  db: SupabaseServer,
  ids: string[],
): Promise<void> => {
  // Chunks are independent: each keeps its items-then-expenses order, all run together.
  await Promise.all(
    chunks(ids).map(async (part) => {
      const items = await db
        .from('receipt_items')
        .delete()
        .in('expense_id', part);
      if (items.error) throw fromSupabaseError(items.error);
      const expenses = await db.from('expenses').delete().in('id', part);
      if (expenses.error) throw fromSupabaseError(expenses.error);
    }),
  );
};

/** Writes what the occurrence edit shares with the other occurrences; each keeps its own day. */
export const editExpenses = async (
  db: SupabaseServer,
  userId: string,
  ids: string[],
  edit: SeriesEdit,
): Promise<void> => {
  // Chunks are independent: one round trip chain per chunk, all in parallel.
  await Promise.all(
    chunks(ids).map(async (part) => {
      const updated = await db
        .from('expenses')
        .update({
          merchant: edit.merchant,
          amount: edit.amount,
          category_id: edit.categoryId,
          payment_method: edit.paymentMethod,
          is_bill: edit.isBill,
        })
        .in('id', part);
      if (updated.error) throw fromSupabaseError(updated.error);

      const wiped = await db
        .from('receipt_items')
        .delete()
        .in('expense_id', part);
      if (wiped.error) throw fromSupabaseError(wiped.error);
      if (edit.items.length === 0) return;
      const inserted = await db.from('receipt_items').insert(
        part.flatMap((expenseId) =>
          edit.items.map((it) => ({
            user_id: userId,
            id: `${expenseId}:${it.id.split(':').at(-1)}`,
            expense_id: expenseId,
            name: it.name,
            unit_price: it.unitPrice,
            quantity: it.quantity,
            discount: it.discount,
            category_id: it.categoryId,
          })),
        ),
      );
      if (inserted.error) throw fromSupabaseError(inserted.error);
    }),
  );
};

/** Ends the series at `endDate`; `null` removes the rule (nothing is left to make). */
const endRule = async (
  db: SupabaseServer,
  rule: RuleRow,
  endDate: string | null,
): Promise<void> => {
  const { error } =
    endDate === null
      ? await db.from('recurring_expenses').delete().eq('id', rule.id)
      : await db
          .from('recurring_expenses')
          .update({ end_date: endDate })
          .eq('id', rule.id);
  if (error) throw fromSupabaseError(error);
};

/** A rule that carries on the series: same days, nothing before `from` is made again. */
const spawnRule = async (
  db: SupabaseServer,
  userId: string,
  values: RuleValues,
  materializedUntil: string | null,
): Promise<void> => {
  const id = crypto.randomUUID();
  const { error } = await db.from('recurring_expenses').insert({
    user_id: userId,
    id,
    name: values.name,
    cost: values.cost,
    interval: values.interval,
    start_date: values.startDate,
    end_date: values.endDate,
    active: true,
    payment_method: values.paymentMethod,
    category_id: values.categoryId,
    last_materialized_date: materializedUntil,
  });
  if (error) throw fromSupabaseError(error);
  await replaceRuleItems(
    db,
    userId,
    id,
    values.items.map((it) => ({
      ...it,
      id: `${id}:${it.id.split(':').at(-1)}`,
    })),
  );
};

const valuesOf = (row: RuleRow, items: Item[]): RuleValues => {
  const rule = toRule(row, []);
  return {
    name: rule.name,
    cost: rule.cost,
    categoryId: rule.categoryId,
    interval: rule.interval,
    startDate: rule.startDate,
    endDate: rule.endDate,
    paymentMethod: rule.paymentMethod,
    items,
  };
};

const itemsOf = async (db: SupabaseServer, row: RuleRow): Promise<Item[]> =>
  toRule(row, await loadRuleItems(db, row.id)).items;

/** An occurrence the series has not turned into an expense yet. */
const isUpcoming = (row: RuleRow, anchor: string): boolean =>
  row.last_materialized_date === null || anchor > row.last_materialized_date;

/**
 * Applies an edit of the `anchor` occurrence to the rule that makes the
 * following ones. Charged expenses are independent rows, so only occurrences
 * not charged yet need the series split: the part before `anchor` keeps the
 * old values, the part reached by `scope` takes the new ones.
 */
export const editSeriesRule = async (
  db: SupabaseServer,
  userId: string,
  ruleId: string,
  anchor: string,
  scope: RecurringScope,
  content: RuleContent,
  /** New days of the series; the stored ones stay when omitted. */
  schedule?: RuleSchedule,
): Promise<void> => {
  const row = await loadRule(db, ruleId);
  if (!row) return;
  const values: RuleValues = {
    ...content,
    ...(schedule ?? {
      interval: row.interval,
      startDate: row.start_date,
      endDate: row.end_date,
    }),
  };
  const edit = async () => {
    const { error } = await db
      .from('recurring_expenses')
      .update({
        name: values.name,
        cost: values.cost,
        interval: values.interval,
        start_date: values.startDate,
        end_date: values.endDate,
        payment_method: values.paymentMethod,
        category_id: values.categoryId,
      })
      .eq('id', ruleId);
    if (error) throw fromSupabaseError(error);
    await replaceRuleItems(db, userId, ruleId, values.items);
  };
  const upcoming = isUpcoming(row, anchor);

  if (scope === 'all') return edit();
  if (scope === 'this') {
    if (!upcoming) return;
    const old = valuesOf(row, await itemsOf(db, row));
    const next = nextOccurrence(toRule(row), anchor);
    await endRule(db, row, previousOccurrence(toRule(row), anchor));
    await spawnRule(
      db,
      userId,
      { ...values, startDate: anchor, endDate: anchor },
      null,
    );
    if (next !== null) await spawnRule(db, userId, old, anchor);
    return;
  }
  if (scope === 'thisAndFollowing') {
    const previous = previousOccurrence(toRule(row), anchor);
    if (!upcoming || previous === null) return edit();
    await endRule(db, row, previous);
    await spawnRule(db, userId, values, previous);
    return;
  }
  if (!upcoming) return edit();
  if (nextOccurrence(toRule(row), anchor) === null) return;
  await endRule(db, row, anchor);
  await spawnRule(db, userId, values, anchor);
};

/**
 * Applies a delete of the `anchor` occurrence: the expenses it reaches go,
 * then the rule stops making the occurrences it reaches.
 */
export const deleteSeries = async (
  db: SupabaseServer,
  userId: string,
  ruleId: string,
  anchor: string,
  scope: RecurringScope,
): Promise<void> => {
  // The rule read is independent of the series ids: one round trip.
  const [ids, row] = await Promise.all([
    seriesExpenseIds(db, ruleId, scope, anchor),
    loadRule(db, ruleId),
  ]);
  await deleteExpenses(db, ids);
  if (!row) return;

  if (scope === 'all') return endRule(db, row, null);
  if (scope === 'this') {
    if (!isUpcoming(row, anchor)) return;
    const old = valuesOf(row, await itemsOf(db, row));
    const next = nextOccurrence(toRule(row), anchor);
    await endRule(db, row, previousOccurrence(toRule(row), anchor));
    if (next !== null) await spawnRule(db, userId, old, anchor);
    return;
  }
  if (scope === 'thisAndFollowing')
    return endRule(db, row, previousOccurrence(toRule(row), anchor));
  await endRule(db, row, anchor);
};

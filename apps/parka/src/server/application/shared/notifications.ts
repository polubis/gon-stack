import type { z } from 'zod';
import type { notificationEvent } from '@schemas/notifications';
import type { Database } from '@/shared/data-sources/db-schema';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { categoryLabel } from '@/shared/i18n/category-label';
import { InternalServer } from '../core/error-handling';
import { logger } from '../core/logger';
import { deliverPush } from './push-delivery';

export type NotificationEvent = z.infer<ReturnType<typeof notificationEvent>>;

type Snapshot<TKind extends NotificationEvent['kind']> = Extract<
  NotificationEvent,
  { kind: TKind }
>['payload'];

type ExpenseSnapshot = Snapshot<'expense-created'>['expense'];
type CategorySnapshot = Snapshot<'category-created'>['category'];
type RecurringSnapshot = Snapshot<'recurring-accrued'>['rule'];

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type RuleRow = Database['public']['Tables']['recurring_expenses']['Row'];

/** Anything that can run the notification insert: the user's or the service client. */
type Db = Pick<SupabaseServer, 'from'>;

const money = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

export const expenseSnapshot = (
  row: ExpenseRow,
  categoryNames: ReadonlyMap<string, string>,
): ExpenseSnapshot => ({
  merchant: row.merchant,
  amount: Number(row.amount),
  date: row.date,
  category: row.category_id
    ? (categoryNames.get(row.category_id) ?? null)
    : null,
  paymentMethod: row.payment_method,
  isBill: row.is_bill,
});

export const categorySnapshot = (row: CategoryRow): CategorySnapshot => ({
  name: categoryLabel(row.name),
  icon: row.icon,
  color: row.color,
});

export const recurringSnapshot = (
  row: RuleRow,
  categoryNames: ReadonlyMap<string, string>,
): RecurringSnapshot => ({
  name: row.name,
  cost: Number(row.cost),
  interval:
    row.interval === 'weekly' || row.interval === 'yearly'
      ? row.interval
      : 'monthly',
  category: row.category_id
    ? (categoryNames.get(row.category_id) ?? null)
    : null,
  paymentMethod: row.payment_method,
});

/** Display names of the user's categories, keyed by id (RLS scopes the read). */
export const loadCategoryNames = async (
  db: Db,
): Promise<ReadonlyMap<string, string>> => {
  const { data, error } = await db.from('categories').select('id, name');
  if (error) throw new InternalServer(error);
  return new Map(data.map((c) => [c.id, categoryLabel(c.name)]));
};

const text = (event: NotificationEvent): { title: string; body: string } => {
  switch (event.kind) {
    case 'expense-created':
      return {
        title: 'Dodano wydatek',
        body: `${event.payload.expense.merchant} · ${money.format(event.payload.expense.amount)}`,
      };
    case 'expense-updated':
      return {
        title: 'Zmieniono wydatek',
        body: event.payload.after.merchant,
      };
    case 'expense-deleted':
      return {
        title: 'Usunięto wydatek',
        body: `${event.payload.expense.merchant} · ${money.format(event.payload.expense.amount)}`,
      };
    case 'category-created':
      return { title: 'Dodano kategorię', body: event.payload.category.name };
    case 'category-updated':
      return { title: 'Zmieniono kategorię', body: event.payload.after.name };
    case 'category-deleted':
      return { title: 'Usunięto kategorię', body: event.payload.category.name };
    case 'recurring-accrued':
      return {
        title: 'Naliczono wydatek cykliczny',
        body: `${event.payload.rule.name} · ${money.format(event.payload.rule.cost)}`,
      };
    default: {
      const unreachable: never = event;
      return unreachable;
    }
  }
};

/**
 * The one place that writes notifications and pushes them to the user's
 * devices. Used directly by the backend flows (their own session client) and
 * by the internal endpoint (service client).
 */
export const recordNotifications = async (
  db: Db,
  userId: string,
  events: readonly NotificationEvent[],
): Promise<number> => {
  if (events.length === 0) return 0;
  const messages = events.map(text);
  const { error } = await db.from('notifications').insert(
    events.map((event, i) => ({
      user_id: userId,
      id: crypto.randomUUID(),
      kind: event.kind,
      payload: event.payload,
      ...messages[i]!,
    })),
  );
  if (error) throw new InternalServer(error);
  await deliverPush(db, userId, messages);
  return events.length;
};

/** A missing notification must never fail the change the user actually made. */
export const tryRecordNotifications = async (
  db: Db,
  userId: string,
  events: readonly NotificationEvent[],
): Promise<void> => {
  try {
    await recordNotifications(db, userId, events);
  } catch (error) {
    logger(error, 'error');
  }
};

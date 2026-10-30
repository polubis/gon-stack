import { z } from 'zod';
import type { Schema as DashboardSchema } from '@schemas/dashboard';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { browserTimeZone } from '@/shared/date/date';
import {
  bucketOf,
  clampPeriod,
  resolvePeriod,
  shiftPeriod,
  todayDay,
} from '@/shared/period/period';
import { dashboardFromTotals } from '@/server/domain/dashboard';
import { InternalServer } from '../core/error-handling';
import { loadProfiles, toDevice } from './device';
import { readAllPages } from './paged';
import { loadRuleItems, toRule } from './recurring';

/**
 * The finance reads, one function each. The list and dashboard endpoints and
 * the combined bootstrap endpoint all answer from here, so what one returns
 * is by construction what the others return. None of them turns due
 * recurring charges into expenses: the caller does that first, once.
 */

/** What `dashboard_summary` answers: sums only, empty buckets left out. */
const totalsSchema = z.object({
  total: z.number(),
  previousTotal: z.number(),
  transactions: z.number(),
  series: z.array(z.object({ index: z.number(), total: z.number() })),
  previousSeries: z.array(z.object({ index: z.number(), total: z.number() })),
  categories: z.array(z.object({ categoryId: z.string(), amount: z.number() })),
});

/**
 * Every expense with its products, newest first. The order is total (date,
 * then id), so no row is skipped or read twice between pages. Products ride
 * along, they are capped per expense only.
 */
const loadExpenses = (db: SupabaseServer) =>
  readAllPages((from, to) =>
    db
      .from('expenses')
      .select('*, receipt_items(*)')
      .order('date', { ascending: false })
      .order('id')
      .range(from, to),
  );

export const readExpenses = async (db: SupabaseServer) => {
  const [expenses, profiles] = await Promise.all([
    loadExpenses(db),
    loadProfiles(db),
  ]);

  return expenses.map((e) => ({
    id: e.id,
    merchant: e.merchant,
    date: e.date,
    amount: Number(e.amount),
    categoryId: e.category_id,
    paymentMethod: e.payment_method,
    isBill: e.is_bill,
    source: e.source as 'receipt' | 'manual',
    device: toDevice(e, profiles),
    recurringId: e.recurring_id,
    occurrenceDate: e.occurrence_date,
    items: e.receipt_items.map((it) => ({
      id: it.id,
      name: it.name,
      unitPrice: Number(it.unit_price),
      quantity: Number(it.quantity),
      discount: Number(it.discount),
      categoryId: it.category_id,
    })),
  }));
};

export const readCategories = async (db: SupabaseServer) => {
  const data = await readAllPages((from, to, total) => {
    const query = db.from('categories').select('*');
    return (total ? query.order('id') : query).range(from, to);
  });

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
  }));
};

export const readLimits = async (db: SupabaseServer) => {
  const data = await readAllPages((from, to, total) => {
    const query = db.from('limits').select('*');
    return (total ? query.order('id') : query).range(from, to);
  });

  return data.map((l) => ({
    id: l.id,
    scope: l.scope as 'total' | 'category',
    categoryId: l.category_id ?? undefined,
    amount: Number(l.amount),
    alertAt: l.alert_at,
  }));
};

export const readRecurring = async (db: SupabaseServer) => {
  const data = await readAllPages((from, to, total) => {
    const query = db.from('recurring_expenses').select('*');
    return (total ? query.order('id') : query).range(from, to);
  });

  const items = await loadRuleItems(db);

  return data.map((row) => toRule(row, items));
};

export const readDashboard = async (
  db: SupabaseServer,
  input: Pick<DashboardSchema['in'], 'kind' | 'from' | 'to' | 'tz'>,
) => {
  // Days are the caller's: the same instant is another day in another zone.
  const timeZone = input.tz;
  const today = todayDay(timeZone);
  // A future period holds nothing: it snaps to the present one.
  const period = clampPeriod(
    resolvePeriod(input.kind, input.from, input.to),
    today,
  );
  // The period right before it is needed for the comparison.
  const previous = shiftPeriod(period, -1);

  const [summary, categories, limits, profile] = await Promise.all([
    // The database adds the expenses up (see the `dashboard_summary` migration).
    // A read-only function: GET needs no request body.
    db.rpc(
      'dashboard_summary',
      {
        p_from: period.from,
        p_to: period.to,
        p_bucket: bucketOf(period),
        p_previous_from: previous.from,
        p_previous_to: previous.to,
        p_previous_bucket: bucketOf(previous),
        p_tz: timeZone ?? browserTimeZone(),
      },
      { get: true },
    ),
    db.from('categories').select('id, name, color'),
    db.from('limits').select('amount').eq('scope', 'total'),
    db.from('profiles').select('name').maybeSingle(),
  ]);
  if (summary.error) throw new InternalServer(summary.error);
  if (categories.error) throw new InternalServer(categories.error);
  if (limits.error) throw new InternalServer(limits.error);
  if (profile.error) throw new InternalServer(profile.error);

  const { categories: categoryAmounts, ...sums } = totalsSchema.parse(
    summary.data,
  );

  // Only real expenses count: a recurring rule is an instruction, and its
  // upcoming occurrences are a projection that never reaches a total.
  const data = dashboardFromTotals({
    totals: { ...sums, categoryAmounts },
    categories: categories.data.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
    })),
    period,
    previous,
    today,
    monthlyLimit: limits.data[0] ? Number(limits.data[0].amount) : null,
  });

  return { ...data, userName: profile.data?.name ?? '' };
};

const deviceRowsSchema = z.array(
  z.object({
    device_id: z.string(),
    device_name: z.string().nullable(),
    device_type: z.string().nullable(),
    device_model: z.string().nullable(),
    device_os: z.string().nullable(),
    device_browser: z.string().nullable(),
    device_screen: z.string().nullable(),
  }),
);

/**
 * Devices the account has written from, one row each: from the newest
 * expense of the device, else the newest task (see `own_devices`).
 */
export const readOwnDevices = async (db: SupabaseServer) => {
  const { data, error } = await db.rpc('own_devices', {}, { get: true });
  if (error) throw new InternalServer(error);
  return deviceRowsSchema.parse(data);
};

/**
 * What a month of expenses (UTC days) adds up to: the total and what each
 * category got, from the same `dashboard_summary` the dashboard uses.
 */
export const readMonthSpending = async (
  db: Pick<SupabaseServer, 'rpc'>,
  month: string,
) => {
  const from = `${month}-01`;
  const [year, number] = month.split('-').map(Number);
  const to = new Date(Date.UTC(year!, number!, 0)).toISOString().slice(0, 10);
  const { data, error } = await db.rpc(
    'dashboard_summary',
    {
      p_from: from,
      p_to: to,
      p_bucket: 'day',
      p_previous_from: from,
      p_previous_to: to,
      p_previous_bucket: 'day',
      p_tz: 'UTC',
    },
    { get: true },
  );
  if (error) throw new InternalServer(error);
  const { total, categories } = totalsSchema.parse(data);
  return { total, categories };
};

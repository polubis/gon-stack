import { getStateSchema, type FinanceState } from '@schemas/state';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const getState = privateProcedure({
  schema: withZodSchema({ schema: getStateSchema }),
})({
  handler: async (_input, { db }) => {
    const [
      categories,
      expenses,
      items,
      limits,
      goals,
      recurring,
      payments,
      notifications,
      profile,
      prefs,
    ] = await Promise.all([
      db.from('categories').select('*'),
      db.from('expenses').select('*'),
      db.from('receipt_items').select('*'),
      db.from('limits').select('*'),
      db.from('savings_goals').select('*'),
      db.from('recurring_expenses').select('*'),
      db
        .from('recurring_payments')
        .select('*')
        .order('date', { ascending: false }),
      db.from('notifications').select('*'),
      db.from('profiles').select('*').maybeSingle(),
      db.from('notification_preferences').select('*').maybeSingle(),
    ]);

    const firstError =
      categories.error ||
      expenses.error ||
      items.error ||
      limits.error ||
      goals.error ||
      recurring.error ||
      payments.error ||
      notifications.error ||
      profile.error ||
      prefs.error;

    if (firstError) throw new InternalServer(firstError.message);

    const itemsByExpense = new Map<
      string,
      FinanceState['expenses'][number]['items']
    >();
    for (const it of items.data ?? []) {
      const list = itemsByExpense.get(it.expense_id) ?? [];
      list.push({
        id: it.id,
        name: it.name,
        unitPrice: Number(it.unit_price),
        quantity: Number(it.quantity),
        discount: Number(it.discount),
        categoryId: it.category_id,
      });
      itemsByExpense.set(it.expense_id, list);
    }

    const historyByRecurring = new Map<
      string,
      { date: string; amount: number }[]
    >();
    for (const p of payments.data ?? []) {
      const list = historyByRecurring.get(p.recurring_id) ?? [];
      list.push({ date: p.date, amount: Number(p.amount) });
      historyByRecurring.set(p.recurring_id, list);
    }

    const data: FinanceState = {
      categories: (categories.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
      })),
      expenses: (expenses.data ?? [])
        .map((e) => ({
          id: e.id,
          merchant: e.merchant,
          date: e.date,
          amount: Number(e.amount),
          categoryId: e.category_id,
          paymentMethod: e.payment_method,
          isBill: e.is_bill,
          source: e.source as 'receipt' | 'manual',
          items: itemsByExpense.get(e.id) ?? [],
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
      limits: (limits.data ?? []).map((l) => ({
        id: l.id,
        scope: l.scope as 'total' | 'category',
        categoryId: l.category_id ?? undefined,
        amount: Number(l.amount),
        alertAt80: l.alert_at80,
        delivery: l.delivery as 'push' | 'email',
      })),
      goals: (goals.data ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        target: Number(g.target),
        saved: Number(g.saved),
        months: Number(g.months),
      })),
      recurring: (recurring.data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        cost: Number(r.cost),
        nextPaymentDate: r.next_payment_date,
        active: r.active,
        paymentMethod: r.payment_method,
        categoryId: r.category_id,
        history: historyByRecurring.get(r.id) ?? [],
      })),
      notifications: (notifications.data ?? [])
        .map((n) => ({
          id: n.id,
          kind: n.kind,
          title: n.title,
          body: n.body,
          ageDays: Number(n.age_days),
        }))
        .sort((a, b) => a.ageDays - b.ageDays),
      settings: {
        profile: {
          name: profile.data?.name ?? 'Anna Kowalska',
          email: profile.data?.email ?? '',
        },
        notifications: {
          push: prefs.data?.push ?? true,
          email: prefs.data?.email ?? false,
          limitWarnings: prefs.data?.limit_warnings ?? true,
          receiptConfirmations: prefs.data?.receipt_confirmations ?? true,
          limitAlerts: prefs.data?.limit_alerts ?? true,
        },
      },
    };

    return { code: 200 as const, data };
  },
});

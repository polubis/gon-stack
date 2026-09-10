import { syncStateSchema, type FinanceState } from '@schemas/state';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/**
 * Full per-user sync: the client owns the whole finance graph in memory, so a
 * write replaces every mutable collection for the session user. Row-level
 * security guarantees the `user_id` stamp below can only ever be the caller.
 */
export const syncState = privateProcedure({
  schema: withZodSchema({ schema: syncStateSchema }),
})({
  handler: async (state: FinanceState, { db, user }) => {
    const uid = user.id;
    // The aggregate sync touches ten tables generically; a single local cast
    // keeps the body readable without fighting the per-table row types.
    const sb = db as unknown as {
      from: (table: string) => {
        delete: () => {
          eq: (
            c: string,
            v: string,
          ) => Promise<{ error: { message: string } | null }>;
        };
        insert: (
          rows: Record<string, unknown>[],
        ) => Promise<{ error: { message: string } | null }>;
        upsert: (
          row: Record<string, unknown>,
        ) => Promise<{ error: { message: string } | null }>;
      };
    };

    const wipe = async (table: string) => {
      const { error } = await sb.from(table).delete().eq('user_id', uid);
      if (error) throw new InternalServer(`${table}: ${error.message}`);
    };

    const insert = async (table: string, rows: Record<string, unknown>[]) => {
      if (rows.length === 0) return;
      const { error } = await sb.from(table).insert(rows);
      if (error) throw new InternalServer(`${table}: ${error.message}`);
    };

    const upsert = async (table: string, row: Record<string, unknown>) => {
      const { error } = await sb.from(table).upsert(row);
      if (error) throw new InternalServer(`${table}: ${error.message}`);
    };

    // Children first; `expenses` / `recurring_expenses` deletes cascade too but
    // being explicit keeps the intent obvious.
    await wipe('receipt_items');
    await wipe('recurring_payments');
    await wipe('expenses');
    await wipe('recurring_expenses');
    await wipe('categories');
    await wipe('limits');
    await wipe('savings_goals');
    await wipe('notifications');

    await insert(
      'categories',
      state.categories.map((c) => ({
        user_id: uid,
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
      })),
    );

    await insert(
      'expenses',
      state.expenses.map((e) => ({
        user_id: uid,
        id: e.id,
        merchant: e.merchant,
        date: e.date,
        amount: e.amount,
        category_id: e.categoryId,
        payment_method: e.paymentMethod,
        is_bill: e.isBill,
        source: e.source,
      })),
    );

    await insert(
      'receipt_items',
      state.expenses.flatMap((e) =>
        e.items.map((it) => ({
          user_id: uid,
          id: it.id,
          expense_id: e.id,
          name: it.name,
          unit_price: it.unitPrice,
          quantity: it.quantity,
          discount: it.discount,
          category_id: it.categoryId,
        })),
      ),
    );

    await insert(
      'limits',
      state.limits.map((l) => ({
        user_id: uid,
        id: l.id,
        scope: l.scope,
        category_id: l.categoryId ?? null,
        amount: l.amount,
        alert_at80: l.alertAt80,
        delivery: l.delivery,
      })),
    );

    await insert(
      'savings_goals',
      state.goals.map((g) => ({
        user_id: uid,
        id: g.id,
        name: g.name,
        target: g.target,
        saved: g.saved,
        months: g.months,
      })),
    );

    await insert(
      'recurring_expenses',
      state.recurring.map((r) => ({
        user_id: uid,
        id: r.id,
        name: r.name,
        cost: r.cost,
        next_payment_date: r.nextPaymentDate,
        active: r.active,
        payment_method: r.paymentMethod,
        category_id: r.categoryId,
      })),
    );

    await insert(
      'recurring_payments',
      state.recurring.flatMap((r) =>
        r.history.map((h) => ({
          user_id: uid,
          recurring_id: r.id,
          date: h.date,
          amount: h.amount,
        })),
      ),
    );

    await insert(
      'notifications',
      state.notifications.map((n) => ({
        user_id: uid,
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        age_days: n.ageDays,
      })),
    );

    await upsert('profiles', {
      user_id: uid,
      name: state.settings.profile.name,
      email: state.settings.profile.email,
    });

    await upsert('notification_preferences', {
      user_id: uid,
      push: state.settings.notifications.push,
      email: state.settings.notifications.email,
      limit_warnings: state.settings.notifications.limitWarnings,
      receipt_confirmations: state.settings.notifications.receiptConfirmations,
      limit_alerts: state.settings.notifications.limitAlerts,
    });

    return { code: 200 as const, ok: true as const };
  },
});

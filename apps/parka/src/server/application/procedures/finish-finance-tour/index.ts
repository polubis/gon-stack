import { finishFinanceTourSchema } from '@schemas/finance-tour';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { tourExpiry } from '@/server/domain/finance-tour';
import { fromSupabaseError } from '../../adapter/supabase';

export const finishFinanceTour = privateProcedure({
  schema: withZodSchema({ schema: finishFinanceTourSchema }),
})({
  handler: async (input, { db, user }) => {
    // Every finish (re)starts the validity window.
    const now = new Date();
    const { error } = await db.from('finance_tours').upsert(
      {
        user_id: user.id,
        outcome: input.outcome,
        finished_at: now.toISOString(),
        expires_at: tourExpiry(now).toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (error) throw fromSupabaseError(error);

    return { code: 200 as const, ok: true as const };
  },
});

import z from 'zod';
import { errorOut } from './general';

/** How the first-run finance tour ended: walked to the end or turned off. */
const outcome = () => z.enum(['completed', 'skipped']);

export const getFinanceTourSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({
        code: z.literal(200),
        /** `null` = never finished or expired, the tour opens. */
        data: z.object({
          outcome: outcome().nullable(),
          /** Until when `outcome` counts; `null` with it. */
          expiresAt: z.string().nullable(),
        }),
      }),
      errorOut(),
    ]),
  });

export const finishFinanceTourSchema = () =>
  z.object({
    in: z.object({ outcome: outcome() }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      errorOut(),
    ]),
  });

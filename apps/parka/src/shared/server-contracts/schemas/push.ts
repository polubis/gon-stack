import z from 'zod';
import { errorOut } from './general';

/** `PushSubscription.toJSON()` of the browser, trimmed to what the sender needs. */
export const subscribePushSchema = () =>
  z.object({
    in: z.object({
      endpoint: z.url().max(2048),
      keys: z.object({
        p256dh: z.string().min(1).max(256),
        auth: z.string().min(1).max(64),
      }),
    }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      errorOut(),
    ]),
  });

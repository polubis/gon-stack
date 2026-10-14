import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { logger } from '../core/logger';
import { sendWebPush, type VapidKeys } from './web-push';

export type PushMessage = { title: string; body: string };

type Db = Pick<SupabaseServer, 'from'>;

/** Subscription is gone for good: remove it, never retry. */
const GONE = new Set([404, 410]);

/** Where a tapped notification leads. */
const OPEN_URL = '/app/notifications/';

const vapidFromEnv = (): VapidKeys | null => {
  const publicKey = import.meta.env.PUBLIC_PARKA_VAPID_PUBLIC_KEY;
  const privateKey = import.meta.env.PARKA_VAPID_PRIVATE_KEY;
  const subject = import.meta.env.PARKA_VAPID_SUBJECT;
  return publicKey && privateKey && subject
    ? { publicKey, privateKey, subject }
    : null;
};

/**
 * Pushes the messages to every subscribed device of the user, when the user
 * turned push on. Never throws: a failed push must not fail the user's change.
 * Subscriptions the push service reports as gone (404/410) are deleted.
 */
export const deliverPush = async (
  db: Db,
  userId: string,
  messages: readonly PushMessage[],
  options: { keys?: VapidKeys | null; send?: typeof fetch } = {},
): Promise<void> => {
  try {
    const keys = options.keys === undefined ? vapidFromEnv() : options.keys;
    if (!keys || messages.length === 0) return;

    const prefs = await db
      .from('notification_preferences')
      .select('push')
      .eq('user_id', userId)
      .maybeSingle();
    if (prefs.error) throw prefs.error;
    if (!prefs.data?.push) return;

    const subs = await db
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId);
    if (subs.error) throw subs.error;

    const gone = new Set<string>();
    await Promise.all(
      subs.data.flatMap((sub) =>
        messages.map(async (message) => {
          try {
            const status = await sendWebPush(
              keys,
              sub,
              JSON.stringify({ ...message, url: OPEN_URL }),
              options.send,
            );
            if (GONE.has(status)) gone.add(sub.endpoint);
            else if (status >= 400) logger(new Error(`Push ${status}`), 'warn');
          } catch (error) {
            logger(error, 'warn');
          }
        }),
      ),
    );

    if (gone.size > 0) {
      const { error } = await db
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .in('endpoint', [...gone]);
      if (error) throw error;
    }
  } catch (error) {
    logger(error, 'error');
  }
};

import { STORAGE_KEY as FORM_MEMORY_KEY } from '@/shared/form-memory/integration/storage';

const LAST_USER_KEY = 'parka:last-user';

/** The push subscription belongs to whoever enabled it: never keep it across accounts. */
export const dropPushSubscription = async (): Promise<void> => {
  try {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager?.getSubscription();
    await subscription?.unsubscribe();
  } catch {
    // Push unavailable: nothing to drop.
  }
};

/**
 * Per-account device state must not leak between accounts. When the account
 * this browser last served differs from `userId` (or is unknown, e.g. data
 * left by an older session), forget the remembered form values and the push
 * subscription (it was registered for another account).
 */
export const reconcileDevice = async (userId: string): Promise<void> => {
  try {
    const last = window.localStorage.getItem(LAST_USER_KEY);
    window.localStorage.setItem(LAST_USER_KEY, userId);
    if (last === userId) return;
    window.localStorage.removeItem(FORM_MEMORY_KEY);
    await dropPushSubscription();
  } catch {
    // Storage unavailable: nothing to reconcile.
  }
};

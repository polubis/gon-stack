import type { PushState } from '../domain/models';

export type PushSubscriptionDto = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** The user did not grant the browser permission. */
export class PushPermissionError extends Error {
  constructor(readonly permission: NotificationPermission) {
    super('Notification permission not granted');
  }
}

const SERVICE_WORKER_URL = '/sw.js';

const applicationServerKey = (): Uint8Array<ArrayBuffer> => {
  const base64 = import.meta.env.PUBLIC_PARKA_VAPID_PUBLIC_KEY.replace(
    /-/g,
    '+',
  ).replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

const isSupported = (): boolean =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const readPushState = async (): Promise<PushState> => {
  if (!isSupported()) return 'unsupported';
  if (!import.meta.env.PUBLIC_PARKA_VAPID_PUBLIC_KEY) return 'unconfigured';
  if (Notification.permission === 'denied') return 'blocked';

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return subscription && Notification.permission === 'granted' ? 'on' : 'off';
};

/** Asks the browser permission, registers the worker and subscribes this device. */
export const enablePush = async (): Promise<PushSubscriptionDto> => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new PushPermissionError(permission);

  await navigator.serviceWorker.register(SERVICE_WORKER_URL);
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey(),
  });

  const { endpoint, keys } = subscription.toJSON();
  if (!endpoint || !keys?.p256dh || !keys.auth)
    throw new Error('Browser returned an incomplete push subscription');
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
};

export const disablePush = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  await subscription?.unsubscribe();
};

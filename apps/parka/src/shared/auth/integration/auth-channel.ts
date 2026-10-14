const NAME = 'parka-auth';

/** Tells the other tabs that login, logout or a switch just happened. */
export const announceAuthChange = (): void => {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(NAME);
  channel.postMessage('changed');
  channel.close();
};

/** Returns an unsubscribe function. */
export const onAuthChange = (listener: () => void): (() => void) => {
  if (typeof BroadcastChannel === 'undefined') return () => undefined;
  const channel = new BroadcastChannel(NAME);
  channel.onmessage = listener;
  return () => channel.close();
};

// Service worker: shows Web Push notifications and opens the app on tap.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const text = event.data ? event.data.text() : '';
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { body: text };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Parka', {
      body: data.body || '',
      data: { url: data.url || '/app/notifications/' },
    }),
  );
});

// The push service rotated or expired the subscription: take a new one and
// register it, so notifications keep arriving without opening the app.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      const options = event.oldSubscription?.options ?? {
        userVisibleOnly: true,
      };
      const subscription =
        event.newSubscription ??
        (await self.registration.pushManager.subscribe(options));
      const { endpoint, keys } = subscription.toJSON();
      if (!endpoint || !keys) return;
      await fetch('/api/push/', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, keys }),
      });
    })().catch(() => {}),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(
    event.notification.data?.url || '/app/notifications/',
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        const open = windows.find((w) => 'focus' in w);
        return open && 'navigate' in open
          ? open.navigate(url).then((w) => w && w.focus())
          : self.clients.openWindow(url);
      }),
  );
});

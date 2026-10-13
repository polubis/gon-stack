// Service worker: shows Web Push notifications and opens the app on tap.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Parka', {
      body: data.body || '',
      data: { url: data.url || '/app/notifications/' },
    }),
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

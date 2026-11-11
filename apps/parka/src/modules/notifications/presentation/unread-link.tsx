import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import { Provider, useContext } from './context';

const Link = () => {
  const ctx = useContext();
  const unread = ctx.useUnreadCount();

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const label =
    unread === 0 ? 'Powiadomienia' : `Powiadomienia, nieprzeczytane: ${unread}`;

  return (
    <a
      href={APP_ROUTER.notifications()}
      aria-label={label}
      data-e2e="notifications:unread-link"
      className="pressable relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-card text-ink shadow-card hover:bg-brand-softer"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {unread > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger-strong px-1 text-micro font-bold text-on-brand ring-2 ring-surface"
        >
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </a>
  );
};

/** Bell with an unread badge, for any header (e.g. Settings). Shows nothing it cannot load. */
export const UnreadLink = () => (
  <Provider>
    <Link />
  </Provider>
);

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
      className="relative grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-hover"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {unread > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-danger-strong px-1 text-micro font-bold text-on-brand"
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

import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { setUnreadSummary } from '@/shared/auth/presentation/unread-summary';
import { Provider, useContext } from './context';

/** Copies the unread total of the surrounding notifications store into the account area. */
export const MirrorUnread = () => {
  const unread = useContext().useUnreadCount();
  useEffect(() => setUnreadSummary(unread), [unread]);
  return null;
};

const Sync = () => {
  const ctx = useContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Every view change refreshes the total: other views create notifications.
  useEffect(() => {
    ctx.load();
  }, [ctx, pathname]);

  return <MirrorUnread />;
};

/** App shell mount: keeps the avatar's unread count current on every view. */
export const UnreadSync = () => (
  <Provider>
    <Sync />
  </Provider>
);

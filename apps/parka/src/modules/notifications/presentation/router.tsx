import { useState } from 'react';
import { BellOff } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { ERROR_CODES } from '../configuration/constraints';
import { useContext } from './context';
import { ListSkeleton } from './list-skeleton';
import { LoadMore } from './load-more';
import { NotificationRow } from './notification-row';

const FIRST_LOAD_SKELETONS = 4;

/**
 * State-driven view switch: card skeletons during the first load, then the
 * error, the empty state or the list. Reads and reloads keep the list on screen.
 */
export const Router = () => {
  const ctx = useContext();
  const notifications = ctx.useNotifications();
  const error = ctx.useError();
  const initializing = ctx.useInitializing();
  const loadingMore = ctx.useLoadingMore();
  const [now] = useState(Date.now);

  if (initializing)
    return (
      <ListSkeleton
        count={FIRST_LOAD_SKELETONS}
        data-e2e="notifications:skeleton"
      />
    );

  if (error && notifications.length === 0) {
    return (
      <ErrorState
        data-e2e="notifications:load-error"
        title="Nie udało się wczytać powiadomień"
        code={ERROR_CODES.load}
        description={error}
        onRetry={ctx.load}
        backHref={APP_ROUTER.settings()}
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        data-e2e="notifications:empty"
        icon={BellOff}
        title="Brak powiadomień"
        description="Gdy dodasz, zmienisz lub usuniesz wydatek albo kategorię, pojawi się tu informacja o zmianie."
      />
    );
  }

  return (
    <>
      <ul
        className="grid grid-cols-1 gap-2 md:gap-4 lg:grid-cols-2"
        data-e2e="notifications:list"
        aria-label="Powiadomienia"
        aria-busy={loadingMore}
      >
        {notifications.map((n) => (
          <NotificationRow key={n.id} notification={n} now={now} />
        ))}
      </ul>
      <LoadMore />
    </>
  );
};

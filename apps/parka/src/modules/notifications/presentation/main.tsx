import { useEffect } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { ScreenHeader } from '@/shared/ui/layout';
import { ERROR_CODES } from '../configuration/constraints';
import { Provider, useContext } from './context';
import { ListSkeleton } from './list-skeleton';
import { NotificationRow } from './notification-row';

const NotificationsView = () => {
  const ctx = useContext();
  const notifications = ctx.useNotifications();
  const error = ctx.useError();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  return (
    <div
      data-e2e="notifications:main"
      className="relative flex flex-1 flex-col"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader title="Powiadomienia" backHref={APP_ROUTER.settings()} />
      </div>
      <main className="flex flex-1 flex-col gap-2 px-4 pb-6 pt-2 md:gap-4 md:px-8 lg:px-10 xl:px-16">
        {error ? (
          <ErrorState
            data-e2e="notifications:load-error"
            title="Nie udało się wczytać powiadomień"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.settings()}
          />
        ) : null}
        {initializing ? (
          <ListSkeleton />
        ) : (
          <ul
            className="grid gap-2 md:gap-4 lg:grid-cols-2"
            data-e2e="notifications:list"
          >
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
            {notifications.length === 0 && !error ? (
              <li className="text-sm text-ink-soft lg:col-span-2">
                Brak powiadomień.
              </li>
            ) : null}
          </ul>
        )}
      </main>
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku powiadomień"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić powiadomień. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <Provider>
      <NotificationsView />
    </Provider>
  </ErrorBoundary>
);

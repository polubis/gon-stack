import { useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { ScreenHeader } from '@/shared/ui/layout';
import { Toast } from '@/shared/ui/toast';
import { ERROR_CODES } from '../configuration/constraints';
import { Provider, useContext } from './context';
import { Router } from './router';

const unreadLabel = (count: number): string =>
  count === 0
    ? 'Wszystko przeczytane'
    : count === 1
      ? '1 nieprzeczytane'
      : `${count} nieprzeczytanych`;

const NotificationsView = () => {
  const ctx = useContext();
  const unread = ctx.useUnreadCount();
  const total = ctx.useNotifications().length;
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const notice = ctx.useNotice();

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  return (
    <div
      data-e2e="notifications:main"
      className="relative flex flex-1 animate-view-enter flex-col motion-reduce:animate-none"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="mx-auto w-full max-w-2xl md:px-4">
        <ScreenHeader
          title="Powiadomienia"
          backHref={APP_ROUTER.settings()}
          action={
            <button
              type="button"
              data-e2e="notifications:mark-all-read"
              disabled={unread === 0}
              onClick={ctx.markAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand-softer disabled:text-ink-soft disabled:opacity-60 disabled:hover:bg-transparent"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Oznacz wszystkie jako przeczytane
            </button>
          }
        />
      </div>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-2 px-4 pb-6 pt-2 md:gap-4 md:px-8">
        {initializing || total === 0 ? null : (
          <p
            role="status"
            data-e2e="notifications:unread-count"
            className="text-xs font-medium text-ink-soft"
          >
            {unreadLabel(unread)}
          </p>
        )}
        <Router />
      </main>
      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="notifications:toast"
          notice={notice}
          onClose={ctx.dismissNotice}
        />
      ) : null}
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku powiadomień"
        code={ERROR_CODES.render}
        description={error.message}
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

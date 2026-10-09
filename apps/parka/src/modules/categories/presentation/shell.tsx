import { useEffect } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { ErrorState } from '@/shared/ui/error-state';
import { ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { ERROR_CODES } from '../configuration/constraints';
import { Provider, useContext } from './context';

const Layout = () => {
  const ctx = useContext();
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  return (
    <div data-e2e="categories:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <div
        key={pathname}
        className="flex flex-1 animate-view-enter flex-col motion-reduce:animate-none"
      >
        {error ? (
          <>
            <div className="mx-auto w-full max-w-2xl md:px-4">
              <ScreenHeader
                title="Kategorie"
                backHref={APP_ROUTER.settings()}
              />
            </div>
            <div className="mx-auto w-full max-w-2xl px-4 pt-2 md:px-8">
              <ErrorState
                data-e2e="categories:load-error"
                title="Nie udało się wczytać kategorii"
                code={ERROR_CODES.load}
                description={error}
                onRetry={ctx.load}
                backHref={APP_ROUTER.settings()}
              />
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </div>

      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="categories:toast"
          tone={notice.tone}
          message={notice.message}
          onDismiss={ctx.dismissNotice}
        />
      ) : null}
    </div>
  );
};

/** Layout route: one store shared by the list and the editor views. */
export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku kategorii"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić kategorii. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <Provider>
      <Layout />
    </Provider>
  </ErrorBoundary>
);

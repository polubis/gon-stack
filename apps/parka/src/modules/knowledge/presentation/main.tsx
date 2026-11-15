import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { FabRail } from '@/shared/navigation/overlay-nav/presentation/fab-rail';
import { openModal } from '@/shared/router/modal-stack';
import { APP_ROUTER } from '@/shared/router/routes';
import { ErrorState } from '@/shared/ui/error-state';
import { ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { ERROR_CODES } from '../configuration/constraints';
import { Provider, useContext } from './context';
import { Folders } from './folders';
import { Hero } from './hero';
import { Modals } from './modals';
import { NEW_NODE_MODAL } from './modal-ids';
import { KnowledgeSkeleton } from './skeleton';
import { Stats } from './stats';

const ADD_BUTTON =
  'pressable cta shadow-cta inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const Screen = () => {
  const { initializing, isLoading, error, notice, load, dismissNotice } =
    useContext();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div
      data-e2e="knowledge:main"
      className="relative mx-auto flex w-full max-w-7xl flex-1 animate-view-zoom flex-col overflow-x-clip motion-reduce:animate-none"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader
          title="Wiedza"
          eyebrow="Twoja"
          action={
            <button
              type="button"
              data-e2e="knowledge:add-trigger"
              onClick={() => openModal(NEW_NODE_MODAL)}
              className={cn(ADD_BUTTON, 'h-11 shrink-0 px-4 max-md:hidden')}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Dodaj
            </button>
          }
        />
      </div>
      <main className="flex flex-1 flex-col gap-3 px-4 pb-24 pt-2 md:gap-4 md:px-8 md:pb-6 lg:px-10 xl:px-16">
        {error ? (
          <ErrorState
            data-e2e="knowledge:load-error"
            title="Nie udało się wczytać wiedzy"
            code={ERROR_CODES.load}
            description={error}
            onRetry={load}
            backHref={APP_ROUTER.dashboard()}
          />
        ) : initializing ? (
          <KnowledgeSkeleton />
        ) : (
          <div className="flex animate-view-enter flex-col gap-3 motion-reduce:animate-none md:gap-4 xl:grid xl:grid-cols-12 xl:content-start">
            <div className="xl:col-span-6 xl:col-start-1 xl:row-start-1">
              <Hero />
            </div>
            <Folders />
            <Stats />
          </div>
        )}
      </main>
      {/* Zero-height rail above the nav: the button floats over the content. */}
      <FabRail className="pointer-events-none relative bottom-4 h-0 md:hidden">
        <button
          type="button"
          aria-label="Dodaj"
          data-e2e="knowledge:add-fab"
          onClick={() => openModal(NEW_NODE_MODAL)}
          className={cn(
            ADD_BUTTON,
            'pointer-events-auto absolute bottom-0 right-4 h-14 w-14 animate-pop-in rounded-full motion-reduce:animate-none',
          )}
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      </FabRail>
      <Modals />
      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="knowledge:toast"
          notice={notice}
          onClose={dismissNotice}
        />
      ) : null}
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku Wiedza"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.dashboard()}
      />
    )}
  >
    <Provider>
      <Screen />
    </Provider>
  </ErrorBoundary>
);

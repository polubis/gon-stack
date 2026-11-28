import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { FabRail } from '@/shared/navigation/overlay-nav/presentation/fab-rail';
import { openModal } from '@/shared/router/modal-stack';
import { APP_ROUTER } from '@/shared/router/routes';
import { ErrorState } from '@/shared/ui/error-state';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { useOwnerEyebrow } from '@/modules/settings/presentation/owner-eyebrow';
import { ERROR_CODES } from '../configuration/constraints';
import { AddMenu } from './add-menu';
import { BacklogButton } from './backlog-button';
import { Provider, useContext } from './context';
import { EmptyCatalog, EmptyKnowledge } from './empty';
import { FiltersButton } from './filters-button';
import { Summary } from './summary';
import { CatalogPicker, cycleCatalog } from './catalog-picker';
import { useCatalogSwipe } from './use-catalog-swipe';
import { newTopicInModal } from './modal-ids';
import { Modals } from './modals';
import { ScreenSkeleton } from './skeleton';
import { TopicList } from './topic-list';

const ADD_BUTTON =
  'pressable cta shadow-cta inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const Screen = () => {
  const {
    today,
    catalog,
    filters,
    topics,
    allTopics,
    catalogs,
    initializing,
    isLoading,
    loaded,
    error,
    notice,
    load,
    selectCatalog,
    dismissNotice,
  } = useContext();
  const eyebrow = useOwnerEyebrow('Twoja');
  // The picked catalog is shown from loaded data: switching never reloads.
  const viewFilters = { ...filters, catalogId: null };
  const filtersKey = JSON.stringify(viewFilters);
  const step = (by: 1 | -1) => {
    const id = cycleCatalog(catalogs, catalog?.id ?? null, by);
    if (id) selectCatalog(id);
  };
  const { gesture, contentRef, slide } = useCatalogSwipe(step);

  useEffect(() => {
    load({ filters: viewFilters });
    // `filters` is tracked through its key: equal filters never reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, filtersKey]);

  const nothing = allTopics.length === 0 && catalogs.length === 0;

  return (
    <div
      data-e2e="knowledge:main"
      className="relative mx-auto flex w-full max-w-7xl flex-1 animate-view-enter flex-col overflow-x-clip motion-reduce:animate-none"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="px-gutter-inset">
        <ScreenHeader
          title="Wiedza"
          eyebrow={eyebrow}
          action={
            <>
              <BacklogButton />
              <FiltersButton />
              <AddMenu
                side="bottom"
                data-e2e="knowledge:add-trigger"
                className={cn(ADD_BUTTON, 'h-11 shrink-0 px-4 max-md:hidden')}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Dodaj
              </AddMenu>
            </>
          }
        />
      </div>
      <main
        {...gesture}
        className="flex flex-1 flex-col gap-3 px-gutter pb-24 pt-2 md:gap-4 md:pb-6"
      >
        <CatalogPicker
          catalogs={catalogs}
          catalog={catalog}
          onStep={(by) => {
            slide(by === 1);
            step(by);
          }}
          onPick={(id) => {
            slide(
              catalogs.findIndex((c) => c.id === id) >
                catalogs.findIndex((c) => c.id === catalog?.id),
            );
            selectCatalog(id);
          }}
        />
        <div ref={contentRef} className="flex flex-col gap-3 md:gap-4">
          {error ? (
            <ErrorState
              data-e2e="knowledge:load-error"
              title="Nie udało się wczytać wiedzy"
              code={ERROR_CODES.load}
              description={error}
              onRetry={() => load({ filters: viewFilters })}
              backHref={APP_ROUTER.dashboard()}
            />
          ) : initializing || (isLoading && !loaded) ? (
            <ScreenSkeleton />
          ) : (
            <div className="flex flex-col gap-3 md:gap-4 xl:grid xl:grid-cols-12 xl:content-start">
              <div className="xl:col-span-5">
                <Summary />
              </div>
              <Card className="flex flex-col gap-4 xl:col-span-7">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="min-w-0 truncate text-base font-semibold">
                    Tematy
                  </h2>
                  {catalog ? (
                    <button
                      type="button"
                      aria-label={`Dodaj temat do katalogu: ${catalog.name}`}
                      onClick={() => openModal(newTopicInModal(catalog.id))}
                      className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
                {nothing && !isLoading ? (
                  <EmptyKnowledge />
                ) : topics.length === 0 ? (
                  <EmptyCatalog />
                ) : (
                  <TopicList
                    topics={topics}
                    scope={`${catalog?.id}:${filtersKey}`}
                  />
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
      {/* Zero-height rail above the nav: the button floats over the content. */}
      <FabRail className="pointer-events-none relative bottom-4 h-0 md:hidden">
        <AddMenu
          side="top"
          aria-label="Dodaj"
          data-e2e="knowledge:add-fab"
          className={cn(
            ADD_BUTTON,
            'pointer-events-auto absolute bottom-0 right-4 h-14 w-14 animate-pop-in rounded-full motion-reduce:animate-none',
          )}
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </AddMenu>
      </FabRail>
      <Modals defaultDay={today} />
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

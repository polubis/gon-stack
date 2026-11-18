import { useEffect } from 'react';
import { Layers, Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { FabRail } from '@/shared/navigation/overlay-nav/presentation/fab-rail';
import { PeriodControl } from '@/shared/period-control/presentation/period-control';
import { usePeriodSwipe } from '@/shared/period-control/presentation/use-period-swipe';
import { containsDay, type Period } from '@/shared/period/period';
import { APP_ROUTER } from '@/shared/router/routes';
import { openModal } from '@/shared/router/modal-stack';
import { ErrorState } from '@/shared/ui/error-state';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { useOwnerEyebrow } from '@/modules/settings/presentation/owner-eyebrow';
import { ERROR_CODES } from '../configuration/constraints';
import { Button } from '@/shared/ui/controls';
import { AddMenu } from './add-menu';
import { BacklogButton } from './backlog-button';
import { Provider, useContext } from './context';
import { EmptyKnowledge, EmptyPeriod } from './empty';
import { FiltersButton } from './filters-button';
import { Hero } from './hero';
import { LIST_MODAL } from './modal-ids';
import { Modals } from './modals';
import { ScreenSkeleton } from './skeleton';
import { TopicList } from './topic-list';

const ADD_BUTTON =
  'pressable cta shadow-cta inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const STRUCTURE = [
  ['category', 'Kategorie'],
  ['catalog', 'Katalogi'],
  ['tag', 'Tagi'],
] as const;

/** Day the period is anchored on: today while it is inside, else its start. */
const anchorOf = (period: Period, today: string): string =>
  containsDay(period, today) ? today : period.from;

const Screen = () => {
  const {
    today,
    kind,
    period,
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
    setPeriod,
    dismissNotice,
  } = useContext();
  const eyebrow = useOwnerEyebrow('Twoja');
  const { from, to } = period;
  const filtersKey = JSON.stringify(filters);
  const change = (next: Period) => {
    if (next.kind !== 'custom')
      setPeriod({ kind: next.kind, day: anchorOf(next, today) });
  };
  const { gesture, contentRef, go } = usePeriodSwipe({
    period,
    today,
    onChange: change,
    allowFuture: true,
  });
  const defaultDay = containsDay(period, today) ? today : from;

  useEffect(() => {
    load({ from, to, filters });
    // `filters` is tracked through its key: equal filters never reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, from, to, filtersKey]);

  const nothing = allTopics.length === 0 && catalogs.length === 0;

  return (
    <div
      data-e2e="knowledge:main"
      className="relative mx-auto flex w-full max-w-7xl flex-1 animate-view-enter flex-col overflow-x-clip motion-reduce:animate-none"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
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
        className="flex flex-1 flex-col gap-3 px-4 pb-24 pt-2 md:gap-4 md:px-8 md:pb-6 lg:px-10 xl:px-16"
      >
        <PeriodControl
          period={period}
          today={today}
          onChange={go}
          allowFuture
        />
        <div
          ref={contentRef}
          key={kind}
          className="flex flex-col gap-3 md:gap-4"
        >
          {error ? (
            <ErrorState
              data-e2e="knowledge:load-error"
              title="Nie udało się wczytać wiedzy"
              code={ERROR_CODES.load}
              description={error}
              onRetry={() => load({ from, to, filters })}
              backHref={APP_ROUTER.dashboard()}
            />
          ) : initializing || (isLoading && !loaded) ? (
            <ScreenSkeleton />
          ) : (
            <div className="flex flex-col gap-3 md:gap-4 xl:grid xl:grid-cols-12 xl:content-start">
              <div className="xl:col-span-5">
                <Hero />
              </div>
              <Card className="flex flex-col gap-4 xl:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">Tematy</h2>
                  <div className="flex flex-wrap gap-1">
                    {STRUCTURE.map(([entity, label]) => (
                      <Button
                        key={entity}
                        variant="ghost"
                        data-e2e={`knowledge:structure-open:${entity}`}
                        className="w-auto px-3 py-1.5 text-xs"
                        onClick={() => openModal(LIST_MODAL[entity])}
                      >
                        <Layers className="size-3.5" aria-hidden="true" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                {nothing && !isLoading ? (
                  <EmptyKnowledge />
                ) : topics.length === 0 ? (
                  <EmptyPeriod />
                ) : (
                  <TopicList
                    topics={topics}
                    scope={`${kind}:${from}:${filtersKey}`}
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
      <Modals defaultDay={defaultDay} />
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

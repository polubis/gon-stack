import { useEffect, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { cn } from '@repo/react-kit/cn';
import { ErrorState } from '@/shared/ui/error-state';
import { ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { FabRail } from '@/shared/navigation/overlay-nav/presentation/fab-rail';
import { APP_ROUTER } from '@/shared/router/routes';
import { Segmented, segmentedIds, Toggle } from '@/shared/ui/controls';
import { PeriodControl } from '@/shared/period-control/presentation/period-control';
import { usePeriodSwipe } from '@/shared/period-control/presentation/use-period-swipe';
import {
  containsDay,
  periodContaining,
  type Period,
} from '@/shared/period/period';
import { navigateTo } from '@/shared/router/navigation';
import {
  ERROR_CODES,
  TIME_KINDS,
  TIME_VIEWS,
  VIEW_PARAM,
} from '../configuration/constraints';
import type { TimeE2eId } from '../configuration/e2e-ids';
import type { TimeKind } from '../domain/models';
import { UnreadLink } from '@/modules/notifications/presentation/unread-link';
import { rangeOf } from '../domain/schedule';
import { AddMenu } from './add-menu';
import { BacklogButton } from './backlog-button';
import { Provider, useContext } from './context';
import { StatsSkeleton, ViewSkeleton } from './skeleton';
import { Stats } from './stats';
import { TaskModals } from './task-modals';

type Props = {
  kind: TimeKind;
  children: ReactNode;
};

const VIEWS_PANEL = 'time-views';

const ADD_BUTTON =
  'pressable cta shadow-cta inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

/** Day the period is anchored on: today while it is inside, else its start. */
const anchorOf = (period: Period, today: string): string =>
  containsDay(period, today) ? today : period.from;

/** Moves to a period: same kind keeps the route, another kind switches it. */
const usePeriodChange = (kind: TimeKind) => {
  const { setAnchor, now, view } = useContext();
  return (period: Period) => {
    const day = anchorOf(period, now.day);
    if (period.kind === kind) {
      setAnchor(day);
      return;
    }
    const target = TIME_KINDS.find((item) => item.kind === period.kind);
    // Another kind is another route: the tab travels in the URL.
    if (!target) return;
    const url = new URL(target.href(day), window.location.origin);
    if (view === 'stats') url.searchParams.set(VIEW_PARAM, 'stats');
    navigateTo(url.pathname + url.search);
  };
};

/** Shared period control; the route holds the kind, the store the anchor. */
const RangeControl = ({
  period,
  onChange,
}: {
  period: Period;
  onChange: (period: Period) => void;
}) => (
  <PeriodControl
    period={period}
    today={useContext().now.day}
    onChange={onChange}
    allowFuture
  />
);

const Screen = ({ kind, children }: Props) => {
  const {
    anchor,
    now,
    initializing,
    isLoading,
    loaded,
    error,
    notice,
    view,
    setView,
    openOnly,
    setOpenOnly,
    load,
    dismissNotice,
  } = useContext();
  const period = periodContaining(kind, anchor);
  const { gesture, contentRef, go } = usePeriodSwipe({
    period,
    today: now.day,
    onChange: usePeriodChange(kind),
    allowFuture: true,
  });
  const id: TimeE2eId = `time:${kind}`;
  const { from, to } = rangeOf(kind, anchor);
  const defaultDay =
    kind === 'day' ? anchor : now.day >= from && now.day <= to ? now.day : from;

  useEffect(() => {
    load(kind, from, to);
  }, [load, kind, from, to]);

  return (
    <div
      data-e2e={id}
      className="relative flex flex-1 animate-view-zoom flex-col overflow-x-clip motion-reduce:animate-none"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader
          title="Czas"
          eyebrow="Twój"
          action={
            <>
              <BacklogButton />
              <UnreadLink />
              <AddMenu
                side="bottom"
                data-e2e="time:add-trigger"
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
        className="flex flex-1 flex-col gap-4 px-4 pb-24 pt-2 md:gap-6 md:px-8 md:pb-6 lg:px-10 xl:px-16"
      >
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="mx-auto w-full max-w-sm" data-e2e="time:view-tabs">
            <Segmented
              label="Widok"
              options={TIME_VIEWS}
              panel={VIEWS_PANEL}
              value={view}
              onChange={setView}
            />
          </div>
          <RangeControl period={period} onChange={go} />
        </div>
        <div ref={contentRef} className="flex flex-col gap-4 md:gap-6">
          {error ? (
            <ErrorState
              data-e2e="time:load-error"
              title="Nie udało się wczytać zadań"
              code={ERROR_CODES.load}
              description={error}
              onRetry={() => load(kind, from, to)}
              backHref={APP_ROUTER.dashboard()}
            />
          ) : initializing || (isLoading && !loaded) ? (
            view === 'stats' ? (
              <StatsSkeleton />
            ) : (
              <ViewSkeleton kind={kind} />
            )
          ) : (
            <div
              key={`${kind}:${view}`}
              className="flex animate-view-enter flex-col gap-4 motion-reduce:animate-none md:gap-6"
            >
              <div
                role="tabpanel"
                id={segmentedIds(VIEWS_PANEL, view).panel}
                aria-labelledby={segmentedIds(VIEWS_PANEL, view).tab}
                className="flex flex-col gap-4 md:gap-6"
              >
                {view === 'stats' ? (
                  <Stats kind={kind} />
                ) : (
                  <>
                    <div
                      data-e2e="time:open-only"
                      className="flex items-center justify-between gap-3 px-1 md:justify-start md:px-0"
                    >
                      <span className="text-sm font-medium">
                        Tylko niezrobione
                      </span>
                      <Toggle
                        label="Tylko niezrobione"
                        data-e2e="time:open-only-toggle"
                        checked={openOnly}
                        onChange={setOpenOnly}
                      />
                    </div>
                    {children}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Zero-height rail in the layer above the nav (as in finance): the button
          floats over the content, which scrolls clear of it thanks to <main>
          bottom padding. */}
      <FabRail className="pointer-events-none relative bottom-4 h-0 md:hidden">
        <AddMenu
          side="top"
          aria-label="Dodaj"
          data-e2e="time:add-fab"
          className={cn(
            ADD_BUTTON,
            'pointer-events-auto absolute bottom-0 right-4 h-14 w-14 animate-pop-in rounded-full motion-reduce:animate-none',
          )}
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </AddMenu>
      </FabRail>
      <TaskModals defaultDay={defaultDay} />
      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="time:toast"
          notice={notice}
          onClose={dismissNotice}
        />
      ) : null}
    </div>
  );
};

/** Chrome shared by the four views: header, range control, store, toasts. */
export const TimeScreen = ({ kind, children }: Props) => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku Czas"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.dashboard()}
      />
    )}
  >
    <Provider>
      <Screen kind={kind}>{children}</Screen>
    </Provider>
  </ErrorBoundary>
);

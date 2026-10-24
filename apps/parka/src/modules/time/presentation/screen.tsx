import { useEffect, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { cn } from '@repo/react-kit/cn';
import { ErrorState } from '@/shared/ui/error-state';
import { ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { APP_ROUTER } from '@/shared/router/routes';
import { PeriodControl } from '@/shared/period-control/presentation/period-control';
import { usePeriodSwipe } from '@/shared/period-control/presentation/use-period-swipe';
import {
  containsDay,
  periodContaining,
  type Period,
} from '@/shared/period/period';
import { navigateTo } from '@/shared/router/navigation';
import { ERROR_CODES, TIME_KINDS } from '../configuration/constraints';
import type { TimeE2eId } from '../configuration/e2e-ids';
import type { TimeKind } from '../domain/models';
import { UnreadLink } from '@/modules/notifications/presentation/unread-link';
import { rangeOf } from '../domain/schedule';
import { AddMenu } from './add-menu';
import { BacklogButton } from './backlog-button';
import { Provider, useContext } from './context';
import { ViewSkeleton } from './skeleton';
import { TaskModals } from './task-modals';

type Props = {
  kind: TimeKind;
  children: ReactNode;
};

const ADD_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-on-brand transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

/** Day the period is anchored on: today while it is inside, else its start. */
const anchorOf = (period: Period, today: string): string =>
  containsDay(period, today) ? today : period.from;

/** Moves to a period: same kind keeps the route, another kind switches it. */
const usePeriodChange = (kind: TimeKind) => {
  const { setAnchor, now } = useContext();
  return (period: Period) => {
    const day = anchorOf(period, now.day);
    if (period.kind === kind) {
      setAnchor(day);
      return;
    }
    const target = TIME_KINDS.find((item) => item.kind === period.kind);
    if (target) navigateTo(target.href(day));
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
    load,
    dismissNotice,
  } = useContext();
  const period = periodContaining(kind, anchor);
  const { gesture, go } = usePeriodSwipe({
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
          titleClassName="text-2xl font-bold tracking-tight lg:text-3xl"
          action={
            <>
              <BacklogButton />
              <UnreadLink />
              <AddMenu
                side="bottom"
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
        <RangeControl period={period} onChange={go} />
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
          <ViewSkeleton kind={kind} />
        ) : (
          <div
            key={kind}
            className="flex animate-view-enter flex-col gap-4 motion-reduce:animate-none md:gap-6"
          >
            {children}
          </div>
        )}
      </main>
      {/* Zero-height sticky rail (as in finance): the button floats above the
          content, which scrolls clear of it thanks to <main> bottom padding. */}
      <div className="pointer-events-none sticky bottom-4 z-(--z-nav) h-0 md:hidden">
        <AddMenu
          side="top"
          aria-label="Dodaj"
          className={cn(
            ADD_BUTTON,
            'pointer-events-auto absolute bottom-0 right-4 h-14 w-14 animate-pop-in rounded-full shadow-popover motion-reduce:animate-none',
          )}
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </AddMenu>
      </div>
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

import { useEffect, type KeyboardEvent, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { cn } from '@repo/react-kit/cn';
import { ErrorState } from '@/shared/ui/error-state';
import { ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { APP_ROUTER } from '@/shared/router/routes';
import { periodContaining, shiftPeriod } from '@/shared/period/period';
import { ERROR_CODES, TIME_KINDS } from '../configuration/constraints';
import type { TimeE2eId } from '../configuration/e2e-ids';
import type { TimeKind } from '../domain/models';
import { periodTitle } from '../domain/period-title';
import { rangeOf } from '../domain/schedule';
import { AddMenu } from './add-menu';
import { Provider, useContext } from './context';
import { ViewSkeleton } from './skeleton';
import { TaskModals } from './task-modals';

type Props = {
  kind: TimeKind;
  children: ReactNode;
};

const ADD_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-on-brand transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const STEP_BUTTON =
  'grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line-strong bg-card text-ink transition-colors hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const OPTION =
  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** Arrow, Home and End keys move focus between the options of a list. */
const moveFocus = (e: KeyboardEvent<HTMLElement>) => {
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const items = [...e.currentTarget.querySelectorAll('a')];
  const at = items.indexOf(document.activeElement as HTMLAnchorElement);
  const target =
    e.key === 'Home'
      ? 0
      : e.key === 'End'
        ? items.length - 1
        : Math.min(
            items.length - 1,
            Math.max(0, at + (e.key === 'ArrowDown' ? 1 : -1)),
          );
  e.preventDefault();
  items[target]?.focus();
};

/** Focus lands on the current option, without scrolling the page. */
const focusCurrent = (e: Event) => {
  const current = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(
    '[aria-current="page"]',
  );
  if (!current) return;
  e.preventDefault();
  current.focus({ preventScroll: true });
};

/** Same layout as the finance `PeriodControl`: arrows, title, kind popover. */
const RangeControl = ({ kind }: { kind: TimeKind }) => {
  const { anchor, setAnchor, now } = useContext();
  const current = TIME_KINDS.find((item) => item.kind === kind);
  const step = (steps: number) =>
    setAnchor(shiftPeriod(periodContaining(kind, anchor), steps).from);
  return (
    <div
      role="group"
      aria-label="Zakres czasu"
      className="mx-auto flex w-full max-w-sm items-center gap-2 p-1"
    >
      <button
        type="button"
        aria-label="Poprzedni okres"
        data-e2e="time:prev"
        onClick={() => step(-1)}
        className={STEP_BUTTON}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="flex h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-card text-sm font-semibold">
        <span
          role="status"
          className="flex min-w-0 basis-3/4 items-center justify-center px-2 text-center leading-tight tabular-nums"
        >
          <span className="line-clamp-2">{periodTitle(kind, anchor)}</span>
        </span>
        <Popover.Root>
          <Popover.Trigger
            aria-label={`Zakres: ${current?.label}`}
            className="flex basis-1/4 items-center justify-center rounded-r-xl border-l border-line-strong transition-colors hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <CalendarRange
              className="h-5 w-5 text-ink-soft"
              aria-hidden="true"
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              onOpenAutoFocus={focusCurrent}
              align="end"
              sideOffset={4}
              collisionPadding={16}
              className="z-(--z-modal) w-44 rounded-xl border border-line-strong bg-card p-2 shadow-lg focus:outline-none"
            >
              <ul
                aria-label="Zakres"
                onKeyDown={moveFocus}
                className="space-y-1"
              >
                {TIME_KINDS.map((item) => (
                  <li key={item.kind}>
                    <Popover.Close asChild>
                      <a
                        href={item.href(anchor)}
                        aria-current={item.kind === kind ? 'page' : undefined}
                        className={cn(
                          OPTION,
                          item.kind === kind &&
                            'bg-brand-soft font-semibold text-brand',
                        )}
                      >
                        {item.label}
                        {item.kind === kind && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
                      </a>
                    </Popover.Close>
                  </li>
                ))}
              </ul>
              <Popover.Close asChild>
                <button
                  type="button"
                  data-e2e="time:today"
                  onClick={() => setAnchor(now.day)}
                  className={cn(OPTION, 'mt-1 border-t border-line pt-2')}
                >
                  Dziś
                </button>
              </Popover.Close>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <button
        type="button"
        aria-label="Następny okres"
        data-e2e="time:next"
        onClick={() => step(1)}
        className={STEP_BUTTON}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};

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
  const id: TimeE2eId = `time:${kind}`;
  const { from, to } = rangeOf(kind, anchor);
  const defaultDay =
    kind === 'day' ? anchor : now.day >= from && now.day <= to ? now.day : from;

  useEffect(() => {
    load(from, to);
  }, [load, from, to]);

  return (
    <div
      data-e2e={id}
      className="relative flex flex-1 animate-view-zoom flex-col motion-reduce:animate-none"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader
          title="Czas"
          action={
            <AddMenu
              side="bottom"
              className={cn(ADD_BUTTON, 'h-11 shrink-0 px-4 max-md:hidden')}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Dodaj
            </AddMenu>
          }
        />
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-24 pt-2 md:gap-6 md:px-8 md:pb-6 lg:px-10 xl:px-16">
        <RangeControl kind={kind} />
        {error ? (
          <ErrorState
            data-e2e="time:load-error"
            title="Nie udało się wczytać zadań"
            code={ERROR_CODES.load}
            description={error}
            onRetry={() => load(from, to)}
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

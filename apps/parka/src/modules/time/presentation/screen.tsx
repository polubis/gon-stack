import type { ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { cn } from '@repo/react-kit/cn';
import { Button } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { ScreenHeader } from '@/shared/ui/layout';
import { APP_ROUTER } from '@/shared/router/routes';
import {
  PERIOD_TITLES,
  TIME_KINDS,
  type TimeKind,
} from '../configuration/constraints';
import type { TimeE2eId } from '../configuration/e2e-ids';

type Props = {
  kind: TimeKind;
  children: ReactNode;
};

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

/**
 * Static twin of the finance `PeriodControl`: same layout and kind popover,
 * but the arrows do nothing and the kinds are plain links between views.
 */
const RangeControl = ({ kind }: { kind: TimeKind }) => {
  const current = TIME_KINDS.find((item) => item.kind === kind);
  return (
    <div
      role="group"
      aria-label="Zakres czasu"
      className="mx-auto flex w-full max-w-sm items-center gap-2 p-1"
    >
      <button
        type="button"
        aria-label="Poprzedni okres"
        className={STEP_BUTTON}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="flex h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-card text-sm font-semibold">
        <span
          role="status"
          className="flex min-w-0 basis-3/4 items-center justify-center px-2 text-center leading-tight tabular-nums"
        >
          <span className="line-clamp-2">{PERIOD_TITLES[kind]}</span>
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
                    <a
                      href={item.href}
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
                  </li>
                ))}
              </ul>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <button type="button" aria-label="Następny okres" className={STEP_BUTTON}>
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};

export const TimeScreen = ({ kind, children }: Props) => {
  const id: TimeE2eId = `time:${kind}`;
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <ErrorState
          title="Wystąpił błąd widoku Czas"
          code="TIME_RENDER"
          description={error.message}
          onRetry={reset}
          backHref={APP_ROUTER.dashboard()}
        />
      )}
    >
      <div
        data-e2e={id}
        className="relative flex flex-1 animate-view-zoom flex-col motion-reduce:animate-none"
      >
        <div className="md:px-4 lg:px-6 xl:px-12">
          <ScreenHeader
            title="Czas"
            action={
              <Button className="h-11 w-auto shrink-0 py-0 max-md:hidden">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Dodaj zadanie
              </Button>
            }
          />
        </div>
        <main className="flex flex-1 flex-col gap-4 px-4 pb-24 pt-2 md:gap-6 md:px-8 md:pb-6 lg:px-10 xl:px-16">
          <RangeControl kind={kind} />
          {children}
        </main>
        {/* Zero-height sticky rail (as in finance): the button floats above the
          content, which scrolls clear of it thanks to <main> bottom padding. */}
        <div className="pointer-events-none sticky bottom-4 z-(--z-nav) h-0 md:hidden">
          <Button
            aria-label="Dodaj zadanie"
            className="pointer-events-auto absolute bottom-0 right-4 h-14 w-14 animate-pop-in rounded-full p-0 shadow-popover motion-reduce:animate-none"
          >
            <Plus className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

import type { ReactNode } from 'react';
import { ListChecks } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Donut } from '@/shared/ui/charts';
import { ProgressBar } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Card } from '@/shared/ui/layout';
import { Ring } from '@/shared/ui/ring';
import { dayLabel } from '@/shared/date/date';
import type { TimeKind } from '../domain/models';
import type { PriorityLevel } from '../domain/priority';
import { taskStats, type Bucket, type TaskStats } from '../domain/stats';
import { useContext } from './context';
import { TaskKey } from './task-key';

const PRIORITY_NAMES: Record<PriorityLevel, string> = {
  high: 'Wysoki',
  medium: 'Średni',
  low: 'Niski',
};

const PRIORITY_TONE: Record<PriorityLevel, 'danger' | 'warn' | 'brand'> = {
  high: 'danger',
  medium: 'warn',
  low: 'brand',
};

const decimal = (value: number): string =>
  value.toLocaleString('pl-PL', { maximumFractionDigits: 1 });

const Stat = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col items-center gap-0.5 px-2">
    <dt className="flex min-h-8 items-end text-center text-xs text-on-hero-soft">
      {label}
    </dt>
    <dd className="text-sm font-semibold tabular-nums md:text-base">
      {children}
    </dd>
  </div>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-baseline justify-between gap-3 py-2 text-sm">
    <dt className="text-ink-soft">{label}</dt>
    <dd className="text-right font-medium tabular-nums">{children}</dd>
  </div>
);

const Hero = ({ stats }: { stats: TaskStats }) => (
  <div
    data-e2e="time:summary"
    className="hero-card flex flex-col justify-center gap-5 rounded-4xl p-5 shadow-popover md:p-7 xl:-order-2 xl:col-span-6 xl:h-full"
  >
    <div className="flex items-center gap-5">
      <Ring
        surface="hero"
        pct={stats.completion}
        label={`Zrealizowano ${stats.completion}% zadań (${stats.done} z ${stats.total})`}
        className="size-28 md:size-32"
      >
        <span
          data-e2e="time:stats-completion"
          className="text-2xl tracking-tight md:text-3xl"
        >
          {stats.completion}%
        </span>
      </Ring>
      <div className="min-w-0">
        <p className="text-sm text-on-hero-soft">Zrealizowane zadania</p>
        <p className="animate-rise text-4xl font-semibold tracking-tight tabular-nums motion-reduce:animate-none md:text-5xl">
          {stats.done} z {stats.total}
        </p>
      </div>
    </div>
    <dl className="grid grid-cols-3 divide-x divide-hero-line border-t border-hero-line pt-4">
      <Stat label="Wszystkie">
        <span data-e2e="time:stats-total">{stats.total}</span>
      </Stat>
      <Stat label="Średnio dziennie">
        <span data-e2e="time:stats-per-day">{decimal(stats.perDay)}</span>
      </Stat>
      <Stat label="Po terminie">
        <span
          data-e2e="time:stats-overdue"
          className={cn(stats.overdue > 0 && 'text-hero-danger')}
        >
          {stats.overdue}
        </span>
      </Stat>
    </dl>
  </div>
);

const StatusCard = ({ stats }: { stats: TaskStats }) => (
  <Card
    data-e2e="time:stats-status"
    className="space-y-4 xl:-order-1 xl:col-span-6"
  >
    <h2 className="flex min-h-9 items-center text-base font-semibold">
      Status
    </h2>
    <Donut
      caption="Podział zadań wg statusu"
      format={(value) => String(value)}
      slices={[
        { label: 'Zrobione', value: stats.done, color: 'var(--brand)' },
        { label: 'W trakcie', value: stats.inProgress, color: 'var(--warn)' },
        {
          label: 'Do zrobienia',
          value: stats.open,
          color: 'var(--track-strong)',
        },
      ]}
    />
  </Card>
);

const CategoriesCard = ({ stats }: { stats: TaskStats }) => (
  <Card data-e2e="time:stats" className="space-y-4 xl:col-span-6">
    <h2 className="flex min-h-9 items-center text-base font-semibold">
      Kategorie
    </h2>
    <Donut
      caption="Podział zadań wg kategorii"
      format={(value) => String(value)}
      slices={stats.byCategory.map((c) => ({
        label: c.name,
        value: c.count,
        color: c.color,
      }))}
    />
  </Card>
);

const PrioritiesCard = ({ stats }: { stats: TaskStats }) => (
  <Card className="space-y-4 xl:col-span-6">
    <h2 className="flex min-h-9 items-center text-base font-semibold">
      Priorytety
    </h2>
    <ul className="space-y-4">
      {stats.byPriority.map((entry) => (
        <li key={entry.level} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-ink-soft">{PRIORITY_NAMES[entry.level]}</span>
            <span className="font-medium tabular-nums">
              {entry.done} z {entry.count}
            </span>
          </div>
          <ProgressBar
            pct={entry.count === 0 ? 0 : (entry.done / entry.count) * 100}
            tone={PRIORITY_TONE[entry.level]}
            label={`Priorytet ${PRIORITY_NAMES[entry.level].toLowerCase()}: zrobione ${entry.done} z ${entry.count}`}
          />
        </li>
      ))}
    </ul>
  </Card>
);

const percentOf = (value: number, top: number): number => (value / top) * 100;

/** Bars of the tasks per bucket, the done part drawn over the rest. */
const Chart = ({ buckets, title }: { buckets: Bucket[]; title: string }) => {
  const top = Math.max(1, ...buckets.map((b) => b.total));
  const crowded = buckets.length > 12;
  return (
    <figure className="m-0">
      <figcaption className="sr-only">{title}</figcaption>
      <div className="flex gap-2">
        <ul
          aria-hidden="true"
          className="flex h-48 w-6 shrink-0 flex-col-reverse justify-between text-right text-xs leading-3 text-ink-soft md:h-56"
        >
          {[0, top].map((tick) => (
            <li key={tick}>{tick}</li>
          ))}
        </ul>
        <div className="min-w-0 flex-1">
          <div className="relative flex h-48 items-end gap-px border-b border-t border-line md:h-56">
            {buckets.map((b) => (
              <div
                key={b.key}
                tabIndex={0}
                role="img"
                aria-label={`${b.title}: zrobione ${b.done} z ${b.total}`}
                className="group relative flex h-full flex-1 items-end rounded-t-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <div
                  className={cn(
                    'relative flex w-full items-end overflow-hidden rounded-t-sm bg-brand/25',
                    b.total > 0 && 'min-h-0.5',
                    !crowded && 'mx-auto max-w-10',
                  )}
                  style={{ height: `${percentOf(b.total, top)}%` }}
                >
                  <div
                    className="w-full bg-brand"
                    style={{ height: `${percentOf(b.done, b.total || 1)}%` }}
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-full left-1/2 z-(--z-tooltip) mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-card px-2 py-1 text-xs shadow-popover group-focus-within:block group-hover:block"
                >
                  <span className="block text-ink-soft">{b.title}</span>
                  <span className="font-semibold">
                    {b.done} z {b.total}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <ul
            aria-hidden="true"
            className="mt-1 flex gap-px text-xs text-ink-soft"
          >
            {buckets.map((b, index) => (
              <li
                key={b.key}
                className={cn(
                  'relative h-4 min-w-0 flex-1',
                  crowded &&
                    index !== 0 &&
                    (index + 1) % 5 !== 0 &&
                    'invisible',
                )}
              >
                {/* Centred on its bar, never clipped by a narrow column. */}
                <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {b.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
};

const Legend = () => (
  <ul className="flex flex-col gap-1 text-xs text-ink-soft md:flex-row md:items-center md:gap-4">
    <li className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
      Zrobione
    </li>
    <li className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-brand/25" aria-hidden="true" />
      Wszystkie
    </li>
  </ul>
);

const ActivityCard = ({
  stats,
  kind,
}: {
  stats: TaskStats;
  kind: TimeKind;
}) => {
  const title = kind === 'day' ? 'Zadania wg godziny' : 'Zadania w czasie';
  return (
    <Card className="space-y-4 xl:col-span-12">
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <Legend />
      </div>
      <Chart buckets={stats.buckets} title={title} />
    </Card>
  );
};

const ActiveCard = ({ stats }: { stats: TaskStats }) => (
  <Card
    as="section"
    aria-labelledby="stats-active"
    className="space-y-4 xl:col-span-6"
  >
    <h2
      id="stats-active"
      className="flex min-h-9 items-center text-base font-semibold"
    >
      W trakcie
    </h2>
    {stats.active.length === 0 ? (
      <EmptyState
        variant="card"
        data-e2e="time:stats-active-empty"
        className="min-h-40"
        icon={ListChecks}
        title="Nic nie jest w toku"
        description="Oznacz zadanie jako w trakcie, a pojawi się tutaj."
      />
    ) : (
      <ul data-e2e="time:stats-active" className="flex flex-col gap-2">
        {stats.active.map((task) => (
          <li key={task.id} className="flex items-baseline gap-2 text-sm">
            <TaskKey taskKey={task.key} />
            <span className="min-w-0 flex-1 truncate font-medium">
              {task.title}
            </span>
            <span className="shrink-0 text-xs text-ink-soft tabular-nums">
              {dayLabel(task.day, 'short', false)}
              {task.at ? `, ${task.at}` : ''}
            </span>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

const DetailsCard = ({ stats }: { stats: TaskStats }) => (
  <Card className="space-y-2 xl:col-span-6">
    <h2 className="flex min-h-9 items-center text-base font-semibold">
      Szczegóły
    </h2>
    <dl className="divide-y divide-line">
      <Row label="Z godziną">{stats.timed}</Row>
      <Row label="Cały dzień">{stats.allDay}</Row>
      <Row label="Cykliczne">{stats.recurring}</Row>
      {stats.busiest ? (
        <Row label="Najbardziej obciążony dzień">
          {dayLabel(stats.busiest.day, 'long', false)} ({stats.busiest.count})
        </Row>
      ) : null}
      <Row label="W backlogu">
        <span data-e2e="time:stats-backlog">{stats.backlog}</span>
      </Row>
    </dl>
  </Card>
);

const useStats = (kind: TimeKind): TaskStats => {
  const { tasks, backlog, categories, priorities, now, anchor } = useContext();
  return taskStats({
    tasks,
    backlog,
    categories,
    priorities,
    kind,
    anchor,
    today: now.day,
  });
};

/** Number of tasks in the period; the stats sections show only with some. */
export const usePeriodTotal = (kind: TimeKind): number => useStats(kind).total;

/** First section of the screen: completion of the period. */
export const Summary = ({ kind }: { kind: TimeKind }) => {
  const stats = useStats(kind);
  if (stats.total === 0) return null;
  return <Hero stats={stats} />;
};

/**
 * Last section of the screen: all statistics cards, below the tasks. On xl the
 * status card moves up beside the summary through `order`.
 */
export const Insights = ({ kind }: { kind: TimeKind }) => {
  const stats = useStats(kind);
  if (stats.total === 0) return null;
  return (
    <>
      <StatusCard stats={stats} />
      <CategoriesCard stats={stats} />
      <PrioritiesCard stats={stats} />
      {stats.buckets.some((b) => b.total > 0) ? (
        <ActivityCard stats={stats} kind={kind} />
      ) : null}
      <ActiveCard stats={stats} />
      <DetailsCard stats={stats} />
    </>
  );
};

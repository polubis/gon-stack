import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import type { TimeKind } from '../domain/models';
import { monthGrid } from '../domain/schedule';

/** Rows of the task list placeholder: a typical busy day. */
const TASK_ROWS = 8;

const range = (length: number) => Array.from({ length }, (_, i) => i);

const TaskRows = () => (
  <ul className="flex flex-col">
    {range(TASK_ROWS).map((i) => (
      <li key={i} className="flex h-14.5 items-center gap-3 p-2">
        <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </span>
        <Skeleton className="h-3 w-10 shrink-0" />
      </li>
    ))}
  </ul>
);

/** Same rows as the loaded calendar: weekday heads, then the cells of the month. */
const Month = ({ anchor }: { anchor: string }) => {
  const { leadingBlanks, days } = monthGrid(anchor);
  const cells = Math.ceil((leadingBlanks + days.length) / 7) * 7;
  return (
    <Card>
      <ul className="grid grid-cols-7 gap-1 md:gap-2">
        {range(7).map((i) => (
          <li key={i} className="flex h-4 justify-center">
            <Skeleton className="h-3 w-6" />
          </li>
        ))}
      </ul>
      <ul className="mt-1 grid grid-cols-7 gap-1 md:mt-2 md:gap-2">
        {range(cells).map((i) => (
          <li key={i}>
            <Skeleton className="min-h-14 md:min-h-24" />
          </li>
        ))}
      </ul>
    </Card>
  );
};

const Year = () => (
  <ul className="grid gap-2 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
    {range(12).map((i) => (
      <Card as="li" key={i} className="flex flex-col gap-2">
        <span className="flex h-6 items-center">
          <Skeleton className="h-4 w-1/2" />
        </span>
        <Skeleton className="h-2 w-full rounded-full" />
      </Card>
    ))}
  </ul>
);

/** Card heading row, as tall as the loaded `h2`. */
const Heading = ({ width }: { width: string }) => (
  <span className="flex min-h-9 items-center">
    <Skeleton className={cn('h-5', width)} />
  </span>
);

/** Donut beside its legend, as in the loaded charts. */
const DonutRows = () => (
  <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
    <Skeleton className="size-36 shrink-0 rounded-full" />
    <div className="w-full min-w-0 space-y-1.5 sm:flex-1">
      {range(3).map((i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>
  </div>
);

/** Grid span of the tasks: a day list sits beside the stats, wide views take the row. */
export const tasksSpan = (kind: TimeKind, total: number): string =>
  kind === 'day' && total > 0 ? 'xl:col-span-6' : 'xl:col-span-12';

/** Mimics the layout of the view being loaded. */
const ViewSkeleton = ({ kind, anchor }: { kind: TimeKind; anchor: string }) => (
  <div
    data-e2e="time:skeleton"
    aria-hidden="true"
    className={tasksSpan(kind, 1)}
  >
    {kind === 'month' ? (
      <Month anchor={anchor} />
    ) : kind === 'year' ? (
      <Year />
    ) : (
      <Card>
        <Skeleton className="mb-3 h-5 w-32" />
        <TaskRows />
      </Card>
    )}
  </div>
);

/** Mimics the summary section: completion hero. */
const SummarySkeleton = () => (
  <div
    data-e2e="time:stats-skeleton"
    aria-hidden="true"
    className="hero-card flex flex-col justify-center gap-5 rounded-4xl p-5 md:p-7 xl:-order-2 xl:col-span-6 xl:h-full"
  >
    <div className="flex items-center gap-5">
      <Skeleton className="size-28 shrink-0 rounded-full bg-hero-track md:size-32" />
      <div className="flex min-w-0 flex-col gap-1">
        <Skeleton className="h-4 w-32 bg-hero-track" />
        <Skeleton className="h-10 w-24 bg-hero-track md:h-12" />
      </div>
    </div>
    <div className="grid grid-cols-3 divide-x divide-hero-line border-t border-hero-line pt-4">
      {range(3).map((i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 px-2">
          <Skeleton className="h-8 w-full bg-hero-track" />
          <Skeleton className="h-5 w-8 bg-hero-track md:h-6" />
        </div>
      ))}
    </div>
  </div>
);

/** Mimics the statistics cards below the tasks: same order, spans and heights. */
const InsightsSkeleton = () => (
  <>
    <Card aria-hidden="true" className="space-y-4 xl:-order-1 xl:col-span-6">
      <Heading width="w-20" />
      <DonutRows />
    </Card>
    <Card aria-hidden="true" className="space-y-4 xl:col-span-6">
      <Heading width="w-24" />
      <DonutRows />
    </Card>
    <Card aria-hidden="true" className="space-y-4 xl:col-span-6">
      <Heading width="w-24" />
      <ul className="space-y-4">
        {range(3).map((i) => (
          <li key={i} className="space-y-1.5">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </li>
        ))}
      </ul>
    </Card>
    <Card aria-hidden="true" className="space-y-4 xl:col-span-12">
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-6 w-40" />
        <div className="flex flex-col gap-1 md:flex-row md:gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div>
        <Skeleton className="h-48 md:h-56" />
        <Skeleton className="mt-1 h-4 w-full" />
      </div>
    </Card>
    <Card aria-hidden="true" className="space-y-4 xl:col-span-6">
      <Heading width="w-24" />
      <Skeleton className="h-40 w-full" />
    </Card>
    <Card aria-hidden="true" className="space-y-2 xl:col-span-6">
      <Heading width="w-24" />
      <div className="space-y-px">
        {range(4).map((i) => (
          <span key={i} className="flex h-9 items-center">
            <Skeleton className="h-5 w-full" />
          </span>
        ))}
      </div>
    </Card>
  </>
);

/** The whole screen as placeholders, in the order and grid of the loaded one. */
export const ScreenSkeleton = ({
  kind,
  anchor,
}: {
  kind: TimeKind;
  anchor: string;
}) => (
  <>
    <SummarySkeleton />
    <ViewSkeleton kind={kind} anchor={anchor} />
    <InsightsSkeleton />
  </>
);

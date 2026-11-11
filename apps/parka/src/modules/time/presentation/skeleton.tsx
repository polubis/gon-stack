import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { SKELETON_ROWS } from '../configuration/constraints';
import type { TimeKind } from '../domain/models';

const rows = Array.from({ length: SKELETON_ROWS }, (_, i) => i);

const TaskRows = () => (
  <ul className="flex flex-col">
    {rows.map((i) => (
      <li key={i} className="flex items-center gap-3 p-2">
        <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-3 w-10 shrink-0" />
      </li>
    ))}
  </ul>
);

const Month = () => (
  <Card className="p-2 md:p-4">
    <ul className="grid grid-cols-7 gap-1 md:gap-2">
      {Array.from({ length: 35 }, (_, i) => (
        <li key={i}>
          <Skeleton className="min-h-14 md:min-h-24" />
        </li>
      ))}
    </ul>
  </Card>
);

const Year = () => (
  <ul className="grid gap-2 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 12 }, (_, i) => (
      <Card as="li" key={i} className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-2 w-full rounded-full" />
      </Card>
    ))}
  </ul>
);

/** Mimics the layout of the view being loaded. */
export const ViewSkeleton = ({ kind }: { kind: TimeKind }) => (
  <div data-e2e="time:skeleton" aria-hidden="true">
    {kind === 'month' ? (
      <Month />
    ) : kind === 'year' ? (
      <Year />
    ) : (
      <Card className="mx-auto w-full max-w-3xl p-2 md:p-4">
        <Skeleton className="mx-2 mb-3 h-4 w-32" />
        <TaskRows />
      </Card>
    )}
  </div>
);

const StatsCard = ({ className }: { className?: string }) => (
  <Card className={className}>
    <Skeleton className="mb-4 h-4 w-28" />
    <Skeleton className="h-40 w-full" />
  </Card>
);

/** Mimics the statistics dashboard: hero, status, categories, priorities, chart. */
export const StatsSkeleton = () => (
  <div
    data-e2e="time:stats-skeleton"
    aria-hidden="true"
    className="flex flex-col gap-3 md:gap-4 xl:grid xl:grid-cols-12"
  >
    <div className="hero-card flex flex-col gap-5 rounded-4xl p-5 md:p-7 xl:col-span-6">
      <div className="flex items-center gap-5">
        <Skeleton className="size-28 shrink-0 rounded-full bg-hero-track md:size-32" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32 bg-hero-track" />
          <Skeleton className="h-10 w-24 bg-hero-track" />
        </div>
      </div>
      <Skeleton className="h-12 w-full bg-hero-track" />
    </div>
    <StatsCard className="xl:col-span-6" />
    <StatsCard className="xl:col-span-6" />
    <StatsCard className="xl:col-span-6" />
    <StatsCard className="xl:col-span-12" />
  </div>
);

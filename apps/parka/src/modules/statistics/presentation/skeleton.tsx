import { Card, Skeleton } from '@/shared/ui';

/** Mirrors the spending tab: range chips, total + chart, donut card. */
export const StatisticsSkeleton = () => (
  <div
    className="flex flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-3 lg:items-start"
    aria-hidden="true"
  >
    <div className="flex gap-1 lg:col-span-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
      ))}
    </div>
    <Card className="space-y-3 lg:col-span-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-37 w-full" />
    </Card>
    <Card className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-36 w-full" />
    </Card>
  </div>
);

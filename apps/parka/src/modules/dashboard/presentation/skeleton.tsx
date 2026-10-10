import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';

const LIST_ROWS = 8;

const Rows = ({ count, className }: { count: number; className: string }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className={className} />
    ))}
  </>
);

/**
 * The whole dashboard as placeholders: shown until everything is loaded.
 * Mirrors the loaded layout section by section (same paddings, row heights
 * and breakpoints), so nothing jumps when the data arrives.
 */
export const DashboardSkeleton = () => (
  <>
    <div
      className="xl:col-span-6 xl:col-start-1 xl:row-start-2"
      aria-hidden="true"
    >
      <Card className="flex flex-col items-center gap-1 py-6 xl:h-full xl:justify-center">
        <Skeleton className="h-4 w-40 md:h-5" />
        <Skeleton className="h-10 w-56 md:h-12" />
        <Skeleton className="h-5 w-24 md:h-6" />
        <div className="mt-4 grid w-full max-w-md grid-cols-3 divide-x divide-line border-t border-line pt-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 px-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton
                className={i === 2 ? 'h-8.5 w-12 md:h-9.5' : 'h-5 w-12 md:h-6'}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>

    <Card
      className="space-y-4 xl:col-span-12 xl:row-start-3"
      aria-hidden="true"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div>
        <Skeleton className="h-48 w-full md:h-56" />
        <Skeleton className="mt-1 h-4 w-full" />
      </div>
    </Card>

    <Card
      className="space-y-4 xl:col-span-6 xl:col-start-7 xl:row-start-2"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-8.5 w-24 rounded-xl" />
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Skeleton className="h-40 w-40 shrink-0 rounded-full" />
        <div className="h-48 w-full min-w-0 flex-1 space-y-1.5">
          <Rows count={6} className="h-5 w-full" />
        </div>
      </div>
    </Card>

    <Card className="space-y-3 xl:col-span-8" aria-hidden="true">
      <div className="flex items-baseline justify-between gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="ml-auto hidden h-8.5 w-36 rounded-xl md:block" />
      </div>
      <div className="flex gap-2 pb-1">
        <Rows count={3} className="h-8.5 w-24 shrink-0 rounded-full" />
      </div>
      <ul className="divide-y divide-line">
        {Array.from({ length: LIST_ROWS }, (_, i) => (
          <li key={i} className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <span className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </span>
            <Skeleton className="h-4 w-16" />
          </li>
        ))}
      </ul>
    </Card>

    <Card
      className="flex h-112 flex-col gap-4 md:h-128 xl:col-span-4 xl:h-0 xl:min-h-full"
      aria-hidden="true"
    >
      <Skeleton className="h-6 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Rows count={2} className="h-20 w-full rounded-xl" />
    </Card>
  </>
);

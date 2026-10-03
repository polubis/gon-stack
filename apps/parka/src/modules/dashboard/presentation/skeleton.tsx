import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';

const LIST_ROWS = 8;
const RECURRING_ROWS = 4;

const Rows = ({ count, className }: { count: number; className: string }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className={className} />
    ))}
  </>
);

/**
 * The whole dashboard as placeholders: shown until everything is loaded.
 * Mirrors the loaded layout section by section, so nothing jumps.
 */
export const DashboardSkeleton = () => (
  <>
    <div className="xl:col-span-12" aria-hidden="true">
      <Card className="flex flex-col items-center gap-2 py-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-56 md:h-14" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-52" />
      </Card>
    </div>

    <Card className="space-y-4 xl:col-span-8" aria-hidden="true">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-48 w-full md:h-56" />
      <Skeleton className="h-4 w-full" />
    </Card>

    <Card className="space-y-4 xl:col-span-4" aria-hidden="true">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-40 w-full" />
    </Card>

    <Card className="space-y-3 xl:col-span-12" aria-hidden="true">
      <div className="flex items-baseline justify-between gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
      <ul className="divide-y divide-line">
        {Array.from({ length: LIST_ROWS }, (_, i) => (
          <li key={i} className="flex items-center gap-3 py-2">
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
      className="flex h-112 flex-col gap-4 md:h-128 xl:col-span-4"
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

    <Card
      className="flex h-112 flex-col gap-4 md:h-128 xl:col-span-4"
      aria-hidden="true"
    >
      <Skeleton className="h-6 w-32" />
      <Rows count={3} className="h-20 w-full rounded-xl" />
    </Card>

    <Card
      className="flex h-112 flex-col gap-4 md:h-128 xl:col-span-4"
      aria-hidden="true"
    >
      <Skeleton className="h-6 w-40" />
      <ul className="space-y-2">
        {Array.from({ length: RECURRING_ROWS }, (_, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-xl border border-line p-3"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <span className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </span>
            <Skeleton className="h-6 w-11 rounded-full" />
          </li>
        ))}
      </ul>
    </Card>
  </>
);

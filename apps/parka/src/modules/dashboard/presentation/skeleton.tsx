import { cn } from '@repo/react-kit/cn';
import {
  EXPENSES_LIST_HEIGHT,
  MAX_VISIBLE_EXPENSES,
} from '../configuration/constraints';
import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';

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
      className="xl:col-span-6 xl:col-start-1 xl:row-start-1"
      aria-hidden="true"
    >
      <div className="hero-card flex flex-col gap-5 rounded-4xl p-5 md:p-7 xl:h-full xl:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex min-h-7 items-center">
            <Skeleton className="h-4 w-40 bg-hero-track" />
          </div>
          <Skeleton className="h-12 w-56 bg-hero-track md:h-15" />
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Skeleton className="size-22 rounded-full bg-hero-track md:size-28" />
          <div className="min-w-0 flex-1 divide-y divide-hero-line">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <Skeleton className="h-4 w-24 bg-hero-track md:h-5" />
                <Skeleton className="h-5 w-16 bg-hero-track md:h-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <Card
      className="space-y-4 xl:col-span-6 xl:col-start-1 xl:row-start-2"
      aria-hidden="true"
    >
      <div className="flex items-baseline justify-between gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="h-10">
        <div className="flex gap-2 pb-1">
          <Rows count={3} className="h-8.5 w-24 shrink-0 rounded-full" />
        </div>
      </div>
      <ul
        className={cn(
          'divide-y divide-line overflow-hidden pr-2',
          EXPENSES_LIST_HEIGHT,
        )}
      >
        {Array.from({ length: MAX_VISIBLE_EXPENSES }, (_, i) => (
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
      className="space-y-4 xl:col-span-6 xl:col-start-7 xl:row-start-1"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-8.5 w-24 rounded-xl" />
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Skeleton className="h-40 w-40 shrink-0 rounded-full" />
        <div className="w-full min-w-0 space-y-1.5 sm:flex-1">
          <Rows count={3} className="h-5 w-full" />
        </div>
      </div>
    </Card>

    <Card
      className="flex h-112 flex-col gap-4 md:h-96 xl:col-span-6 xl:col-start-7 xl:row-start-2 xl:h-0 xl:min-h-full"
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
      className="space-y-4 xl:col-span-12 xl:row-start-3"
      aria-hidden="true"
    >
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-6 w-40" />
        <div className="flex flex-col gap-1 md:flex-row md:gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div>
        <Skeleton className="h-48 w-full md:h-56" />
        <Skeleton className="mt-1 h-4 w-full" />
      </div>
    </Card>
  </>
);

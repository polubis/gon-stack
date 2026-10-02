import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';

/** Mirrors the total-limit card: amount, bar, spent line, action button. */
export const LimitsSkeleton = () => (
  <Card
    className="space-y-3 md:max-w-2xl md:space-y-4 md:p-6"
    aria-hidden="true"
  >
    <div className="space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-32" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-11 w-full rounded-xl" />
  </Card>
);

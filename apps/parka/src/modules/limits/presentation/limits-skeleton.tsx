import { Card, Skeleton } from '@/shared/ui';

/** Mirrors the total-limit card: amount, bar, spent line, action button. */
export const LimitsSkeleton = () => (
  <Card className="space-y-3" aria-hidden="true">
    <div className="space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-32" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-11 w-full rounded-xl" />
  </Card>
);

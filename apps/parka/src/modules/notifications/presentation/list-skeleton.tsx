import { Card, Skeleton } from '@/shared/ui';

const ROWS = 4;

const RowSkeleton = () => (
  <Card as="li" className="flex items-start gap-3">
    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
    <span className="flex flex-1 flex-col gap-1.5">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </span>
    <Skeleton className="h-3 w-16" />
  </Card>
);

/** Mirrors the notification list: icon + two lines + age. */
export const ListSkeleton = () => (
  <ul className="space-y-2" aria-hidden="true">
    {Array.from({ length: ROWS }, (_, i) => (
      <RowSkeleton key={i} />
    ))}
  </ul>
);

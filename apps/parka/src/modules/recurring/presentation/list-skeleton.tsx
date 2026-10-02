import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';

const ROWS = 3;

/** Mirrors the recurring rows: avatar, two text lines, toggle. */
export const ListSkeleton = () => (
  <ul
    className="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3"
    aria-hidden="true"
  >
    {Array.from({ length: ROWS }, (_, i) => (
      <Card as="li" key={i} className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <span className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </span>
        <Skeleton className="h-6 w-11 rounded-full" />
      </Card>
    ))}
  </ul>
);

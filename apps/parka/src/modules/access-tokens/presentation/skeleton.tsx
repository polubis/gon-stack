import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';

const ROWS = 2;

/** Mirrors the endpoint card and the token cards. */
export const ListSkeleton = () => (
  <div className="flex flex-col gap-4" aria-hidden="true">
    <Card className="space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </Card>
    <ul className="flex flex-col gap-3">
      {Array.from({ length: ROWS }, (_, i) => (
        <li key={i}>
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  </div>
);

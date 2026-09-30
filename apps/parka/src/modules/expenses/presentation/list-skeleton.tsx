import { Skeleton } from '@/shared/ui';
import { Card } from './layout';

const ROWS = 3;

const RowSkeleton = () => (
  <li className="flex items-center gap-3 px-2 py-2">
    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
    <span className="flex flex-1 flex-col gap-1.5">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </span>
    <Skeleton className="h-4 w-16" />
  </li>
);

/** Mirrors a month group: heading line + card with rows. */
export const ListSkeleton = () => (
  <div
    className="grid gap-4 md:gap-6 lg:grid-cols-2 lg:items-start"
    aria-hidden="true"
  >
    {[0, 1].map((group) => (
      <section key={group}>
        <div className="mb-1 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Card className="p-2">
          <ul>
            {Array.from({ length: ROWS }, (_, i) => (
              <RowSkeleton key={i} />
            ))}
          </ul>
        </Card>
      </section>
    ))}
  </div>
);

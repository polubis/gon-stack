import type { ComponentProps } from 'react';
import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';

const DIFF_ROWS = 3;

/** Mirrors `NotificationRow`: icon + dot, title and body, time, diff block, action. */
const CardSkeleton = () => (
  <Card as="li" className="flex min-w-0 flex-col gap-1">
    <div className="flex items-start gap-3">
      <span className="relative shrink-0">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </span>
      <Skeleton className="h-3 w-14 shrink-0" />
    </div>
    <div className="mt-2 flex flex-col gap-2 rounded-xl bg-surface p-3">
      {Array.from({ length: DIFF_ROWS }, (_, i) => (
        <span key={i} className="flex gap-3">
          <Skeleton className="h-3 w-16 shrink-0 sm:w-28" />
          <Skeleton className="h-3 flex-1" />
        </span>
      ))}
    </div>
    <div className="flex justify-end pt-1">
      <Skeleton className="h-6 w-40" />
    </div>
  </Card>
);

type Props = ComponentProps<'ul'> & { count: number };

/** Card-shaped placeholders: the first load (a screenful) or the next page (a few). */
export const ListSkeleton = ({ count, ...rest }: Props) => (
  <ul
    className="grid grid-cols-1 gap-2 md:gap-4 lg:grid-cols-2"
    aria-hidden="true"
    {...rest}
  >
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </ul>
);

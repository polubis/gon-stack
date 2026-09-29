import { Skeleton } from '@/shared/ui';

const ROWS = 4;

/** Mirrors the category list card. */
export const ListSkeleton = () => (
  <ul
    className="overflow-hidden rounded-2xl border border-line bg-card"
    aria-hidden="true"
  >
    {Array.from({ length: ROWS }, (_, i) => (
      <li
        key={i}
        className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0"
      >
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-1/3" />
      </li>
    ))}
  </ul>
);

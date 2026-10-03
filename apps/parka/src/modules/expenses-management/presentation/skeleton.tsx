import { Skeleton } from '@/shared/ui/skeleton';

/** Mimics the page while categories load: tabs, upload buttons, form card. */
export const PageSkeleton = () => (
  <div role="status" className="space-y-4">
    <span className="sr-only">Ładowanie formularza…</span>
    <Skeleton className="h-11 w-full" />
    <div className="grid grid-cols-2 gap-2 md:max-w-md">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
    <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-96 w-full lg:col-span-2" />
    </div>
  </div>
);

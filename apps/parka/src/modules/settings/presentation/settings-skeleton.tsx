import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { LINKS, NOTIFICATION_OPTIONS } from '../configuration/constraints';

/** Mirrors profile card, notifications card and links list. */
export const SettingsSkeleton = () => (
  <div
    className="flex flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-3"
    aria-hidden="true"
  >
    <Card className="flex items-center gap-3 lg:col-span-2">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <span className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </span>
    </Card>
    <Card className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-full" />
    </Card>
    <Card className="space-y-3 lg:col-span-2">
      <Skeleton className="h-4 w-32" />
      {NOTIFICATION_OPTIONS.map(({ key }) => (
        <div key={key} className="flex items-center justify-between py-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
      ))}
    </Card>
    <div className="space-y-2">
      {LINKS.map(({ href }) => (
        <Skeleton key={href} className="h-10 w-full" />
      ))}
    </div>
  </div>
);

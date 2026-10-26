import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { LINKS, NOTIFICATION_OPTIONS } from '../configuration/constraints';

/** Mirrors the settings cards, links list and devices. */
export const SettingsSkeleton = () => (
  <div
    className="flex flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-2"
    aria-hidden="true"
  >
    <Card className="space-y-3">
      <Skeleton className="h-4 w-20" />
      <div className="flex items-center justify-between py-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>
    </Card>
    <Card className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-full" />
    </Card>
    <Card className="space-y-3">
      <Skeleton className="h-4 w-32" />
      {NOTIFICATION_OPTIONS.map(({ key }) => (
        <div key={key} className="flex items-center justify-between py-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      ))}
    </Card>
    <div className="space-y-2">
      {LINKS.map(({ href }) => (
        <Skeleton key={href} className="h-11 w-full" />
      ))}
    </div>
    <Card className="space-y-3 lg:col-span-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </Card>
  </div>
);

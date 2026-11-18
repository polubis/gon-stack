import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { SKELETON_ROWS } from '../configuration/constraints';

const range = (length: number) => Array.from({ length }, (_, i) => i);

/** Mimics the hero: heading, percent, brain and the three counters. */
const HeroSkeleton = () => (
  <div
    aria-hidden="true"
    className="hero-card flex flex-col gap-4 rounded-4xl p-5 md:p-7 xl:col-span-5 xl:h-full xl:justify-between"
  >
    <div className="flex flex-col gap-1">
      <Skeleton className="h-4 w-40 bg-hero-track" />
      <Skeleton className="h-12 w-28 bg-hero-track md:h-14" />
    </div>
    <Skeleton className="mx-auto aspect-4/3 w-full max-w-sm bg-hero-track" />
    <div className="grid grid-cols-3 divide-x divide-hero-line border-t border-hero-line pt-4">
      {range(3).map((i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 px-2">
          <Skeleton className="h-4 w-full bg-hero-track" />
          <Skeleton className="h-5 w-8 bg-hero-track" />
        </div>
      ))}
    </div>
  </div>
);

/** Mimics the list: category, catalog heading and topic rows with a progress bar. */
const ListSkeleton = () => (
  <Card aria-hidden="true" className="flex flex-col gap-4 xl:col-span-7">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-40" />
      <ul className="flex flex-col">
        {range(SKELETON_ROWS).map((i) => (
          <li key={i} className="flex flex-col gap-1.5 p-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2 w-full rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  </Card>
);

/** The whole screen as placeholders, in the order and grid of the loaded one. */
export const ScreenSkeleton = () => (
  <div
    data-e2e="knowledge:skeleton"
    className="flex flex-col gap-3 md:gap-4 xl:grid xl:grid-cols-12 xl:content-start"
  >
    <HeroSkeleton />
    <ListSkeleton />
  </div>
);
